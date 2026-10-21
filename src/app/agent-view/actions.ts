"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { VisibilitySettingsSchema, type VisibilitySettings } from "@/lib/types";
import { getRepository } from "@/lib/db/client";

const MemberId = z.string().regex(/^[a-z0-9_-]{1,40}$/);

/** Persists a member's visibility settings to Postgres (PGlite). Called debounced from the client. */
export async function saveSettings(memberId: string, settings: VisibilitySettings): Promise<{ ok: boolean; error?: string }> {
  const id = MemberId.safeParse(memberId);
  const s = VisibilitySettingsSchema.safeParse(settings);
  if (!id.success || !s.success) return { ok: false, error: "invalid settings" };
  const repo = await getRepository();
  if (!(await repo.getProfile(id.data))) return { ok: false, error: "unknown member" };
  await repo.saveSettings(id.data, s.data as VisibilitySettings);
  revalidatePath("/agent-view");
  return { ok: true };
}
