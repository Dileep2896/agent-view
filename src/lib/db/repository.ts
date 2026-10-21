import type { Member, Profile, Transcript, VisibilitySettings } from "@/lib/types";

/** All data access goes through this interface (PGlite in the app, in-memory in unit tests). */
export interface ProfileRepository {
  listMembers(): Promise<Member[]>;
  getProfile(memberId: string): Promise<Profile | null>;
  getTranscript(memberId: string): Promise<Transcript | null>;
  /** Saved settings, or the defaults if the member never changed anything. */
  getSettings(memberId: string): Promise<VisibilitySettings>;
  saveSettings(memberId: string, settings: VisibilitySettings): Promise<void>;
}
