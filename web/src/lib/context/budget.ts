import type { ChatMessage } from "@/lib/types";

/**
 * 精簡版 Context 管理（借鏡 TPC-AI context 引擎的核心概念）：
 * token 估算 → 智慧修剪（保留最近幾輪）→ 被丟棄的內容以一行摘要保留。
 * 這裡用啟發式 token 估算（不呼叫額外 API），足以示範概念。
 */

/** 啟發式 token 估算：CJK 每字 ~1.6 token、其餘 ~4 char/token */
export function estimateTokens(text: string): number {
  let cjk = 0;
  for (const ch of text) {
    if (/[　-鿿＀-￯]/.test(ch)) cjk++;
  }
  const rest = text.length - cjk;
  return Math.ceil(cjk * 1.6 + rest / 4);
}

export function historyTokens(messages: ChatMessage[]): number {
  return messages.reduce((s, m) => s + estimateTokens(m.text) + 4, 0);
}

export interface PrunedHistory {
  messages: ChatMessage[];
  droppedCount: number;
  /** 被丟棄內容的一行摘要（若有） */
  summaryNote: ChatMessage | null;
  estimatedTokens: number;
}

/**
 * 在 token 預算內保留最近的對話；較舊的先摘要成一行再丟棄。
 * @param budgetTokens 歷史訊息的 token 上限
 * @param keepRecent 至少保留的最近訊息數
 */
export function pruneHistory(
  messages: ChatMessage[],
  budgetTokens = 6000,
  keepRecent = 8
): PrunedHistory {
  if (historyTokens(messages) <= budgetTokens) {
    return {
      messages,
      droppedCount: 0,
      summaryNote: null,
      estimatedTokens: historyTokens(messages),
    };
  }

  // 從最近往回收，直到達到預算或保留數
  const kept: ChatMessage[] = [];
  let used = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const t = estimateTokens(messages[i].text) + 4;
    if (kept.length >= keepRecent && used + t > budgetTokens) break;
    kept.unshift(messages[i]);
    used += t;
  }

  const dropped = messages.slice(0, messages.length - kept.length);
  const summaryNote: ChatMessage | null =
    dropped.length > 0
      ? {
          role: "user",
          text: `（系統摘要：先前 ${dropped.length} 則較舊對話已省略以節省 token，主題涵蓋「${topicsOf(
            dropped
          )}」。如需其中細節請重新提問。）`,
        }
      : null;

  const finalMsgs = summaryNote ? [summaryNote, ...kept] : kept;
  return {
    messages: finalMsgs,
    droppedCount: dropped.length,
    summaryNote,
    estimatedTokens: historyTokens(finalMsgs),
  };
}

/** 從被丟棄訊息裡抓幾個關鍵詞（極簡 topic 萃取） */
function topicsOf(messages: ChatMessage[]): string {
  const users = messages.filter((m) => m.role === "user").map((m) => m.text);
  const joined = users.join("，");
  return joined.length > 40 ? joined.slice(0, 40) + "…" : joined || "商圈分析";
}
