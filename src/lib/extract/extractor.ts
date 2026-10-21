import type { Profile, Transcript } from "@/lib/types";

/**
 * Turns a career-call transcript into a structured, evidence-linked profile.
 *
 * Production would plug an LLM tool-calling extractor in here: the model is given a `record_claim` tool whose
 * input schema is ClaimSchema minus `evidence`, plus a verbatim `quote`; offsets are then computed server-side with
 * `span()` so a hallucinated quote fails validation instead of shipping. The demo only ships SeededExtractor.
 */
export interface ProfileExtractor {
  extract(transcript: Transcript): Profile;
}
