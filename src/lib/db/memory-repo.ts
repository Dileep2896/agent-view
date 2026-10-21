import type { Member, Profile, Transcript, VisibilitySettings } from "@/lib/types";
import { defaultSettings, seed } from "@/seed";
import type { ProfileRepository } from "./repository";

export class InMemoryProfileRepository implements ProfileRepository {
  private settings = new Map<string, VisibilitySettings>();

  async listMembers(): Promise<Member[]> {
    return seed.map((s) => s.profile.member);
  }
  async getProfile(memberId: string): Promise<Profile | null> {
    return seed.find((s) => s.profile.member.id === memberId)?.profile ?? null;
  }
  async getTranscript(memberId: string): Promise<Transcript | null> {
    return seed.find((s) => s.profile.member.id === memberId)?.transcript ?? null;
  }
  async getSettings(memberId: string): Promise<VisibilitySettings> {
    return structuredClone(this.settings.get(memberId) ?? defaultSettings());
  }
  async saveSettings(memberId: string, settings: VisibilitySettings): Promise<void> {
    this.settings.set(memberId, structuredClone(settings));
  }
}
