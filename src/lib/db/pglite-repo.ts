import type { PGlite } from "@electric-sql/pglite";
import {
  VisibilitySettingsSchema,
  type Claim,
  type Member,
  type Profile,
  type Transcript,
  type Turn,
  type VisibilitySettings,
} from "@/lib/types";
import { defaultSettings, seed } from "@/seed";
import type { ProfileRepository } from "./repository";
import { readSchema } from "./schema";

interface ClaimRow {
  id: string;
  member_id: string;
  category: Claim["category"];
  field: string;
  label: string;
  value: string;
  quote: string;
  turn_id: number;
  span_start: number;
  span_end: number;
  predicate: Claim["predicate"] | null;
  fact: Claim["fact"] | null;
}

export class PgliteProfileRepository implements ProfileRepository {
  constructor(private readonly db: PGlite) {}

  /** Creates the schema and seeds on first boot. Idempotent. */
  async init(): Promise<void> {
    await this.db.exec(readSchema());
    const { rows } = await this.db.query<{ n: number }>("select count(*)::int as n from members");
    if ((rows[0]?.n ?? 0) > 0) return;
    await this.db.transaction(async (tx) => {
      for (const [i, { profile, transcript }] of seed.entries()) {
        const m = profile.member;
        await tx.query("insert into members (id, position, name, headline) values ($1, $2, $3, $4)", [m.id, i, m.name, m.headline]);
        await tx.query("insert into transcripts (member_id, turns) values ($1, $2::jsonb)", [m.id, JSON.stringify(transcript.turns)]);
        for (const [j, c] of profile.claims.entries()) {
          await tx.query(
            `insert into claims (id, member_id, position, category, field, label, value, quote, turn_id, span_start, span_end, predicate, fact)
             values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb)`,
            [c.id, m.id, j, c.category, c.field, c.label, c.value, c.quote, c.evidence.turnId, c.evidence.start, c.evidence.end,
              c.predicate ?? null, c.fact === undefined ? null : JSON.stringify(c.fact)],
          );
        }
      }
    });
  }

  async listMembers(): Promise<Member[]> {
    const { rows } = await this.db.query<Member>("select id, name, headline from members order by position");
    return rows;
  }

  async getProfile(memberId: string): Promise<Profile | null> {
    const m = await this.db.query<Member>("select id, name, headline from members where id = $1", [memberId]);
    const member = m.rows[0];
    if (!member) return null;
    const { rows } = await this.db.query<ClaimRow>("select * from claims where member_id = $1 order by position", [memberId]);
    const claims: Claim[] = rows.map((r) => ({
      id: r.id,
      memberId: r.member_id,
      category: r.category,
      field: r.field,
      label: r.label,
      value: r.value,
      quote: r.quote,
      evidence: { turnId: r.turn_id, start: r.span_start, end: r.span_end },
      ...(r.predicate ? { predicate: r.predicate } : {}),
      ...(r.fact !== null ? { fact: r.fact } : {}),
    }));
    return { member, claims };
  }

  async getTranscript(memberId: string): Promise<Transcript | null> {
    const { rows } = await this.db.query<{ turns: Turn[] }>("select turns from transcripts where member_id = $1", [memberId]);
    const row = rows[0];
    return row ? { memberId, turns: row.turns } : null;
  }

  async getSettings(memberId: string): Promise<VisibilitySettings> {
    const { rows } = await this.db.query<{
      consent: boolean;
      category_defaults: unknown;
      claim_overrides: unknown;
      predicate_states: unknown;
    }>("select consent, category_defaults, claim_overrides, predicate_states from visibility_settings where member_id = $1", [memberId]);
    const row = rows[0];
    if (!row) return defaultSettings();
    return VisibilitySettingsSchema.parse({
      consent: row.consent,
      categoryDefaults: row.category_defaults,
      claimOverrides: row.claim_overrides,
      predicateStates: row.predicate_states,
    }) as VisibilitySettings;
  }

  async saveSettings(memberId: string, settings: VisibilitySettings): Promise<void> {
    await this.db.query(
      `insert into visibility_settings (member_id, consent, category_defaults, claim_overrides, predicate_states, updated_at)
       values ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, now())
       on conflict (member_id) do update set consent = excluded.consent, category_defaults = excluded.category_defaults,
         claim_overrides = excluded.claim_overrides, predicate_states = excluded.predicate_states, updated_at = now()`,
      [memberId, settings.consent, JSON.stringify(settings.categoryDefaults), JSON.stringify(settings.claimOverrides),
        JSON.stringify(settings.predicateStates)],
    );
  }
}
