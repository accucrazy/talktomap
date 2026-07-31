import { type GoogleGenAI, Type } from "@google/genai";
import type { StructuredInsight } from "@/lib/types";

const CONFIDENCE = ["高", "中", "低"] as const;

/**
 * 結構化輸出（借鏡 TPC-AI 的 structured output）：以 JSON schema 約束，
 * 從一段分析回答萃取 { confidence, keyInsights, assumptions }。
 * 這是不含工具的獨立收尾呼叫；任何失敗都回傳 null（chat 不受影響）。
 */
export async function finalizeInsight(
  ai: GoogleGenAI,
  model: string,
  answer: string,
  locale: "zh-TW" | "ja" | "en" = "zh-TW"
): Promise<StructuredInsight | null> {
  const langNote =
    locale === "ja"
      ? "keyInsights と assumptions は必ず日本語で書くこと。"
      : locale === "en"
      ? "Write keyInsights and assumptions in English."
      : "keyInsights 與 assumptions 用繁體中文。";
  try {
    const res = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `以下是一段商圈分析回答，請萃取結構化摘要：\n\n${answer}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: `你是分析結果的結構化萃取器。根據回答輸出：信心水準（高/中/低）、2–4 條關鍵洞察、以及分析所依賴的假設。若回答為估算或示範資料，assumptions 要點出此限制。${langNote}只輸出符合 schema 的 JSON。`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            confidence: { type: Type.STRING, enum: [...CONFIDENCE] },
            keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
            assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["confidence", "keyInsights", "assumptions"],
        },
        temperature: 0.1,
      },
    });

    const parsed = JSON.parse(res.text ?? "");
    if (!parsed || typeof parsed !== "object") return null;

    const confidence = CONFIDENCE.includes(parsed.confidence)
      ? (parsed.confidence as StructuredInsight["confidence"])
      : "中";
    const toStrArr = (v: unknown) =>
      Array.isArray(v) ? v.slice(0, 4).map((x) => String(x)) : [];

    return {
      confidence,
      keyInsights: toStrArr(parsed.keyInsights),
      assumptions: toStrArr(parsed.assumptions),
    };
  } catch {
    return null;
  }
}
