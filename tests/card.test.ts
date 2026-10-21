import { describe, expect, it } from "vitest";
import { seed, defaultSettings } from "@/seed";
import { applyVisibility } from "@/lib/visibility";
import { toAgentCard } from "@/lib/card";

const maya = seed[0]!.profile;

describe("toAgentCard", () => {
  it("matches the MCP search_people member-card keys", () => {
    const card = toAgentCard(applyVisibility(maya, defaultSettings()), "mem_maya");
    expect(Object.keys(card).sort()).toEqual(
      ["company", "location", "memberContext", "name", "network", "ref", "startedAt", "title", "verdicts"].sort(),
    );
    expect(card).toMatchObject({ ref: "mem_maya", name: "Maya Chen", network: "member", company: "Ramp" });
  });

  it("puts emphasized claims first in memberContext and excludes structured fields", () => {
    const s = { ...defaultSettings(), claimOverrides: { "maya-07": "emphasize" as const } };
    const card = toAgentCard(applyVisibility(maya, s), "mem_maya");
    if ("withheld" in card) throw new Error("unexpected");
    const lines = card.memberContext.split("\n");
    expect(lines[0]).toContain("Selling to CFOs");
    expect(lines[0]!.startsWith("[emphasized]")).toBe(true);
    expect(card.memberContext).not.toContain("Senior Account Executive");
  });

  it("builds memberContext only from visible and emphasized claims", () => {
    const s = { ...defaultSettings(), claimOverrides: { "maya-06": "private" as const } };
    const card = toAgentCard(applyVisibility(maya, s), "mem_maya");
    if ("withheld" in card) throw new Error("unexpected");
    expect(card.memberContext).not.toContain("outbound");
    expect(card.memberContext).not.toContain("$135K");
  });

  it("collapses to withheld when consent is off", () => {
    const card = toAgentCard(applyVisibility(maya, { ...defaultSettings(), consent: false }), "mem_maya");
    expect(card).toEqual({ ref: "mem_maya", withheld: "consent" });
  });

  it("carries verdicts through", () => {
    const card = toAgentCard(applyVisibility(maya, defaultSettings()), "mem_maya", { title: "match" });
    if ("withheld" in card) throw new Error("unexpected");
    expect(card.verdicts).toEqual({ title: "match" });
  });
});
