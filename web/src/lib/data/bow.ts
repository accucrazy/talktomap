/**
 * BOW closed-commerce mock-up data.
 *
 * Reference model: the Shin Kong Mitsukoshi 熟客推薦系統 deck — a boutique sales
 * associate lists a product, shares a private link with a close client, and the
 * sale is booked against that associate's ID.
 *
 * Everything here is invented demo data for the pitch. Maison names are
 * placeholders on purpose so the mock-up doesn't put words in a real brand's mouth.
 */

export interface Bilingual {
  en: string;
  zh: string;
}

export const THB = (n: number) => `฿${n.toLocaleString("en-US")}`;

/* ------------------------------------------------------------------ *
 * Sales associate — the person the whole model hangs on
 * ------------------------------------------------------------------ */

export interface SalesAssociate {
  /** Employee ID; this is what gets stamped on every order. */
  code: string;
  name: string;
  nickname: string;
  boutique: string;
  hall: string;
  counter: string;
  bio: string;
  initials: string;
  /** Clients in their private book. */
  clients: number;
}

export const associate: SalesAssociate = {
  code: "BOW-1042",
  name: "Praew Sirikul",
  nickname: "Praew · Fine Jewellery",
  boutique: "BOW Central Embassy",
  hall: "Ground Floor — Atrium",
  counter: "7109320",
  bio: "Fine jewellery & high watchmaking. Private appointments daily 11:00–20:00.",
  initials: "PS",
  clients: 186,
};

/* ------------------------------------------------------------------ *
 * Catalogue
 * ------------------------------------------------------------------ */

export interface Product {
  id: string;
  house: string;
  name: string;
  variant: string;
  sku: string;
  price: number;
  qty: number;
  /** Two hex stops used to fake the product shot without shipping image assets. */
  tone: [string, string];
}

export const catalog: Product[] = [
  {
    id: "p-aurel-serpentine",
    house: "Maison Aurel",
    name: "Serpentine Cuff",
    variant: "18K rose gold · pavé",
    sku: "AUR-SC-118",
    price: 486_000,
    qty: 1,
    tone: ["#d9b877", "#8a6a2f"],
  },
  {
    id: "p-aurel-earrings",
    house: "Maison Aurel",
    name: "Serpentine Ear Studs",
    variant: "18K rose gold",
    sku: "AUR-SE-042",
    price: 154_000,
    qty: 1,
    tone: ["#e6d5ae", "#a98c4f"],
  },
  {
    id: "p-celeste-tote",
    house: "Céleste",
    name: "Ombre Tote",
    variant: "Calfskin · Nuit",
    sku: "CEL-OT-330",
    price: 268_000,
    qty: 1,
    tone: ["#3b3f4a", "#14161c"],
  },
  {
    id: "p-riviere-scarf",
    house: "Rivière",
    name: "Andaman Silk Carré",
    variant: "90cm · Coral",
    sku: "RIV-AC-907",
    price: 32_500,
    qty: 1,
    tone: ["#c96a5b", "#7d3529"],
  },
];

/** The look Praew builds during the walkthrough. */
export const lookItems: Product[] = [catalog[0], catalog[1]];

export const lookTotal = lookItems.reduce((s, i) => s + i.price * i.qty, 0);

export const look = {
  title: "Serpentine — Private Preview",
  note:
    "Khun, the pieces we spoke about on Saturday. Held under your name until Friday — the cuff is the last one in Bangkok.",
  validFrom: "2026-08-07",
  validTo: "2026-08-14",
  public: false,
  linkId: "b76b9f68c-304b-4d6a-bb24",
  shortLink: "bow.co/s/1042/serpentine",
};

/* ------------------------------------------------------------------ *
 * Customer
 * ------------------------------------------------------------------ */

export const client = {
  name: "Khun Nalin",
  tier: "Noir",
  memberSince: "2019",
  address: "Sindhorn Residence, Langsuan, Bangkok 10330",
  card: "•••• 4417",
};

export const orderRef = "BOW26080741";

/* ------------------------------------------------------------------ *
 * Orders — associate's book
 * ------------------------------------------------------------------ */

export interface OrderRow {
  ref: string;
  client: string;
  item: string;
  amount: number;
  placed: string;
  fulfilment: "Boutique pickup" | "White-glove delivery";
  status: Bilingual;
  state: "paid" | "shipped" | "collected";
}

export const associateOrders: OrderRow[] = [
  {
    ref: "BOW26080741",
    client: "Khun Nalin",
    item: "Serpentine Cuff + Ear Studs",
    amount: lookTotal,
    placed: "2026/08/07 18:19",
    fulfilment: "White-glove delivery",
    status: { en: "Paid — preparing", zh: "已付款・備貨中" },
    state: "paid",
  },
  {
    ref: "BOW26080512",
    client: "Khun Ploy",
    item: "Céleste Ombre Tote",
    amount: 268_000,
    placed: "2026/08/05 14:02",
    fulfilment: "Boutique pickup",
    status: { en: "Collected", zh: "已取貨" },
    state: "collected",
  },
  {
    ref: "BOW26080308",
    client: "Mr. Chen",
    item: "Rivière Andaman Carré ×2",
    amount: 65_000,
    placed: "2026/08/03 11:47",
    fulfilment: "White-glove delivery",
    status: { en: "Shipped", zh: "已出貨" },
    state: "shipped",
  },
];

/* ------------------------------------------------------------------ *
 * Attribution — the number Isaac actually wants on the table
 * ------------------------------------------------------------------ */

export const campaign = {
  name: "Moana × BOW — Serpentine",
  window: "2026/07/18 – 2026/08/06",
  channels: "TikTok · IG Reels · YouTube Shorts",
};

export interface FunnelStage {
  label: Bilingual;
  value: number;
  /** Rendered as-is when the raw number needs a unit. */
  display?: string;
  note: Bilingual;
}

export const funnel: FunnelStage[] = [
  {
    label: { en: "Content views", zh: "內容觀看" },
    value: 2_480_000,
    note: { en: "9 posts across 3 platforms", zh: "3 平台共 9 則貼文" },
  },
  {
    label: { en: "Engagements", zh: "互動" },
    value: 186_400,
    note: { en: "7.5% engagement rate", zh: "互動率 7.5%" },
  },
  {
    label: { en: "Link taps", zh: "連結點擊" },
    value: 41_200,
    note: { en: "Bio link + associate links", zh: "個人簡介連結＋專櫃連結" },
  },
  {
    label: { en: "App installs", zh: "App 安裝" },
    value: 6_840,
    note: { en: "16.6% of link taps", zh: "點擊轉安裝 16.6%" },
  },
  {
    label: { en: "Orders", zh: "成交訂單" },
    value: 412,
    note: { en: "6.0% of installs", zh: "安裝轉購買 6.0%" },
  },
];

export const gmv = 18_640_000;
export const avgOrder = Math.round(gmv / 412);
/** Share of GMV carrying an associate code. */
export const attributedShare = 0.78;

export interface LeaderRow {
  code: string;
  name: string;
  boutique: string;
  orders: number;
  gmv: number;
  links: number;
}

export const leaderboard: LeaderRow[] = [
  {
    code: "BOW-1042",
    name: "Praew S.",
    boutique: "Central Embassy",
    orders: 38,
    gmv: 2_410_000,
    links: 96,
  },
  {
    code: "BOW-1178",
    name: "Ken T.",
    boutique: "EmSphere",
    orders: 31,
    gmv: 1_880_000,
    links: 74,
  },
  {
    code: "BOW-0917",
    name: "Mint W.",
    boutique: "Siam Paragon",
    orders: 27,
    gmv: 1_640_000,
    links: 88,
  },
  {
    code: "BOW-1265",
    name: "Arm P.",
    boutique: "ICONSIAM",
    orders: 22,
    gmv: 1_205_000,
    links: 61,
  },
  {
    code: "BOW-0844",
    name: "June K.",
    boutique: "Central Chidlom",
    orders: 19,
    gmv: 980_000,
    links: 55,
  },
];

/* ------------------------------------------------------------------ *
 * Walkthrough script
 * ------------------------------------------------------------------ */

export type TrackId = "associate" | "customer" | "hq";

export interface Track {
  id: TrackId;
  label: Bilingual;
  who: Bilingual;
  frame: "phone" | "wide";
}

export const tracks: Track[] = [
  {
    id: "associate",
    label: { en: "1 · Sales associate", zh: "1・專櫃銷售" },
    who: { en: "Praew, BOW Central Embassy", zh: "Praew，BOW Central Embassy 專櫃" },
    frame: "phone",
  },
  {
    id: "customer",
    label: { en: "2 · Client", zh: "2・顧客" },
    who: { en: "Khun Nalin, Noir member", zh: "Khun Nalin，Noir 會員" },
    frame: "phone",
  },
  {
    id: "hq",
    label: { en: "3 · Head office", zh: "3・總部" },
    who: { en: "Marketing & retail leadership", zh: "行銷與零售管理層" },
    frame: "wide",
  },
];

export interface Step {
  id: string;
  track: TrackId;
  title: Bilingual;
  /** What the person is doing, and why it matters to the pitch. */
  note: Bilingual;
  /** Label on the on-screen primary action, if any. */
}

export const steps: Step[] = [
  {
    id: "sa-login",
    track: "associate",
    title: { en: "Staff sign-in", zh: "同仁登入" },
    note: {
      en: "Employee ID + date of birth, with PDPA consent. Store, hall and counter are pulled from HR, so every listing is already tied to a real person and a real counter.",
      zh: "員編＋西元生日登入並勾選個資條款。店別／館別／櫃號由人資系統自動帶入，因此每一筆上架資料一開始就綁定到真人與真櫃位。",
    },
  },
  {
    id: "sa-home",
    track: "associate",
    title: { en: "My boutique", zh: "我的賣場" },
    note: {
      en: "The associate's own storefront: their book of clients, live links, and the sales those links produced this month. This screen is the reason associates will actually use the app.",
      zh: "銷售人員自己的賣場：熟客名單、進行中的連結，以及這些連結本月帶來的業績。這一頁是專櫃同仁願意持續使用的關鍵。",
    },
  },
  {
    id: "sa-create",
    track: "associate",
    title: { en: "Build a private look", zh: "建立專屬選品" },
    note: {
      en: "Pick pieces from live inventory, add a personal note, set how long the hold lasts. Total price is computed from the line items — the associate never types a number.",
      zh: "從現有庫存挑選商品、寫下給顧客的話、設定保留期限。總價由各單品自動加總，銷售人員不需手動輸入金額。",
    },
  },
  {
    id: "sa-share",
    track: "associate",
    title: { en: "Send it to the client", zh: "分享給顧客" },
    note: {
      en: "One tap to LINE or WhatsApp, copy link, or show a QR code across the counter. The associate code is baked into the link — this is the attribution hook.",
      zh: "一鍵分享到 LINE／WhatsApp、複製連結，或在櫃上出示 QR Code 讓顧客掃描。員編已寫進連結，這就是業績歸屬的關鍵。",
    },
  },
  {
    id: "sa-orders",
    track: "associate",
    title: { en: "My orders", zh: "我的訂單" },
    note: {
      en: "Every order placed through their links, with fulfilment state. Commission is unambiguous because the code travelled with the link.",
      zh: "所有透過個人連結成立的訂單與出貨狀態。因為員編隨連結帶入，業績歸屬沒有爭議。",
    },
  },
  {
    id: "cx-line",
    track: "customer",
    title: { en: "The message", zh: "顧客收到訊息" },
    note: {
      en: "The client gets it where she already talks to her associate — LINE. No ad, no cold traffic: a private message from a person she knows.",
      zh: "顧客在原本就跟專櫃聯絡的 LINE 上收到訊息。不是廣告、不是陌生流量，而是熟悉的人傳來的私訊。",
    },
  },
  {
    id: "cx-landing",
    track: "customer",
    title: { en: "Preview & app gate", zh: "預覽與 App 導引" },
    note: {
      en: "The web preview shows enough to hold interest, then routes her into the BOW app to transact. Install is credited to the same associate link.",
      zh: "網頁預覽先留住興趣，再導引下載 BOW App 完成交易。安裝也會歸屬到同一組專櫃連結。",
    },
  },
  {
    id: "cx-detail",
    track: "customer",
    title: { en: "In-app product page", zh: "App 商品頁" },
    note: {
      en: "Inside the app the associate is named on the page. It reads as a personal recommendation, not a catalogue — which is exactly how luxury already sells.",
      zh: "App 內的商品頁上標示推薦的專櫃人員，讀起來像個人推薦而非型錄——這正是精品原本的銷售方式。",
    },
  },
  {
    id: "cx-checkout",
    track: "customer",
    title: { en: "Checkout", zh: "結帳" },
    note: {
      en: "White-glove delivery or boutique pickup, saved card, no shipping form to fill. Payment is handled on our side — BOW doesn't have to build or operate it.",
      zh: "專人配送或到店取貨、綁定信用卡、免填運送資料。金流由我方處理，BOW 不需自建與維運。",
    },
  },
  {
    id: "cx-done",
    track: "customer",
    title: { en: "Order confirmed", zh: "訂單成立" },
    note: {
      en: "The confirmation names the associate. The client sees continuity of service; the system sees a closed loop from content to cash.",
      zh: "確認頁顯示服務的專櫃人員。對顧客是服務的延續，對系統則是一條從內容到金流的完整迴路。",
    },
  },
  {
    id: "cx-track",
    track: "customer",
    title: { en: "Order status", zh: "訂單狀態" },
    note: {
      en: "Pickup orders carry a collection code; delivery orders show shipped instead. Same states the counter team already works with.",
      zh: "到店取貨訂單顯示取貨憑證，宅配訂單則顯示已出貨。與櫃上現行作業狀態一致。",
    },
  },
  {
    id: "hq-funnel",
    track: "hq",
    title: { en: "Content → revenue", zh: "內容 → 營收" },
    note: {
      en: "The whole point of the exercise: Moana's reach measured all the way down to baht, not to impressions. Every stage is a real, countable event.",
      zh: "這件事的重點：把 Moana 的聲量一路量到實際成交金額，而不是停在曝光數。每一段都是可計數的真實事件。",
    },
  },
  {
    id: "hq-leaderboard",
    track: "hq",
    title: { en: "By associate & boutique", zh: "專櫃人員／門市排行" },
    note: {
      en: "Attribution splits down to the individual. Leadership can see which boutiques converted the campaign and reward it — that is what makes the next campaign easy to sell internally.",
      zh: "業績歸屬可拆到個人。管理層能看到哪些門市真正把聲量轉成成交並給予獎勵——這也讓下一檔活動在內部更容易被支持。",
    },
  },
];

export const stepsByTrack = (t: TrackId) => steps.filter((s) => s.track === t);
