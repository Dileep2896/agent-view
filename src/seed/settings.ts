import type { VisibilitySettings } from "@/lib/types";
import { PREDICATES } from "@/lib/types";

const allPredicates = (state: "answerable" | "hidden") =>
  Object.fromEntries(PREDICATES.map((p) => [p, state])) as VisibilitySettings["predicateStates"];

/** Sensible default: everything visible, private facts private-but-answerable. */
export function defaultSettings(): VisibilitySettings {
  return {
    consent: true,
    categoryDefaults: {
      experience: "visible",
      strengths: "visible",
      goals: "visible",
      preferences: "visible",
      private_facts: "private",
    },
    claimOverrides: {},
    predicateStates: allPredicates("answerable"),
  };
}

/**
 * Story scenario for Maya. "Before" is how a cautious candidate leaves things after the call when consent is
 * an abstract switch: goals and preferences hidden, company hidden, no predicate answerable.
 * "After" is what she chooses once Agent View shows her exactly what agents receive.
 */
export const mayaBefore: VisibilitySettings = {
  consent: true,
  categoryDefaults: {
    experience: "visible",
    strengths: "visible",
    goals: "private",
    preferences: "private",
    private_facts: "private",
  },
  claimOverrides: { "maya-02": "private" },
  predicateStates: allPredicates("hidden"),
};

export const mayaAfter: VisibilitySettings = {
  consent: true,
  categoryDefaults: {
    experience: "visible",
    strengths: "visible",
    goals: "visible",
    preferences: "visible",
    private_facts: "private",
  },
  claimOverrides: { "maya-02": "private", "maya-05": "emphasize", "maya-06": "emphasize" },
  predicateStates: {
    ...allPredicates("answerable"),
    sponsorship_required: "hidden",
    relocation_willingness: "hidden",
  },
};
