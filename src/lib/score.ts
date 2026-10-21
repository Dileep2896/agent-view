import type { Category, Claim, Profile, VisibilitySettings } from "@/lib/types";
import { mayaAfter, mayaBefore, seedMember } from "@/seed";
import { resolveClaimVisibility } from "./visibility";

export const CATEGORY_WEIGHTS: Record<Category, number> = {
  experience: 3,
  strengths: 3,
  goals: 2,
  preferences: 2,
  private_facts: 1,
};
export const EMPHASIS_BONUS = 0.5;

/** A claim reaches agents if it is shown, or if its private predicate is answerable. */
export function isAgentVisible(claim: Claim, settings: VisibilitySettings): boolean {
  if (!settings.consent) return false;
  if (resolveClaimVisibility(claim, settings) !== "private") return true;
  return claim.predicate !== undefined && settings.predicateStates[claim.predicate] === "answerable";
}

/** round(100 * sum(weight x visible) / sum(weight)), emphasis +0.5 weight, capped at 100, 0 without consent. */
export function discoverabilityScore(profile: Profile, settings: VisibilitySettings): number {
  if (!settings.consent) return 0;
  let num = 0;
  let den = 0;
  for (const c of profile.claims) {
    const w = CATEGORY_WEIGHTS[c.category];
    den += w;
    if (!isAgentVisible(c, settings)) continue;
    num += w + (resolveClaimVisibility(c, settings) === "emphasize" ? EMPHASIS_BONUS : 0);
  }
  return den ? Math.min(100, Math.round((100 * num) / den)) : 0;
}

export function visibleFieldCount(profile: Profile, settings: VisibilitySettings): number {
  return profile.claims.filter((c) => isAgentVisible(c, settings)).length;
}

/** Numbers the /story page animates. Computed from Maya's seed, never hard-coded. */
export function storyNumbers() {
  const maya = seedMember("maya");
  if (!maya) throw new Error("maya seed missing");
  return {
    scoreBefore: discoverabilityScore(maya.profile, mayaBefore),
    scoreAfter: discoverabilityScore(maya.profile, mayaAfter),
    fieldsBefore: visibleFieldCount(maya.profile, mayaBefore),
    fieldsAfter: visibleFieldCount(maya.profile, mayaAfter),
  };
}
