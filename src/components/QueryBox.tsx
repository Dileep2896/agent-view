"use client";
import { Search } from "lucide-react";
import type { SampleQuery } from "@/lib/types";
import { cn } from "@/lib/cn";

export function QueryBox({ value, onChange, samples }: { value: string; onChange: (v: string) => void; samples: SampleQuery[] }) {
  return (
    <div className="space-y-2">
      <label htmlFor="recruiter-query" className="text-xs font-medium text-white/60">
        Test a recruiter query
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden="true" />
        <input
          id="recruiter-query"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Founding AE, NYC, Series A fintech, $140K base"
          className="w-full rounded-xl border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:border-accent/60 focus:outline-none"
        />
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sample queries">
        {samples.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.text)}
            aria-pressed={value === s.text}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
              value === s.text ? "border-accent bg-accent/20 text-white" : "border-white/10 text-white/60 hover:border-white/30 hover:text-white",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
