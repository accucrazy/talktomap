import type { ThreatLevel } from "@/lib/types";

/**
 * 提案標的：名古屋・エスカ地下街（ESCA）— 名古屋駅 太閤通口／新幹線口 直結の地下街。
 *
 * 資料確度混在（提案時務必辨別）：
 *   公開 = 立地・交通・開業年・名物構成など公開情報／報導ベース
 *   政策 = リニア中央新幹線など公表済みの計画（時期は流動的）
 *   推定 = 人流内訳・賃料・坪効率・季節指数など簡易モデル／人工估算
 * 数値はデモ用途の示範値であり、正式提案では一次データ（乗降客統計・賃料査定・POS）で更新すること。
 */

export type Confidence = "公開" | "政策" | "推定";

export const escaMeta = {
  name: "エスカ地下街",
  nameJaKana: "ESCA",
  nameZh: "ESCA 地下街",
  address: "〒453-0015 愛知県名古屋市中村区椿町6-9先",
  mapUrl: "https://maps.app.goo.gl/wiCTBRqY6ECTWkaN7",
  // 名古屋駅・新幹線口付近
  lat: 35.1706,
  lng: 136.8814,
  oneLiner:
    "名古屋駅で唯一、新幹線口（西・太閤通口）に直結する地下街。『名古屋めし』の集積で通過客を捕捉する、食ブランド型ターミナル商業。",
};

export interface FactRow {
  label: string;
  value: string;
  confidence: Confidence;
}

export const escaFacts: FactRow[] = [
  { label: "開業", value: "1971年（東海道新幹線 名古屋駅西口の地下街として）", confidence: "公開" },
  { label: "立地", value: "名古屋駅 太閤通口／新幹線口 直結（西側）・地下1層", confidence: "公開" },
  { label: "店舗数", value: "約75店（飲食・物販・サービス）", confidence: "公開" },
  { label: "業種構成", value: "『名古屋めし』飲食が中核 ＋ 土産・物販・生活サービス", confidence: "公開" },
  { label: "商圏タイプ", value: "ターミナル通過型（出張・旅行・新幹線乗継が母数）", confidence: "推定" },
  { label: "天候依存", value: "地下動線のため天候非依存・回遊安定", confidence: "公開" },
];

/** 名古屋めし等の代表テナント・カテゴリ（集客の核） */
export const foodDraws: { name: string; genre: string }[] = [
  { name: "矢場とん", genre: "みそかつ" },
  { name: "チャオ", genre: "あんかけスパゲッティ" },
  { name: "ソラ豆", genre: "あんかけスパ／喫茶" },
  { name: "住よし系 きしめん", genre: "きしめん・和麺" },
  { name: "手羽先・居酒屋各店", genre: "手羽先唐揚" },
  { name: "喫茶・モーニング", genre: "名古屋式喫茶文化" },
];

/** 名古屋駅周辺の競合。threat = 「その施設が ESCA に与える競争脅威」 */
export interface Competitor {
  id: string;
  name: string;
  nameEn: string;
  side: "西口（太閤通口）" | "中央改札" | "東口（桜通口）";
  type: string;
  threat: ThreatLevel;
  note: string;
}

export const competitors: Competitor[] = [
  {
    id: "esca",
    name: "エスカ地下街",
    nameEn: "ESCA",
    side: "西口（太閤通口）",
    type: "地下街（食）",
    threat: "target",
    note: "本提案の主体",
  },
  {
    id: "gate-tower-takashimaya",
    name: "JRゲートタワー／ジェイアール名古屋タカシマヤ",
    nameEn: "JR Gate Tower / Takashimaya",
    side: "東口（桜通口）",
    type: "駅直上・大型百貨／専門店",
    threat: "extreme",
    note: "東口の圧倒的集客核。質・規模・館内滞在時間で最大の吸引力。",
  },
  {
    id: "unimall",
    name: "ユニモール",
    nameEn: "Unimall",
    side: "中央改札",
    type: "地下街（物販・ファッション）",
    threat: "high",
    note: "同じ地下街フォーマットで物販が強く、最も直接的な競合。",
  },
  {
    id: "gate-walk",
    name: "ゲートウォーク",
    nameEn: "Gate Walk",
    side: "東口（桜通口）",
    type: "地下街（飲食・物販）",
    threat: "medium",
    note: "東口動線の地下回遊を担い、飲食でも一部競合。",
  },
  {
    id: "meichika",
    name: "メイチカ",
    nameEn: "Meichika",
    side: "中央改札",
    type: "地下街（飲食・喫茶）",
    threat: "medium",
    note: "飲食・喫茶で競合するが規模は小さい。",
  },
  {
    id: "sunroad",
    name: "サンロード",
    nameEn: "Sun Road",
    side: "中央改札",
    type: "地下街（ファッション・雑貨）",
    threat: "medium",
    note: "栄方向への回遊を吸収。物販中心で客層はやや相違。",
  },
  {
    id: "meitetsu-kintetsu",
    name: "名鉄百貨店／近鉄パッセ",
    nameEn: "Meitetsu / Kintetsu Passe",
    side: "中央改札",
    type: "百貨・ファッションビル",
    threat: "low",
    note: "私鉄利用客を捕捉。食の通過客とは重なりが小さい。",
  },
];

/** 推定：来街客の内訳（正式提案では現地カウント／アンケートで更新） */
export interface Segment {
  label: string;
  pct: number;
  note: string;
}
export const segments: Segment[] = [
  { label: "出張・ビジネス（新幹線）", pct: 35, note: "平日昼・夕方に集中、単価安定" },
  { label: "旅行・観光（新幹線）", pct: 30, note: "週末・連休に増、名古屋めし目的が多い" },
  { label: "地元・通勤・乗継", pct: 25, note: "反復利用、喫茶・軽食・土産" },
  { label: "インバウンド", pct: 10, note: "回復基調・伸びしろ大（要多言語/免税対応）" },
];

/** 判斷維度スコアカード（1–5）— 「多維度で見る」提案の中核 */
export interface Dimension {
  axis: string;
  score: number; // 1（弱）〜5（強）
  confidence: Confidence;
  comment: string;
}
export const dimensions: Dimension[] = [
  { axis: "立地・駅直結性", score: 5, confidence: "公開", comment: "新幹線口に直結する唯一の地下街。代替不能の一等地。" },
  { axis: "交通結節・母数規模", score: 5, confidence: "公開", comment: "名古屋駅は全社局合計 約120万人/日級（推定）の巨大ターミナル。" },
  { axis: "食ブランド（名古屋めし）", score: 4, confidence: "公開", comment: "矢場とん・あんかけスパ等の集積で全国的認知。強い差別化。" },
  { axis: "飲食テナント競争力", score: 4, confidence: "公開", comment: "目的来店を生む名店群。滞在=食で明確。" },
  { axis: "物販テナント競争力", score: 2, confidence: "推定", comment: "土産中心で弱め。買回り需要は東口に流出しやすい。" },
  { axis: "客層の多様性", score: 3, confidence: "推定", comment: "出張・観光に偏重。地元の日常回遊は限定的。" },
  { axis: "インバウンド対応度", score: 2, confidence: "推定", comment: "多言語・免税・キャッシュレスに伸びしろ（＝機会）。" },
  { axis: "施設の新しさ・快適性", score: 2, confidence: "推定", comment: "1971年開業で老朽感。東口の新しさに見劣り。" },
  { axis: "競合環境（対 東口）", score: 2, confidence: "公開", comment: "高島屋/ゲートタワーの質的優位が継続する構造的劣位。" },
  { axis: "収益性（賃料・坪効率）", score: 3, confidence: "推定", comment: "地下街の集客コスト優位で飲食坪効率は堅調と推定。" },
  { axis: "季節・曜日変動", score: 3, confidence: "推定", comment: "出張=平日/観光=週末で平準化。繁忙は連休・年末年始。" },
  { axis: "リニア再開発の機会", score: 5, confidence: "政策", comment: "太閤通口（西＝ESCA側）が再開発の主役に。中長期の最大の追い風。" },
  { axis: "リニア工事・動線リスク", score: 2, confidence: "推定", comment: "工事期間の動線寸断・回遊減が中期リスク。" },
  { axis: "再定位・改装余地", score: 4, confidence: "推定", comment: "食ブランドを核にした全面刷新の伸びしろが大きい。" },
];

export const swot = {
  S: [
    "新幹線口に直結する唯一無二の立地（代替不能）",
    "『名古屋めし』集積という全国区の食ブランド",
    "ターミナル通過客という巨大かつ安定した母数",
    "地下動線で天候非依存・回遊が安定",
  ],
  W: [
    "1971年開業の施設老朽感・快適性の不足",
    "物販が弱く、買回り需要は東口へ流出",
    "『駅裏（西口）』イメージと東口比の視認性劣位",
    "多言語・免税・キャッシュレス等インバウンド対応の遅れ（推定）",
  ],
  O: [
    "リニア中央新幹線 → 太閤通口（西側）が再開発の主役に",
    "インバウンド回復と『名古屋めし』の海外人気",
    "免税・多言語・キャッシュレスで客単価とインバウンド比率を引き上げ",
    "食ブランドを核にした全面リニューアルの余地",
  ],
  T: [
    "リニア工事期の動線寸断・回遊減",
    "東口（高島屋／ゲートタワー）の質的優位の継続",
    "内食化・EC進展による物販・外食需要の構造変化",
    "為替変動によるインバウンド需要の不安定さ",
    "再開発に伴う賃料・建替え圧力",
  ],
};

export interface TimelineItem {
  year: string;
  title: string;
  body: string;
  kind: "past" | "key" | "future";
}
export const timeline: TimelineItem[] = [
  { year: "1964", title: "東海道新幹線 開業", body: "名古屋駅が東西の大動脈の結節点に。", kind: "past" },
  { year: "1971", title: "エスカ地下街 開業", body: "新幹線口（西）側の地下街として誕生。", kind: "past" },
  { year: "当初 2027", title: "リニア名古屋 開業（当初計画）", body: "名古屋がリニア始発、西側の価値が激変する想定だった。", kind: "key" },
  { year: "現在", title: "開業時期は延期・未定", body: "JR東海が2027年開業は困難と表明。時期は流動的だが方向性は不変。", kind: "key" },
  { year: "開業後", title: "太閤通口が『表玄関』化", body: "リニア始発＝西側が再開発の主役に。ESCAの立地価値が構造的に上昇。", kind: "future" },
];

/** 推定：需要の季節指数（100=年間平均） */
export const seasonality: { label: string; index: number }[] = [
  { label: "1月（年末年始）", index: 118 },
  { label: "2月", index: 88 },
  { label: "3月（春休・卒業）", index: 108 },
  { label: "4月（新年度）", index: 96 },
  { label: "5月（GW）", index: 120 },
  { label: "6月", index: 90 },
  { label: "7月", index: 98 },
  { label: "8月（夏休・帰省）", index: 122 },
  { label: "9月", index: 95 },
  { label: "10月", index: 104 },
  { label: "11月（紅葉・出張期）", index: 106 },
  { label: "12月（忘年・帰省）", index: 115 },
];

export interface StrategyPhase {
  phase: string;
  horizon: string;
  title: string;
  points: string[];
}
export const strategy: StrategyPhase[] = [
  {
    phase: "STEP 1",
    horizon: "0–12ヶ月・即効",
    title: "食ブランドの磨き込み × インバウンド取り込み",
    points: [
      "多言語サイネージ・メニュー、免税・キャッシュレス全店対応",
      "『名古屋めし横丁』としての回遊導線・写真映えの再設計",
      "新幹線改札からの誘導サイン強化（西口＝ESCAの想起率向上）",
    ],
  },
  {
    phase: "STEP 2",
    horizon: "1–3年・中期",
    title: "テナントMIX再編と快適性リニューアル",
    points: [
      "弱い物販を削り、食・体験・土産の比率を最適化",
      "内装・照明・トイレ等の快適性刷新で滞在時間を延伸",
      "曜日・季節の需要差に応じた催事・限定で平準化",
    ],
  },
  {
    phase: "STEP 3",
    horizon: "3年〜・リニア対応",
    title: "太閤通口再開発と連動した再定位",
    points: [
      "リニア動線・西口再開発の全体計画にESCAを組み込む",
      "工事期の回遊維持策（仮設導線・情報発信）を先行設計",
      "『名古屋の食の玄関口』としてのブランド確立",
    ],
  },
];
