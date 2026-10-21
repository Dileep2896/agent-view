import { describe, expect, it } from "vitest";
import { seed, sampleQueries } from "@/seed";
import { span } from "@/seed/claims";
import { SeededExtractor } from "@/lib/extract/seeded";
import { CATEGORIES } from "@/lib/types";

describe("seed data", () => {
  it("has the three planned members", () => {
    expect(seed.map((s) => s.profile.member.name)).toEqual(["Maya Chen", "Dev Patel", "Lucia Rossi"]);
  });

  it.each(seed.map((s) => [s.profile.member.id, s] as const))("%s has 12-20 turns and 10-16 claims", (_id, s) => {
    expect(s.transcript.turns.length).toBeGreaterThanOrEqual(12);
    expect(s.transcript.turns.length).toBeLessThanOrEqual(20);
    expect(s.profile.claims.length).toBeGreaterThanOrEqual(10);
    expect(s.profile.claims.length).toBeLessThanOrEqual(16);
  });

  it("covers every category for every member", () => {
    for (const s of seed) {
      const cats = new Set(s.profile.claims.map((c) => c.category));
      for (const c of CATEGORIES) expect(cats.has(c)).toBe(true);
    }
  });

  it("claim ids are unique", () => {
    const ids = seed.flatMap((s) => s.profile.claims.map((c) => c.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("span() throws when a quote is not verbatim", () => {
    expect(() => span(seed[0]!.transcript, 1, "not in the call")).toThrow(/quote not found/);
    expect(() => span(seed[0]!.transcript, 99, "x")).toThrow(/turn 99 missing/);
  });

  it("ships five sample queries", () => {
    expect(sampleQueries).toHaveLength(5);
  });
});

describe("SeededExtractor", () => {
  const extractor = new SeededExtractor();

  it("every claim quote equals transcript.turns[turnId].text.slice(start, end)", () => {
    for (const s of seed) {
      const profile = extractor.extract(s.transcript);
      for (const c of profile.claims) {
        const { turnId, start, end } = c.evidence;
        expect(s.transcript.turns[turnId]!.text.slice(start, end)).toBe(c.quote);
      }
    }
  });

  it("only quotes what the member said, never the interviewer", () => {
    for (const s of seed) {
      for (const c of extractor.extract(s.transcript).claims) {
        expect(s.transcript.turns[c.evidence.turnId]!.speaker).toBe("member");
      }
    }
  });

  it("throws for an unknown transcript", () => {
    expect(() => extractor.extract({ memberId: "ghost", turns: [] })).toThrow(/no seeded profile/);
  });
});
