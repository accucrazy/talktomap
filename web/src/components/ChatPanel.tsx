"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatResponse, MapAction } from "@/lib/types";

const SUGGESTIONS = [
  "118 Mall 開幕後，誰受威脅最大？",
  "以 LaLaport 為中心 1.5 公里內有哪些競品？",
  "預估 118 Mall 開幕對各商場的客流影響",
];

const TOOL_LABELS: Record<string, string> = {
  list_malls: "商場清單",
  get_mall: "商場資料",
  get_competitors_near: "競品掃描",
  get_threat_analysis: "威脅分析",
  estimate_sales_impact: "客流影響模型",
};

const WELCOME: ChatMessage = {
  role: "model",
  text: "你好，我是 Talk to Map 商圈分析助理。\n目前載入示範情境：**吉隆坡 Bukit Bintang / TRX 商圈**（本案：LaLaport BBCC）。\n你可以問我競品威脅、半徑掃描、或新商場開幕的客流影響——分析結果會同步標到右側地圖。",
};

/** 極簡 markdown：**粗體** 與「- 」清單 */
function renderMd(text: string) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let listBuf: string[] = [];
  const bold = (s: string, key: number) =>
    s.split(/\*\*(.+?)\*\*/g).map((seg, i) =>
      i % 2 === 1 ? <strong key={`${key}-${i}`}>{seg}</strong> : seg
    );
  const flushList = () => {
    if (listBuf.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`}>
          {listBuf.map((li, i) => (
            <li key={i}>{bold(li, i)}</li>
          ))}
        </ul>
      );
      listBuf = [];
    }
  };
  lines.forEach((line, i) => {
    const t = line.trim();
    if (t.startsWith("- ") || t.startsWith("* ")) {
      listBuf.push(t.slice(2));
    } else {
      flushList();
      if (t) blocks.push(<p key={`p-${i}`}>{bold(t, i)}</p>);
    }
  });
  flushList();
  return <div className="chat-md">{blocks}</div>;
}

export default function ChatPanel({
  onMapActions,
}: {
  onMapActions: (actions: MapAction[]) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [toolChips, setToolChips] = useState<Record<number, string[]>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");
    const history = [...messages, { role: "user" as const, text: q }];
    setMessages(history);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // WELCOME 是前端寫死的開場白，不送進模型歷史
        body: JSON.stringify({ messages: history.slice(1) }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(err?.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as ChatResponse;
      setMessages((prev) => {
        setToolChips((chips) => ({
          ...chips,
          [prev.length]: data.toolsUsed,
        }));
        return [...prev, { role: "model", text: data.reply }];
      });
      if (data.mapActions.length) onMapActions(data.mapActions);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `分析失敗：${e instanceof Error ? e.message : "未知錯誤"}，請再試一次。`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* 訊息串 */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i}>
            <div
              className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                m.role === "user"
                  ? "ml-auto rounded-br-sm bg-brand text-white"
                  : "rounded-bl-sm border border-red-100 bg-brand-pink/60 text-gray-800"
              }`}
            >
              {m.role === "model" ? renderMd(m.text) : m.text}
            </div>
            {m.role === "model" && toolChips[i]?.length ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {toolChips[i].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-red-200 bg-white px-2 py-0.5 text-[10.5px] font-medium text-brand-dark"
                  >
                    ⚙ {TOOL_LABELS[t] ?? t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-red-100 bg-brand-pink/60 px-3.5 py-2.5 text-[13px] text-gray-500 w-fit">
            <span className="inline-block h-2 w-2 animate-ping rounded-full bg-brand" />
            分析中（呼叫工具查詢資料）…
          </div>
        )}
      </div>

      {/* 建議問題 */}
      <div className="flex flex-wrap gap-1.5 border-t border-gray-100 px-4 pt-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            disabled={loading}
            className="rounded-full border border-red-200 bg-white px-2.5 py-1 text-[11.5px] text-brand-dark transition-colors hover:bg-brand-pink disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* 輸入框 */}
      <form
        className="flex gap-2 p-4 pt-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="問我商圈競爭、人流影響…"
          className="flex-1 rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-40"
        >
          送出
        </button>
      </form>
    </div>
  );
}
