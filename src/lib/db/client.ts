import { PGlite } from "@electric-sql/pglite";
import { PgliteProfileRepository } from "./pglite-repo";
import type { ProfileRepository } from "./repository";

const globalForDb = globalThis as unknown as { __agentViewRepo?: Promise<ProfileRepository> };

/** PGlite singleton: persisted to ./.pglite in dev, in-memory under tests (or when PGLITE_DIR=memory). */
export function getRepository(): Promise<ProfileRepository> {
  if (!globalForDb.__agentViewRepo) {
    const dir = process.env.NODE_ENV === "test" || process.env.PGLITE_DIR === "memory" ? undefined : process.env.PGLITE_DIR ?? "./.pglite";
    globalForDb.__agentViewRepo = (async () => {
      const db = dir ? new PGlite(dir) : new PGlite();
      const repo = new PgliteProfileRepository(db);
      await repo.init();
      return repo;
    })();
    globalForDb.__agentViewRepo.catch(() => {
      globalForDb.__agentViewRepo = undefined;
    });
  }
  return globalForDb.__agentViewRepo;
}
