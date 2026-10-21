import type { AgentCard, AgentProjection, Verdict, WithheldCard } from "@/lib/types";
import { isStructuredField } from "./visibility";

/** Render a projection as the member card an MCP-style `search_people` tool returns. */
export function toAgentCard(
  projection: AgentProjection,
  ref: string,
  verdicts: Record<string, Verdict> = {},
): AgentCard | WithheldCard {
  if (projection.withheld) return { ref, withheld: "consent" };

  const context = projection.claims
    .filter((c) => !isStructuredField(c.field))
    .map((c, i) => ({ c, i }))
    .sort((a, b) => Number(b.c.emphasized) - Number(a.c.emphasized) || a.i - b.i)
    .map(({ c }) => `${c.emphasized ? "[emphasized] " : ""}${c.label}: ${c.value}`);

  return {
    ref,
    name: projection.name,
    title: projection.fields.title,
    company: projection.fields.company,
    location: projection.fields.location,
    startedAt: projection.fields.startedAt,
    network: "member",
    memberContext: context.join("\n"),
    verdicts,
  };
}

export const memberRef = (memberId: string) => `mem_${memberId}`;
