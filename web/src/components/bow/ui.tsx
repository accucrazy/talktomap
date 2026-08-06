import type { CSSProperties, ReactNode } from "react";
import type { Product } from "@/lib/data/bow";

/** iPhone-ish frame. Screens are authored at 360×740 and scaled by the caller. */
export function PhoneFrame({
  children,
  scale = 1,
  label,
}: {
  children: ReactNode;
  scale?: number;
  label?: string;
}) {
  const W = 360;
  const H = 740;
  return (
    <div
      className="shrink-0"
      style={{ width: (W + 20) * scale, height: (H + 20) * scale }}
    >
      <div
        className="origin-top-left rounded-[42px] bg-bow-ink p-[10px] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)]"
        style={{ width: W + 20, height: H + 20, transform: `scale(${scale})` }}
        aria-label={label}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[33px] bg-white">
          {/* status bar */}
          <div className="flex h-[34px] items-end justify-between px-6 pb-1 text-[11px] font-semibold text-bow-ink">
            <span>9:41</span>
            <span className="absolute left-1/2 top-0 h-[24px] w-[110px] -translate-x-1/2 rounded-b-[14px] bg-bow-ink" />
            <span className="tracking-tight">5G ▮▮▯ 􀛨</span>
          </div>
          <div className="h-[calc(100%-34px)] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Desktop/tablet frame for the head-office screens. */
export function WideFrame({
  children,
  scale = 1,
  label,
}: {
  children: ReactNode;
  scale?: number;
  label?: string;
}) {
  const W = 1040;
  const H = 780;
  /** Browser chrome strip + stand, so the caller's box matches what renders. */
  const CHROME = 30;
  const BASE = 18;
  const total = CHROME + H + BASE;
  return (
    <div className="shrink-0" style={{ width: W * scale, height: total * scale }}>
      <div
        className="origin-top-left"
        style={{ width: W, height: total, transform: `scale(${scale})` }}
        aria-label={label}
      >
        <div className="overflow-hidden rounded-t-xl border border-b-0 border-black/10 bg-white shadow-[0_24px_60px_-24px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-1.5 border-b border-black/5 bg-[#f2f0ec] px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 rounded bg-white px-2 py-0.5 text-[10px] text-black/45">
              partners.bow.co/insights
            </span>
          </div>
          <div style={{ height: H }} className="overflow-y-auto">
            {children}
          </div>
        </div>
        <div className="h-[18px] rounded-b-xl bg-[#d8d4cd]" />
      </div>
    </div>
  );
}

/** Black bar with the BOW wordmark — the in-app header. */
export function AppBar({
  title,
  left,
  right,
}: {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between bg-bow-ink px-4 py-3 text-bow-ivory">
      <div className="w-16 text-[13px]">{left}</div>
      <div className="text-center">
        <div className="font-serif text-[17px] font-bold tracking-[0.42em] text-bow-gold-soft">
          BOW
        </div>
        {title ? (
          <div className="mt-0.5 text-[10px] tracking-[0.2em] text-white/55">
            {title.toUpperCase()}
          </div>
        ) : null}
      </div>
      <div className="w-16 text-right text-[13px]">{right}</div>
    </div>
  );
}

export function GoldButton({
  children,
  variant = "solid",
}: {
  children: ReactNode;
  variant?: "solid" | "outline" | "ink";
}) {
  const style =
    variant === "solid"
      ? "bg-bow-gold text-white"
      : variant === "ink"
        ? "bg-bow-ink text-bow-gold-soft"
        : "border border-bow-gold text-bow-gold bg-transparent";
  return (
    <div
      className={`w-full rounded-sm px-4 py-3 text-center text-[13px] font-bold tracking-[0.14em] ${style}`}
    >
      {children}
    </div>
  );
}

export function Field({
  label,
  value,
  placeholder,
  locked,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  locked?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold tracking-[0.16em] text-black/45">
        {label.toUpperCase()}
      </span>
      <div
        className={`mt-1 flex items-center justify-between rounded-sm border px-3 py-2.5 text-[13px] ${
          locked
            ? "border-black/10 bg-black/[0.04] text-black/55"
            : "border-black/15 bg-white text-bow-ink"
        }`}
      >
        <span className={value ? "" : "text-black/30"}>{value ?? placeholder}</span>
        {locked ? (
          <span className="text-[9px] tracking-wider text-black/35">AUTO</span>
        ) : null}
      </div>
    </label>
  );
}

/** Stand-in for a product shot: a tinted panel with the maison initial. */
export function ProductShot({
  product,
  size = 64,
  radius = 2,
}: {
  product: Product;
  size?: number;
  radius?: number;
}) {
  const style: CSSProperties = {
    width: size,
    height: size,
    borderRadius: radius,
    background: `radial-gradient(120% 100% at 30% 20%, ${product.tone[0]} 0%, ${product.tone[1]} 100%)`,
  };
  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={style}
      role="img"
      aria-label={`${product.house} ${product.name}`}
    >
      <span
        className="absolute inset-0 grid place-items-center font-serif font-bold text-white/85"
        style={{ fontSize: size * 0.34 }}
      >
        {product.house[0]}
      </span>
      <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" />
    </div>
  );
}

export function Avatar({ initials, size = 44 }: { initials: string; size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full bg-bow-ink font-serif font-bold text-bow-gold-soft"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

export function TabBar({ active }: { active: "shop" | "orders" | "me" }) {
  const items: { key: "shop" | "orders" | "me"; label: string; glyph: string }[] = [
    { key: "shop", label: "Boutique", glyph: "◈" },
    { key: "orders", label: "Orders", glyph: "❐" },
    { key: "me", label: "Me", glyph: "◍" },
  ];
  return (
    <div className="sticky bottom-0 flex border-t border-black/10 bg-white/95 backdrop-blur">
      {items.map((i) => (
        <div
          key={i.key}
          className={`flex-1 py-2 text-center ${
            active === i.key ? "text-bow-gold" : "text-black/35"
          }`}
        >
          <div className="text-[15px] leading-4">{i.glyph}</div>
          <div className="mt-1 text-[9px] font-semibold tracking-wider">{i.label}</div>
        </div>
      ))}
    </div>
  );
}

/** Fake QR — deterministic pattern, no scanning intended. */
export function FakeQR({ size = 132, seed = 7 }: { size?: number; seed?: number }) {
  const n = 21;
  const cells: boolean[] = [];
  let x = seed * 9301 + 49297;
  for (let i = 0; i < n * n; i++) {
    x = (x * 9301 + 49297) % 233280;
    cells.push(x / 233280 > 0.5);
  }
  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${n} ${n}`}
      role="img"
      aria-label="QR code (mock-up)"
      shapeRendering="crispEdges"
    >
      <rect width={n} height={n} fill="#fff" />
      {cells.map((on, i) => {
        const r = Math.floor(i / n);
        const c = i % n;
        if (isFinder(r, c) || !on) return null;
        return <rect key={i} x={c} y={r} width={1} height={1} fill="#101012" />;
      })}
      {[
        [0, 0],
        [0, n - 7],
        [n - 7, 0],
      ].map(([r, c]) => (
        <g key={`${r}-${c}`} fill="#101012">
          <rect x={c} y={r} width={7} height={7} />
          <rect x={c + 1} y={r + 1} width={5} height={5} fill="#fff" />
          <rect x={c + 2} y={r + 2} width={3} height={3} />
        </g>
      ))}
    </svg>
  );
}
