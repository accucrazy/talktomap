import {
  THB,
  attributedShare,
  avgOrder,
  campaign,
  funnel,
  gmv,
  leaderboard,
} from "@/lib/data/bow";

function HqHeader({ tab }: { tab: "funnel" | "people" }) {
  return (
    <div className="bg-bow-ink px-6 py-4 text-bow-ivory">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-[16px] font-bold tracking-[0.4em] text-bow-gold-soft">
            BOW
          </span>
          <span className="text-[11px] tracking-[0.2em] text-white/45">
            COMMERCE INSIGHTS
          </span>
        </div>
        <span className="text-[11px] text-white/45">{campaign.window}</span>
      </div>
      <div className="mt-3 flex gap-5 text-[12px]">
        {[
          { k: "funnel", l: "Campaign funnel" },
          { k: "people", l: "Associates & boutiques" },
        ].map((t) => (
          <span
            key={t.k}
            className={`pb-1 ${
              tab === t.k
                ? "border-b-2 border-bow-gold font-semibold text-white"
                : "text-white/45"
            }`}
          >
            {t.l}
          </span>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`border p-4 ${
        accent ? "border-bow-gold bg-bow-gold/[0.07]" : "border-black/10 bg-white"
      }`}
    >
      <div className="text-[10px] font-bold tracking-[0.16em] text-black/45">
        {label.toUpperCase()}
      </div>
      <div className="mt-1.5 font-serif text-[26px] font-bold leading-none text-bow-ink">
        {value}
      </div>
      <div className="mt-1.5 text-[11px] text-black/50">{sub}</div>
    </div>
  );
}

/** C1 — content → revenue funnel. The slide Isaac wants in front of Khun Pink. */
export function HqFunnel() {
  const top = funnel[0].value;
  return (
    <div className="min-h-full bg-bow-ivory">
      <HqHeader tab="funnel" />
      <div className="px-6 py-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-[20px] font-bold text-bow-ink">
            {campaign.name}
          </h2>
          <span className="text-[11px] text-black/45">{campaign.channels}</span>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          <Stat
            label="Attributed GMV"
            value={`฿${(gmv / 1_000_000).toFixed(2)}M`}
            sub="Orders carrying a campaign or associate code"
            accent
          />
          <Stat label="Orders" value="412" sub="From 6,840 installs" />
          <Stat label="Avg. order" value={THB(avgOrder)} sub="Fine jewellery mix" />
          <Stat
            label="Associate-linked"
            value={`${Math.round(attributedShare * 100)}%`}
            sub="Of GMV traced to a named advisor"
          />
        </div>

        <div className="mt-6 border border-black/10 bg-white p-5">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[11px] font-bold tracking-[0.18em] text-black/50">
              CONTENT → REVENUE
            </h3>
            <span className="text-[10px] text-black/40">
              Each stage is a counted event, not a modelled estimate
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {funnel.map((s, i) => {
              const width = Math.max(8, (s.value / top) ** 0.42 * 100);
              const prev = i === 0 ? null : funnel[i - 1].value;
              return (
                <div key={s.label.en} className="flex items-center gap-4">
                  <div className="w-32 shrink-0 text-right">
                    <div className="text-[12px] font-semibold text-bow-ink">
                      {s.label.en}
                    </div>
                    <div className="text-[10px] text-black/40">{s.label.zh}</div>
                  </div>
                  <div className="flex-1">
                    <div
                      className="flex h-11 items-center rounded-sm px-3 text-white"
                      style={{
                        width: `${width}%`,
                        background: `linear-gradient(90deg, #101012 0%, ${
                          i === funnel.length - 1 ? "#b8964f" : "#4a4a52"
                        } 100%)`,
                      }}
                    >
                      <span className="font-serif text-[16px] font-bold">
                        {s.value.toLocaleString("en-US")}
                      </span>
                    </div>
                  </div>
                  <div className="w-52 shrink-0 text-[10px] leading-4 text-black/45">
                    {prev ? (
                      <span className="font-semibold text-bow-gold">
                        {((s.value / prev) * 100).toFixed(1)}% ↓{" "}
                      </span>
                    ) : null}
                    {s.note.en}
                  </div>
                </div>
              );
            })}

            <div className="flex items-center gap-4 pt-1">
              <div className="w-32 shrink-0 text-right">
                <div className="text-[12px] font-semibold text-bow-ink">Revenue</div>
                <div className="text-[10px] text-black/40">成交金額</div>
              </div>
              <div className="flex-1">
                <div className="flex h-11 w-[26%] items-center rounded-sm bg-bow-gold px-3 text-white">
                  <span className="font-serif text-[16px] font-bold">
                    ฿{(gmv / 1_000_000).toFixed(2)}M
                  </span>
                </div>
              </div>
              <div className="w-52 shrink-0 text-[10px] leading-4 text-black/45">
                ฿7.51 in GMV per baht of campaign spend
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[10px] leading-relaxed text-black/40">
          Demo figures. In production each stage reads from a real source —
          platform APIs for reach, link service for taps, MMP for installs, the
          BOW order table for orders and GMV.
        </p>
      </div>
    </div>
  );
}

/** C2 — attribution split by associate and boutique. */
export function HqLeaderboard() {
  const max = leaderboard[0].gmv;
  return (
    <div className="min-h-full bg-bow-ivory">
      <HqHeader tab="people" />
      <div className="px-6 py-4">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Active advisors" value="64" sub="Across 9 boutiques" />
          <Stat label="Links shared" value="1,284" sub="Private + storefront" />
          <Stat
            label="Link → order"
            value="4.1%"
            sub="Private links convert 3× storefront links"
            accent
          />
        </div>

        <div className="mt-5 border border-black/10 bg-white">
          <div className="flex items-baseline justify-between border-b border-black/8 px-5 py-3">
            <h3 className="text-[11px] font-bold tracking-[0.18em] text-black/50">
              TOP CLIENT ADVISORS
            </h3>
            <span className="text-[10px] text-black/40">{campaign.window}</span>
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-black/8 text-[10px] font-bold tracking-wider text-black/40">
                <th className="px-5 py-2 text-left">ADVISOR</th>
                <th className="px-3 py-2 text-left">BOUTIQUE</th>
                <th className="px-3 py-2 text-right">LINKS</th>
                <th className="px-3 py-2 text-right">ORDERS</th>
                <th className="px-3 py-2 text-right">GMV</th>
                <th className="px-5 py-2 text-left">SHARE</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((r, i) => (
                <tr
                  key={r.code}
                  className={`border-b border-black/5 ${i === 0 ? "bg-bow-gold/[0.06]" : ""}`}
                >
                  <td className="px-5 py-2">
                    <div className="font-semibold text-bow-ink">{r.name}</div>
                    <div className="text-[10px] text-black/40">{r.code}</div>
                  </td>
                  <td className="px-3 py-2 text-black/60">{r.boutique}</td>
                  <td className="px-3 py-2 text-right text-black/60">{r.links}</td>
                  <td className="px-3 py-2 text-right font-semibold text-bow-ink">
                    {r.orders}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-bow-ink">
                    {THB(r.gmv)}
                  </td>
                  <td className="px-5 py-2">
                    <span
                      className="block h-2 rounded-full bg-bow-gold"
                      style={{ width: `${(r.gmv / max) * 100}%` }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="border border-black/10 bg-white p-4">
            <h3 className="text-[11px] font-bold tracking-[0.18em] text-black/50">
              WHERE THE ORDER CAME FROM
            </h3>
            <div className="mt-3 space-y-2">
              {[
                { l: "Private link from advisor", v: 62 },
                { l: "Advisor public storefront", v: 16 },
                { l: "Moana bio link (unassigned)", v: 15 },
                { l: "In-app browse", v: 7 },
              ].map((r) => (
                <div key={r.l} className="flex items-center gap-3">
                  <span className="w-44 shrink-0 text-[11px] text-black/60">{r.l}</span>
                  <span className="h-2.5 flex-1 rounded-full bg-black/[0.06]">
                    <span
                      className="block h-2.5 rounded-full bg-bow-ink"
                      style={{ width: `${r.v}%` }}
                    />
                  </span>
                  <span className="w-9 shrink-0 text-right text-[11px] font-semibold text-bow-ink">
                    {r.v}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-black/10 bg-white p-4">
            <h3 className="text-[11px] font-bold tracking-[0.18em] text-black/50">
              WHAT THIS SETTLES
            </h3>
            <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-black/65">
              <li>
                <span className="font-semibold text-bow-ink">Buzz → baht.</span> The
                campaign is reported in revenue, not impressions.
              </li>
              <li>
                <span className="font-semibold text-bow-ink">Counter staff win too.</span>{" "}
                Online sales land on a named advisor, so the floor stops treating
                digital as a competitor.
              </li>
              <li>
                <span className="font-semibold text-bow-ink">No channel conflict.</span>{" "}
                Closed platform, invite-only links — the brand never appears on an
                open marketplace.
              </li>
              <li>
                <span className="font-semibold text-bow-ink">Payment is ours.</span> BOW
                gets the rail without building or operating it.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
