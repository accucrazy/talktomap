import { Type, type FunctionDeclaration } from "@google/genai";
import type { ToolName } from "./agent/registry";
import {
  estimateSalesImpact,
  getCompetitorsNear,
  getMall,
  getThreatAnalysis,
  listMalls,
} from "./analysis";
import { resolveMall, mallById } from "./resolve";
import type { Scenario } from "./scenarios";
import { skillById, SKILLS } from "./skills/entries";
import type { MapAction } from "./types";

/** 給 Gemini 的工具宣告 */
export const functionDeclarations: FunctionDeclaration[] = [
  {
    name: "list_malls",
    description:
      "列出商圈內所有已建檔商場的基本資料（名稱、開幕、規模、年人流、核心定位、威脅層級）",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "get_mall",
    description: "查詢單一商場的詳細資料，可用中文名、英文名或 id",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "商場名稱或 id" },
      },
      required: ["name"],
    },
  },
  {
    name: "get_competitors_near",
    description:
      "以指定商場為中心，掃描半徑內的競品商場，回傳距離與定位重疊度",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "中心商場名稱或 id" },
        radius_km: {
          type: Type.NUMBER,
          description: "掃描半徑（公里），預設 1.5",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "get_threat_analysis",
    description:
      "對指定商場做競爭威脅分析：每個競品的威脅層級、距離、定位重疊度、規模比與綜合威脅分數。未指定時以本案（分析主體）為主體",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "分析主體商場名稱或 id（可省略，預設為本案）",
        },
      },
    },
  },
  {
    name: "estimate_sales_impact",
    description:
      "用簡化 Huff 引力模型估算某商場（新進入者或既有強競合）對商圈內各商場的客流影響（客流分配佔比變化、客流下滑區間）。可省略新進入者，改用該情境的預設對象",
    parameters: {
      type: Type.OBJECT,
      properties: {
        new_entrant: {
          type: Type.STRING,
          description: "對象商場名稱或 id（可省略，使用情境預設）",
        },
      },
    },
  },
  {
    name: "get_official_stats",
    description:
      "查詢本情境所在地的『地方政府開放數據』（人口、年齡結構等官方統計），用於佐證商圈集客潛力。無參數，依當前情境自動選擇資料來源（如馬來西亞 DOSM / 日本 e-Stat）。",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "load_skill",
    description: `按需載入一份領域知識（方法論細節）。可用技能 id：${SKILLS.map(
      (s) => s.id
    ).join("、")}`,
    parameters: {
      type: Type.OBJECT,
      properties: {
        skill_id: { type: Type.STRING, description: "技能 id" },
      },
      required: ["skill_id"],
    },
  },
  {
    name: "delegate_to_specialist",
    description:
      "把一個明確的子問題委派給專職分析師（applebaum=競品掃描、huff=客流模型、porter=威脅評分），取得其分析結論。僅協調者可用。",
    parameters: {
      type: Type.OBJECT,
      properties: {
        specialist: {
          type: Type.STRING,
          description: "專職分析師 id：applebaum / huff / porter",
        },
        task: { type: Type.STRING, description: "交付給對方的明確子問題" },
      },
      required: ["specialist", "task"],
    },
  },
];

const DECL_BY_NAME = new Map(functionDeclarations.map((d) => [d.name, d]));

/** 依 Agent 的工具白名單挑出可用的 function declarations */
export function functionDeclarationsFor(tools: ToolName[]): FunctionDeclaration[] {
  return tools
    .map((t) => DECL_BY_NAME.get(t))
    .filter((d): d is FunctionDeclaration => Boolean(d));
}

interface DispatchResult {
  result: Record<string, unknown>;
  mapActions: MapAction[];
}

/** 執行工具並自動推導對應的地圖動作（scenario-scoped） */
export function dispatchTool(
  name: string,
  args: Record<string, unknown>,
  sc: Scenario
): DispatchResult {
  const argName = typeof args.name === "string" ? args.name : undefined;

  switch (name) {
    case "load_skill": {
      const skillId = typeof args.skill_id === "string" ? args.skill_id : "";
      const skill = skillById(skillId);
      return {
        result: skill
          ? { 技能: skill.title, 內容: skill.body }
          : {
              error: `找不到技能「${skillId}」，可用：${SKILLS.map((s) => s.id).join("、")}`,
            },
        mapActions: [],
      };
    }

    case "list_malls":
      return { result: listMalls(sc), mapActions: [{ type: "reset" }] };

    case "get_mall": {
      const result = getMall(sc, argName ?? "");
      const mall = argName ? resolveMall(sc.malls, argName) : undefined;
      return {
        result,
        mapActions: mall ? [{ type: "focus", mallId: mall.id, zoom: 16 }] : [],
      };
    }

    case "get_competitors_near": {
      const radiusKm =
        typeof args.radius_km === "number" ? args.radius_km : 1.5;
      const result = getCompetitorsNear(sc, argName ?? "", radiusKm);
      const center = argName ? resolveMall(sc.malls, argName) : undefined;
      const actions: MapAction[] = [];
      if (center) {
        actions.push({ type: "circle", mallId: center.id, radiusKm });
        if ("競品" in result && Array.isArray(result.競品)) {
          actions.push({
            type: "highlight",
            mallIds: (result.競品 as { id: string }[]).map((c) => c.id),
          });
        }
      }
      return { result, mapActions: actions };
    }

    case "get_threat_analysis": {
      const result = getThreatAnalysis(sc, argName);
      const target = argName
        ? resolveMall(sc.malls, argName)
        : mallById(sc.malls, sc.targetId);
      const actions: MapAction[] = [];
      if (target && "競品威脅" in result && Array.isArray(result.競品威脅)) {
        actions.push({ type: "focus", mallId: target.id, zoom: sc.zoom });
        actions.push({
          type: "highlight",
          mallIds: (result.競品威脅 as { id: string }[]).map((c) => c.id),
        });
      }
      return { result, mapActions: actions };
    }

    case "estimate_sales_impact": {
      const entrantName =
        typeof args.new_entrant === "string"
          ? args.new_entrant
          : sc.defaultEntrantId;
      const result = estimateSalesImpact(sc, entrantName);
      const entrant = resolveMall(sc.malls, entrantName);
      return {
        result,
        mapActions: entrant
          ? [
              { type: "focus", mallId: entrant.id, zoom: sc.zoom },
              { type: "circle", mallId: entrant.id, radiusKm: 1.5 },
            ]
          : [],
      };
    }

    default:
      return { result: { error: `未知工具 ${name}` }, mapActions: [] };
  }
}
