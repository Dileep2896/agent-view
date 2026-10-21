import {
  PRIVATE_TOKEN,
  STRUCTURED_FIELDS,
  type AgentProjection,
  type Claim,
  type FieldValue,
  type Profile,
  type StructuredField,
  type Visibility,
  type VisibilitySettings,
} from "@/lib/types";

/** Per-claim override wins; otherwise the category default applies. */
export function resolveClaimVisibility(claim: Claim, settings: VisibilitySettings): Visibility {
  return settings.claimOverrides[claim.id] ?? settings.categoryDefaults[claim.category];
}

export function isStructuredField(field: string): field is StructuredField {
  return (STRUCTURED_FIELDS as readonly string[]).includes(field);
}

/**
 * The single choke point between a member's raw profile and anything an agent sees.
 * Private claims are dropped (free text) or replaced with "[private]" (structured fields).
 * Without AI Visibility consent nothing but the withheld marker leaves.
 */
export function applyVisibility(profile: Profile, settings: VisibilitySettings): AgentProjection {
  const memberId = profile.member.id;
  if (!settings.consent) return { withheld: "consent", memberId };

  const fields: Record<StructuredField, FieldValue> = { title: null, company: null, location: null, startedAt: null };
  const claims: Extract<AgentProjection, { name: string }>["claims"] = [];

  for (const claim of profile.claims) {
    const v = resolveClaimVisibility(claim, settings);
    if (isStructuredField(claim.field)) {
      fields[claim.field] = v === "private" ? PRIVATE_TOKEN : claim.value;
    }
    if (v === "private") continue;
    claims.push({
      id: claim.id,
      category: claim.category,
      field: claim.field,
      label: claim.label,
      value: claim.value,
      emphasized: v === "emphasize",
    });
  }

  return { memberId, name: profile.member.name, fields, claims };
}
