"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import ComparisonTable from "@/components/ComparisonTable";
import MapView, { type MapDirectives } from "@/components/MapView";
import { mallsWithinRadius } from "@/lib/data/malls";
import type { MapAction } from "@/lib/types";

const INITIAL_DIRECTIVES: MapDirectives = {
  focus: null,
  highlightIds: [],
  circles: [],
  seq: 0,
};

const RADIUS_MIN = 0.3;
const RADIUS_MAX = 5;
const CHAT_MIN = 300;
const CHAT_MAX = 640;

export default function AppShell({ mapsApiKey }: { mapsApiKey: string }) {
  const [directives, setDirectives] = useState<MapDirectives>(
    INITIAL_DIRECTIVES
  );
  const [radiusKm, setRadiusKm] = useState(1.5);
  const [chatWidth, setChatWidth] = useState(380);
  const mainRef = useRef<HTMLElement>(null);

  /** Reduce the MapAction[] from a chat reply into map-directive state */
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

  /** Ids of malls inside the current radius (used to dim out-of-range pins) */
  const visibleIds = useMemo(
    () => new Set(mallsWithinRadius(radiusKm).map((m) => m.id)),
    [radiusKm]
  );

  /** Drag handle to resize the chat panel horizontally (desktop) */
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const left = mainRef.current?.getBoundingClientRect().left ?? 0;
    const onMove = (ev: MouseEvent) => {
      const w = Math.min(Math.max(ev.clientX - left, CHAT_MIN), CHAT_MAX);
      setChatWidth(w);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

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
          Conversational trade-area analytics
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="rounded-full bg-brand-pink px-3 py-1 text-xs font-bold text-brand-dark">
            Kuala Lumpur · Bukit Bintang / TRX
          </span>
          <span
            className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"
            title="Seed data + simplified models; not yet wired to Google Places / footfall APIs"
          >
            Demo data
          </span>
        </div>
      </header>

      {/* Main: chat (left) / map (right); stacks on mobile with the map on top */}
      <main
        ref={mainRef}
        className="flex min-h-0 flex-1 flex-col-reverse md:flex-row"
        style={{ ["--chat-w" as string]: `${chatWidth}px` }}
      >
        <aside className="h-[45dvh] w-full border-t border-red-100 md:h-auto md:w-[var(--chat-w)] md:shrink-0 md:border-t-0">
          <ChatPanel onMapActions={applyMapActions} />
        </aside>

        {/* Drag handle (desktop only) */}
        <div
          onMouseDown={startResize}
          className="hidden w-1.5 shrink-0 cursor-col-resize items-stretch bg-red-100 transition-colors hover:bg-brand md:flex"
          title="Drag to resize the chat panel"
        >
          <div className="m-auto h-8 w-0.5 rounded-full bg-white/70" />
        </div>

        <section className="relative min-h-0 flex-1">
          <MapView
            apiKey={mapsApiKey}
            directives={directives}
            radiusKm={radiusKm}
            visibleIds={visibleIds}
          />

          {/* Radius control (top-left overlay) */}
          <div className="pointer-events-auto absolute left-3 top-3 z-10 w-64 rounded-xl border border-red-200 bg-white/95 p-3 shadow-lg backdrop-blur">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-xs font-bold text-brand-dark">
                Analysis radius
              </span>
              <span className="text-sm font-black text-brand">
                {radiusKm.toFixed(1)} km
              </span>
            </div>
            <input
              type="range"
              min={RADIUS_MIN}
              max={RADIUS_MAX}
              step={0.1}
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              className="w-full accent-brand"
              aria-label="Analysis radius in kilometers"
            />
            <div className="mt-0.5 flex justify-between text-[10px] text-gray-400">
              <span>{RADIUS_MIN} km</span>
              <span>centered on LaLaport BBCC</span>
              <span>{RADIUS_MAX} km</span>
            </div>
          </div>

          {/* Bottom comparison-table drawer */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-2 md:px-4">
            <ComparisonTable radiusKm={radiusKm} onSelectMall={focusMall} />
          </div>
        </section>
      </main>
    </div>
  );
}
