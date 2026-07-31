import { GoogleGenAI, type Content } from "@google/genai";
import { NextResponse } from "next/server";
import { dispatchTool, functionDeclarations } from "@/lib/gemini-tools";
import type { ChatMessage, ChatResponse, MapAction } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "gemini-flash-latest";
const MAX_TOOL_ROUNDS = 5;

const SYSTEM_INSTRUCTION = `You are the trade-area analyst for "Talk to Map", serving mall developers and leasing teams.
Demo scenario: the Kuala Lumpur city centre (Bukit Bintang / TRX area). The subject is LaLaport BBCC; competitors include 118 Mall (opens 2026.8), The Exchange TRX, Pavilion KL, Lot 10, Berjaya Times Square, Suria KLCC, Fahrenheit 88, Sungei Wang Plaza, Mid Valley Megamall and more.

Rules:
1. For any answer involving figures, always call a tool first; never invent numbers from memory.
2. Answer in English, conclusion first, then 2–4 key points as a "-" bulleted list.
3. Keep tool-returned numbers exact; label estimates as "est.".
4. The data is demo/seed data with simplified models; be honest about this if asked about sources.
5. Keep answers concise (under ~180 words); don't restate the full table, focus on insight and recommendations.
6. For questions unrelated to trade-area analysis, politely say you only handle trade-area analysis.`;

interface ChatRequestBody {
  messages: ChatMessage[];
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server" },
      { status: 500 }
    );
  }

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json(
      { error: "messages must not be empty" },
      { status: 400 }
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  // 對話歷史（僅保留最近 20 則，控制 token）
  const contents: Content[] = body.messages.slice(-20).map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));

  const mapActions: MapAction[] = [];
  const toolsUsed: string[] = [];

  try {
    let reply = "";
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations }],
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

      // 執行每個工具，回填 functionResponse
      const responseParts = calls.map((call) => {
        const name = call.name ?? "";
        const { result, mapActions: actions } = dispatchTool(
          name,
          (call.args ?? {}) as Record<string, unknown>
        );
        toolsUsed.push(name);
        mapActions.push(...actions);
        return {
          functionResponse: { name, response: { result } },
        };
      });
      contents.push({ role: "user", parts: responseParts });
    }

    if (!reply) {
      reply =
        "Sorry, this analysis didn't complete (tool-call round limit reached). Please rephrase and try again.";
    }

    const payload: ChatResponse = {
      reply,
      mapActions,
      toolsUsed: [...new Set(toolsUsed)],
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("chat api error:", err);
    return NextResponse.json(
      { error: "Failed to reach the analysis model, please try again later" },
      { status: 502 }
    );
  }
}
