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

/** Tool declarations for Gemini */
export const functionDeclarations: FunctionDeclaration[] = [
  {
    name: "list_malls",
    description:
      "List all malls on file in the trade area (name, opening, size, annual footfall, core positioning, threat level)",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "get_mall",
    description: "Get details for a single mall by English name or id",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Mall name or id" },
      },
      required: ["name"],
    },
  },
  {
    name: "get_competitors_near",
    description:
      "Scan competitors within a radius of a given mall; returns distance and positioning overlap",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Center mall name or id" },
        radius_km: {
          type: Type.NUMBER,
          description: "Scan radius in km, default 1.5",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "get_threat_analysis",
    description:
      "Competitive threat analysis for a mall: each competitor's threat level, distance, positioning overlap, scale ratio and composite score. Defaults to the subject, LaLaport BBCC",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "Subject mall name or id (optional, defaults to the subject)",
        },
      },
    },
  },
  {
    name: "estimate_sales_impact",
    description:
      "Estimate a new mall's footfall impact on the trade area with a simplified Huff gravity model (share shift before/after opening, footfall-drop range). Defaults to 118 Mall (opens 2026.8)",
    parameters: {
      type: Type.OBJECT,
      properties: {
        new_entrant: {
          type: Type.STRING,
          description: "New-entrant mall name or id (optional, defaults to 118 Mall)",
        },
      },
    },
  },
];

interface DispatchResult {
  result: Record<string, unknown>;
  mapActions: MapAction[];
}

/** Run a tool and derive the matching map actions */
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
        if ("competitors" in result && Array.isArray(result.competitors)) {
          actions.push({
            type: "highlight",
            mallIds: (result.competitors as { id: string }[]).map((c) => c.id),
          });
        }
      }
      return { result, mapActions: actions };
    }

    case "get_threat_analysis": {
      const result = getThreatAnalysis(argName);
      const target = argName ? resolveMall(argName) : resolveMall(TARGET_MALL_ID);
      const actions: MapAction[] = [];
      if (
        target &&
        "competitorThreats" in result &&
        Array.isArray(result.competitorThreats)
      ) {
        actions.push({ type: "focus", mallId: target.id, zoom: 15 });
        actions.push({
          type: "highlight",
          mallIds: (result.competitorThreats as { id: string }[]).map(
            (c) => c.id
          ),
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
      return { result: { error: `Unknown tool ${name}` }, mapActions: [] };
  }
}
