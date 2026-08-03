"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import ComparisonTable from "@/components/ComparisonTable";
import MapView, { type MapDirectives } from "@/components/MapView";
import { uiStrings } from "@/lib/i18n";
import { mallById } from "@/lib/resolve";
import { SCENARIOS, type Scenario } from "@/lib/scenarios";
import type { MapAction } from "@/lib/types";

const INITIAL_DIRECTIVES: MapDirectives = {
  focus: null,
  highlightIds: [],
  circles: [],
  seq: 0,
};

const CHAT_MIN = 300;
const CHAT_MAX = 640;

export default function AppShell({ mapsApiKey }: { mapsApiKey: string }) {
  const [scenario, setScenario] = useState<Scenario>(SCENARIOS[0]);
  const [directives, setDirectives] = useState<MapDirectives>(
    INITIAL_DIRECTIVES
  );
  const [radiusKm, setRadiusKm] = useState(SCENARIOS[0].defaultRadiusKm);
  const [chatWidth, setChatWidth] = useState(380);
  const draggingRef = useRef(false);

  // 切換情境時清空地圖指令並重設半徑
  useEffect(() => {
    setDirectives((prev) => ({
      focus: null,
      highlightIds: [],
      circles: [],
      seq: prev.seq + 1,
    }));
    setRadiusKm(scenario.defaultRadiusKm);
  }, [scenario.id, scenario.defaultRadiusKm]);

  // 對話欄寬度拖曳
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      setChatWidth(Math.min(CHAT_MAX, Math.max(CHAT_MIN, e.clientX)));
    };
    const onUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const startDrag = useCallback(() => {
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  /** 將 chat 回傳的 MapAction[] 化簡為地圖指令狀態 */
  const applyMapActions = useCallback((actions: MapAction[]) => {
    setDirectives((prev) => {
      let next: MapDirectives = {
        focus: null,
        highlightIds: [],
        circles: [],
        seq: prev.seq + 1,
      };
      for (const a of actions) {
        switch (a.type) {
          case "reset":
            next = { ...next, focus: null, highlightIds: [], circles: [] };
            break;
          case "focus":
            next.focus = { mallId: a.mallId, zoom: a.zoom };
            break;
          case "highlight":
            next.highlightIds = [
              ...new Set([...next.highlightIds, ...a.mallIds]),
            ];
            break;
          case "circle":
            next.circles = [
              ...next.circles.filter((c) => c.mallId !== a.mallId),
              { mallId: a.mallId, radiusKm: a.radiusKm },
            ];
            break;
        }
      }
      return next;
    });
  }, []);

  const focusMall = useCallback(
    (mallId: string) => applyMapActions([{ type: "focus", mallId, zoom: 16 }]),
    [applyMapActions]
  );

  const t = uiStrings(scenario.locale);
  const target = mallById(scenario.malls, scenario.targetId);

  return (
    <div className="flex h-dvh flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-red-100 bg-white px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-lg font-black text-white">
            T
          </span>
          <h1 className="text-lg font-black tracking-tight text-brand-dark">
            Talk to Map
          </h1>
        </div>
        <span className="hidden text-sm font-medium text-gray-500 sm:inline">
          {t.appSubtitle}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {/* 情境切換器 */}
          <div className="flex items-center rounded-full border border-red-200 bg-white p-0.5">
            {SCENARIOS.map((s) => {
              const active = s.id === scenario.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScenario(s)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                    active
                      ? "bg-brand text-white"
                      : "text-brand-dark hover:bg-brand-pink"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {scenario.id === "nagoya-esca" && (
            <Link
              href="/proposals/esca"
              className="hidden rounded-full border border-red-200 px-3 py-1 text-xs font-bold text-brand-dark transition hover:bg-brand-pink sm:inline"
            >
              {t.proposalLink}
            </Link>
          )}

          <span
            className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"
            title={t.demoBadgeTitle}
          >
            {t.demoBadge}
          </span>
        </div>
      </header>

      {/* 主區：左對話 / 右地圖（行動版上下堆疊，地圖在上） */}
      <main className="flex min-h-0 flex-1 flex-col-reverse md:flex-row">
        <aside
          className="h-[45dvh] w-full shrink-0 border-t border-red-100 md:h-auto md:w-[var(--chat-w)] md:border-t-0"
          style={{ ["--chat-w" as string]: `${chatWidth}px` }}
        >
          <div className="h-full w-full">
            <ChatPanel scenario={scenario} onMapActions={applyMapActions} />
          </div>
        </aside>

        {/* 拖曳把手（桌機）：調整對話欄寬度 */}
        <div
          onPointerDown={startDrag}
          onDoubleClick={() => setChatWidth(380)}
          title={`${CHAT_MIN}–${CHAT_MAX}px`}
          className="group hidden w-1.5 shrink-0 cursor-col-resize items-center justify-center border-x border-red-100 bg-red-50/60 transition-colors hover:bg-brand/30 md:flex"
        >
          <span className="h-8 w-0.5 rounded-full bg-brand/40 transition-colors group-hover:bg-brand" />
        </div>

        {/* min-w-0 讓 flex 子元素能正常收縮，避免對話欄把地圖擠成 0 寬 */}
        <section className="relative min-h-0 min-w-0 flex-1">
          <MapView
            apiKey={mapsApiKey}
            directives={directives}
            scenario={scenario}
            radiusKm={radiusKm}
          />

          {/* 半徑控制（地圖左上） */}
          <div className="absolute left-3 top-3 z-10 w-56 rounded-xl border border-red-100 bg-white/95 p-3 shadow-lg backdrop-blur">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-[11px] font-bold text-brand-dark">
                {t.radiusLabel}
              </span>
              <span className="text-sm font-black text-brand">
                {radiusKm.toFixed(1)} km
              </span>
            </div>
            <input
              type="range"
              min={scenario.radiusRange.min}
              max={scenario.radiusRange.max}
              step={scenario.radiusRange.step}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full accent-[color:var(--brand)]"
              aria-label={t.radiusLabel}
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>{scenario.radiusRange.min} km</span>
              <span className="truncate px-1 text-center text-gray-500">
                {target?.name}
              </span>
              <span>{scenario.radiusRange.max} km</span>
            </div>
          </div>

          {/* 底部比較表抽屜 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-2 md:px-4">
            <ComparisonTable
              malls={scenario.malls}
              locale={scenario.locale}
              target={target}
              radiusKm={radiusKm}
              onSelectMall={focusMall}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
