"use client";
import type { PredicateAnswer, PredicateQuestion } from "@/lib/types";
import { PREDICATE_COPY } from "@/lib/predicates";
import { Badge, type Tone } from "./ui/badge";

const tone: Record<PredicateAnswer, Tone> = {
  meets: "good",
  yes: "good",
  compatible: "good",
  below: "bad",
  no: "warn",
  incompatible: "bad",
  unknown: "muted",
  blocked: "muted",
};

export function PredicateList({ items }: { items: { q: PredicateQuestion; answer: PredicateAnswer }[] }) {
  return (
    <div>
      <h3 className="mb-1 text-xs font-medium text-white/60">Private questions agents can ask</h3>
      <p className="mb-2 text-[11px] text-white/40">Agents get answers from your private facts as a closed set of enums. The raw value is never sent.</p>
      <ul className="divide-y divide-white/5 rounded-xl ring-1 ring-white/10" data-testid="predicate-list">
        {items.map(({ q, answer }) => (
          <li key={q.key} className="flex items-center gap-2 px-3 py-2 text-sm">
            <span className="text-white/80">{PREDICATE_COPY[q.key].question(q)}</span>
            <span className="ml-auto font-mono">
              <Badge tone={tone[answer]}>{answer}</Badge>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
