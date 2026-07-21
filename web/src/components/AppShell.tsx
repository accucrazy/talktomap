"use client";

import { useCallback, useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import ComparisonTable from "@/components/ComparisonTable";
import MapView, { type MapDirectives } from "@/components/MapView";
import type { MapAction } from "@/lib/types";

const INITIAL_DIRECTIVES: MapDirectives = {
  focus: null,
  highlightIds: [],
  circles: [],
  seq: 0,
};

export default function AppShell({ mapsApiKey }: { mapsApiKey: string }) {
  const [directives, setDirectives] = useState<MapDirectives>(
    INITIAL_DIRECTIVES
  );

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
          對話式商圈分析
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="rounded-full bg-brand-pink px-3 py-1 text-xs font-bold text-brand-dark">
            吉隆坡 · Bukit Bintang / TRX
          </span>
          <span
            className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"
            title="種子建檔資料 + 簡化模型，尚未串接 Google Places / 人流 API"
          >
            示範資料
          </span>
        </div>
      </header>

      {/* 主區：左對話 / 右地圖（行動版上下堆疊，地圖在上） */}
      <main className="flex min-h-0 flex-1 flex-col-reverse md:flex-row">
        <aside className="h-[45dvh] w-full border-t border-red-100 md:h-auto md:w-[380px] md:shrink-0 md:border-r md:border-t-0">
          <ChatPanel onMapActions={applyMapActions} />
        </aside>

        <section className="relative min-h-0 flex-1">
          <MapView apiKey={mapsApiKey} directives={directives} />
          {/* 底部比較表抽屜 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-2 md:px-4">
            <ComparisonTable onSelectMall={focusMall} />
          </div>
        </section>
      </main>
    </div>
  );
}
