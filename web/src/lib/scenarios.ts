import { malls as klMalls, TARGET_MALL_ID as KL_TARGET } from "./data/malls";
import { nagoyaMalls, NAGOYA_TARGET_ID } from "./data/nagoya";
import type { Locale } from "./i18n";
import type { Mall } from "./types";

export interface DemandPoint {
  name: string;
  lat: number;
  lng: number;
  weight: number;
}

/** 地方政府開放數據來源設定（人口／年齡結構等） */
export type GovDataConfig =
  | {
      provider: "data.gov.my";
      datasetId: string;
      /** 篩選的行政區（state 欄位值） */
      area: string;
      label: string;
      sourceUrl: string;
    }
  | {
      provider: "estat";
      /** e-Stat 統計表 id */
      statsDataId: string;
      /** 地域コード（市区町村） */
      cdArea: string;
      label: string;
      sourceUrl: string;
    };

export interface Scenario {
  id: string;
  /** 標頭切換器上的短標籤 */
  label: string;
  /** 標頭 pill 顯示的商圈名 */
  areaLabel: string;
  malls: Mall[];
  targetId: string;
  /** estimate_sales_impact 的預設新進入者 */
  defaultEntrantId: string;
  center: { lat: number; lng: number };
  zoom: number;
  /** Google Maps 地區/語言提示 */
  region: string;
  language: string;
  /** UI 與對話回覆語言 */
  locale: Locale;
  /** 本案預設半徑圈（km） */
  defaultRadiusKm: number;
  /** 半徑滑桿的可調範圍（km） */
  radiusRange: { min: number; max: number; step: number };
  /** Huff 模型的人流需求節點 */
  demandPoints: DemandPoint[];
  huffModelLabel: string;
  /** 地方政府開放數據來源（可選） */
  govData?: GovDataConfig;
  /** 對話開場白 */
  greeting: string;
  /** 對話建議問題 */
  suggestions: string[];
  /** 注入模型 systemInstruction 的情境描述 */
  systemContext: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "kl-bbcc",
    label: "KL BBCC",
    areaLabel: "Kuala Lumpur · Bukit Bintang / TRX",
    malls: klMalls,
    targetId: KL_TARGET,
    defaultEntrantId: "118-mall",
    center: { lat: 3.1447, lng: 101.7095 },
    zoom: 15,
    region: "MY",
    language: "en",
    locale: "en",
    defaultRadiusKm: 1.5,
    radiusRange: { min: 0.3, max: 5, step: 0.1 },
    demandPoints: [
      { name: "Bukit Bintang Station", lat: 3.146, lng: 101.7113, weight: 0.3 },
      { name: "Hang Tuah Station", lat: 3.14, lng: 101.706, weight: 0.2 },
      { name: "TRX Station", lat: 3.142, lng: 101.7183, weight: 0.2 },
      { name: "Merdeka Station", lat: 3.1419, lng: 101.7022, weight: 0.15 },
      { name: "Imbi Station", lat: 3.1428, lng: 101.7092, weight: 0.15 },
    ],
    huffModelLabel:
      "Simplified Huff gravity model (attraction = effective floor area / distance², weighted across 5 demand nodes)",
    govData: {
      provider: "data.gov.my",
      datasetId: "population_state",
      area: "W.P. Kuala Lumpur",
      label: "W.P. Kuala Lumpur population structure (DOSM via data.gov.my)",
      sourceUrl: "https://data.gov.my/data-catalogue/population_state",
    },
    greeting:
      "Hello, I'm the Talk to Map trade-area analyst.\nCurrent scenario: **Kuala Lumpur — Bukit Bintang / TRX**, subject: LaLaport BBCC.\nAsk me about competitive threats, radius scans, or the footfall impact of a new mall opening — results are plotted on the map. Use the radius slider to change the analysis catchment.",
    suggestions: [
      "Who is most threatened once 118 Mall opens?",
      "Which competitors are within 1.5 km of LaLaport?",
      "Estimate 118 Mall's footfall impact on each mall",
      "Show KL trade-area potential from official population data",
    ],
    systemContext: `Current scenario: Kuala Lumpur Bukit Bintang / TRX trade area. Subject of analysis is LaLaport BBCC (Mitsui Fudosan). Competitors include 118 Mall @ Merdeka 118 (opening 2026.8), The Exchange TRX, Pavilion KL, Lot 10, Berjaya Times Square, Suria KLCC, Fahrenheit 88, The Starhill, Sungei Wang Plaza, NU Sentral, Quill City Mall, Sunway Putra Mall, Mid Valley Megamall and The Gardens Mall. The user can adjust the analysis radius; the comparison table shows only malls inside that radius.`,
  },
  {
    id: "nagoya-esca",
    label: "名古屋 ESCA",
    areaLabel: "名古屋 · 名駅（新幹線口）",
    malls: nagoyaMalls,
    targetId: NAGOYA_TARGET_ID,
    defaultEntrantId: "gate-tower-takashimaya",
    center: { lat: 35.1708, lng: 136.8822 },
    zoom: 16,
    region: "JP",
    language: "ja",
    locale: "ja",
    defaultRadiusKm: 0.5,
    radiusRange: { min: 0.1, max: 3, step: 0.1 },
    demandPoints: [
      { name: "新幹線口／太閤通口（西）", lat: 35.1706, lng: 136.8798, weight: 0.28 },
      { name: "桜通口（東）", lat: 35.1712, lng: 136.8825, weight: 0.3 },
      { name: "名鉄・近鉄改札（中央）", lat: 35.1695, lng: 136.8823, weight: 0.2 },
      { name: "地下鉄東山線 名古屋駅", lat: 35.1719, lng: 136.8845, weight: 0.12 },
      { name: "あおなみ線／バスターミナル", lat: 35.17, lng: 136.8802, weight: 0.1 },
    ],
    huffModelLabel:
      "簡化 Huff 引力模型（吸引力 = 有效面積 / 距離²，名古屋駅 5 節点で加权）",
    govData: {
      provider: "estat",
      // 国勢調査 男女別人口・世帯数（全国/都道府県/市区町村）。中村区=23105
      statsDataId: "0003448237",
      cdArea: "23105",
      label: "名古屋市中村区 人口・世帯（e-Stat 国勢調査）",
      sourceUrl: "https://www.e-stat.go.jp/",
    },
    greeting:
      "こんにちは、Talk to Map 商圏分析アシスタントです。\n現在のシナリオ：**名古屋・名駅商圏**（本件：エスカ地下街／新幹線口直結）。\n競合：名古屋タカシマヤ／JRゲートタワー、ユニモール、サンロード（閉館予定）、メイチカ（臨時休業）、ミヤコ地下街 など。競合脅威・半径スキャン・客流影響について質問できます——結果は右の地図に同期表示されます。\n（多角的な提案レポートは /proposals/esca へ）",
    suggestions: [
      "エスカ地下街の最大の競合脅威は？",
      "エスカを中心に半径0.5km圏内の競合は？",
      "タカシマヤ級の集客核が客流に与える影響を試算",
      "政府統計（e-Stat）で中村区の人口を見る",
    ],
    systemContext: `現在のシナリオ：名古屋・名駅（名古屋駅）商圏。分析主体は「エスカ地下街」（ESCA、1971年開業、新幹線口／太閤通口直結の地下街、名古屋めし集積、約80店、Google評価3.8）。競合：名古屋タカシマヤ／JRゲートタワー（東口の集客核・脅威最大）、ユニモール（営業中・最直接競合）、ゲートウォーク、名駅地下街サンロード（名鉄エリア再開発に伴い閉館予定と報道・時期は要確認）、メイチカ（リニア関連工事で臨時休業中）、ミヤコ地下街（小規模）、名鉄百貨店／近鉄パッセ。重要な判断軸：リニア中央新幹線により西側（太閤通口＝ESCA側）が再開発の主役になる見込み（開業時期は延期・流動的）。地下街の評価・営業状況は Google マップ由来、面積・来場者数は推定のデモ値であることを明示すること。`,
  },
];

export const DEFAULT_SCENARIO_ID = "kl-bbcc";

export function scenarioById(id: string | undefined): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}
