import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { PgliteProfileRepository } from "@/lib/db/pglite-repo";
import { InMemoryProfileRepository } from "@/lib/db/memory-repo";
import type { ProfileRepository } from "@/lib/db/repository";
import { defaultSettings } from "@/seed";

const db = new PGlite();
const pg = new PgliteProfileRepository(db);
beforeAll(async () => {
  await pg.init();
});
afterAll(async () => {
  await db.close();
});

describe.each<[string, () => ProfileRepository]>([
  ["PgliteProfileRepository (in-memory Postgres)", () => pg],
  ["InMemoryProfileRepository", () => new InMemoryProfileRepository()],
])("%s", (_name, make) => {
  it("lists the seeded members", async () => {
    const repo = make();
    expect((await repo.listMembers()).map((m) => m.id)).toEqual(["maya", "dev", "lucia"]);
  });

  it("round-trips profile and transcript with exact evidence offsets", async () => {
    const repo = make();
    const profile = await repo.getProfile("maya");
    const transcript = await repo.getTranscript("maya");
    expect(profile?.claims).toHaveLength(16);
    for (const c of profile!.claims) {
      expect(transcript!.turns[c.evidence.turnId]!.text.slice(c.evidence.start, c.evidence.end)).toBe(c.quote);
    }
    expect(profile!.claims.find((c) => c.predicate === "salary_min")?.fact).toBe(135000);
  });

  it("returns default settings, then persists saved settings", async () => {
    const repo = make();
    expect(await repo.getSettings("dev")).toEqual(defaultSettings());
    const next = { ...defaultSettings(), consent: false, claimOverrides: { "dev-02": "private" as const } };
    await repo.saveSettings("dev", next);
    expect(await repo.getSettings("dev")).toEqual(next);
    await repo.saveSettings("dev", defaultSettings());
  });

  it("returns null for unknown members", async () => {
    const repo = make();
    expect(await repo.getProfile("ghost")).toBeNull();
    expect(await repo.getTranscript("ghost")).toBeNull();
  });
});

describe("PGlite seeding", () => {
  it("is idempotent", async () => {
    await pg.init();
    const r = await db.query<{ n: number }>("select count(*)::int as n from claims");
    expect(r.rows[0]!.n).toBe(48);
  });
});
