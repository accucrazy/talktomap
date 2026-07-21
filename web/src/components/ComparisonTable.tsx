"use client";

import { useState } from "react";
import { malls } from "@/lib/data/malls";
import type { Mall } from "@/lib/types";
import { THREAT_META } from "./threat";

function ThreatCell({ mall }: { mall: Mall }) {
  const meta = THREAT_META[mall.threatLevel];
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-sm font-bold tracking-wide"
        style={{ color: meta.color }}
      >
        {meta.dots} {meta.label}
      </span>
      <span className="text-xs text-gray-500">{mall.threatNote}</span>
    </div>
  );
}

export default function ComparisonTable({
  onSelectMall,
}: {
  onSelectMall: (mallId: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="pointer-events-auto overflow-hidden rounded-t-xl border border-b-0 border-red-200 bg-white/97 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between bg-brand px-4 py-2 text-left"
      >
        <span className="text-sm font-bold text-white">
          商場競爭比較表
          <span className="ml-2 text-xs font-medium text-white/75">
            點列可定位地圖
          </span>
        </span>
        <span className="text-xs font-bold text-white/90">
          {open ? "收合 ▾" : "展開 ▴"}
        </span>
      </button>

      {open && (
        <div className="max-h-[38vh] overflow-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f37878] text-white">
                <th className="px-3 py-2 font-bold">商場</th>
                <th className="px-3 py-2 font-bold">開幕</th>
                <th className="px-3 py-2 font-bold">規模</th>
                <th className="px-3 py-2 font-bold">年人流</th>
                <th className="px-3 py-2 font-bold">核心定位</th>
                <th className="px-3 py-2 font-bold">威脅層級</th>
              </tr>
            </thead>
            <tbody>
              {malls.map((mall, i) => (
                <tr
                  key={mall.id}
                  onClick={() => onSelectMall(mall.id)}
                  className={`cursor-pointer border-b border-red-100 align-top transition-colors hover:bg-brand-pink ${
                    i % 2 === 0 ? "bg-white" : "bg-[#fdf1f1]"
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <div className="font-bold text-brand-dark">{mall.name}</div>
                    <div className="text-xs text-gray-500">{mall.nameEn}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">{mall.opened}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {mall.sizeLabel}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {mall.trafficLabel}
                  </td>
                  <td className="px-3 py-2.5">
                    {mall.positioning.length === 1 ? (
                      <span>{mall.positioning[0]}</span>
                    ) : (
                      <ul className="ml-4 list-disc space-y-0.5 text-[13px]">
                        {mall.positioning.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <ThreatCell mall={mall} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
