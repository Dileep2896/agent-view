import type { Profile, Transcript } from "@/lib/types";
import { seedMember } from "@/seed";
import type { ProfileExtractor } from "./extractor";

/** Returns the hand-authored profile for a seeded transcript. Deterministic; no network. */
export class SeededExtractor implements ProfileExtractor {
  extract(transcript: Transcript): Profile {
    const found = seedMember(transcript.memberId);
    if (!found) throw new Error(`no seeded profile for ${transcript.memberId}`);
    return found.profile;
  }
}
