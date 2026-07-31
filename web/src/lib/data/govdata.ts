import type { MapAction } from "@/lib/types";
import type { Scenario } from "@/lib/scenarios";

/**
 * 地方政府開放數據接入。
 * - data.gov.my（馬來西亞 DOSM）：免金鑰，人口 population_state。
 * - e-Stat（日本政府統計）：需免費 appId（環境變數 ESTAT_APP_ID），国勢調査等。
 *
 * 回傳 { result, mapActions }；任何失敗都回傳可讀的 error，不丟例外（chat 不中斷）。
 */

export interface OfficialStatsResult {
  result: Record<string, unknown>;
  mapActions: MapAction[];
}

const TIMEOUT_MS = 12_000;

async function fetchJson(url: string, headers?: Record<string, string>) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

/** 聚焦本案，讓數據與地圖對應 */
function focusTarget(sc: Scenario): MapAction[] {
  return [{ type: "focus", mallId: sc.targetId, zoom: Math.max(sc.zoom - 1, 11) }];
}

interface MyRow {
  state: string;
  date: string;
  sex: string;
  ethnicity: string;
  age: string;
  population: number; // 單位：千人
}

/** 依年齡帶字串分類：幼年(0-14) / 生產年齡(15-64) / 高齡(65+) */
function ageGroup(age: string): "young" | "working" | "senior" | null {
  if (age === "overall_age" || age === "overall") return null;
  if (age.endsWith("+")) {
    const lo = parseInt(age, 10);
    return Number.isFinite(lo) && lo >= 65 ? "senior" : "working";
  }
  const lo = parseInt(age.split("-")[0], 10);
  if (!Number.isFinite(lo)) return null;
  if (lo <= 10) return "young"; // 0-4,5-9,10-14 皆 <15
  if (lo >= 65) return "senior";
  return "working";
}

async function runDataGovMy(
  sc: Scenario,
  cfg: Extract<GovDataCfg, { provider: "data.gov.my" }>
): Promise<OfficialStatsResult> {
  const url = `https://api.data.gov.my/data-catalogue?id=${encodeURIComponent(
    cfg.datasetId
  )}&limit=8000`;
  const rows = (await fetchJson(url)) as MyRow[];
  const area = rows.filter(
    (r) =>
      r.state === cfg.area &&
      r.sex === "overall_sex" &&
      r.ethnicity === "overall_ethnicity"
  );
  if (area.length === 0) {
    return {
      result: { error: `data.gov.my 查無「${cfg.area}」資料` },
      mapActions: [],
    };
  }
  const latest = area.reduce((a, b) => (a.date > b.date ? a : b)).date;
  const latestRows = area.filter((r) => r.date === latest);
  const k = (n: number) => Math.round(n * 1000); // 千人 → 人

  const total =
    latestRows.find((r) => r.age === "overall_age")?.population ?? 0;
  const groups = { young: 0, working: 0, senior: 0 };
  for (const r of latestRows) {
    const g = ageGroup(r.age);
    if (g) groups[g] += r.population;
  }
  const totalPersons = k(total);
  const seniorPct =
    total > 0 ? Math.round((groups.senior / total) * 1000) / 10 : 0;
  const workingPct =
    total > 0 ? Math.round((groups.working / total) * 1000) / 10 : 0;

  return {
    result: {
      來源: cfg.label,
      資料集: cfg.datasetId,
      官方連結: cfg.sourceUrl,
      地區: cfg.area,
      統計時點: latest,
      總人口: totalPersons.toLocaleString("en-US"),
      年齡結構: {
        幼年_0_14: k(groups.young).toLocaleString("en-US"),
        生產年齡_15_64: k(groups.working).toLocaleString("en-US"),
        高齡_65plus: k(groups.senior).toLocaleString("en-US"),
        生產年齡佔比: `${workingPct}%`,
        高齡化率: `${seniorPct}%`,
      },
      說明:
        "來自馬來西亞統計局（DOSM）開放數據；為行政區（州/聯邦直轄區）層級，非商場點位半徑內數字。",
    },
    mapActions: focusTarget(sc),
  };
}

async function runEstat(
  sc: Scenario,
  cfg: Extract<GovDataCfg, { provider: "estat" }>
): Promise<OfficialStatsResult> {
  const appId = process.env.ESTAT_APP_ID;
  if (!appId) {
    return {
      result: {
        error:
          "此情境的政府開放數據來自日本 e-Stat，需要免費的 appId。請至 e-Stat 申請並設定環境變數 ESTAT_APP_ID 後再查詢。",
        申請網址: "https://www.e-stat.go.jp/api/",
        目標: cfg.label,
      },
      mapActions: [],
    };
  }
  const url =
    `https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?appId=${encodeURIComponent(
      appId
    )}&statsDataId=${encodeURIComponent(cfg.statsDataId)}` +
    `&cdArea=${encodeURIComponent(cfg.cdArea)}&limit=50`;
  const data = (await fetchJson(url)) as EstatResponse;
  const root = data?.GET_STATS_DATA;
  const status = root?.RESULT?.STATUS;
  if (status !== 0) {
    return {
      result: {
        error: `e-Stat 回傳錯誤：${root?.RESULT?.ERROR_MSG ?? "未知"}（statsDataId=${cfg.statsDataId}, cdArea=${cfg.cdArea}）`,
        官方連結: cfg.sourceUrl,
      },
      mapActions: [],
    };
  }
  const values = root?.STATISTICAL_DATA?.DATA_INF?.VALUE ?? [];
  const sample = values.slice(0, 12).map((v) => ({
    値: v.$,
    単位: v["@unit"],
    時間: v["@time"],
    地域: v["@area"],
    分類: v["@cat01"],
  }));
  return {
    result: {
      來源: cfg.label,
      官方連結: cfg.sourceUrl,
      統計表: cfg.statsDataId,
      地域コード: cfg.cdArea,
      資料筆數: values.length,
      數值樣本: sample,
      說明:
        "來自日本政府統計 e-Stat（欄位為 e-Stat 代碼，如 @cat01 為分類、@time 為時間）。請據數值樣本歸納人口/世帯概況。",
    },
    mapActions: focusTarget(sc),
  };
}

// 內部型別（避免 scenarios 匯入循環，改用結構型別）
type GovDataCfg = NonNullable<Scenario["govData"]>;

interface EstatResponse {
  GET_STATS_DATA?: {
    RESULT?: { STATUS?: number; ERROR_MSG?: string };
    STATISTICAL_DATA?: {
      DATA_INF?: {
        VALUE?: {
          $: string;
          "@unit"?: string;
          "@time"?: string;
          "@area"?: string;
          "@cat01"?: string;
        }[];
      };
    };
  };
}

export async function runOfficialStats(
  sc: Scenario
): Promise<OfficialStatsResult> {
  const cfg = sc.govData;
  if (!cfg) {
    return {
      result: { error: `「${sc.areaLabel}」情境尚未接入地方政府開放數據` },
      mapActions: [],
    };
  }
  try {
    if (cfg.provider === "data.gov.my") return await runDataGovMy(sc, cfg);
    return await runEstat(sc, cfg);
  } catch (e) {
    return {
      result: {
        error: `政府開放數據查詢失敗：${
          e instanceof Error ? e.message : "未知錯誤"
        }`,
      },
      mapActions: [],
    };
  }
}
