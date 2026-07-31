import { GoogleGenAI, type Content } from "@google/genai";
import { NextResponse } from "next/server";
import { finalizeInsight } from "@/lib/agent/finalize";
import { buildSystemInstruction } from "@/lib/agent/persona";
import { agentById } from "@/lib/agent/registry";
import { runSubAgent } from "@/lib/agent/subagent";
import { pruneHistory } from "@/lib/context/budget";
import { runOfficialStats } from "@/lib/data/govdata";
import { dispatchTool, functionDeclarationsFor } from "@/lib/gemini-tools";
import { scenarioById } from "@/lib/scenarios";
import type { ChatMessage, ChatResponse, MapAction } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "gemini-flash-latest";
const MAX_TOOL_ROUNDS = 5;
const HISTORY_TOKEN_BUDGET = 6000;

interface ChatRequestBody {
  messages: ChatMessage[];
  scenarioId?: string;
  agentId?: string;
  /** 是否啟用結構化收尾（預設開啟） */
  structured?: boolean;
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "伺服器未設定 GEMINI_API_KEY" },
      { status: 500 }
    );
  }

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "請求格式錯誤" }, { status: 400 });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "messages 不可為空" }, { status: 400 });
  }

  const scenario = scenarioById(body.scenarioId);
  const agent = agentById(body.agentId);
  const useStructured = body.structured !== false;
  const ai = new GoogleGenAI({ apiKey });

  // Context 管理：token 預算內修剪較舊對話（借鏡 TPC-AI context 引擎）
  const pruned = pruneHistory(body.messages, HISTORY_TOKEN_BUDGET);
  const contents: Content[] = pruned.messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));

  const mapActions: MapAction[] = [];
  const toolsUsed: string[] = [];
  const delegatedTo: string[] = [];

  const declarations = functionDeclarationsFor(agent.tools);

  try {
    let reply = "";
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents,
        config: {
          systemInstruction: buildSystemInstruction(agent, scenario),
          tools: [{ functionDeclarations: declarations }],
          temperature: 0.3,
        },
      });

      const calls = res.functionCalls;
      if (!calls || calls.length === 0) {
        reply = res.text ?? "";
        break;
      }

      // 把模型的 function call 回合加入歷史
      const modelContent = res.candidates?.[0]?.content;
      if (modelContent) contents.push(modelContent);

      // 執行每個工具（含 A2A 委派），回填 functionResponse
      const responseParts: { functionResponse: { name: string; response: { result: unknown } } }[] = [];
      for (const call of calls) {
        const name = call.name ?? "";
        const args = (call.args ?? {}) as Record<string, unknown>;

        if (name === "delegate_to_specialist") {
          const specialist =
            typeof args.specialist === "string" ? args.specialist : "";
          const task = typeof args.task === "string" ? args.task : "";
          const sub = await runSubAgent(ai, MODEL, scenario, specialist, task);
          toolsUsed.push("delegate_to_specialist", ...sub.toolsUsed);
          mapActions.push(...sub.mapActions);
          delegatedTo.push(sub.specialist);
          responseParts.push({
            functionResponse: {
              name,
              response: {
                result: { 專職分析師: sub.specialist, 結論: sub.reply },
              },
            },
          });
          continue;
        }

        if (name === "get_official_stats") {
          const { result, mapActions: acts } = await runOfficialStats(scenario);
          toolsUsed.push(name);
          mapActions.push(...acts);
          responseParts.push({ functionResponse: { name, response: { result } } });
          continue;
        }

        const { result, mapActions: actions } = dispatchTool(name, args, scenario);
        toolsUsed.push(name);
        mapActions.push(...actions);
        responseParts.push({ functionResponse: { name, response: { result } } });
      }
      contents.push({ role: "user", parts: responseParts });
    }

    if (!reply) {
      reply =
        "抱歉，這次分析沒有完成（工具呼叫回合數超限），請換個方式再問一次。";
    }

    // 結構化收尾（獨立、可失敗、失敗回 null）
    const structured =
      useStructured && reply.length > 20
        ? await finalizeInsight(ai, MODEL, reply, scenario.locale)
        : null;

    const payload: ChatResponse = {
      reply,
      mapActions,
      toolsUsed: [...new Set(toolsUsed)],
      agentName: agent.name,
      delegatedTo: [...new Set(delegatedTo)],
      structured,
      prunedCount: pruned.droppedCount,
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("chat api error:", err);
    return NextResponse.json(
      { error: "呼叫分析模型失敗，請稍後再試" },
      { status: 502 }
    );
  }
}
