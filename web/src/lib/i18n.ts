/**
 * 情境別 UI 文案（KL=繁體中文、名古屋=日本語）。
 * 對話回覆語言由 persona 的共用規則注入（scenario.locale）。
 */

export type Locale = "zh-TW" | "ja" | "en";

export interface UIStrings {
  /** header */
  appSubtitle: string;
  demoBadge: string;
  demoBadgeTitle: string;
  proposalLink: string;
  /** 比較表 */
  tableTitle: string;
  tableHint: string;
  collapse: string;
  expand: string;
  colMall: string;
  colOpened: string;
  colSize: string;
  colTraffic: string;
  colPositioning: string;
  colThreat: string;
  /** 地圖 */
  pinTarget: string;
  threatPrefix: string;
  infoOpened: string;
  infoTraffic: string;
  /** 半徑控制 */
  radiusLabel: string;
  radiusWithin: (km: string, n: number) => string;
  colDistance: string;
  /** chat */
  analystLabel: string;
  loadingText: string;
  inputPlaceholder: string;
  sendButton: string;
  analysisFailed: string;
  retryHint: string;
  structuredTitle: string;
  confidenceLabel: string;
  /** 信心水準（模型輸出固定為 高/中/低）在各語言的顯示 */
  confidenceValues: Record<string, string>;
  assumptionsLabel: string;
  delegatePrefix: string;
  prunedSuffix: (n: number) => string;
  toolLabels: Record<string, string>;
  agentRoles: Record<string, string>;
  /** 威脅層級標籤 */
  threatLevels: { target: string; extreme: string; high: string; medium: string; low: string };
}

export const STRINGS: Record<Locale, UIStrings> = {
  "zh-TW": {
    appSubtitle: "對話式商圈分析",
    demoBadge: "示範資料",
    demoBadgeTitle: "種子建檔資料 + 簡化模型，尚未串接 Google Places / 人流 API",
    proposalLink: "提案報告 →",
    tableTitle: "商場競爭比較表",
    tableHint: "點列可定位地圖",
    collapse: "收合 ▾",
    expand: "展開 ▴",
    colMall: "商場",
    colOpened: "開幕",
    colSize: "規模",
    colTraffic: "年人流",
    colPositioning: "核心定位",
    colThreat: "威脅層級",
    pinTarget: "本案",
    threatPrefix: "威脅",
    infoOpened: "開幕",
    infoTraffic: "年人流",
    radiusLabel: "分析半徑",
    radiusWithin: (km, n) => `半徑 ${km} 公里內 · ${n} 家競品`,
    colDistance: "距離",
    analystLabel: "分析師（可切換專職角色）",
    loadingText: "分析中（呼叫工具查詢資料）…",
    inputPlaceholder: "問我商圈競爭、人流影響…",
    sendButton: "送出",
    analysisFailed: "分析失敗",
    retryHint: "請再試一次。",
    structuredTitle: "結構化摘要",
    confidenceLabel: "信心",
    confidenceValues: { 高: "高", 中: "中", 低: "低" },
    assumptionsLabel: "假設／限制",
    delegatePrefix: "委派",
    prunedSuffix: (n) => `省略 ${n} 則舊訊息`,
    toolLabels: {
      list_malls: "商場清單",
      get_mall: "商場資料",
      get_competitors_near: "競品掃描",
      get_threat_analysis: "威脅分析",
      estimate_sales_impact: "客流影響模型",
      get_official_stats: "政府開放數據",
      load_skill: "技能載入",
      delegate_to_specialist: "委派專職",
    },
    agentRoles: {
      reilly: "主商圈分析師",
      applebaum: "競品掃描專員",
      huff: "客流模型師",
      porter: "威脅評分師",
    },
    threatLevels: { target: "本案", extreme: "極高", high: "高", medium: "中", low: "低" },
  },
  ja: {
    appSubtitle: "対話型商圏分析",
    demoBadge: "デモデータ",
    demoBadgeTitle: "シードデータ + 簡易モデル（Google Places / 人流APIは未接続）",
    proposalLink: "提案レポート →",
    tableTitle: "商業施設 競合比較表",
    tableHint: "行をクリックで地図へ",
    collapse: "折りたたむ ▾",
    expand: "展開 ▴",
    colMall: "施設",
    colOpened: "開業",
    colSize: "規模",
    colTraffic: "年間来場者",
    colPositioning: "ポジショニング",
    colThreat: "脅威レベル",
    pinTarget: "本件",
    threatPrefix: "脅威",
    infoOpened: "開業",
    infoTraffic: "年間来場者",
    radiusLabel: "分析半径",
    radiusWithin: (km, n) => `半径 ${km} km 圏内 · 競合 ${n} 件`,
    colDistance: "距離",
    analystLabel: "アナリスト（専門ロールを切替）",
    loadingText: "分析中（ツールでデータ照会中）…",
    inputPlaceholder: "商圏競合や客流影響について質問…",
    sendButton: "送信",
    analysisFailed: "分析に失敗しました",
    retryHint: "もう一度お試しください。",
    structuredTitle: "構造化サマリー",
    confidenceLabel: "信頼度",
    confidenceValues: { 高: "高", 中: "中", 低: "低" },
    assumptionsLabel: "前提／限界",
    delegatePrefix: "委任",
    prunedSuffix: (n) => `古いメッセージ${n}件を省略`,
    toolLabels: {
      list_malls: "施設リスト",
      get_mall: "施設データ",
      get_competitors_near: "競合スキャン",
      get_threat_analysis: "脅威分析",
      estimate_sales_impact: "客流影響モデル",
      get_official_stats: "政府オープンデータ",
      load_skill: "スキル読込",
      delegate_to_specialist: "専門家へ委任",
    },
    agentRoles: {
      reilly: "主席商圏アナリスト",
      applebaum: "競合スキャン担当",
      huff: "客流モデル担当",
      porter: "脅威評価担当",
    },
    threatLevels: { target: "本件", extreme: "最大", high: "高", medium: "中", low: "低" },
  },
  en: {
    appSubtitle: "Conversational trade-area analysis",
    demoBadge: "Demo data",
    demoBadgeTitle:
      "Seed data + simplified models. Google Places / footfall APIs not yet connected.",
    proposalLink: "Proposal report →",
    tableTitle: "Mall Competition Comparison",
    tableHint: "Click a row to locate on map",
    collapse: "Collapse ▾",
    expand: "Expand ▴",
    colMall: "Mall",
    colOpened: "Opened",
    colSize: "Size",
    colTraffic: "Annual footfall",
    colPositioning: "Positioning",
    colThreat: "Threat level",
    pinTarget: "Subject",
    threatPrefix: "Threat: ",
    infoOpened: "Opened",
    infoTraffic: "Footfall",
    radiusLabel: "Analysis radius",
    radiusWithin: (km, n) =>
      `within ${km} km · ${n} competitor${n === 1 ? "" : "s"}`,
    colDistance: "Dist.",
    analystLabel: "Analyst (switch specialist role)",
    loadingText: "Analysing (querying data via tools)…",
    inputPlaceholder: "Ask about competition, footfall impact…",
    sendButton: "Send",
    analysisFailed: "Analysis failed",
    retryHint: "Please try again.",
    structuredTitle: "Structured summary",
    confidenceLabel: "Confidence",
    confidenceValues: { 高: "High", 中: "Medium", 低: "Low" },
    assumptionsLabel: "Assumptions / limits",
    delegatePrefix: "delegated to",
    prunedSuffix: (n) => `${n} older message${n === 1 ? "" : "s"} omitted`,
    toolLabels: {
      list_malls: "Mall list",
      get_mall: "Mall data",
      get_competitors_near: "Competitor scan",
      get_threat_analysis: "Threat analysis",
      estimate_sales_impact: "Footfall impact model",
      get_official_stats: "Government open data",
      load_skill: "Skill loaded",
      delegate_to_specialist: "Delegation",
    },
    agentRoles: {
      reilly: "Lead trade-area analyst",
      applebaum: "Competitor scanning",
      huff: "Footfall modelling",
      porter: "Threat scoring",
    },
    threatLevels: {
      target: "Subject",
      extreme: "Extreme",
      high: "High",
      medium: "Medium",
      low: "Low",
    },
  },
};

export function uiStrings(locale: Locale): UIStrings {
  return STRINGS[locale] ?? STRINGS["zh-TW"];
}
