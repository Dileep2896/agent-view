import type { Category, Claim, Fact, PredicateKey, Transcript } from "@/lib/types";
import { transcripts } from "./transcripts";

interface ClaimInput {
  category: Category;
  field: string;
  label: string;
  value: string;
  turn: number;
  quote: string;
  predicate?: PredicateKey;
  fact?: Fact;
}

/** Compute exact character offsets of `quote` inside a transcript turn. Throws if the quote is not verbatim. */
export function span(transcript: Transcript, turnId: number, quote: string) {
  const turn = transcript.turns[turnId];
  if (!turn) throw new Error(`turn ${turnId} missing in ${transcript.memberId}`);
  const start = turn.text.indexOf(quote);
  if (start < 0) throw new Error(`quote not found in ${transcript.memberId}#${turnId}: ${quote}`);
  return { turnId, start, end: start + quote.length };
}

function build(memberId: string, inputs: ClaimInput[]): Claim[] {
  const transcript = transcripts.find((t) => t.memberId === memberId);
  if (!transcript) throw new Error(`no transcript for ${memberId}`);
  return inputs.map((c, i) => ({
    id: `${memberId}-${String(i + 1).padStart(2, "0")}`,
    memberId,
    category: c.category,
    field: c.field,
    label: c.label,
    value: c.value,
    quote: c.quote,
    evidence: span(transcript, c.turn, c.quote),
    ...(c.predicate ? { predicate: c.predicate } : {}),
    ...(c.fact !== undefined ? { fact: c.fact } : {}),
  }));
}

export const claims: Claim[] = [
  ...build("maya", [
    { category: "experience", field: "title", label: "Title", value: "Senior Account Executive", turn: 1, quote: "Senior Account Executive" },
    { category: "experience", field: "company", label: "Current company", value: "Ramp", turn: 1, quote: "at Ramp" },
    { category: "experience", field: "location", label: "Location", value: "New York", turn: 1, quote: "based in New York" },
    { category: "experience", field: "startedAt", label: "Started", value: "2022", turn: 3, quote: "I joined in 2022" },
    { category: "experience", field: "arr", label: "Quota impact", value: "Closed $3.1M new ARR last year, mid-market finance teams", turn: 3, quote: "Last year I closed $3.1M in new ARR, mostly mid-market finance teams" },
    { category: "strengths", field: "outbound", label: "Strength", value: "Building outbound from zero: wrote the sequences and playbook", turn: 5, quote: "building outbound from zero" },
    { category: "strengths", field: "buyer", label: "Strength", value: "Selling to CFOs and controllers (close cycles, spend controls)", turn: 7, quote: "CFOs and controllers. I can speak their language on close cycles and spend controls" },
    { category: "goals", field: "next_role", label: "Next role", value: "Founding AE at a Series A fintech", turn: 9, quote: "be the founding AE at a Series A fintech" },
    { category: "goals", field: "trajectory", label: "Trajectory", value: "Build and lead the first sales team", turn: 9, quote: "eventually build and lead the first sales team" },
    { category: "preferences", field: "work_arrangement", label: "Work arrangement", value: "Hybrid or in-person", turn: 11, quote: "Hybrid or in-person in NYC", predicate: "work_arrangement", fact: ["hybrid", "onsite"] },
    { category: "preferences", field: "team", label: "Team", value: "Small team, owns the full sales cycle", turn: 11, quote: "a small team where I own the whole cycle" },
    { category: "private_facts", field: "salary_min", label: "Base salary minimum", value: "$135K minimum base", turn: 13, quote: "I wouldn't move for less than $135K base", predicate: "salary_min", fact: 135000 },
    { category: "private_facts", field: "us_work_authorization", label: "US work authorization", value: "US work authorized", turn: 15, quote: "I'm a US citizen", predicate: "us_work_authorization", fact: true },
    { category: "private_facts", field: "sponsorship_required", label: "Visa sponsorship", value: "No visa sponsorship needed", turn: 15, quote: "no sponsorship needed", predicate: "sponsorship_required", fact: false },
    { category: "private_facts", field: "job_search_availability", label: "Availability", value: "Actively looking", turn: 17, quote: "I'm actively looking right now", predicate: "job_search_availability", fact: true },
    { category: "private_facts", field: "relocation_willingness", label: "Relocation", value: "Not open to relocation", turn: 17, quote: "I'm staying in New York, so no relocation", predicate: "relocation_willingness", fact: false },
  ]),
  ...build("dev", [
    { category: "experience", field: "title", label: "Title", value: "Staff Backend Engineer", turn: 1, quote: "Staff Backend Engineer" },
    { category: "experience", field: "company", label: "Current company", value: "Tiltpay", turn: 1, quote: "at Tiltpay" },
    { category: "experience", field: "location", label: "Location", value: "San Francisco", turn: 1, quote: "working out of San Francisco" },
    { category: "experience", field: "startedAt", label: "Started", value: "2021", turn: 3, quote: "Since 2021" },
    { category: "experience", field: "ledger", label: "Scope", value: "Owns the card-payments ledger service (about $40B/yr)", turn: 3, quote: "I own the ledger service that moves about $40B a year in card payments" },
    { category: "strengths", field: "reliability", label: "Strength", value: "Payments reliability: weekly incidents down to almost none", turn: 5, quote: "Making payment systems boringly reliable" },
    { category: "strengths", field: "ledger_migration", label: "Strength", value: "Led migration to idempotent, double-entry writes", turn: 5, quote: "I led the migration to idempotent, double-entry writes" },
    { category: "strengths", field: "stack", label: "Tools", value: "Go, Postgres, Kafka event streams", turn: 7, quote: "Go and Postgres, mostly. Some Kafka for the event stream" },
    { category: "goals", field: "next_role", label: "Next role", value: "Own payments infrastructure end to end where money movement is the product", turn: 9, quote: "own payments infrastructure end to end at a company where money movement is the product" },
    { category: "preferences", field: "work_arrangement", label: "Work arrangement", value: "Remote-first or hybrid", turn: 11, quote: "Remote-first or hybrid", predicate: "work_arrangement", fact: ["remote", "hybrid"] },
    { category: "preferences", field: "focus", label: "Working style", value: "Long focus blocks", turn: 11, quote: "I do my best work with long focus blocks" },
    { category: "private_facts", field: "salary_min", label: "Base salary minimum", value: "$205K minimum base", turn: 13, quote: "At least $205K base", predicate: "salary_min", fact: 205000 },
    { category: "private_facts", field: "us_work_authorization", label: "US work authorization", value: "Authorized on H-1B", turn: 13, quote: "I'm on an H-1B, so I'm authorized", predicate: "us_work_authorization", fact: true },
    { category: "private_facts", field: "sponsorship_required", label: "Visa sponsorship", value: "Needs H-1B transfer sponsorship", turn: 13, quote: "I'd need sponsorship to transfer", predicate: "sponsorship_required", fact: true },
    { category: "private_facts", field: "job_search_availability", label: "Availability", value: "Open to the right role, not urgent", turn: 15, quote: "Open to the right role, not urgently", predicate: "job_search_availability", fact: true },
    { category: "private_facts", field: "relocation_willingness", label: "Relocation", value: "Would relocate to New York", turn: 15, quote: "I'd relocate to New York for it", predicate: "relocation_willingness", fact: true },
  ]),
  ...build("lucia", [
    { category: "experience", field: "title", label: "Title", value: "Senior Product Designer", turn: 1, quote: "Senior Product Designer" },
    { category: "experience", field: "company", label: "Current company", value: "Northwind Studio", turn: 1, quote: "at Northwind Studio" },
    { category: "experience", field: "location", label: "Location", value: "Remote (Lisbon)", turn: 1, quote: "I work remotely from Lisbon" },
    { category: "experience", field: "startedAt", label: "Started", value: "2020", turn: 3, quote: "Since 2020" },
    { category: "experience", field: "design_system", label: "Impact", value: "Built a design system from scratch, used by four product teams", turn: 3, quote: "I built our design system from scratch and it's now used by four product teams" },
    { category: "strengths", field: "calm_ui", label: "Strength", value: "Turning messy workflows into calm interfaces", turn: 5, quote: "Turning messy workflows into calm interfaces" },
    { category: "strengths", field: "b2b", label: "Strength", value: "Complex B2B tools: dashboards and admin consoles", turn: 5, quote: "I'm strongest on complex B2B tools, like dashboards and admin consoles" },
    { category: "strengths", field: "code_prototypes", label: "Tools", value: "Prototypes in React code; handoff is a pull request", turn: 7, quote: "I prototype in code with React" },
    { category: "goals", field: "next_role", label: "Next role", value: "Lead design systems at a product-led company", turn: 9, quote: "lead design systems at a product-led company" },
    { category: "preferences", field: "work_arrangement", label: "Work arrangement", value: "Fully remote", turn: 11, quote: "Fully remote", predicate: "work_arrangement", fact: ["remote"] },
    { category: "preferences", field: "overlap", label: "Hours", value: "A few overlap hours with US time zones", turn: 11, quote: "a few overlap hours with US time zones" },
    { category: "private_facts", field: "salary_min", label: "Base salary minimum", value: "$150K minimum base", turn: 13, quote: "I'd want $150K or more", predicate: "salary_min", fact: 150000 },
    { category: "private_facts", field: "us_work_authorization", label: "US work authorization", value: "No US work authorization (EU citizen)", turn: 13, quote: "no US work authorization", predicate: "us_work_authorization", fact: false },
    { category: "private_facts", field: "sponsorship_required", label: "Visa sponsorship", value: "Contractor only, no sponsorship", turn: 15, quote: "I'd only work as a contractor, so no sponsorship", predicate: "sponsorship_required", fact: false },
    { category: "private_facts", field: "job_search_availability", label: "Availability", value: "Not actively looking", turn: 17, quote: "Not actively", predicate: "job_search_availability", fact: false },
    { category: "private_facts", field: "relocation_willingness", label: "Relocation", value: "Will not relocate", turn: 15, quote: "I won't relocate", predicate: "relocation_willingness", fact: false },
  ]),
];
