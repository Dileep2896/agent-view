import { describe, expect, it } from "vitest";
import { seed, defaultSettings } from "@/seed";
import { answerPredicate, PREDICATE_ANSWERS } from "@/lib/predicates";
import type { PredicateQuestion, VisibilitySettings } from "@/lib/types";

const p = (id: string) => seed.find((s) => s.profile.member.id === id)!.profile;
const s = defaultSettings();

describe("answerPredicate (closed catalog)", () => {
  it("salary_min: meets / below without exposing the number", () => {
    expect(answerPredicate(p("maya"), s, { key: "salary_min", amountUsd: 140000 })).toBe("meets");
    expect(answerPredicate(p("maya"), s, { key: "salary_min", amountUsd: 135000 })).toBe("meets");
    expect(answerPredicate(p("maya"), s, { key: "salary_min", amountUsd: 120000 })).toBe("below");
  });

  it("boolean predicates answer yes / no", () => {
    expect(answerPredicate(p("maya"), s, { key: "us_work_authorization" })).toBe("yes");
    expect(answerPredicate(p("lucia"), s, { key: "us_work_authorization" })).toBe("no");
    expect(answerPredicate(p("dev"), s, { key: "sponsorship_required" })).toBe("yes");
    expect(answerPredicate(p("maya"), s, { key: "sponsorship_required" })).toBe("no");
    expect(answerPredicate(p("lucia"), s, { key: "job_search_availability" })).toBe("no");
    expect(answerPredicate(p("dev"), s, { key: "relocation_willingness" })).toBe("yes");
  });

  it("work_arrangement: compatible / incompatible", () => {
    expect(answerPredicate(p("maya"), s, { key: "work_arrangement", arrangement: "onsite" })).toBe("compatible");
    expect(answerPredicate(p("lucia"), s, { key: "work_arrangement", arrangement: "hybrid" })).toBe("incompatible");
  });

  it("blocked when consent is off", () => {
    expect(answerPredicate(p("maya"), { ...s, consent: false }, { key: "salary_min", amountUsd: 1 })).toBe("blocked");
  });

  it("blocked when that predicate sub-category is hidden", () => {
    const hidden: VisibilitySettings = { ...s, predicateStates: { ...s.predicateStates, salary_min: "hidden" } };
    expect(answerPredicate(p("maya"), hidden, { key: "salary_min", amountUsd: 200000 })).toBe("blocked");
    expect(answerPredicate(p("maya"), hidden, { key: "us_work_authorization" })).toBe("yes");
  });

  it("unknown when nothing was recorded", () => {
    const profile = { ...p("maya"), claims: p("maya").claims.filter((c) => c.predicate !== "salary_min") };
    expect(answerPredicate(profile, s, { key: "salary_min", amountUsd: 140000 })).toBe("unknown");
  });

  it("never returns a raw value, only catalog enums", () => {
    const qs: PredicateQuestion[] = [
      { key: "salary_min", amountUsd: 140000 },
      { key: "us_work_authorization" },
      { key: "sponsorship_required" },
      { key: "job_search_availability" },
      { key: "relocation_willingness" },
      { key: "work_arrangement", arrangement: "remote" },
    ];
    for (const { profile } of seed) {
      for (const q of qs) {
        for (const settings of [s, { ...s, consent: false }]) {
          const a = answerPredicate(profile, settings, q);
          expect(PREDICATE_ANSWERS).toContain(a);
          for (const c of profile.claims) expect(String(a)).not.toBe(String(c.fact));
        }
      }
    }
  });
});
