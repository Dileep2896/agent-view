import type { SampleQuery } from "@/lib/types";

/** Five recruiter queries the simulator ships with. parseQuery must handle all of them. */
export const sampleQueries: SampleQuery[] = [
  { id: "q1", label: "Founding AE, fintech", memberId: "maya", text: "Founding AE, NYC, Series A fintech, $140K base" },
  { id: "q2", label: "AE in SF, hybrid", memberId: "maya", text: "Account executive, San Francisco, hybrid, $120k" },
  { id: "q3", label: "Payments backend, SF", memberId: "dev", text: "Senior backend engineer, SF, payments infrastructure, $210K base" },
  { id: "q4", label: "Remote Go engineer", memberId: "dev", text: "Backend engineer, remote, Go, Postgres, $180k" },
  { id: "q5", label: "Design systems lead", memberId: "lucia", text: "Product designer, remote, design systems, $140K" },
];
