import type { ThreatLevel } from "@/lib/types";

/** Threat level → display label / dots / color (●● Critical / ● High / ● Medium / ● Low) */
export const THREAT_META: Record<
  ThreatLevel,
  { label: string; dots: string; color: string }
> = {
  target: { label: "Subject", dots: "★", color: "var(--threat-target)" },
  extreme: { label: "Critical", dots: "●●", color: "var(--threat-extreme)" },
  high: { label: "High", dots: "●", color: "var(--threat-high)" },
  medium: { label: "Medium", dots: "●", color: "var(--threat-medium)" },
  low: { label: "Low", dots: "●", color: "var(--threat-low)" },
};
