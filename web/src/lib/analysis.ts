import { malls, mallById, resolveMall, TARGET_MALL_ID } from "./data/malls";
import { haversineKm } from "./geo";
import type { Mall } from "./types";

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

/** Positioning overlap between two malls (Jaccard similarity, 0–1) */
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
    area: m.area,
    opened: m.opened,
    size: m.sizeLabel,
    annualTraffic: m.trafficLabel,
    positioning: m.positioning,
    positioningTag: m.positioningTag,
    threatLevel: threatLabel(m),
    note: m.threatNote,
  };
}

export function threatLabel(m: Mall): string {
  switch (m.threatLevel) {
    case "target":
      return "Subject";
    case "extreme":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
  }
}

/* ---------------- Tool implementations (called via Gemini function calling) ---------------- */

export function listMalls() {
  return {
    note: "All malls on file in this trade area (demo data)",
    malls: malls.map(mallSummary),
  };
}

export function getMall(nameOrId: string) {
  const m = resolveMall(nameOrId);
  if (!m) return { error: `Mall "${nameOrId}" not found; use list_malls to see the list` };
  return mallSummary(m);
}

export function getCompetitorsNear(nameOrId: string, radiusKm = 1.5) {
  const center = resolveMall(nameOrId);
  if (!center)
    return { error: `Mall "${nameOrId}" not found; use list_malls to see the list` };
  const competitors = malls
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
    radiusKm,
    competitorCount: competitors.length,
    competitors,
  };
}

/**
 * Threat analysis for a given mall (defaults to the subject, LaLaport BBCC).
 * Returns each competitor's threat level plus quantified factors
 * (distance / positioning overlap / scale ratio / composite score).
 */
export function getThreatAnalysis(nameOrId?: string) {
  const target = nameOrId ? resolveMall(nameOrId) : mallById(TARGET_MALL_ID);
  if (!target)
    return { error: `Mall "${nameOrId}" not found; use list_malls to see the list` };
  const rows = malls
    .filter((m) => m.id !== target.id)
    .map((m) => {
      const dist = haversineKm(target.lat, target.lng, m.lat, m.lng);
      const overlap = positioningOverlap(target, m);
      const scaleRatio = m.modelSf / target.modelSf;
      // Composite threat score: overlap × distance decay × scale factor, for ranking only
      const score = overlap * (1 / (1 + dist)) * Math.min(scaleRatio, 2);
      return {
        ...mallSummary(m),
        distanceKm: round(dist),
        positioningOverlap: round(overlap),
        scaleRatio: round(scaleRatio),
        compositeThreatScore: round(score),
      };
    })
    .sort((a, b) => b.compositeThreatScore - a.compositeThreatScore);
  return {
    subject: target.name,
    note:
      "Threat level is a manual judgement; composite score = overlap × distance decay × scale factor, for relative ranking only (demo data)",
    competitorThreats: rows,
  };
}

/**
 * Simplified Huff gravity model: computes each mall's share of trade-area
 * footfall as "effective area / distance²", then simulates a new entrant
 * (default: 118 Mall, opening 2026.8) to estimate footfall impact.
 */
export function estimateSalesImpact(newEntrantNameOrId = "118-mall") {
  const entrant = resolveMall(newEntrantNameOrId);
  if (!entrant)
    return {
      error: `Mall "${newEntrantNameOrId}" not found; use list_malls to see the list`,
    };

  // Demand points: major footfall nodes in the trade area (stations/junctions, demo)
  const demandPoints = [
    { name: "Bukit Bintang stn", lat: 3.146, lng: 101.7113, weight: 0.3 },
    { name: "Hang Tuah stn", lat: 3.14, lng: 101.706, weight: 0.2 },
    { name: "TRX stn", lat: 3.142, lng: 101.7183, weight: 0.2 },
    { name: "Merdeka stn", lat: 3.1419, lng: 101.7022, weight: 0.15 },
    { name: "Imbi stn", lat: 3.1428, lng: 101.7092, weight: 0.15 },
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
    // Impact interval ±30% (model uncertainty)
    const lo = round(dropPct * 0.7, 1);
    const hi = round(dropPct * 1.3, 1);
    const estVisitLossM = round(m.trafficM * (dropPct / 100), 1);
    return {
      mall: m.name,
      shareBefore: `${round(b * 100, 1)}%`,
      shareAfter: `${round(a * 100, 1)}%`,
      footfallDropEst: `${lo}% ~ ${hi}%`,
      annualVisitLossEst_millions: estVisitLossM,
    };
  });

  return {
    model:
      "Simplified Huff gravity model (attraction = effective area / distance², 5 weighted demand nodes)",
    newEntrant: `${entrant.name} (opens ${entrant.opened})`,
    caveat:
      "Demo-grade rough estimate: excludes price band, tenant mix, marketing; relative comparison only, not a precise forecast",
    entrantShareAfter: `${round(after[entrant.id] * 100, 1)}% (share of trade-area footfall)`,
    mallImpacts: impact.sort(
      (a, b) => b.annualVisitLossEst_millions - a.annualVisitLossEst_millions
    ),
  };
}
