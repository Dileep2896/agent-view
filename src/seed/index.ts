import { z } from "zod";
import { ProfileSchema, TranscriptSchema, type Profile, type Transcript } from "@/lib/types";
import { claims } from "./claims";
import { members } from "./members";
import { transcripts } from "./transcripts";

export { sampleQueries } from "./queries";
export { defaultSettings, mayaAfter, mayaBefore } from "./settings";

export interface SeedMember {
  profile: Profile;
  transcript: Transcript;
}

/** Validates all seed data at load time; offsets must fall inside the turn text. */
export function loadSeed(): SeedMember[] {
  return members.map((member) => {
    const transcript = TranscriptSchema.parse(transcripts.find((t) => t.memberId === member.id));
    const profile = ProfileSchema.parse({ member, claims: claims.filter((c) => c.memberId === member.id) });
    for (const c of profile.claims) {
      const turn = transcript.turns[c.evidence.turnId];
      const ok = turn && c.evidence.end <= turn.text.length && turn.text.slice(c.evidence.start, c.evidence.end) === c.quote;
      if (!ok) throw new z.ZodError([{ code: "custom", path: ["claims", c.id, "evidence"], message: "evidence offsets do not match quote" }]);
    }
    return { profile, transcript };
  });
}

export const seed: SeedMember[] = loadSeed();

export function seedMember(id: string): SeedMember | undefined {
  return seed.find((s) => s.profile.member.id === id);
}
