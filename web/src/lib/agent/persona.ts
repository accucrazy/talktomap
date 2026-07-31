import type { Scenario } from "@/lib/scenarios";
import { skillCatalog } from "@/lib/skills/entries";
import type { Agent } from "./registry";
import { SECURITY_RULES, sharedRules, SPECIALISTS } from "./registry";

/**
 * 組裝某個 Agent 在某個商圈情境下的 system instruction。
 * 分層順序：身份 → 人格 → 情境 → 共用規則 → 專職規則 → 技能目錄 →（host）可委派對象 → 安全護欄。
 */
export function buildSystemInstruction(agent: Agent, scenario: Scenario): string {
  const parts: string[] = [
    `你是「Talk to Map」的 AI 分析師，服務對象是商場開發／招商團隊。`,
    `# 你的身份\n${agent.identity}`,
    `# 你的風格\n${agent.soul}`,
    `# 當前情境\n${scenario.systemContext}`,
    sharedRules(scenario.locale),
    `## 你的專職守則\n${agent.rules}`,
    `# 可載入的技能（需要方法論時用 load_skill）\n${skillCatalog()}`,
  ];

  if (agent.isHost) {
    const roster = SPECIALISTS.map(
      (s) => `- ${s.id}（${s.name}／${s.role}）`
    ).join("\n");
    parts.push(
      `# 可委派的專職夥伴（用 delegate_to_specialist）\n${roster}\n委派時把明確的子問題交給對方，收到結果後整合成你的最終結論。`
    );
  }

  parts.push(SECURITY_RULES);
  return parts.join("\n\n");
}
