"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { motionTokens, springs } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

/** A 6-second loop: the "Current company" toggle flips to Private and the card field redacts. */
export function MiniDemo({ label, value }: { label: string; value: string }) {
  const reduce = useReducedMotion();
  const [isPrivate, setPrivate] = useState(false);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setPrivate((p) => !p), 3000);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <div className="grid gap-4 rounded-2xl border border-white/10 bg-night-900/70 p-4 sm:grid-cols-2" aria-label="Looping demo: setting a claim to private redacts it from the agent card">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wide text-white/40">{label}</div>
          <div className={cn("text-sm transition-colors", isPrivate ? "text-white/50 line-through" : "text-white")}>{value}</div>
        </div>
        <div className="relative inline-flex rounded-lg bg-black/30 p-0.5 text-xs ring-1 ring-white/10">
          {(["Visible", "Private"] as const).map((o) => {
            const on = (o === "Private") === isPrivate;
            return (
              <span key={o} className="relative z-10 px-2 py-1 font-medium">
                {on && <motion.span layoutId="mini-pill" transition={springs.snappy} className={cn("absolute inset-0 -z-10 rounded-md", o === "Private" ? "bg-slate-600" : "bg-emerald-500/80")} />}
                <span className={on ? "text-white" : "text-white/50"}>{o}</span>
              </span>
            );
          })}
        </div>
      </div>
      <pre className="rounded-xl bg-black/40 p-3 font-mono text-xs text-white/80 ring-1 ring-white/10">
        <span className="text-sky-300">&quot;company&quot;</span>:{" "}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isPrivate ? "p" : "v"}
            initial={{ opacity: 0, y: reduce ? 0 : -motionTokens.distance.sm }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : motionTokens.distance.sm }}
            transition={{ duration: motionTokens.duration.normal }}
            className="inline-block"
          >
            {isPrivate ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/25 px-2 text-slate-200 ring-1 ring-slate-400/40">
                <Lock className="h-3 w-3" aria-hidden="true" />
                [private]
              </span>
            ) : (
              <span className="text-emerald-300">&quot;{value}&quot;</span>
            )}
          </motion.span>
        </AnimatePresence>
      </pre>
    </div>
  );
}
