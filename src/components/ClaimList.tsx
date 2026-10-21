"use client";
import { Quote } from "lucide-react";
import { CATEGORIES, CATEGORY_LABELS, type Category, type Claim, type PredicateState, type Visibility, type VisibilitySettings } from "@/lib/types";
import { resolveClaimVisibility } from "@/lib/visibility";
import { cn } from "@/lib/cn";
import { VisibilityControl } from "./VisibilityControl";
import { Segmented } from "./ui/segmented";

interface Props {
  claims: Claim[];
  settings: VisibilitySettings;
  activeClaimId: string | null;
  onSelect: (id: string) => void;
  onCategory: (c: Category, v: Visibility) => void;
  onClaim: (id: string, v: Visibility) => void;
  onPredicate: (claim: Claim, s: PredicateState) => void;
}

const PREDICATE_OPTIONS = [
  { value: "answerable" as const, label: "Answerable", title: "Agents may ask yes/no questions; the raw value is never shared" },
  { value: "hidden" as const, label: "Hidden", title: "Agents get 'blocked'" },
];

/** Extracted claims grouped by category, each with its own three-state control. */
export function ClaimList({ claims, settings, activeClaimId, onSelect, onCategory, onClaim, onPredicate }: Props) {
  return (
    <div className="space-y-5">
      {CATEGORIES.map((cat) => {
        const items = claims.filter((c) => c.category === cat);
        if (!items.length) return null;
        return (
          <section key={cat} aria-labelledby={`cat-${cat}`}>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 id={`cat-${cat}`} className="text-xs font-semibold uppercase tracking-wider text-white/60">
                {CATEGORY_LABELS[cat]} <span className="text-white/30">({items.length})</span>
              </h3>
              <div className="ml-auto flex items-center gap-1.5 text-[11px] text-white/40">
                default
                <VisibilityControl size="xs" label={`Default for ${CATEGORY_LABELS[cat]}`} value={settings.categoryDefaults[cat]} onChange={(v) => onCategory(cat, v)} />
              </div>
            </div>
            <ul className="space-y-1.5">
              {items.map((c) => {
                const v = resolveClaimVisibility(c, settings);
                const active = c.id === activeClaimId;
                return (
                  <li
                    key={c.id}
                    className={cn(
                      "rounded-xl border px-3 py-2 transition-colors",
                      active ? "border-accent/70 bg-accent/10" : "border-white/10 bg-white/[0.03]",
                      v === "private" && "opacity-80",
                    )}
                  >
                    <div className="flex flex-wrap items-start gap-2">
                      <button
                        type="button"
                        onClick={() => onSelect(c.id)}
                        aria-label={`${c.value} (show in transcript)`}
                        aria-pressed={active}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block text-[11px] uppercase tracking-wide text-white/40">{c.label}</span>
                        <span className={cn("block text-sm", v === "private" ? "text-white/60 line-through decoration-white/30" : "text-white")}>{c.value}</span>
                        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-white/40">
                          <Quote className="h-3 w-3" aria-hidden="true" />
                          <span className="truncate">“{c.quote}”</span>
                        </span>
                      </button>
                      <VisibilityControl size="xs" label={`${c.label}: ${c.value}`} value={v} onChange={(nv) => onClaim(c.id, nv)} />
                    </div>
                    {c.predicate && (
                      <div className="mt-2 flex items-center gap-2 border-t border-white/5 pt-2 text-[11px] text-white/50">
                        <span>Agent questions about this</span>
                        <Segmented
                          size="xs"
                          label={`Agent questions about ${c.label}`}
                          value={settings.predicateStates[c.predicate]}
                          options={PREDICATE_OPTIONS}
                          onChange={(s) => onPredicate(c, s)}
                          toneFor={(s) => (s === "answerable" ? "bg-sky-500/80 text-night-950" : "bg-slate-600 text-white")}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
