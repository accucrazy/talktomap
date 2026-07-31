import type { GoogleGenAI, Content } from "@google/genai";
import { runOfficialStats } from "@/lib/data/govdata";
import { dispatchTool, functionDeclarationsFor } from "@/lib/gemini-tools";
import type { Scenario } from "@/lib/scenarios";
import type { MapAction } from "@/lib/types";
import { buildSystemInstruction } from "./persona";
import { agentById } from "./registry";

export interface SubAgentResult {
  specialist: string;
  reply: string;
  mapActions: MapAction[];
  toolsUsed: string[];
}

const SUBAGENT_MAX_ROUNDS = 2;

/**
 * A2A-lite：以某位專職 subagent 的人格 + 工具白名單，跑一段有界的分析回合，回傳其結論。
 * 由 host 的 delegate_to_specialist 觸發；subagent 不能再委派（避免遞迴）。
 */
export async function runSubAgent(
  ai: GoogleGenAI,
  model: string,
  scenario: Scenario,
  specialistId: string,
  task: string
): Promise<SubAgentResult> {
  const agent = agentById(specialistId);
  if (agent.isHost) {
    return {
      specialist: specialistId,
      reply: `（無效的委派對象「${specialistId}」，可用：applebaum / huff / porter）`,
      mapActions: [],
      toolsUsed: [],
    };
  }

  const tools = agent.tools.filter((t) => t !== "delegate_to_specialist");
  const decls = functionDeclarationsFor(tools);
  const contents: Content[] = [{ role: "user", parts: [{ text: task }] }];
  const mapActions: MapAction[] = [];
  const toolsUsed: string[] = [];
  let reply = "";

  for (let round = 0; round <= SUBAGENT_MAX_ROUNDS; round++) {
    const res = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: buildSystemInstruction(agent, scenario),
        tools: [{ functionDeclarations: decls }],
        temperature: 0.3,
      },
    });

    const calls = res.functionCalls;
    if (!calls || calls.length === 0) {
      reply = res.text ?? "";
      break;
    }

    const modelContent = res.candidates?.[0]?.content;
    if (modelContent) contents.push(modelContent);

    const parts: {
      functionResponse: { name: string; response: { result: unknown } };
    }[] = [];
    for (const call of calls) {
      const name = call.name ?? "";
      const args = (call.args ?? {}) as Record<string, unknown>;
      if (name === "get_official_stats") {
        const { result, mapActions: acts } = await runOfficialStats(scenario);
        toolsUsed.push(name);
        mapActions.push(...acts);
        parts.push({ functionResponse: { name, response: { result } } });
        continue;
      }
      const { result, mapActions: acts } = dispatchTool(name, args, scenario);
      toolsUsed.push(name);
      mapActions.push(...acts);
      parts.push({ functionResponse: { name, response: { result } } });
    }
    contents.push({ role: "user", parts });
  }

  if (!reply) reply = `（${agent.name} 未能在回合限制內完成分析）`;
  return { specialist: agent.name, reply, mapActions, toolsUsed };
}
