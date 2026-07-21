import { malls, mallById, resolveMall, TARGET_MALL_ID } from "./data/malls";
import { haversineKm } from "./geo";
import type { Mall } from "./types";

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

/** 兩商場定位重疊度（Jaccard 相似度，0–1） */
export function positioningOverlap(a: Mall, b: Mall): number {
  const sa = new Set(a.segments);
  const sb = new Set(b.segments);
  const inter = [...sa].filter((s) => sb.has(s)).length;
  const union = new Set([...sa, ...sb]).size;
  return union === 0 ? 0 : inter / union;
}

function mallSummary(m: Mall) {
  return {
    id: m.id,
    名稱: m.name,
    英文名: m.nameEn,
    開幕: m.opened,
    規模: m.sizeLabel,
    年人流: m.trafficLabel,
    核心定位: m.positioning,
    定位標籤: m.positioningTag,
    威脅層級: threatLabel(m),
    備註: m.threatNote,
  };
}

export function threatLabel(m: Mall): string {
  switch (m.threatLevel) {
    case "target":
      return "本案";
    case "extreme":
      return "極高";
    case "high":
      return "高";
    case "medium":
      return "中";
    case "low":
      return "低";
  }
}

/* ---------------- 工具實作（給 Gemini function calling 呼叫） ---------------- */

export function listMalls() {
  return {
    說明: "商圈內所有已建檔商場（示範資料）",
    商場: malls.map(mallSummary),
  };
}

export function getMall(nameOrId: string) {
  const m = resolveMall(nameOrId);
  if (!m) return { error: `找不到商場「${nameOrId}」，可用 list_malls 查詢清單` };
  return mallSummary(m);
}

export function getCompetitorsNear(nameOrId: string, radiusKm = 1.5) {
  const center = resolveMall(nameOrId);
  if (!center)
    return { error: `找不到商場「${nameOrId}」，可用 list_malls 查詢清單` };
  const competitors = malls
    .filter((m) => m.id !== center.id)
    .map((m) => ({
      ...mallSummary(m),
      距離公里: round(haversineKm(center.lat, center.lng, m.lat, m.lng)),
      定位重疊度: round(positioningOverlap(center, m)),
    }))
    .filter((m) => m.距離公里 <= radiusKm)
    .sort((a, b) => a.距離公里 - b.距離公里);
  return {
    中心: center.name,
    半徑公里: radiusKm,
    競品數: competitors.length,
    競品: competitors,
  };
}

/**
 * 威脅分析：對指定商場（預設為本案 LaLaport BBCC）
 * 回傳每個競品的威脅層級（人工判讀）+ 量化因子（距離 / 定位重疊 / 規模比）。
 */
export function getThreatAnalysis(nameOrId?: string) {
  const target = nameOrId ? resolveMall(nameOrId) : mallById(TARGET_MALL_ID);
  if (!target)
    return { error: `找不到商場「${nameOrId}」，可用 list_malls 查詢清單` };
  const rows = malls
    .filter((m) => m.id !== target.id)
    .map((m) => {
      const dist = haversineKm(target.lat, target.lng, m.lat, m.lng);
      const overlap = positioningOverlap(target, m);
      const scaleRatio = m.modelSf / target.modelSf;
      // 綜合威脅分數：定位重疊 ×（距離衰減）×（規模因子），僅供排序參考
      const score = overlap * (1 / (1 + dist)) * Math.min(scaleRatio, 2);
      return {
        ...mallSummary(m),
        距離公里: round(dist),
        定位重疊度: round(overlap),
        規模比: round(scaleRatio),
        綜合威脅分數: round(score),
      };
    })
    .sort((a, b) => b.綜合威脅分數 - a.綜合威脅分數);
  return {
    分析主體: target.name,
    說明:
      "威脅層級為人工判讀結果；綜合威脅分數 = 定位重疊 × 距離衰減 × 規模因子，僅供相對排序參考（示範資料）",
    競品威脅: rows,
  };
}

/**
 * 簡化 Huff 引力模型：以「有效面積 / 距離^2」計算商圈內各商場的客流分配佔比，
 * 並模擬新進入者（預設 118 Mall，2026.8 開幕）開幕前後的佔比變化 → 客流影響估算。
 */
export function estimateSalesImpact(newEntrantNameOrId = "118-mall") {
  const entrant = resolveMall(newEntrantNameOrId);
  if (!entrant)
    return {
      error: `找不到商場「${newEntrantNameOrId}」，可用 list_malls 查詢清單`,
    };

  // 需求點：商圈內主要人流節點（車站/路口，示範用）
  const demandPoints = [
    { name: "Bukit Bintang 站", lat: 3.146, lng: 101.7113, weight: 0.3 },
    { name: "Hang Tuah 站", lat: 3.14, lng: 101.706, weight: 0.2 },
    { name: "TRX 站", lat: 3.142, lng: 101.7183, weight: 0.2 },
    { name: "Merdeka 站", lat: 3.1419, lng: 101.7022, weight: 0.15 },
    { name: "Imbi 站", lat: 3.1428, lng: 101.7092, weight: 0.15 },
  ];

  const huffShares = (candidates: Mall[]) => {
    const shares: Record<string, number> = {};
    for (const m of candidates) shares[m.id] = 0;
    for (const dp of demandPoints) {
      const attractions = candidates.map((m) => {
        const d = Math.max(haversineKm(dp.lat, dp.lng, m.lat, m.lng), 0.15);
        return { id: m.id, a: m.modelSf / d ** 2 };
      });
      const total = attractions.reduce((s, x) => s + x.a, 0);
      for (const x of attractions) shares[x.id] += (x.a / total) * dp.weight;
    }
    return shares;
  };

  const withoutEntrant = malls.filter((m) => m.id !== entrant.id);
  const before = huffShares(withoutEntrant);
  const after = huffShares(malls);

  const impact = withoutEntrant.map((m) => {
    const b = before[m.id];
    const a = after[m.id];
    const dropPct = ((b - a) / b) * 100;
    // 影響區間 ±30%（模型不確定性）
    const lo = round(dropPct * 0.7, 1);
    const hi = round(dropPct * 1.3, 1);
    const estVisitLossM = round(m.trafficM * (dropPct / 100), 1);
    return {
      商場: m.name,
      開幕前佔比: `${round(b * 100, 1)}%`,
      開幕後佔比: `${round(a * 100, 1)}%`,
      客流下滑估計: `${lo}% ~ ${hi}%`,
      年客流損失估計_百萬人次: estVisitLossM,
    };
  });

  return {
    模型: "簡化 Huff 引力模型（吸引力 = 有效面積 / 距離²，5 個人流需求節點加權）",
    新進入者: `${entrant.name}（${entrant.opened} 開幕）`,
    警語:
      "示範等級粗略估算：未含價格帶、品牌組合、行銷等因子，僅供相對比較，非精準預測",
    開幕後市佔: `${round(after[entrant.id] * 100, 1)}%（商圈內客流分配佔比）`,
    各商場影響: impact.sort(
      (a, b) =>
        b.年客流損失估計_百萬人次 - a.年客流損失估計_百萬人次
    ),
  };
}
