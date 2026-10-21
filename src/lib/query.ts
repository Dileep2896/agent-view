import {
  PRIVATE_TOKEN,
  type AgentProjection,
  type Arrangement,
  type MatchResult,
  type ProjectedClaim,
  type Query,
  type Verdict,
} from "@/lib/types";

const TITLES: { canonical: string; pattern: RegExp }[] = [
  { canonical: "account executive", pattern: /\b(?:founding\s+)?(?:ae|account\s+exec(?:utive)?)\b/g },
  { canonical: "backend engineer", pattern: /\b(?:senior\s+|staff\s+)?(?:back[- ]?end|server[- ]side)\s+(?:engineer|developer|dev)\b/g },
  { canonical: "product designer", pattern: /\b(?:senior\s+)?product\s+designer\b/g },
  { canonical: "software engineer", pattern: /\b(?:senior\s+)?software\s+engineer\b/g },
  { canonical: "engineering manager", pattern: /\bengineering\s+manager\b/g },
];

export const CITIES: { canonical: string; pattern: RegExp }[] = [
  { canonical: "new york", pattern: /\b(?:nyc|new\s+york(?:\s+city)?)\b/g },
  { canonical: "san francisco", pattern: /\b(?:sf|san\s+francisco|bay\s+area)\b/g },
  { canonical: "london", pattern: /\blondon\b/g },
  { canonical: "lisbon", pattern: /\blisbon\b/g },
  { canonical: "austin", pattern: /\baustin\b/g },
];

const ARRANGEMENT_PATTERNS: { value: Arrangement; pattern: RegExp }[] = [
  { value: "remote", pattern: /\bremote(?:[- ]first)?\b|\bremotely\b/g },
  { value: "hybrid", pattern: /\bhybrid\b/g },
  { value: "onsite", pattern: /\bon[- ]?site\b|\bin[- ]person\b|\bin[- ]office\b/g },
];

const AMOUNT = /\$\s?(\d[\d,]*(?:\.\d+)?)\s*(k)?\b|\b(\d[\d,]*(?:\.\d+)?)\s*k\b/gi;
const PHRASES = ["series a", "series b", "series c", "design systems", "design system", "early stage", "money movement"];
const STOPWORDS = new Set(
  "a an and or the of in at for with to base salary comp compensation senior staff lead principal founding junior role roles job looking".split(" "),
);

/** Keyword -> terms that count as evidence. Deterministic token/synonym overlap, no embeddings. */
export const SYNONYMS: Record<string, string[]> = {
  fintech: ["fintech", "finance", "financial", "payments", "spend", "cfo", "cfos"],
  "series a": ["series a", "early stage", "startup", "founding"],
  payments: ["payments", "payment", "card-payments", "ledger", "money movement"],
  infrastructure: ["infrastructure", "infra", "platform"],
  go: ["go", "golang"],
  postgres: ["postgres", "postgresql", "sql"],
  "design systems": ["design system", "design systems"],
  outbound: ["outbound", "prospecting"],
};

function collect(text: string, pattern: RegExp): { index: number; length: number }[] {
  return [...text.matchAll(pattern)].map((m) => ({ index: m.index ?? 0, length: m[0].length }));
}

function blank(text: string, hits: { index: number; length: number }[]): string {
  let out = text;
  for (const h of hits) out = out.slice(0, h.index) + " ".repeat(h.length) + out.slice(h.index + h.length);
  return out;
}

/** Rule-based recruiter query parser: title dictionary, city dictionary, $140K amounts, remote/hybrid/onsite. */
export function parseQuery(input: string): Query {
  let text = input.toLowerCase();
  const query: Query = { titles: [], location: [], keywords: [] };

  for (const t of TITLES) {
    const hits = collect(text, t.pattern);
    if (hits.length && !query.titles.includes(t.canonical)) query.titles.push(t.canonical);
    text = blank(text, hits);
  }
  for (const c of CITIES) {
    const hits = collect(text, c.pattern);
    if (hits.length && !query.location.includes(c.canonical)) query.location.push(c.canonical);
    text = blank(text, hits);
  }
  const amounts = [...text.matchAll(AMOUNT)];
  const first = amounts[0];
  if (first) {
    const raw = Number((first[1] ?? first[3] ?? "0").replace(/,/g, ""));
    const usd = first[2] || first[3] ? raw * 1000 : raw;
    if (usd > 0) query.baseSalaryUsd = Math.round(usd);
  }
  text = blank(text, amounts.map((m) => ({ index: m.index ?? 0, length: m[0].length })));
  for (const a of ARRANGEMENT_PATTERNS) {
    const hits = collect(text, a.pattern);
    if (hits.length && !query.workArrangement) query.workArrangement = a.value;
    text = blank(text, hits);
  }

  const found: { index: number; kw: string }[] = [];
  for (const p of PHRASES) {
    const hits = collect(text, new RegExp(`\\b${escape(p)}\\b`, "g"));
    const kw = p === "design system" ? "design systems" : p;
    for (const h of hits) found.push({ index: h.index, kw });
    text = blank(text, hits);
  }
  for (const m of text.matchAll(/[a-z0-9][a-z0-9+#.-]*/g)) {
    const word = m[0].replace(/[.-]+$/, "");
    if (word && !STOPWORDS.has(word)) found.push({ index: m.index ?? 0, kw: word });
  }
  found.sort((a, b) => a.index - b.index);
  for (const f of found) if (!query.keywords.includes(f.kw)) query.keywords.push(f.kw);

  if (query.baseSalaryUsd === undefined) delete query.baseSalaryUsd;
  if (query.workArrangement === undefined) delete query.workArrangement;
  return query;
}

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mentions(text: string, term: string): boolean {
  return new RegExp(`(^|[^a-z0-9])${escape(term)}s?($|[^a-z0-9])`).test(text.toLowerCase());
}

const tokens = (s: string) => s.toLowerCase().match(/[a-z0-9]+/g) ?? [];

export function arrangementsIn(text: string): Arrangement[] {
  const lower = text.toLowerCase();
  return ARRANGEMENT_PATTERNS.filter((a) => new RegExp(a.pattern.source).test(lower)).map((a) => a.value);
}

function canonicalCity(location: string): string | undefined {
  const lower = location.toLowerCase();
  return CITIES.find((c) => new RegExp(c.pattern.source).test(lower))?.canonical;
}

/** Score weights per query component (only components present in the query count). */
export const MATCH_WEIGHTS = { title: 30, location: 20, work_arrangement: 10, keywords: 40 } as const;
/** Visible evidence earns 2/3 credit, emphasized evidence full credit: emphasis counts 1.5x. */
const VISIBLE_CREDIT = 2 / 3;
const EMPHASIZED_CREDIT = 1;
export const SURFACE_THRESHOLD = 60;
const REQUIRED = ["title", "location", "work_arrangement"];

/**
 * Deterministic match of a projection (never the raw profile) against a typed query.
 * Missing or hidden evidence is "unknown", never "no_match": hiding a claim can only cost a match, not fail one.
 */
export function matchQuery(projection: AgentProjection, query: Query): MatchResult {
  if (projection.withheld) return { surfaces: false, score: 0, verdicts: {}, matchedClaimIds: [] };

  const verdicts: Record<string, Verdict> = {};
  const matched = new Set<string>();
  let earned = 0;
  let possible = 0;
  const byField = (f: string) => projection.claims.find((c) => c.field === f);

  if (query.titles.length) {
    possible += MATCH_WEIGHTS.title;
    const title = projection.fields.title;
    if (!title || title === PRIVATE_TOKEN) verdicts.title = "unknown";
    else {
      const have = new Set(tokens(title));
      const ok = query.titles.some((t) => tokens(t).every((w) => have.has(w)));
      verdicts.title = ok ? "match" : "no_match";
      if (ok) {
        earned += MATCH_WEIGHTS.title;
        const id = byField("title")?.id;
        if (id) matched.add(id);
      }
    }
  }

  if (query.location.length) {
    possible += MATCH_WEIGHTS.location;
    const loc = projection.fields.location;
    if (!loc || loc === PRIVATE_TOKEN) verdicts.location = "unknown";
    else {
      const city = canonicalCity(loc);
      const ok = query.location.some((q) => q === city || loc.toLowerCase().includes(q));
      verdicts.location = ok ? "match" : "no_match";
      if (ok) {
        earned += MATCH_WEIGHTS.location;
        const id = byField("location")?.id;
        if (id) matched.add(id);
      }
    }
  }

  if (query.workArrangement) {
    possible += MATCH_WEIGHTS.work_arrangement;
    const pref = byField("work_arrangement");
    if (!pref) verdicts.work_arrangement = "unknown";
    else {
      const ok = arrangementsIn(pref.value).includes(query.workArrangement);
      verdicts.work_arrangement = ok ? "match" : "no_match";
      if (ok) {
        earned += MATCH_WEIGHTS.work_arrangement;
        matched.add(pref.id);
      }
    }
  }

  if (query.keywords.length) {
    possible += MATCH_WEIGHTS.keywords;
    const share = MATCH_WEIGHTS.keywords / query.keywords.length;
    for (const kw of query.keywords) {
      const terms = SYNONYMS[kw] ?? [kw];
      const hits: ProjectedClaim[] = projection.claims.filter((c) =>
        terms.some((t) => mentions(`${c.label} ${c.value}`, t)),
      );
      verdicts[`keyword:${kw}`] = hits.length ? "match" : "unknown";
      if (!hits.length) continue;
      hits.forEach((h) => matched.add(h.id));
      earned += share * (hits.some((h) => h.emphasized) ? EMPHASIZED_CREDIT : VISIBLE_CREDIT);
    }
  }

  const score = possible ? Math.min(100, Math.round((100 * earned) / possible)) : 0;
  const blocked = REQUIRED.some((k) => verdicts[k] === "no_match");
  return { surfaces: score >= SURFACE_THRESHOLD && !blocked, score, verdicts, matchedClaimIds: [...matched] };
}
