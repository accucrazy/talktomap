import {
  THB,
  associate,
  client,
  look,
  lookItems,
  lookTotal,
  orderRef,
} from "@/lib/data/bow";
import { AppBar, Avatar, GoldButton, ProductShot, TabBar } from "./ui";

/** B1 — the LINE thread where the link actually arrives. */
export function CxLine() {
  return (
    <div className="flex min-h-full flex-col bg-[#8fa9bd]">
      <div className="flex items-center gap-2 bg-[#7b95a9] px-3 py-2.5 text-white">
        <span className="text-[15px]">‹</span>
        <Avatar initials={associate.initials} size={28} />
        <div className="text-[13px] font-semibold">Praew · BOW Embassy</div>
        <div className="ml-auto text-[13px] opacity-80">☰</div>
      </div>

      <div className="flex-1 space-y-2.5 px-3 py-4">
        <div className="text-center">
          <span className="rounded-full bg-black/20 px-2.5 py-0.5 text-[10px] text-white">
            Today
          </span>
        </div>

        <div className="flex gap-2">
          <Avatar initials={associate.initials} size={28} />
          <div className="max-w-[74%] rounded-lg rounded-tl-none bg-white px-3 py-2 text-[12px] leading-relaxed text-bow-ink">
            Khun Nalin, the Serpentine pieces arrived this morning 🤍 I put the
            cuff and the studs aside for you.
          </div>
        </div>

        <div className="flex gap-2">
          <span className="w-7 shrink-0" />
          <div className="max-w-[80%] overflow-hidden rounded-lg rounded-tl-none bg-white">
            <div
              className="h-28 w-full"
              style={{
                background:
                  "radial-gradient(120% 100% at 30% 20%, #d9b877 0%, #8a6a2f 100%)",
              }}
            />
            <div className="p-2.5">
              <div className="text-[12px] font-semibold text-bow-ink">{look.title}</div>
              <div className="mt-0.5 text-[10px] text-black/45">
                2 pieces · {THB(lookTotal)}
              </div>
              <div className="mt-1.5 truncate text-[10px] text-[#2f6fb0]">
                {look.shortLink}?sa={associate.code}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <span className="w-7 shrink-0" />
          <div className="max-w-[74%] rounded-lg rounded-tl-none bg-white px-3 py-2 text-[12px] leading-relaxed text-bow-ink">
            Held under your name until Friday. Everything is in the link —
            payment and delivery too.
          </div>
        </div>

        <div className="flex justify-end">
          <div className="max-w-[70%] rounded-lg rounded-tr-none bg-bow-line px-3 py-2 text-[12px] text-white">
            Opening it now ✨
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white px-3 py-2.5">
        <span className="text-[15px] text-black/35">＋</span>
        <div className="flex-1 rounded-full bg-black/5 px-3 py-1.5 text-[12px] text-black/30">
          Message
        </div>
        <span className="text-[15px] text-black/35">☺</span>
      </div>
    </div>
  );
}

/** B2 — mobile web preview with the app gate. */
export function CxLanding() {
  return (
    <div className="min-h-full bg-white">
      <div className="flex items-center gap-2 bg-[#f2f0ec] px-3 py-2 text-[11px] text-black/50">
        <span>🔒</span>
        <span className="flex-1 truncate">{look.shortLink}</span>
        <span>⟳</span>
      </div>

      <div
        className="relative h-[232px]"
        style={{
          background:
            "radial-gradient(120% 100% at 30% 20%, #d9b877 0%, #6f5426 100%)",
        }}
      >
        <div className="absolute inset-x-0 top-0 p-4">
          <div className="font-serif text-[15px] font-bold tracking-[0.4em] text-white/90">
            BOW
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="text-[10px] tracking-[0.22em] text-white/70">
            PRIVATE PREVIEW
          </div>
          <div className="mt-1 font-serif text-[21px] font-bold text-white">
            {look.title}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center gap-2.5 border border-black/10 bg-bow-ivory p-2.5">
          <Avatar initials={associate.initials} size={36} />
          <div className="min-w-0">
            <div className="text-[11px] text-black/45">Prepared for you by</div>
            <div className="truncate text-[12px] font-semibold text-bow-ink">
              {associate.name} · {associate.boutique}
            </div>
          </div>
        </div>

        <p className="mt-3 text-[12px] leading-relaxed text-bow-ink">“{look.note}”</p>

        <div className="mt-4 space-y-2">
          {lookItems.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <ProductShot product={p} size={52} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-semibold text-bow-ink">
                  {p.house} {p.name}
                </div>
                <div className="text-[10px] text-black/45">{p.variant}</div>
              </div>
              <div className="text-[12px] font-semibold text-bow-ink">{THB(p.price)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* app gate */}
      <div className="sticky bottom-0 border-t border-black/10 bg-white p-4 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)]">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[9px] bg-bow-ink font-serif text-[11px] font-bold tracking-widest text-bow-gold-soft">
            B
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold text-bow-ink">
              Continue in the BOW app
            </div>
            <div className="text-[10px] text-black/45">
              Secure checkout, order tracking, client care
            </div>
          </div>
        </div>
        <div className="mt-2.5">
          <GoldButton>OPEN IN APP</GoldButton>
        </div>
        <div className="mt-1.5 text-center text-[9px] text-black/35">
          Don’t have it yet? The App Store link keeps {associate.code} attached.
        </div>
      </div>
    </div>
  );
}

/** B3 — in-app product page, associate named on it. */
export function CxDetail() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <AppBar left="‹" right="♡" />
      <div
        className="relative h-[186px]"
        style={{
          background:
            "radial-gradient(120% 100% at 32% 22%, #e0c188 0%, #7a5c2a 100%)",
        }}
      >
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="text-[10px] tracking-[0.22em] text-black/45">
          {lookItems[0].house.toUpperCase()}
        </div>
        <h2 className="mt-0.5 font-serif text-[20px] font-bold text-bow-ink">
          {lookItems[0].name}
        </h2>
        <div className="mt-0.5 text-[11px] text-black/50">{lookItems[0].variant}</div>
        <div className="mt-1.5 font-serif text-[19px] font-bold text-bow-ink">
          {THB(lookItems[0].price)}
        </div>

        <div className="mt-2.5 flex items-center gap-2.5 border-y border-black/8 py-2.5">
          <Avatar initials={associate.initials} size={34} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] text-bow-ink">
              Recommended by{" "}
              <span className="font-semibold">{associate.name}</span>
            </div>
            <div className="text-[10px] text-black/45">
              {associate.boutique} · {associate.code}
            </div>
          </div>
          <span className="rounded-sm border border-bow-gold px-2 py-1 text-[10px] font-bold text-bow-gold">
            CHAT
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between bg-bow-ivory px-3 py-1.5 text-[11px]">
          <span className="text-black/55">Reserved for {client.name}</span>
          <span className="font-semibold text-bow-gold">until {look.validTo}</span>
        </div>

        <div className="mt-3">
          <div className="text-[10px] font-bold tracking-[0.16em] text-black/45">
            ALSO IN THIS LOOK
          </div>
          <div className="mt-1.5 flex items-center gap-3 border border-black/8 p-2">
            <ProductShot product={lookItems[1]} size={42} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-semibold text-bow-ink">
                {lookItems[1].name}
              </div>
              <div className="text-[10px] text-black/45">{THB(lookItems[1].price)}</div>
            </div>
            <span className="text-[15px] text-bow-gold">＋</span>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-black/10 px-3 pb-2.5 pt-2.5">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-[11px] text-black/50">2 pieces</span>
          <span className="font-serif text-[17px] font-bold text-bow-ink">
            {THB(lookTotal)}
          </span>
        </div>
        <GoldButton>PURCHASE</GoldButton>
      </div>
      <TabBar active="shop" />
    </div>
  );
}

/** B4 — checkout: fulfilment choice, saved card. */
export function CxCheckout() {
  return (
    <div className="min-h-full bg-bow-ivory pb-4">
      <AppBar title="checkout" left="‹" />
      <div className="space-y-3 px-4 pt-4">
        <div className="border border-black/8 bg-white p-3">
          {lookItems.map((p) => (
            <div key={p.id} className="flex items-center gap-3 py-1.5">
              <ProductShot product={p} size={40} />
              <div className="min-w-0 flex-1 truncate text-[12px] text-bow-ink">
                {p.house} {p.name}
              </div>
              <div className="text-[12px] font-semibold">{THB(p.price)}</div>
            </div>
          ))}
        </div>

        <div>
          <div className="text-[10px] font-bold tracking-[0.16em] text-black/45">
            FULFILMENT
          </div>
          <div className="mt-1.5 space-y-2">
            <div className="flex items-start gap-2.5 border-2 border-bow-gold bg-white p-3">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-[5px] border-bow-gold" />
              <div>
                <div className="text-[12px] font-semibold text-bow-ink">
                  White-glove delivery
                </div>
                <div className="mt-0.5 text-[10px] leading-relaxed text-black/50">
                  {client.address} · insured, signature required, 1–2 business days
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2.5 border border-black/10 bg-white p-3">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-black/25" />
              <div>
                <div className="text-[12px] font-semibold text-bow-ink">
                  Collect at boutique
                </div>
                <div className="mt-0.5 text-[10px] text-black/50">
                  {associate.boutique} · with {associate.name}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold tracking-[0.16em] text-black/45">
            PAYMENT
          </div>
          <div className="mt-1.5 flex items-center gap-2.5 border border-black/10 bg-white p-3">
            <span className="rounded-sm bg-bow-ink px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white">
              VISA
            </span>
            <div className="flex-1 text-[12px] text-bow-ink">
              {client.card} · pay in full
            </div>
            <span className="text-[12px] text-black/30">›</span>
          </div>
        </div>

        <div className="border border-black/8 bg-white p-3 text-[12px]">
          <div className="flex justify-between py-0.5 text-black/55">
            <span>Subtotal</span>
            <span>{THB(lookTotal)}</span>
          </div>
          <div className="flex justify-between py-0.5 text-black/55">
            <span>Delivery</span>
            <span>Complimentary</span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between border-t border-black/8 pt-2">
            <span className="text-[11px] font-bold tracking-wider text-black/50">
              TOTAL
            </span>
            <span className="font-serif text-[18px] font-bold text-bow-ink">
              {THB(lookTotal)}
            </span>
          </div>
          <div className="mt-2 rounded-sm bg-bow-gold/10 px-2 py-1.5 text-[10px] text-black/55">
            Serviced by {associate.name} · {associate.code}
          </div>
        </div>

        <GoldButton>CONFIRM &amp; PAY</GoldButton>
      </div>
    </div>
  );
}

/** B5 — confirmation, associate credited. */
export function CxDone() {
  return (
    <div className="flex min-h-full flex-col bg-bow-ink text-bow-ivory">
      <div className="px-6 pt-14 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-bow-gold text-[24px] text-bow-gold">
          ✓
        </div>
        <h2 className="mt-4 font-serif text-[22px] font-bold text-bow-gold-soft">
          Thank you, {client.name}
        </h2>
        <p className="mt-1.5 text-[11px] leading-relaxed text-white/50">
          Your order is confirmed. {associate.name} will follow up personally
          before delivery.
        </p>
      </div>

      <div className="mx-5 mt-6 border border-white/12 bg-white/[0.05] p-4 text-[12px]">
        {[
          ["Order", orderRef],
          ["Placed", "2026/08/07 18:19"],
          ["Amount", THB(lookTotal)],
          ["Payment", `Visa ${client.card}`],
          ["Fulfilment", "White-glove delivery"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between py-1.5">
            <span className="text-white/45">{k}</span>
            <span className="font-semibold">{v}</span>
          </div>
        ))}
        <div className="mt-2 flex items-center gap-2.5 border-t border-white/10 pt-3">
          <Avatar initials={associate.initials} size={32} />
          <div className="text-[11px]">
            <div className="text-white/45">Client advisor</div>
            <div className="font-semibold">
              {associate.name} · {associate.code}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-2 p-5">
        <GoldButton>VIEW ORDER</GoldButton>
        <div className="text-center text-[10px] text-white/35">
          A copy has been sent to your LINE chat with Praew.
        </div>
      </div>
    </div>
  );
}

/** B6 — order status: delivery vs pickup states. */
export function CxTrack() {
  return (
    <div className="flex min-h-full flex-col bg-bow-ivory">
      <AppBar title="my orders" left="‹" />
      <div className="flex gap-1 bg-bow-ink px-3 pb-3">
        {["In progress", "Completed"].map((t, i) => (
          <div
            key={t}
            className={`rounded-sm px-3 py-1.5 text-[11px] font-semibold ${
              i === 0 ? "bg-bow-gold text-white" : "bg-white/10 text-white/60"
            }`}
          >
            {t}
          </div>
        ))}
      </div>

      <div className="flex-1 space-y-3 px-4 py-4">
        <div className="border border-black/8 bg-white">
          <div className="flex items-center justify-between border-b border-black/8 px-3 py-2">
            <span className="text-[10px] text-black/45">{orderRef}</span>
            <span className="rounded-sm bg-sky-50 px-1.5 py-0.5 text-[9px] font-bold text-sky-700">
              PREPARING
            </span>
          </div>
          <div className="flex items-center gap-3 p-3">
            <ProductShot product={lookItems[0]} size={52} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-semibold text-bow-ink">
                {look.title}
              </div>
              <div className="mt-0.5 text-[10px] text-black/45">2 pieces</div>
              <div className="mt-1 text-[12px] font-semibold text-bow-ink">
                {THB(lookTotal)}
              </div>
            </div>
          </div>
          <div className="border-t border-black/8 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px]">
              {["Paid", "Preparing", "In transit", "Delivered"].map((s, i) => (
                <div key={s} className="flex flex-1 flex-col items-center gap-1">
                  <span
                    className={`h-1.5 w-full rounded-full ${
                      i <= 1 ? "bg-bow-gold" : "bg-black/10"
                    }`}
                  />
                  <span className={i <= 1 ? "text-bow-ink" : "text-black/35"}>{s}</span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 text-[10px] text-black/45">
              White-glove delivery — no collection code is issued for delivery orders.
            </div>
          </div>
        </div>

        <div className="border border-black/8 bg-white opacity-95">
          <div className="flex items-center justify-between border-b border-black/8 px-3 py-2">
            <span className="text-[10px] text-black/45">BOW26080512</span>
            <span className="rounded-sm bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
              COLLECTED
            </span>
          </div>
          <div className="flex items-center gap-3 p-3">
            <ProductShot product={lookItems[1]} size={44} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-semibold text-bow-ink">
                Ombre Tote — Nuit
              </div>
              <div className="mt-0.5 text-[10px] text-black/45">
                Collected 2026/08/06 · Central Embassy
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-black/40">Code</div>
              <div className="font-mono text-[12px] font-bold text-bow-ink">4417</div>
            </div>
          </div>
        </div>
      </div>
      <TabBar active="orders" />
    </div>
  );
}
