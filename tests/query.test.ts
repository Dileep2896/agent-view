import { describe, expect, it } from "vitest";
import { seed, defaultSettings, sampleQueries } from "@/seed";
import { applyVisibility } from "@/lib/visibility";
import { matchQuery, parseQuery } from "@/lib/query";
import type { VisibilitySettings } from "@/lib/types";

const byId = (id: string) => seed.find((s) => s.profile.member.id === id)!.profile;
const project = (id: string, s: VisibilitySettings = defaultSettings()) => applyVisibility(byId(id), s);

describe("parseQuery", () => {
  it("parses all five sample queries", () => {
    const parsed = Object.fromEntries(sampleQueries.map((q) => [q.id, parseQuery(q.text)]));
    expect(parsed.q1).toEqual({ titles: ["account executive"], location: ["new york"], keywords: ["series a", "fintech"], baseSalaryUsd: 140000 });
    expect(parsed.q2).toEqual({ titles: ["account executive"], location: ["san francisco"], keywords: [], baseSalaryUsd: 120000, workArrangement: "hybrid" });
    expect(parsed.q3).toEqual({ titles: ["backend engineer"], location: ["san francisco"], keywords: ["payments", "infrastructure"], baseSalaryUsd: 210000 });
    expect(parsed.q4).toEqual({ titles: ["backend engineer"], location: [], keywords: ["go", "postgres"], baseSalaryUsd: 180000, workArrangement: "remote" });
    expect(parsed.q5).toEqual({ titles: ["product designer"], location: [], keywords: ["design systems"], baseSalaryUsd: 140000, workArrangement: "remote" });
  });

  it("handles empty and junk input", () => {
    expect(parseQuery("")).toEqual({ titles: [], location: [], keywords: [] });
    expect(parseQuery("  ,, ")).toEqual({ titles: [], location: [], keywords: [] });
  });

  it("understands onsite / in-person and 1.5k-style amounts", () => {
    expect(parseQuery("designer, in-person, London").workArrangement).toBe("onsite");
    expect(parseQuery("designer $150,000").baseSalaryUsd).toBe(150000);
  });
});

describe("matchQuery", () => {
  it("Maya surfaces for the founding AE query", () => {
    const r = matchQuery(project("maya"), parseQuery(sampleQueries[0]!.text));
    expect(r.surfaces).toBe(true);
    expect(r.score).toBeGreaterThanOrEqual(60);
    expect(r.verdicts).toMatchObject({ title: "match", location: "match" });
    expect(r.matchedClaimIds).toContain("maya-08");
  });

  it("a location mismatch is no_match and blocks surfacing", () => {
    const r = matchQuery(project("maya"), parseQuery(sampleQueries[1]!.text));
    expect(r.verdicts.location).toBe("no_match");
    expect(r.surfaces).toBe(false);
  });

  it("matches Dev and Lucia on their queries", () => {
    expect(matchQuery(project("dev"), parseQuery(sampleQueries[2]!.text)).surfaces).toBe(true);
    expect(matchQuery(project("dev"), parseQuery(sampleQueries[3]!.text)).surfaces).toBe(true);
    expect(matchQuery(project("lucia"), parseQuery(sampleQueries[4]!.text)).surfaces).toBe(true);
  });

  it("emphasized claims count 1.5x", () => {
    const q = parseQuery("account executive, fintech, outbound");
    const base = matchQuery(project("maya"), q).score;
    const s = { ...defaultSettings(), claimOverrides: { "maya-06": "emphasize" as const } };
    expect(matchQuery(project("maya", s), q).score).toBeGreaterThan(base);
  });

  it("hiding a claim turns match into unknown, never no_match", () => {
    const q = parseQuery(sampleQueries[0]!.text);
    const shown = matchQuery(project("maya"), q);
    for (const claim of byId("maya").claims) {
      const hidden = matchQuery(project("maya", { ...defaultSettings(), claimOverrides: { [claim.id]: "private" } }), q);
      for (const [k, v] of Object.entries(hidden.verdicts)) {
        if (shown.verdicts[k] === "match") expect(v === "match" || v === "unknown").toBe(true);
        if (shown.verdicts[k] !== "no_match") expect(v).not.toBe("no_match");
      }
    }
    const noTitle = matchQuery(project("maya", { ...defaultSettings(), claimOverrides: { "maya-01": "private" } }), q);
    expect(noTitle.verdicts.title).toBe("unknown");
  });

  it("never uses private claims as evidence", () => {
    const r = matchQuery(project("maya"), parseQuery("account executive, $135K, relocation"));
    expect(r.matchedClaimIds.some((id) => byId("maya").claims.find((c) => c.id === id)?.category === "private_facts")).toBe(false);
  });

  it("does not surface a withheld member", () => {
    const r = matchQuery(project("maya", { ...defaultSettings(), consent: false }), parseQuery(sampleQueries[0]!.text));
    expect(r).toEqual({ surfaces: false, score: 0, verdicts: {}, matchedClaimIds: [] });
  });

  it("checks work arrangement against a visible preference", () => {
    const r = matchQuery(project("lucia"), parseQuery("product designer, hybrid"));
    expect(r.verdicts.work_arrangement).toBe("no_match");
    const hidden = matchQuery(project("lucia", { ...defaultSettings(), claimOverrides: { "lucia-10": "private" } }), parseQuery("product designer, hybrid"));
    expect(hidden.verdicts.work_arrangement).toBe("unknown");
  });

  it("is deterministic and bounded 0..100", () => {
    for (const q of sampleQueries) {
      const a = matchQuery(project(q.memberId), parseQuery(q.text));
      const b = matchQuery(project(q.memberId), parseQuery(q.text));
      expect(a).toEqual(b);
      expect(a.score).toBeGreaterThanOrEqual(0);
      expect(a.score).toBeLessThanOrEqual(100);
    }
  });
});
