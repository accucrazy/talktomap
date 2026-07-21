// 共用型別定義

/** 威脅層級：target = 本案（分析主體）、extreme/high/medium/low = 競品對本案的威脅程度 */
export type ThreatLevel = "target" | "extreme" | "high" | "medium" | "low";

/** 客群/定位標籤，用於計算定位重疊度 */
export type SegmentTag =
  | "luxury" // 奢侈品
  | "premium" // 高端
  | "mass" // 大眾
  | "family" // 家庭
  | "youth" // 年輕客群
  | "japanese" // 日系主題
  | "food" // 美食導向
  | "tourist" // 觀光客
  | "themepark"; // 室內樂園

export interface Mall {
  id: string;
  /** 中文名稱 */
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  /** 開幕時間（顯示用字串，如 "2026.8"、"1990s"） */
  opened: string;
  /** 規模顯示字串，如 "1.3M sf / 400+ 店" */
  sizeLabel: string;
  /** 供模型計算用的有效商業面積（平方英尺） */
  modelSf: number;
  /** 年人流顯示字串 */
  trafficLabel: string;
  /** 供模型計算用的年人流估計（百萬人次；未公開者為估算值） */
  trafficM: number;
  /** 核心定位描述（bullet points） */
  positioning: string[];
  /** 定位短標籤，如「高端主流」 */
  positioningTag: string;
  /** 客群標籤（計算定位重疊度用） */
  segments: SegmentTag[];
  /** 對本案的威脅層級 */
  threatLevel: ThreatLevel;
  /** 威脅層級註解，如「同層競爭」「已分眾」 */
  threatNote: string;
}

/** Chat 回覆附帶的地圖動作，前端據此操作地圖 */
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
  /** 本輪呼叫過的分析工具（顯示於 UI 供透明化） */
  toolsUsed: string[];
}
