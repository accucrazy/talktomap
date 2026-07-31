"use client";

import { useEffect, useRef, useState } from "react";
import { AGENTS, DEFAULT_AGENT_ID } from "@/lib/agent/registry";
import { uiStrings, type UIStrings } from "@/lib/i18n";
import type { Scenario } from "@/lib/scenarios";
import type {
  ChatMessage,
  ChatResponse,
  MapAction,
  StructuredInsight,
} from "@/lib/types";

interface MsgMeta {
  tools: string[];
  agentName?: string;
  delegatedTo?: string[];
  structured?: StructuredInsight | null;
  prunedCount?: number;
}

const CONF_STYLE: Record<string, string> = {
  高: "bg-emerald-50 text-emerald-700 border-emerald-200",
  中: "bg-amber-50 text-amber-700 border-amber-200",
  低: "bg-rose-50 text-rose-700 border-rose-200",
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
  scenario,
  onMapActions,
}: {
  scenario: Scenario;
  onMapActions: (actions: MapAction[]) => void;
}) {
  const welcome: ChatMessage = { role: "model", text: scenario.greeting };
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [meta, setMeta] = useState<Record<number, MsgMeta>>({});
  const [agentId, setAgentId] = useState<string>(DEFAULT_AGENT_ID);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = uiStrings(scenario.locale);

  // 切換情境時重置對話（開場白、工具標記）
  useEffect(() => {
    setMessages([{ role: "model", text: scenario.greeting }]);
    setMeta({});
    setInput("");
  }, [scenario.id, scenario.greeting]);

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
        // 開場白為前端寫死，不送進模型歷史；附上情境 id 與 Agent id
        body: JSON.stringify({
          messages: history.slice(1),
          scenarioId: scenario.id,
          agentId,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(err?.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as ChatResponse;
      setMessages((prev) => {
        setMeta((m) => ({
          ...m,
          [prev.length]: {
            tools: data.toolsUsed,
            agentName: data.agentName,
            delegatedTo: data.delegatedTo,
            structured: data.structured,
            prunedCount: data.prunedCount,
          },
        }));
        return [...prev, { role: "model", text: data.reply }];
      });
      if (data.mapActions.length) onMapActions(data.mapActions);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `${t.analysisFailed}：${e instanceof Error ? e.message : "?"}。${t.retryHint}`,
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
            {m.role === "model" && meta[i] ? (
              <MessageMeta info={meta[i]} t={t} />
            ) : null}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-red-100 bg-brand-pink/60 px-3.5 py-2.5 text-[13px] text-gray-500 w-fit">
            <span className="inline-block h-2 w-2 animate-ping rounded-full bg-brand" />
            {t.loadingText}
          </div>
        )}
      </div>

      {/* Agent 選擇器 */}
      <div className="border-t border-gray-100 px-4 pt-2.5">
        <div className="mb-1 text-[10.5px] font-bold text-gray-400">
          {t.analystLabel}
        </div>
        <div className="flex flex-wrap gap-1">
          {AGENTS.map((a) => {
            const active = a.id === agentId;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setAgentId(a.id)}
                disabled={loading}
                title={`${a.role}｜靈感：${a.inspiration}`}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors disabled:opacity-50 ${
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-red-200 bg-white text-brand-dark hover:bg-brand-pink"
                }`}
              >
                {a.name}
                <span
                  className={`ml-1 font-normal ${
                    active ? "text-white/80" : "text-gray-400"
                  }`}
                >
                  {t.agentRoles[a.id] ?? a.role}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 建議問題 */}
      <div className="flex flex-wrap gap-1.5 px-4 pt-2.5">
        {scenario.suggestions.map((s) => (
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
          placeholder={t.inputPlaceholder}
          className="flex-1 rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-40"
        >
          {t.sendButton}
        </button>
      </form>
    </div>
  );
}

/** 回答訊息下方的透明化資訊：Agent、委派、工具、context 修剪、結構化摘要 */
function MessageMeta({ info, t }: { info: MsgMeta; t: UIStrings }) {
  const s = info.structured;
  return (
    <div className="mt-1.5 space-y-1.5">
      {/* Agent / 委派 / 工具 chips */}
      <div className="flex flex-wrap items-center gap-1">
        {info.agentName ? (
          <span className="rounded-full bg-brand px-2 py-0.5 text-[10.5px] font-bold text-white">
            🧭 {info.agentName}
          </span>
        ) : null}
        {info.delegatedTo?.map((d) => (
          <span
            key={d}
            className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10.5px] font-medium text-sky-700"
          >
            ↪ {t.delegatePrefix} {d}
          </span>
        ))}
        {info.tools?.map((tool) => (
          <span
            key={tool}
            className="rounded-full border border-red-200 bg-white px-2 py-0.5 text-[10.5px] font-medium text-brand-dark"
          >
            ⚙ {t.toolLabels[tool] ?? tool}
          </span>
        ))}
        {info.prunedCount ? (
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10.5px] font-medium text-gray-500">
            ✂ {t.prunedSuffix(info.prunedCount)}
          </span>
        ) : null}
      </div>

      {/* 結構化摘要 */}
      {s ? (
        <div className="rounded-xl border border-red-100 bg-white/70 p-2.5 text-[12px]">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="font-bold text-brand-dark">{t.structuredTitle}</span>
            <span
              className={`rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${
                CONF_STYLE[s.confidence] ?? CONF_STYLE["中"]
              }`}
            >
              {t.confidenceLabel} {t.confidenceValues[s.confidence] ?? s.confidence}
            </span>
          </div>
          {s.keyInsights.length ? (
            <ul className="ml-4 list-disc space-y-0.5 text-gray-700">
              {s.keyInsights.map((k, i) => (
                <li key={i}>{k}</li>
              ))}
            </ul>
          ) : null}
          {s.assumptions.length ? (
            <div className="mt-1.5 text-[11px] text-amber-700">
              <span className="font-bold">{t.assumptionsLabel}：</span>
              {s.assumptions.join("；")}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
