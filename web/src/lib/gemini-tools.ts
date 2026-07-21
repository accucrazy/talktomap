import { Type, type FunctionDeclaration } from "@google/genai";
import {
  estimateSalesImpact,
  getCompetitorsNear,
  getMall,
  getThreatAnalysis,
  listMalls,
} from "./analysis";
import { resolveMall, TARGET_MALL_ID } from "./data/malls";
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
      "對指定商場做競爭威脅分析：每個競品的威脅層級、距離、定位重疊度、規模比與綜合威脅分數。未指定時以本案 LaLaport BBCC 為分析主體",
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
      "用簡化 Huff 引力模型估算新商場開幕對商圈內各商場的客流影響（開幕前後客流分配佔比變化、客流下滑區間）。預設新進入者為 118 Mall（2026.8 開幕）",
    parameters: {
      type: Type.OBJECT,
      properties: {
        new_entrant: {
          type: Type.STRING,
          description: "新進入者商場名稱或 id（可省略，預設 118 Mall）",
        },
      },
    },
  },
];

interface DispatchResult {
  result: Record<string, unknown>;
  mapActions: MapAction[];
}

/** 執行工具並自動推導對應的地圖動作 */
export function dispatchTool(
  name: string,
  args: Record<string, unknown>
): DispatchResult {
  const argName = typeof args.name === "string" ? args.name : undefined;

  switch (name) {
    case "list_malls":
      return { result: listMalls(), mapActions: [{ type: "reset" }] };

    case "get_mall": {
      const result = getMall(argName ?? "");
      const mall = argName ? resolveMall(argName) : undefined;
      return {
        result,
        mapActions: mall ? [{ type: "focus", mallId: mall.id, zoom: 16 }] : [],
      };
    }

    case "get_competitors_near": {
      const radiusKm =
        typeof args.radius_km === "number" ? args.radius_km : 1.5;
      const result = getCompetitorsNear(argName ?? "", radiusKm);
      const center = argName ? resolveMall(argName) : undefined;
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
      const result = getThreatAnalysis(argName);
      const target = argName ? resolveMall(argName) : resolveMall(TARGET_MALL_ID);
      const actions: MapAction[] = [];
      if (target && "競品威脅" in result && Array.isArray(result.競品威脅)) {
        actions.push({ type: "focus", mallId: target.id, zoom: 15 });
        actions.push({
          type: "highlight",
          mallIds: (result.競品威脅 as { id: string }[]).map((c) => c.id),
        });
      }
      return { result, mapActions: actions };
    }

    case "estimate_sales_impact": {
      const entrantName =
        typeof args.new_entrant === "string" ? args.new_entrant : "118-mall";
      const result = estimateSalesImpact(entrantName);
      const entrant = resolveMall(entrantName);
      return {
        result,
        mapActions: entrant
          ? [
              { type: "focus", mallId: entrant.id, zoom: 15 },
              { type: "circle", mallId: entrant.id, radiusKm: 1.5 },
            ]
          : [],
      };
    }

    default:
      return { result: { error: `未知工具 ${name}` }, mapActions: [] };
  }
}
