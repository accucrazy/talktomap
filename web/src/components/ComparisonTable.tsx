"use client";

import { useState } from "react";
import { haversineKm } from "@/lib/geo";
import { uiStrings, type Locale } from "@/lib/i18n";
import type { Mall } from "@/lib/types";
import { THREAT_META } from "./threat";

function ThreatCell({ mall, locale }: { mall: Mall; locale: Locale }) {
  const meta = THREAT_META[mall.threatLevel];
  const label = uiStrings(locale).threatLevels[mall.threatLevel];
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-sm font-bold tracking-wide"
        style={{ color: meta.color }}
      >
        {meta.dots} {label}
      </span>
      <span className="text-xs text-gray-500">{mall.threatNote}</span>
    </div>
  );
}

export default function ComparisonTable({
  malls,
  locale,
  target,
  radiusKm,
  onSelectMall,
}: {
  malls: Mall[];
  locale: Locale;
  /** 半徑圓心（本案） */
  target: Mall | undefined;
  radiusKm: number;
  onSelectMall: (mallId: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const t = uiStrings(locale);

  // 依半徑過濾：本案永遠顯示，其餘只留圈內者，並帶上距離
  const rows = malls
    .map((m) => ({
      mall: m,
      distKm: target ? haversineKm(target.lat, target.lng, m.lat, m.lng) : 0,
    }))
    .filter((r) => r.mall.id === target?.id || r.distKm <= radiusKm)
    .sort((a, b) => a.distKm - b.distKm);

  const competitorCount = rows.filter((r) => r.mall.id !== target?.id).length;

  return (
    <div className="pointer-events-auto overflow-hidden rounded-t-xl border border-b-0 border-red-200 bg-white/97 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between bg-brand px-4 py-2 text-left"
      >
        <span className="text-sm font-bold text-white">
          {t.tableTitle}
          <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white">
            {t.radiusWithin(radiusKm.toFixed(1), competitorCount)}
          </span>
          <span className="ml-2 hidden text-xs font-medium text-white/75 sm:inline">
            {t.tableHint}
          </span>
        </span>
        <span className="text-xs font-bold text-white/90">
          {open ? t.collapse : t.expand}
        </span>
      </button>

      {open && (
        <div className="max-h-[38vh] overflow-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f37878] text-white">
                <th className="px-3 py-2 font-bold">{t.colMall}</th>
                <th className="px-3 py-2 font-bold">{t.colDistance}</th>
                <th className="px-3 py-2 font-bold">{t.colOpened}</th>
                <th className="px-3 py-2 font-bold">{t.colSize}</th>
                <th className="px-3 py-2 font-bold">{t.colTraffic}</th>
                <th className="px-3 py-2 font-bold">{t.colPositioning}</th>
                <th className="px-3 py-2 font-bold">{t.colThreat}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ mall, distKm }, i) => (
                <tr
                  key={mall.id}
                  onClick={() => onSelectMall(mall.id)}
                  className={`cursor-pointer border-b border-red-100 align-top transition-colors hover:bg-brand-pink ${
                    mall.id === target?.id
                      ? "bg-brand-pink"
                      : i % 2 === 0
                      ? "bg-white"
                      : "bg-[#fdf1f1]"
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <div className="font-bold text-brand-dark">{mall.name}</div>
                    <div className="text-xs text-gray-500">
                      {mall.area ?? mall.nameEn}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-gray-600">
                    {mall.id === target?.id ? "—" : `${distKm.toFixed(2)} km`}
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
                    <ThreatCell mall={mall} locale={locale} />
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
