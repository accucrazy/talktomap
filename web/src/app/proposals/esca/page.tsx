import Link from "next/link";
import type { Metadata } from "next";
import { THREAT_META } from "@/components/threat";
import { uiStrings } from "@/lib/i18n";
import {
  competitors,
  dimensions,
  escaFacts,
  escaMeta,
  foodDraws,
  seasonality,
  segments,
  strategy,
  swot,
  timeline,
  type Confidence,
} from "@/lib/data/esca";

export const metadata: Metadata = {
  title: "提案：名古屋 ESCA 地下街 商圏分析 — Talk to Map",
  description:
    "名古屋駅 新幹線口直結『エスカ地下街』の多維度商圏分析提案（立地・交通・競合・客層・SWOT・リニア再開発・季節性・戦略）",
};

const CONF_STYLE: Record<Confidence, string> = {
  公開: "bg-emerald-50 text-emerald-700 border-emerald-200",
  政策: "bg-sky-50 text-sky-700 border-sky-200",
  推定: "bg-amber-50 text-amber-700 border-amber-200",
};

function ConfBadge({ c }: { c: Confidence }) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${CONF_STYLE[c]}`}
    >
      {c}
    </span>
  );
}

/** 5 段階スコアの塗りバー */
function ScoreBar({ score }: { score: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${score} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-2.5 w-4 rounded-sm ${
            i <= score ? "bg-brand" : "bg-red-100"
          }`}
        />
      ))}
    </span>
  );
}

function SectionTitle({
  n,
  ja,
  zh,
}: {
  n: string;
  ja: string;
  zh: string;
}) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand text-sm font-black text-white">
        {n}
      </span>
      <h2 className="text-xl font-black tracking-tight text-brand-dark">
        {ja}
        <span className="ml-2 text-sm font-medium text-gray-400">{zh}</span>
      </h2>
    </div>
  );
}

const SWOT_META = {
  S: { label: "Strengths 強み", cls: "border-emerald-200 bg-emerald-50", dot: "text-emerald-600" },
  W: { label: "Weaknesses 弱み", cls: "border-rose-200 bg-rose-50", dot: "text-rose-600" },
  O: { label: "Opportunities 機会", cls: "border-sky-200 bg-sky-50", dot: "text-sky-600" },
  T: { label: "Threats 脅威", cls: "border-amber-200 bg-amber-50", dot: "text-amber-600" },
} as const;

export default function EscaProposalPage() {
  const maxSeason = Math.max(...seasonality.map((s) => s.index));

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-red-100 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-lg font-black text-white">
            T
          </span>
          <span className="text-lg font-black tracking-tight text-brand-dark">
            Talk to Map
          </span>
        </Link>
        <span className="hidden text-sm font-medium text-gray-500 sm:inline">
          提案モード
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="rounded-full bg-brand-pink px-3 py-1 text-xs font-bold text-brand-dark">
            名古屋 · 名駅（新幹線口）
          </span>
          <Link
            href="/"
            className="rounded-full border border-red-200 px-3 py-1 text-xs font-bold text-brand-dark transition hover:bg-brand-pink"
          >
            ← ダッシュボードへ
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        {/* Hero */}
        <section className="mb-10 grid gap-6 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="mb-2 text-sm font-bold tracking-wide text-brand">
              商圏分析提案 / PROPOSAL
            </p>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-brand-dark md:text-4xl">
              {escaMeta.name}
              <span className="ml-2 align-middle text-lg font-bold text-gray-400">
                {escaMeta.nameJaKana}
              </span>
            </h1>
            <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-gray-700">
              {escaMeta.oneLiner}
            </p>
            <p className="mt-3 text-xs text-gray-500">{escaMeta.address}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {escaFacts.slice(0, 4).map((f) => (
                <span
                  key={f.label}
                  className="rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs text-gray-700"
                >
                  <span className="font-bold text-brand-dark">{f.label}</span>{" "}
                  {f.value}
                </span>
              ))}
            </div>
            <a
              href={escaMeta.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-xs font-bold text-brand underline underline-offset-2"
            >
              Google Maps で開く ↗
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl border border-red-100 shadow-sm">
            <iframe
              title="ESCA 地下街 位置"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                "エスカ地下街 名古屋"
              )}&z=16&output=embed`}
              className="h-64 w-full md:h-full"
              loading="lazy"
            />
          </div>
        </section>

        {/* 1. 判斷維度スコアカード */}
        <section className="mb-12">
          <SectionTitle n="1" ja="判斷維度スコアカード" zh="多維度評分總覽" />
          <p className="mb-4 max-w-prose text-sm text-gray-600">
            立地・交通・競合・客層・施設・収益・リニア機会まで
            <strong className="text-brand-dark"> 14 の判斷維度</strong>
            で採点。スコアは 1（弱）〜5（強）、各行に資料確度を明示。
          </p>
          <div className="overflow-x-auto rounded-2xl border border-red-100 bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="bg-brand text-white">
                  <th className="px-4 py-2.5 font-bold">判斷維度</th>
                  <th className="px-4 py-2.5 font-bold">評分</th>
                  <th className="px-4 py-2.5 font-bold">確度</th>
                  <th className="px-4 py-2.5 font-bold">コメント</th>
                </tr>
              </thead>
              <tbody>
                {dimensions.map((d, i) => (
                  <tr
                    key={d.axis}
                    className={i % 2 ? "bg-brand-pink/30" : "bg-white"}
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 font-bold text-brand-dark">
                      {d.axis}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-2">
                        <ScoreBar score={d.score} />
                        <span className="text-xs font-bold text-gray-500">
                          {d.score}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <ConfBadge c={d.confidence} />
                    </td>
                    <td className="px-4 py-2.5 text-gray-700">{d.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. 立地・交通 & 客層 */}
        <section className="mb-12 grid gap-6 lg:grid-cols-2">
          <div>
            <SectionTitle n="2" ja="立地・交通・基本諸元" zh="區位與基本資料" />
            <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
              <dl className="divide-y divide-red-50">
                {escaFacts.map((f) => (
                  <div key={f.label} className="flex gap-3 py-2.5">
                    <dt className="w-20 shrink-0 text-xs font-bold text-brand-dark">
                      {f.label}
                    </dt>
                    <dd className="flex-1 text-sm text-gray-700">{f.value}</dd>
                    <ConfBadge c={f.confidence} />
                  </div>
                ))}
              </dl>
            </div>
            <div className="mt-4 rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
              <p className="mb-2 text-xs font-bold text-brand-dark">
                集客の核『名古屋めし』代表テナント
              </p>
              <div className="flex flex-wrap gap-2">
                {foodDraws.map((f) => (
                  <span
                    key={f.name}
                    className="rounded-full bg-brand-pink px-3 py-1 text-xs text-brand-dark"
                  >
                    <span className="font-bold">{f.name}</span>
                    <span className="ml-1 text-brand/70">{f.genre}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <SectionTitle n="3" ja="来街客の構成（推定）" zh="客層結構" />
            <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
              <div className="space-y-3">
                {segments.map((s) => (
                  <div key={s.label}>
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <span className="text-sm font-bold text-brand-dark">
                        {s.label}
                      </span>
                      <span className="text-sm font-black text-brand">
                        {s.pct}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-red-50">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{s.note}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-amber-700">
                ※ 内訳は簡易推定。正式提案では現地カウント／アンケートで更新。
              </p>
            </div>
          </div>
        </section>

        {/* 4. 競合脅威 */}
        <section className="mb-12">
          <SectionTitle n="4" ja="名駅 競合ポジショニング" zh="競合威脅評分" />
          <p className="mb-4 max-w-prose text-sm text-gray-600">
            競争の構図は明快 —{" "}
            <strong className="text-brand-dark">
              ESCA はほぼ唯一、西口（新幹線口）側の大型集客装置
            </strong>
            。主要競合は東口（桜通口）に集中し、質・規模で優位に立つ。
          </p>
          <div className="overflow-x-auto rounded-2xl border border-red-100 bg-white shadow-sm">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="bg-brand text-white">
                  <th className="px-4 py-2.5 font-bold">施設</th>
                  <th className="px-4 py-2.5 font-bold">位置</th>
                  <th className="px-4 py-2.5 font-bold">タイプ</th>
                  <th className="px-4 py-2.5 font-bold">脅威度</th>
                  <th className="px-4 py-2.5 font-bold">メモ</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((c, i) => {
                  const meta = THREAT_META[c.threat];
                  return (
                    <tr
                      key={c.id}
                      className={
                        c.threat === "target"
                          ? "bg-brand-pink"
                          : i % 2
                          ? "bg-brand-pink/20"
                          : "bg-white"
                      }
                    >
                      <td className="px-4 py-2.5">
                        <div className="font-bold text-brand-dark">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.nameEn}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-xs text-gray-600">
                        {c.side}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-600">
                        {c.type}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-white"
                          style={{ backgroundColor: meta.color }}
                        >
                          <span>{meta.dots}</span>
                          {uiStrings("ja").threatLevels[c.threat]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-700">{c.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. SWOT */}
        <section className="mb-12">
          <SectionTitle n="5" ja="SWOT 分析" zh="強み・弱み・機会・脅威" />
          <div className="grid gap-4 sm:grid-cols-2">
            {(["S", "W", "O", "T"] as const).map((k) => {
              const meta = SWOT_META[k];
              return (
                <div
                  key={k}
                  className={`rounded-2xl border p-5 shadow-sm ${meta.cls}`}
                >
                  <h3 className="mb-2 text-sm font-black text-gray-800">
                    {meta.label}
                  </h3>
                  <ul className="space-y-1.5">
                    {swot[k].map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-sm text-gray-700"
                      >
                        <span className={`font-black ${meta.dot}`}>›</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. リニア */}
        <section className="mb-12">
          <SectionTitle
            n="6"
            ja="リニア中央新幹線インパクト"
            zh="關鍵判斷軸：磁浮開業"
          />
          <p className="mb-5 max-w-prose text-sm text-gray-600">
            本提案の
            <strong className="text-brand-dark">最重要の判斷軸</strong>。リニア始発駅化で
            <strong className="text-brand-dark">
              太閤通口（西＝ESCA 側）が名古屋駅の『表玄関』に反転
            </strong>
            する。開業時期は延期・流動的だが、立地価値上昇の方向は不変。
          </p>
          <ol className="relative ml-3 border-l-2 border-red-100">
            {timeline.map((t) => (
              <li key={t.year} className="mb-5 ml-5">
                <span
                  className={`absolute -left-[9px] mt-1 h-4 w-4 rounded-full border-2 border-white ${
                    t.kind === "future"
                      ? "bg-brand"
                      : t.kind === "key"
                      ? "bg-threat-medium"
                      : "bg-gray-300"
                  }`}
                />
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-black text-brand-dark">
                    {t.year}
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {t.title}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-600">{t.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 7. 季節性 */}
        <section className="mb-12">
          <SectionTitle n="7" ja="需要の季節性（推定指数）" zh="季節性需求" />
          <p className="mb-4 text-sm text-gray-600">
            指数 100 = 年間平均。連休・帰省期（GW・お盆・年末年始）にピーク。
            <span className="ml-1 text-amber-700">※推定値</span>
          </p>
          <div className="flex items-end gap-1.5 rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            {seasonality.map((s) => (
              <div key={s.label} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-brand/80"
                  style={{ height: `${(s.index / maxSeason) * 120}px` }}
                  title={`${s.label}: ${s.index}`}
                />
                <span className="text-[9px] leading-tight text-gray-400">
                  {s.label.replace(/（.*）/, "").replace("月", "")}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 8. 戦略 */}
        <section className="mb-12">
          <SectionTitle n="8" ja="提案・実行ロードマップ" zh="策略建議" />
          <div className="grid gap-4 md:grid-cols-3">
            {strategy.map((s) => (
              <div
                key={s.phase}
                className="flex flex-col rounded-2xl border border-red-100 bg-white p-5 shadow-sm"
              >
                <span className="mb-1 inline-block w-fit rounded-full bg-brand px-2.5 py-0.5 text-xs font-black text-white">
                  {s.phase}
                </span>
                <span className="mb-2 text-xs font-bold text-gray-400">
                  {s.horizon}
                </span>
                <h3 className="mb-3 text-sm font-black text-brand-dark">
                  {s.title}
                </h3>
                <ul className="space-y-1.5">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-2 text-sm text-gray-700">
                      <span className="font-black text-brand">·</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <footer className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs leading-relaxed text-amber-800">
          <strong className="font-black">資料の確度について：</strong>
          本提案の「
          <span className="font-bold">公開</span>」は公開情報／報導ベース、「
          <span className="font-bold">政策</span>」は公表済み計画（時期は流動的）、「
          <span className="font-bold">推定</span>
          」は簡易モデル／人工估算のデモ値です。人流内訳・賃料・坪効率・季節指数などの数値は正式提案の前に一次データ（乗降客統計・賃料査定・POS・現地調査）で更新してください。
        </footer>
      </main>
    </div>
  );
}
