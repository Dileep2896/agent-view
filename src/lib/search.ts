import { matchQuery, parseQuery } from "@/lib/query";
import { answerPredicate, questionsForQuery } from "@/lib/predicates";
import { applyVisibility } from "@/lib/visibility";
import { memberRef, toAgentCard } from "@/lib/card";
import type { AgentCard, MatchResult, PredicateAnswer, PredicateKey, Query } from "@/lib/types";
import type { ProfileRepository } from "@/lib/db/repository";

export interface SearchBody {
  ref: string;
  query: Query;
  card?: AgentCard;
  withheld?: "consent";
  match: MatchResult;
  predicates: Partial<Record<PredicateKey, PredicateAnswer>>;
}

export type SearchResult = { status: 200; body: SearchBody } | { status: 404; body: { error: string } };

/** What a recruiter agent calling search_people for this member would receive. */
export async function searchMember(repo: ProfileRepository, q: string, memberId: string): Promise<SearchResult> {
  const profile = await repo.getProfile(memberId);
  if (!profile) return { status: 404, body: { error: `unknown member ${memberId}` } };
  const settings = await repo.getSettings(memberId);
  const query = parseQuery(q);
  const projection = applyVisibility(profile, settings);
  const match = matchQuery(projection, query);
  const card = toAgentCard(projection, memberRef(memberId), match.verdicts);
  const predicates = Object.fromEntries(
    questionsForQuery(query).map((pq) => [pq.key, answerPredicate(profile, settings, pq)]),
  ) as SearchBody["predicates"];
  const ref = memberRef(memberId);
  return "withheld" in card
    ? { status: 200, body: { ref, query, withheld: "consent", match, predicates } }
    : { status: 200, body: { ref, query, card, match, predicates } };
}
