// Shared type definitions

/** Threat level: target = the subject mall; extreme/high/medium/low = a competitor's threat to the subject */
export type ThreatLevel = "target" | "extreme" | "high" | "medium" | "low";

/** Customer / positioning segment tags, used to compute positioning overlap */
export type SegmentTag =
  | "luxury"
  | "premium"
  | "mass"
  | "family"
  | "youth"
  | "japanese"
  | "food"
  | "tourist"
  | "themepark";

export interface Mall {
  id: string;
  /** English mall name (primary display) */
  name: string;
  /** District / area subtitle, e.g. "Bukit Bintang", "TRX" */
  area: string;
  lat: number;
  lng: number;
  /** Opening date display string, e.g. "2026.8", "1990s" */
  opened: string;
  /** Size display string, e.g. "1.3M sf / 400+ stores" */
  sizeLabel: string;
  /** Effective retail area (sq ft) used by the models */
  modelSf: number;
  /** Annual footfall display string */
  trafficLabel: string;
  /** Annual footfall estimate (millions of visits) used by the models */
  trafficM: number;
  /** Core positioning bullet points */
  positioning: string[];
  /** Short positioning tag, e.g. "Premium mainstream" */
  positioningTag: string;
  /** Segment tags (for positioning-overlap calculation) */
  segments: SegmentTag[];
  /** Threat level toward the subject mall */
  threatLevel: ThreatLevel;
  /** Threat note, e.g. "Head-to-head", "Already segmented" */
  threatNote: string;
}

/** Map actions carried by a chat reply; the frontend applies them to the map */
export type MapAction =
  | { type: "focus"; mallId: string; zoom?: number }
  | { type: "highlight"; mallIds: string[] }
  | { type: "circle"; mallId: string; radiusKm: number }
  | { type: "reset" };

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface ChatResponse {
  reply: string;
  mapActions: MapAction[];
  /** Analysis tools invoked this turn (surfaced in the UI for transparency) */
  toolsUsed: string[];
}
