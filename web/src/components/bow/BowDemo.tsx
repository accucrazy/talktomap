"use client";

import { useState, type ReactNode } from "react";
import {
  steps,
  stepsByTrack,
  tracks,
  type Bilingual,
  type TrackId,
} from "@/lib/data/bow";
import { PhoneFrame, WideFrame } from "./ui";
import {
  SaCreate,
  SaHome,
  SaLogin,
  SaOrders,
  SaShare,
} from "./screensAssociate";
import {
  CxCheckout,
  CxDetail,
  CxDone,
  CxLanding,
  CxLine,
  CxTrack,
} from "./screensCustomer";
import { HqFunnel, HqLeaderboard } from "./screensHq";

const SCREENS: Record<string, () => ReactNode> = {
  "sa-login": SaLogin,
  "sa-home": SaHome,
  "sa-create": SaCreate,
  "sa-share": SaShare,
  "sa-orders": SaOrders,
  "cx-line": CxLine,
  "cx-landing": CxLanding,
  "cx-detail": CxDetail,
  "cx-checkout": CxCheckout,
  "cx-done": CxDone,
  "cx-track": CxTrack,
  "hq-funnel": HqFunnel,
  "hq-leaderboard": HqLeaderboard,
};

type Lang = "en" | "zh";

const T = {
  kicker: {
    en: "Mock-up · not a live product",
    zh: "介面模擬・非實際上線產品",
  },
  title: {
    en: "BOW — closed commerce for client advisors",
    zh: "BOW — 專櫃熟客封閉式電商",
  },
  lede: {
    en: "Advisors send private product links to their own clients; the client buys in the BOW app; the sale is booked against the advisor's code. Content and buzz become countable revenue.",
    zh: "專櫃人員把專屬商品連結傳給自己的熟客，顧客在 BOW App 完成購買，業績自動歸屬到該員編。線上聲量因此變成可計數的營收。",
  },
  walkthrough: { en: "Walkthrough", zh: "逐步導覽" },
  storyboard: { en: "All screens", zh: "全部畫面" },
  prev: { en: "Back", zh: "上一步" },
  next: { en: "Next", zh: "下一步" },
  step: { en: "Step", zh: "步驟" },
  of: { en: "of", zh: "／" },
  storyHint: {
    en: "Every screen at once — screenshot straight into the deck.",
    zh: "一次看完所有畫面，可直接截圖放進簡報。",
  },
} satisfies Record<string, Bilingual>;

export default function BowDemo() {
  const [lang, setLang] = useState<Lang>("en");
  const [mode, setMode] = useState<"walk" | "story">("walk");
  const [track, setTrack] = useState<TrackId>("associate");
  const [idx, setIdx] = useState(0);

  const trackSteps = stepsByTrack(track);
  const current = trackSteps[Math.min(idx, trackSteps.length - 1)];
  const trackMeta = tracks.find((t) => t.id === track)!;
  const t = (b: Bilingual) => b[lang];

  const go = (nextTrack: TrackId) => {
    setTrack(nextTrack);
    setIdx(0);
  };

  const Screen = SCREENS[current.id];
  const isWide = trackMeta.frame === "wide";
  const Frame = isWide ? WideFrame : PhoneFrame;

  return (
    <div className="min-h-full bg-[#e9e5df] pb-16">
      {/* ---------------- header ---------------- */}
      <header className="bg-bow-ink text-bow-ivory">
        <div className="mx-auto max-w-6xl px-6 py-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="font-serif text-[22px] font-bold tracking-[0.42em] text-bow-gold-soft">
                  BOW
                </span>
                <span className="rounded-full border border-bow-gold/50 px-2.5 py-0.5 text-[10px] font-bold tracking-[0.16em] text-bow-gold">
                  {t(T.kicker).toUpperCase()}
                </span>
              </div>
              <h1 className="mt-3 font-serif text-[26px] font-bold leading-tight">
                {t(T.title)}
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed text-white/60">
                {t(T.lede)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex overflow-hidden rounded-sm border border-white/20 text-[11px]">
                {(["en", "zh"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-3 py-1.5 font-semibold ${
                      lang === l ? "bg-bow-gold text-white" : "text-white/60"
                    }`}
                  >
                    {l === "en" ? "EN" : "繁中"}
                  </button>
                ))}
              </div>
              <div className="flex overflow-hidden rounded-sm border border-white/20 text-[11px]">
                {(
                  [
                    ["walk", T.walkthrough],
                    ["story", T.storyboard],
                  ] as const
                ).map(([m, label]) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-3 py-1.5 font-semibold ${
                      mode === m ? "bg-white/15 text-white" : "text-white/50"
                    }`}
                  >
                    {t(label)}
                  </button>
                ))}
              </div>
              <a
                href="/"
                className="text-[11px] text-white/40 underline underline-offset-2 hover:text-white/70"
              >
                ← Talk to Map
              </a>
            </div>
          </div>

          {/* track tabs */}
          <nav className="mt-6 flex flex-wrap gap-2">
            {tracks.map((tr) => (
              <button
                key={tr.id}
                onClick={() => go(tr.id)}
                className={`rounded-sm border px-3.5 py-2 text-left ${
                  track === tr.id
                    ? "border-bow-gold bg-bow-gold/15"
                    : "border-white/15 hover:border-white/35"
                }`}
              >
                <div className="text-[12px] font-bold">{t(tr.label)}</div>
                <div className="mt-0.5 text-[10px] text-white/45">
                  {t(tr.who)}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ---------------- body ---------------- */}
      {mode === "walk" ? (
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* step rail */}
            <ol className="w-full shrink-0 space-y-1.5 lg:w-72">
              {trackSteps.map((s, i) => (
                <li key={s.id}>
                  <button
                    onClick={() => setIdx(i)}
                    className={`flex w-full gap-2.5 rounded-sm border px-3 py-2.5 text-left transition ${
                      i === idx
                        ? "border-bow-ink bg-white shadow-sm"
                        : "border-transparent bg-white/50 hover:bg-white/80"
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                        i === idx
                          ? "bg-bow-gold text-white"
                          : "bg-black/10 text-black/50"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[13px] font-semibold text-bow-ink">
                      {t(s.title)}
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            {/* device + annotation. The head-office screens are wide, so they
                stack instead of sharing the row with the annotation column. */}
            <div
              className={
                isWide
                  ? "flex min-w-0 flex-1 flex-col gap-6"
                  : "flex min-w-0 flex-1 flex-col gap-8 xl:flex-row"
              }
            >
              <div className="flex justify-center lg:justify-start">
                <Frame scale={isWide ? 0.66 : 0.92} label={t(current.title)}>
                  <Screen />
                </Frame>
              </div>

              {/* annotation */}
              <div className={isWide ? "max-w-3xl" : "min-w-0 flex-1"}>
                <div className="text-[11px] font-bold tracking-[0.18em] text-black/40">
                  {t(T.step).toUpperCase()} {idx + 1} {t(T.of)}{" "}
                  {trackSteps.length}
                </div>
                <h2 className="mt-1.5 font-serif text-[22px] font-bold text-bow-ink">
                  {t(current.title)}
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed text-black/70">
                  {t(current.note)}
                </p>

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => setIdx((i) => Math.max(0, i - 1))}
                    disabled={idx === 0}
                    className="rounded-sm border border-black/20 px-4 py-2 text-[12px] font-semibold text-bow-ink disabled:opacity-30"
                  >
                    ‹ {t(T.prev)}
                  </button>
                  <button
                    onClick={() =>
                      setIdx((i) => {
                        if (i < trackSteps.length - 1) return i + 1;
                        const ti = tracks.findIndex((x) => x.id === track);
                        if (ti < tracks.length - 1) setTrack(tracks[ti + 1].id);
                        return 0;
                      })
                    }
                    className="rounded-sm bg-bow-ink px-4 py-2 text-[12px] font-semibold text-bow-gold-soft"
                  >
                    {t(T.next)} ›
                  </button>
                </div>

                <div className="mt-8 border-t border-black/10 pt-4 text-[12px] leading-relaxed text-black/45">
                  {lang === "en" ? (
                    <>
                      Flow modelled on the Shin Kong Mitsukoshi 熟客推薦系統
                      deck: staff sign-in → list a piece → share a link → client
                      buys → order lands back on the counter.
                    </>
                  ) : (
                    <>
                      流程參考新光三越「熟客推薦系統」簡報：同仁登入 → 商品建檔
                      → 分享連結 → 顧客下單 → 訂單回到該櫃位。
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-[1400px] px-6 py-8">
          <p className="text-[12px] text-black/45">{t(T.storyHint)}</p>
          {tracks.map((tr) => (
            <section key={tr.id} className="mt-8">
              <h2 className="font-serif text-[18px] font-bold text-bow-ink">
                {t(tr.label)}
              </h2>
              <div className="mt-4 flex flex-wrap gap-6">
                {steps
                  .filter((s) => s.track === tr.id)
                  .map((s, i) => {
                    const S = SCREENS[s.id];
                    const F = tr.frame === "wide" ? WideFrame : PhoneFrame;
                    return (
                      <figure key={s.id} className="w-fit">
                        <F
                          scale={tr.frame === "wide" ? 0.44 : 0.62}
                          label={t(s.title)}
                        >
                          <S />
                        </F>
                        <figcaption className="mt-2 max-w-[240px] text-[12px] font-semibold text-bow-ink">
                          {i + 1}. {t(s.title)}
                        </figcaption>
                      </figure>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
