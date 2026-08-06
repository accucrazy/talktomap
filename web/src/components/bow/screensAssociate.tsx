import {
  THB,
  associate,
  associateOrders,
  catalog,
  look,
  lookItems,
  lookTotal,
} from "@/lib/data/bow";
import {
  AppBar,
  Avatar,
  FakeQR,
  Field,
  GoldButton,
  ProductShot,
} from "./ui";

/** A1 — staff sign-in (employee ID + DOB + PDPA consent). */
export function SaLogin() {
  return (
    <div className="flex h-full flex-col bg-bow-ink text-bow-ivory">
      <div className="px-8 pt-16 text-center">
        <div className="font-serif text-[34px] font-bold tracking-[0.42em] text-bow-gold-soft">
          BOW
        </div>
        <div className="mt-2 text-[10px] tracking-[0.34em] text-white/45">
          CLIENT ADVISOR PORTAL
        </div>
      </div>
      <div className="mt-10 space-y-4 px-7">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-white/45">
            EMPLOYEE ID
          </span>
          <div className="mt-1 rounded-sm border border-white/20 bg-white/[0.06] px-3 py-2.5 text-[13px]">
            {associate.code}
          </div>
        </div>
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-white/45">
            DATE OF BIRTH
          </span>
          <div className="mt-1 rounded-sm border border-white/20 bg-white/[0.06] px-3 py-2.5 text-[13px] text-white/60">
            19930214
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-[3px] bg-bow-gold text-[10px] font-bold text-bow-ink">
            ✓
          </span>
          <p className="text-[10px] leading-relaxed text-white/50">
            I have read and accept the BOW staff privacy terms (PDPA). Client
            contact details viewed in this app may not be exported or used
            outside a BOW service context.
          </p>
        </div>
        <div className="pt-3">
          <GoldButton>SIGN IN</GoldButton>
        </div>
        <p className="pt-1 text-center text-[10px] text-white/35">
          Store, hall and counter are assigned by HR — they cannot be edited here.
        </p>
      </div>
    </div>
  );
}

/** A2 — the associate's own storefront and month-to-date attributed sales. */
export function SaHome() {
  return (
    <div className="min-h-full bg-bow-ivory pb-6">
      <AppBar title="my boutique" left="☰" right="＋" />
      <div className="bg-bow-ink px-4 pb-5 pt-1 text-bow-ivory">
        <div className="flex items-center gap-3">
          <Avatar initials={associate.initials} size={48} />
          <div className="min-w-0">
            <div className="truncate text-[15px] font-bold">{associate.nickname}</div>
            <div className="mt-0.5 text-[11px] text-white/50">
              {associate.boutique} · {associate.code}
            </div>
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-white/55">{associate.bio}</p>
      </div>

      <div className="grid grid-cols-3 gap-px bg-black/10">
        {[
          { k: "Clients", v: String(associate.clients) },
          { k: "Live links", v: "12" },
          { k: "MTD sales", v: "฿2.41M" },
        ].map((s) => (
          <div key={s.k} className="bg-white px-2 py-3 text-center">
            <div className="font-serif text-[17px] font-bold text-bow-ink">{s.v}</div>
            <div className="mt-0.5 text-[9px] font-semibold tracking-wider text-black/40">
              {s.k.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pt-5">
        <div className="flex items-baseline justify-between">
          <h3 className="text-[11px] font-bold tracking-[0.18em] text-black/50">
            ACTIVE LINKS
          </h3>
          <span className="text-[11px] text-bow-gold">See all</span>
        </div>
        <div className="mt-2 space-y-2">
          {[
            { p: catalog[0], name: "Serpentine — Private Preview", to: "Khun Nalin", v: "3 views" },
            { p: catalog[2], name: "Ombre Tote — Nuit", to: "Khun Ploy", v: "sold" },
            { p: catalog[3], name: "Andaman Carré", to: "Public storefront", v: "41 views" },
          ].map((l) => (
            <div
              key={l.name}
              className="flex items-center gap-3 border border-black/8 bg-white p-2.5"
            >
              <ProductShot product={l.p} size={44} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-semibold text-bow-ink">
                  {l.name}
                </div>
                <div className="mt-0.5 text-[10px] text-black/45">
                  → {l.to} · {l.v}
                </div>
              </div>
              <div className="flex gap-2 text-[13px] text-black/35">
                <span>⧉</span>
                <span>↗</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <GoldButton variant="ink">＋ NEW PRIVATE LOOK</GoldButton>
        </div>
      </div>
    </div>
  );
}

/** A3 — build the look: line items, personal note, hold window. */
export function SaCreate() {
  return (
    <div className="min-h-full bg-bow-ivory pb-3">
      <AppBar title="new look" left="✕" right="Save" />
      <div className="space-y-2.5 px-4 pt-3">
        <div className="flex items-center justify-between rounded-sm border border-black/10 bg-black/[0.04] px-3 py-2 text-[11px] text-black/60">
          <span>
            Central Embassy · Ground Atrium · Counter {associate.counter}
          </span>
          <span className="text-[9px] tracking-wider text-black/35">AUTO</span>
        </div>
        <Field label="Look title" value={look.title} />

        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.16em] text-black/45">
              PIECES
            </span>
            <span className="text-[11px] font-semibold text-bow-gold">＋ Add item</span>
          </div>
          <div className="mt-1.5 divide-y divide-black/8 border border-black/10 bg-white">
            {lookItems.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-2">
                <ProductShot product={p} size={46} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-semibold text-bow-ink">
                    {p.house} {p.name}
                  </div>
                  <div className="mt-0.5 truncate text-[10px] text-black/45">
                    {p.variant} · {p.sku}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-semibold text-bow-ink">
                    {THB(p.price)}
                  </div>
                  <div className="text-[10px] text-black/40">×{p.qty}</div>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between bg-black/[0.03] px-2.5 py-2">
              <span className="text-[10px] font-bold tracking-[0.16em] text-black/50">
                TOTAL · AUTO
              </span>
              <span className="font-serif text-[16px] font-bold text-bow-ink">
                {THB(lookTotal)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-black/45">
            NOTE TO CLIENT
          </span>
          <div className="mt-1 border border-black/15 bg-white p-2.5 text-[11.5px] leading-relaxed text-bow-ink">
            {look.note}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-sm border border-black/15 bg-white px-3 py-2 text-[12px]">
          <span className="text-[10px] font-bold tracking-[0.16em] text-black/45">
            HOLD
          </span>
          <span className="text-bow-ink">
            {look.validFrom} → {look.validTo}
          </span>
        </div>

        <div className="flex items-center justify-between border border-black/10 bg-white px-3 py-2.5">
          <div>
            <div className="text-[12px] font-semibold text-bow-ink">
              Public on my storefront
            </div>
            <div className="mt-0.5 text-[10px] text-black/45">
              Off = private link only
            </div>
          </div>
          <div className="ml-3 h-5 w-9 shrink-0 rounded-full bg-black/15 p-0.5">
            <div className="h-4 w-4 rounded-full bg-white shadow" />
          </div>
        </div>

        <GoldButton>PUBLISH LOOK</GoldButton>
      </div>
    </div>
  );
}

/** A4 — the share sheet: link, LINE, QR. */
export function SaShare() {
  return (
    <div className="min-h-full bg-bow-ivory pb-6">
      <AppBar title="share" left="‹" />
      <div className="px-4 pt-5 text-center">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-bow-gold text-[18px] text-white">
          ✓
        </div>
        <h2 className="mt-3 font-serif text-[18px] font-bold text-bow-ink">
          Your look is live
        </h2>
        <p className="mx-auto mt-1 max-w-[250px] text-[11px] leading-relaxed text-black/50">
          Held for {look.validFrom} – {look.validTo}. Stock is reserved until then.
        </p>
      </div>

      <div className="mx-4 mt-4 border border-black/10 bg-white p-3">
        <div className="text-[10px] font-bold tracking-[0.16em] text-black/45">
          PRIVATE LINK
        </div>
        <div className="mt-1.5 break-all rounded-sm bg-black/[0.04] px-2.5 py-2 font-mono text-[11px] leading-relaxed text-bow-ink">
          https://{look.shortLink}?sa={associate.code}&amp;b={look.linkId}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-black/45">
          <span className="rounded-sm bg-bow-gold/15 px-1.5 py-0.5 font-bold text-bow-gold">
            sa={associate.code}
          </span>
          <span>travels with the link — every order carries your code</span>
        </div>
      </div>

      <div className="mx-4 mt-3 space-y-2">
        <div className="flex w-full items-center justify-center gap-2 rounded-sm bg-bow-line px-4 py-3 text-[13px] font-bold tracking-wide text-white">
          <span className="grid h-4 w-4 place-items-center rounded-[4px] bg-white text-[9px] font-black text-bow-line">
            L
          </span>
          SHARE ON LINE
        </div>
        <GoldButton variant="outline">COPY LINK</GoldButton>
      </div>

      <div className="mx-4 mt-3 border border-black/10 bg-white p-3 text-center">
        <div className="text-[10px] font-bold tracking-[0.16em] text-black/45">
          OR SCAN AT THE COUNTER
        </div>
        <div className="mt-2 flex justify-center">
          <FakeQR size={116} />
        </div>
        <div className="mt-2 text-[10px] text-black/45">
          {look.shortLink} · {associate.code}
        </div>
      </div>
    </div>
  );
}

/** A5 — the associate's order book. */
export function SaOrders() {
  return (
    <div className="min-h-full bg-bow-ivory pb-6">
      <AppBar title="my orders" left="☰" />
      <div className="flex gap-1 bg-bow-ink px-3 pb-3">
        {["All", "Preparing", "Completed"].map((t, i) => (
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

      <div className="px-4 pt-4">
        <div className="border border-bow-gold/40 bg-bow-gold/[0.07] p-3">
          <div className="text-[10px] font-bold tracking-[0.16em] text-black/50">
            AUGUST · ATTRIBUTED TO {associate.code}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-serif text-[24px] font-bold text-bow-ink">฿2,410,000</span>
            <span className="text-[11px] text-black/45">38 orders</span>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {associateOrders.map((o) => (
            <div key={o.ref} className="border border-black/8 bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold text-bow-ink">{o.client}</div>
                  <div className="mt-0.5 truncate text-[11px] text-black/50">{o.item}</div>
                </div>
                <span
                  className={`shrink-0 rounded-sm px-1.5 py-0.5 text-[9px] font-bold ${
                    o.state === "collected"
                      ? "bg-emerald-50 text-emerald-700"
                      : o.state === "shipped"
                        ? "bg-sky-50 text-sky-700"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {o.status.en}
                </span>
              </div>
              <div className="mt-2 flex items-end justify-between border-t border-black/5 pt-2">
                <div className="text-[10px] leading-4 text-black/40">
                  {o.ref}
                  <br />
                  {o.placed} · {o.fulfilment}
                </div>
                <div className="font-serif text-[15px] font-bold text-bow-ink">
                  {THB(o.amount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
