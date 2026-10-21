import type { Profile, PredicateAnswer, PredicateKey, PredicateQuestion, Query, VisibilitySettings } from "@/lib/types";

export const PREDICATE_ANSWERS: PredicateAnswer[] = [
  "meets",
  "below",
  "yes",
  "no",
  "compatible",
  "incompatible",
  "unknown",
  "blocked",
];

export const PREDICATE_COPY: Record<PredicateKey, { label: string; question: (q: PredicateQuestion) => string }> = {
  salary_min: {
    label: "Base salary minimum",
    question: (q) => `Would they accept $${q.key === "salary_min" ? Math.round(q.amountUsd / 1000) : "?"}K base?`,
  },
  us_work_authorization: { label: "US work authorization", question: () => "Authorized to work in the US?" },
  sponsorship_required: { label: "Visa sponsorship", question: () => "Requires visa sponsorship?" },
  job_search_availability: { label: "Availability", question: () => "Open to new roles now?" },
  relocation_willingness: { label: "Relocation", question: () => "Willing to relocate?" },
  work_arrangement: {
    label: "Work arrangement",
    question: (q) => `Compatible with ${q.key === "work_arrangement" ? q.arrangement : "?"} work?`,
  },
};

/**
 * The closed private-predicate catalog. Reads the raw recorded fact but only ever returns an enum,
 * so "private but answerable" never exposes the number or the text.
 */
export function answerPredicate(
  profile: Profile,
  settings: VisibilitySettings,
  question: PredicateQuestion,
): PredicateAnswer {
  if (!settings.consent) return "blocked";
  if (settings.predicateStates[question.key] === "hidden") return "blocked";

  const fact = profile.claims.find((c) => c.predicate === question.key)?.fact;
  if (fact === undefined) return "unknown";

  switch (question.key) {
    case "salary_min":
      return typeof fact === "number" ? (question.amountUsd >= fact ? "meets" : "below") : "unknown";
    case "work_arrangement":
      return Array.isArray(fact) ? (fact.includes(question.arrangement) ? "compatible" : "incompatible") : "unknown";
    default:
      return typeof fact === "boolean" ? (fact ? "yes" : "no") : "unknown";
  }
}

/** The questions a recruiter agent would ask for a given query. */
export function questionsForQuery(query: Query): PredicateQuestion[] {
  const qs: PredicateQuestion[] = [];
  if (query.baseSalaryUsd) qs.push({ key: "salary_min", amountUsd: query.baseSalaryUsd });
  if (query.workArrangement) qs.push({ key: "work_arrangement", arrangement: query.workArrangement });
  qs.push(
    { key: "us_work_authorization" },
    { key: "sponsorship_required" },
    { key: "job_search_availability" },
    { key: "relocation_willingness" },
  );
  return qs;
}
