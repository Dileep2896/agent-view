"use client";
import { useEffect, useRef } from "react";
import type { Claim, Transcript, Visibility } from "@/lib/types";
import { cn } from "@/lib/cn";

interface Props {
  transcript: Transcript;
  claims: Claim[];
  visibilityOf: (c: Claim) => Visibility;
  activeClaimId: string | null;
  pulseKey: number;
  onSelect: (id: string) => void;
}

const markTone: Record<Visibility, string> = {
  emphasize: "bg-accent/35 text-white ring-accent/60",
  visible: "bg-emerald-400/20 text-emerald-50 ring-emerald-400/40",
  private: "private-stripes bg-slate-500/10 text-white/60 ring-slate-400/30",
};

/** The call transcript with every claim's source span highlighted and clickable. */
export function TranscriptPane({ transcript, claims, visibilityOf, activeClaimId, pulseKey, onSelect }: Props) {
  const refs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    if (!activeClaimId) return;
    refs.current.get(activeClaimId)?.scrollIntoView?.({ block: "center", behavior: "smooth" });
  }, [activeClaimId, pulseKey]);

  return (
    <ol className="space-y-3" aria-label="Call transcript">
      {transcript.turns.map((turn) => {
        const spans = claims
          .filter((c) => c.evidence.turnId === turn.id)
          .sort((a, b) => a.evidence.start - b.evidence.start)
          .filter((c, i, arr) => i === 0 || c.evidence.start >= arr[i - 1]!.evidence.end);
        const parts: React.ReactNode[] = [];
        let cursor = 0;
        for (const c of spans) {
          if (c.evidence.start > cursor) parts.push(turn.text.slice(cursor, c.evidence.start));
          const active = c.id === activeClaimId;
          parts.push(
            <mark
              key={active ? `${c.id}-${pulseKey}` : c.id}
              data-testid={`span-${c.id}`}
              aria-current={active ? "true" : undefined}
              ref={(el) => {
                if (el) refs.current.set(c.id, el);
              }}
              onClick={() => onSelect(c.id)}
              className={cn(
                "cursor-pointer rounded px-0.5 ring-1 ring-inset transition-colors",
                markTone[visibilityOf(c)],
                active && "animate-pulseSpan ring-2 ring-accent-soft",
              )}
            >
              {turn.text.slice(c.evidence.start, c.evidence.end)}
            </mark>,
          );
          cursor = c.evidence.end;
        }
        if (cursor < turn.text.length) parts.push(turn.text.slice(cursor));
        const isInterviewer = turn.speaker === "interviewer";
        return (
          <li key={turn.id} className={cn("flex gap-2", isInterviewer ? "" : "flex-row-reverse")}>
            <span aria-hidden="true" className={cn("mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold", isInterviewer ? "bg-accent/30 text-sky-100" : "bg-white/15")}>
              {isInterviewer ? "AI" : "You"}
            </span>
            <p className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed", isInterviewer ? "bg-white/5 text-white/70" : "bg-white/10 text-white/90")}>
              <span className="sr-only">{isInterviewer ? "Interviewer: " : "You: "}</span>
              {parts}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
