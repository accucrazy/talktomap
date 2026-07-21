import type { ThreatLevel } from "@/lib/types";

/** 威脅層級 → 顯示文字/色碼（沿用截圖語意：●● 極高 / ● 高 / ● 中 / ● 低） */
export const THREAT_META: Record<
  ThreatLevel,
  { label: string; dots: string; color: string }
> = {
  target: { label: "本案", dots: "★", color: "var(--threat-target)" },
  extreme: { label: "極高", dots: "●●", color: "var(--threat-extreme)" },
  high: { label: "高", dots: "●", color: "var(--threat-high)" },
  medium: { label: "中", dots: "●", color: "var(--threat-medium)" },
  low: { label: "低", dots: "●", color: "var(--threat-low)" },
};
