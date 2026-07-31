import { haversineKm } from "./geo";
import { mallById, resolveMall } from "./resolve";
import type { Scenario } from "./scenarios";
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
    name: m.name,
    nameEn: m.nameEn,
    opened: m.opened,
    size: m.sizeLabel,
    annualFootfall: m.trafficLabel,
    positioning: m.positioning,
    positioningTag: m.positioningTag,
    threatLevel: threatLabel(m),
    note: m.threatNote,
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

/* ---------------- 工具實作（給 Gemini function calling 呼叫，scenario-scoped） ---------------- */

export function listMalls(sc: Scenario) {
  return {
    note: "商圈內所有已建檔商場（示範資料）",
    malls: sc.malls.map(mallSummary),
  };
}

export function getMall(sc: Scenario, nameOrId: string) {
  const m = resolveMall(sc.malls, nameOrId);
  if (!m) return { error: `找不到商場「${nameOrId}」，可用 list_malls 查詢清單` };
  return mallSummary(m);
}

export function getCompetitorsNear(sc: Scenario, nameOrId: string, radiusKm = 1.5) {
  const center = resolveMall(sc.malls, nameOrId);
  if (!center)
    return { error: `找不到商場「${nameOrId}」，可用 list_malls 查詢清單` };
  const competitors = sc.malls
    .filter((m) => m.id !== center.id)
    .map((m) => ({
      ...mallSummary(m),
      distanceKm: round(haversineKm(center.lat, center.lng, m.lat, m.lng)),
      positioningOverlap: round(positioningOverlap(center, m)),
    }))
    .filter((m) => m.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
  return {
    center: center.name,
    radiusKm: radiusKm,
    competitorCount: competitors.length,
    competitors: competitors,
  };
}

/**
 * 威脅分析：對指定商場（預設為本案）
 * 回傳每個競品的威脅層級（人工判讀）+ 量化因子（距離 / 定位重疊 / 規模比）。
 */
export function getThreatAnalysis(sc: Scenario, nameOrId?: string) {
  const target = nameOrId
    ? resolveMall(sc.malls, nameOrId)
    : mallById(sc.malls, sc.targetId);
  if (!target)
    return { error: `找不到商場「${nameOrId}」，可用 list_malls 查詢清單` };
  const rows = sc.malls
    .filter((m) => m.id !== target.id)
    .map((m) => {
      const dist = haversineKm(target.lat, target.lng, m.lat, m.lng);
      const overlap = positioningOverlap(target, m);
      const scaleRatio = m.modelSf / target.modelSf;
      // 綜合威脅分數：定位重疊 ×（距離衰減）×（規模因子），僅供排序參考
      const score = overlap * (1 / (1 + dist)) * Math.min(scaleRatio, 2);
      return {
        ...mallSummary(m),
        distanceKm: round(dist),
        positioningOverlap: round(overlap),
        scaleRatio: round(scaleRatio),
        threatScore: round(score),
      };
    })
    .sort((a, b) => b.threatScore - a.threatScore);
  return {
    subject: target.name,
    note:
      "威脅層級為人工判讀結果；綜合威脅分數 = 定位重疊 × 距離衰減 × 規模因子，僅供相對排序參考（示範資料）",
    competitorThreats: rows,
  };
}

/**
 * 簡化 Huff 引力模型：以「有效面積 / 距離²」計算商圈內各商場的客流分配佔比，
 * 並模擬新進入者開幕前後的佔比變化 → 客流影響估算。
 */
export function estimateSalesImpact(sc: Scenario, newEntrantNameOrId?: string) {
  const entrant = resolveMall(sc.malls, newEntrantNameOrId ?? sc.defaultEntrantId);
  if (!entrant)
    return {
      error: `找不到商場「${newEntrantNameOrId}」，可用 list_malls 查詢清單`,
    };

  const demandPoints = sc.demandPoints;

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

  const withoutEntrant = sc.malls.filter((m) => m.id !== entrant.id);
  const before = huffShares(withoutEntrant);
  const after = huffShares(sc.malls);

  const impact = withoutEntrant.map((m) => {
    const b = before[m.id];
    const a = after[m.id];
    const dropPct = ((b - a) / b) * 100;
    // 影響區間 ±30%（模型不確定性）
    const lo = round(dropPct * 0.7, 1);
    const hi = round(dropPct * 1.3, 1);
    const estVisitLossM = round(m.trafficM * (dropPct / 100), 1);
    return {
      mall: m.name,
      shareBefore: `${round(b * 100, 1)}%`,
      shareAfter: `${round(a * 100, 1)}%`,
      footfallDropEst: `${lo}% ~ ${hi}%`,
      annualVisitLossM: estVisitLossM,
    };
  });

  return {
    model: sc.huffModelLabel,
    newEntrant: `${entrant.name}（${entrant.opened} 開幕）`,
    caveat:
      "示範等級粗略估算：未含價格帶、品牌組合、行銷等因子，僅供相對比較，非精準預測",
    postOpeningShare: `${round(after[entrant.id] * 100, 1)}%（商圈內客流分配佔比）`,
    impactByMall: impact.sort(
      (a, b) => b.annualVisitLossM - a.annualVisitLossM
    ),
  };
}
