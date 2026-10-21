import { z } from "zod";

/** Profile categories extracted from a career call. */
export const CATEGORIES = ["experience", "strengths", "goals", "preferences", "private_facts"] as const;
export const CategorySchema = z.enum(CATEGORIES);
export type Category = z.infer<typeof CategorySchema>;

export const CATEGORY_LABELS: Record<Category, string> = {
  experience: "Experience",
  strengths: "Strengths",
  goals: "Goals",
  preferences: "Preferences",
  private_facts: "Private facts",
};

/** Three-state visibility a member controls per category and per claim. */
export const VISIBILITIES = ["emphasize", "visible", "private"] as const;
export const VisibilitySchema = z.enum(VISIBILITIES);
export type Visibility = z.infer<typeof VisibilitySchema>;

/** The closed private-predicate catalog (answer-candidate-question contract). */
export const PREDICATES = [
  "salary_min",
  "us_work_authorization",
  "sponsorship_required",
  "job_search_availability",
  "relocation_willingness",
  "work_arrangement",
] as const;
export const PredicateKeySchema = z.enum(PREDICATES);
export type PredicateKey = z.infer<typeof PredicateKeySchema>;

export const PREDICATE_STATES = ["answerable", "hidden"] as const;
export const PredicateStateSchema = z.enum(PREDICATE_STATES);
export type PredicateState = z.infer<typeof PredicateStateSchema>;

export const ARRANGEMENTS = ["remote", "hybrid", "onsite"] as const;
export const ArrangementSchema = z.enum(ARRANGEMENTS);
export type Arrangement = z.infer<typeof ArrangementSchema>;

/** Structured fields that land in top-level card keys rather than memberContext. */
export const STRUCTURED_FIELDS = ["title", "company", "location", "startedAt"] as const;
export type StructuredField = (typeof STRUCTURED_FIELDS)[number];

export const TurnSchema = z.object({
  id: z.number().int().nonnegative(),
  speaker: z.enum(["interviewer", "member"]),
  text: z.string().min(1),
});
export type Turn = z.infer<typeof TurnSchema>;

export const TranscriptSchema = z.object({
  memberId: z.string(),
  turns: z.array(TurnSchema).min(12).max(20),
});
export type Transcript = z.infer<typeof TranscriptSchema>;

export const EvidenceSchema = z.object({
  turnId: z.number().int().nonnegative(),
  start: z.number().int().nonnegative(),
  end: z.number().int().positive(),
});
export type Evidence = z.infer<typeof EvidenceSchema>;

export const FactSchema = z.union([z.number(), z.boolean(), z.array(ArrangementSchema)]);
export type Fact = z.infer<typeof FactSchema>;

export const ClaimSchema = z
  .object({
    id: z.string(),
    memberId: z.string(),
    category: CategorySchema,
    /** Structured field name (title/company/...), "work_arrangement", or a free-text slug. */
    field: z.string(),
    label: z.string(),
    value: z.string(),
    quote: z.string().min(1),
    evidence: EvidenceSchema,
    predicate: PredicateKeySchema.optional(),
    fact: FactSchema.optional(),
  })
  .refine((c) => c.evidence.end > c.evidence.start, { message: "evidence end must be after start" })
  .refine((c) => c.category !== "private_facts" || c.predicate !== undefined, {
    message: "private_facts claims must map to a catalog predicate",
  })
  .refine((c) => (c.predicate === undefined) === (c.fact === undefined), {
    message: "a predicate claim needs a recorded fact (and vice versa)",
  });
export type Claim = z.infer<typeof ClaimSchema>;

export const MemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  headline: z.string(),
});
export type Member = z.infer<typeof MemberSchema>;

export const ProfileSchema = z.object({
  member: MemberSchema,
  claims: z.array(ClaimSchema).min(10).max(16),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const VisibilitySettingsSchema = z.object({
  /** Master "Discoverable by AI agents" switch (the AI visibility consent). */
  consent: z.boolean(),
  categoryDefaults: z.record(CategorySchema, VisibilitySchema),
  claimOverrides: z.record(z.string(), VisibilitySchema),
  predicateStates: z.record(PredicateKeySchema, PredicateStateSchema),
});
export type VisibilitySettings = {
  consent: boolean;
  categoryDefaults: Record<Category, Visibility>;
  claimOverrides: Record<string, Visibility>;
  predicateStates: Record<PredicateKey, PredicateState>;
};

export const PRIVATE_TOKEN = "[private]" as const;
export type FieldValue = string | typeof PRIVATE_TOKEN | null;

export interface ProjectedClaim {
  id: string;
  category: Category;
  field: string;
  label: string;
  value: string;
  emphasized: boolean;
}

/** What an agent is allowed to know: private claims are gone, structured private fields are tokens. */
export type AgentProjection =
  | { withheld: "consent"; memberId: string }
  | {
      withheld?: undefined;
      memberId: string;
      name: string;
      fields: Record<StructuredField, FieldValue>;
      claims: ProjectedClaim[];
    };

export type Verdict = "match" | "no_match" | "unknown";

/** Mirrors the member card of an MCP-style `search_people` tool. */
export interface AgentCard {
  ref: string;
  name: string;
  title: FieldValue;
  company: FieldValue;
  location: FieldValue;
  startedAt: FieldValue;
  network: "member";
  memberContext: string;
  verdicts: Record<string, Verdict>;
}

export type WithheldCard = { ref: string; withheld: "consent" };

export const QuerySchema = z.object({
  titles: z.array(z.string()),
  location: z.array(z.string()),
  keywords: z.array(z.string()),
  baseSalaryUsd: z.number().positive().optional(),
  workArrangement: ArrangementSchema.optional(),
});
export type Query = z.infer<typeof QuerySchema>;

export interface MatchResult {
  surfaces: boolean;
  score: number;
  verdicts: Record<string, Verdict>;
  matchedClaimIds: string[];
}

export type PredicateAnswer =
  | "meets"
  | "below"
  | "yes"
  | "no"
  | "compatible"
  | "incompatible"
  | "unknown"
  | "blocked";

export type PredicateQuestion =
  | { key: "salary_min"; amountUsd: number }
  | { key: "work_arrangement"; arrangement: Arrangement }
  | { key: Exclude<PredicateKey, "salary_min" | "work_arrangement"> };

export interface SampleQuery {
  id: string;
  label: string;
  text: string;
  memberId: string;
}
