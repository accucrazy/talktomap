import { GoogleGenAI, type Content } from "@google/genai";
import { NextResponse } from "next/server";
import { dispatchTool, functionDeclarations } from "@/lib/gemini-tools";
import type { ChatMessage, ChatResponse, MapAction } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "gemini-flash-latest";
const MAX_TOOL_ROUNDS = 5;

const SYSTEM_INSTRUCTION = `你是「Talk to Map」的商圈分析助理，服務對象是商場開發/招商團隊。
目前示範情境：吉隆坡 Bukit Bintang / TRX 商圈，分析主體為 LaLaport BBCC（本案），競品含 118 Mall（2026.8 開幕）、The Exchange TRX、Pavilion KL、Lot 10、Berjaya Times Square。

規則：
1. 任何涉及數據的回答，一律先呼叫工具取得資料，嚴禁憑記憶編造數字。
2. 用繁體中文回答，結論先行，再列 2–4 個重點（用「-」開頭的清單）。
3. 引用工具回傳的數字時保持原值，估算值要標明「估算」。
4. 目前資料為示範假資料（種子建檔 + 簡化模型），使用者問到資料來源時要誠實說明。
5. 回答保持精簡（250 字以內），不要重複表格已有的完整內容，聚焦於洞察與建議。
6. 與商圈分析無關的問題，禮貌說明你只處理商圈分析。`;

interface ChatRequestBody {
  messages: ChatMessage[];
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
        "抱歉，這次分析沒有完成（工具呼叫回合數超限），請換個方式再問一次。";
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
      { error: "呼叫分析模型失敗，請稍後再試" },
      { status: 502 }
    );
  }
}
