import { describe, expect, it } from "vitest";
import { seed, defaultSettings, mayaBefore, mayaAfter } from "@/seed";
import { discoverabilityScore, storyNumbers, visibleFieldCount } from "@/lib/score";

const maya = seed[0]!.profile;

describe("discoverabilityScore", () => {
  it("is 0 when consent is off", () => {
    expect(discoverabilityScore(maya, { ...defaultSettings(), consent: false })).toBe(0);
  });

  it("follows round(100 * sum(weight x visible) / sum(weight))", () => {
    // weights: experience 5x3, strengths 2x3, goals 2x2, preferences 2x2, private_facts 5x1 = 34
    // mayaBefore: experience 4 visible (12) + strengths 2 (6) = 18 -> 53
    expect(discoverabilityScore(maya, mayaBefore)).toBe(53);
  });

  it("emphasis adds +0.5 weight and the result is capped at 100", () => {
    const all = defaultSettings();
    const everything = { ...all, claimOverrides: Object.fromEntries(maya.claims.map((c) => [c.id, "emphasize" as const])) };
    expect(discoverabilityScore(maya, everything)).toBe(100);
    const one = { ...mayaBefore, claimOverrides: { ...mayaBefore.claimOverrides, "maya-06": "emphasize" as const } };
    expect(discoverabilityScore(maya, one)).toBe(54); // (18 + 0.5) / 34
  });

  it("an answerable private predicate counts as agent-visible", () => {
    const hiddenPreds = { ...defaultSettings(), predicateStates: { ...defaultSettings().predicateStates, salary_min: "hidden" as const } };
    expect(discoverabilityScore(maya, defaultSettings())).toBeGreaterThan(discoverabilityScore(maya, hiddenPreds));
  });

  it("visibleFieldCount counts visible claims plus answerable predicates", () => {
    expect(visibleFieldCount(maya, mayaBefore)).toBe(6);
    expect(visibleFieldCount(maya, { ...mayaBefore, consent: false })).toBe(0);
  });
});

describe("story numbers", () => {
  it("are computed from Maya's seed before/after settings", () => {
    const n = storyNumbers();
    expect(n.scoreBefore).toBe(discoverabilityScore(maya, mayaBefore));
    expect(n.scoreAfter).toBe(discoverabilityScore(maya, mayaAfter));
    expect(n.fieldsBefore).toBe(visibleFieldCount(maya, mayaBefore));
    expect(n.fieldsAfter).toBe(visibleFieldCount(maya, mayaAfter));
    expect(n).toEqual({ scoreBefore: 53, scoreAfter: 88, fieldsBefore: 6, fieldsAfter: 13 });
  });
});
