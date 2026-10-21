"use client";
import { motion, useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";

export interface DiagramClaim {
  quote: string;
  label: string;
  value: string;
  private: boolean;
}

function Draw({ d, delay, color = "#38bdf8" }: { d: string; delay: number; color?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 0.9 }}
      viewport={{ once: true }}
      transition={{ duration: reduce ? 0 : motionTokens.duration.story, delay: reduce ? 0 : delay, ease: motionTokens.easing.smooth }}
    />
  );
}

/** Before: transcript -> black box -> "?" card. After: quotes wired to claims, through a visibility gate, into a visible card. */
export function BeforeAfterDiagram({ claims }: { claims: DiagramClaim[] }) {
  const reduce = useReducedMotion();
  const rowY = (i: number) => 30 + i * 62;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <figure className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <figcaption className="mb-3 font-mono text-xs uppercase tracking-wider text-rose-300">Before</figcaption>
        <svg viewBox="0 0 300 220" className="w-full" role="img" aria-label="Before: the transcript goes into a black-box profile and agents get an unknown card">
          <rect x="10" y="70" width="80" height="80" rx="10" className="fill-white/10" />
          <text x="50" y="114" textAnchor="middle" className="fill-white/70 text-[11px]">transcript</text>
          <Draw d="M90 110 L120 110" delay={0.2} color="#94a3b8" />
          <rect x="120" y="70" width="70" height="80" rx="10" className="fill-black stroke-white/20" />
          <text x="155" y="114" textAnchor="middle" className="fill-white/50 text-[11px]">profile</text>
          <Draw d="M190 110 L220 110" delay={0.5} color="#94a3b8" />
          <rect x="220" y="80" width="70" height="60" rx="10" className="fill-amber-400/15 stroke-amber-300/40" />
          <text x="255" y="117" textAnchor="middle" className="fill-amber-200 text-[22px] font-semibold">?</text>
        </svg>
      </figure>

      <figure className="rounded-2xl border border-accent/30 bg-accent/[0.06] p-4">
        <figcaption className="mb-3 font-mono text-xs uppercase tracking-wider text-emerald-300">After: Agent View</figcaption>
        <svg viewBox="0 0 760 260" className="w-full" role="img" aria-label="After: each transcript quote is linked to a claim, private claims become [private] tokens at the visibility gate, and the agent card is visible">
          {claims.map((c, i) => (
            <g key={c.label + i}>
              <foreignObject x="0" y={rowY(i) - 18} width="210" height="40">
                <div className="truncate rounded-lg bg-white/10 px-2 py-1.5 text-[11px] italic text-white/70">“{c.quote}”</div>
              </foreignObject>
              <Draw d={`M210 ${rowY(i)} C 240 ${rowY(i)}, 240 ${rowY(i)}, 270 ${rowY(i)}`} delay={0.2 + i * 0.15} />
              <foreignObject x="270" y={rowY(i) - 18} width="190" height="40">
                <div className="truncate rounded-lg bg-night-800 px-2 py-1.5 text-[11px] text-white ring-1 ring-white/15">
                  <span className="text-white/40">{c.label}: </span>
                  {c.value}
                </div>
              </foreignObject>
              <Draw d={`M460 ${rowY(i)} L500 ${rowY(i)}`} delay={0.8 + i * 0.15} color={c.private ? "#94a3b8" : "#34d399"} />
            </g>
          ))}
          <rect x="500" y="8" width="26" height="244" rx="8" className="fill-white/5 stroke-white/20" />
          <text x="513" y="135" textAnchor="middle" transform="rotate(-90 513 135)" className="fill-white/50 text-[10px] tracking-widest">VISIBILITY</text>
          <Draw d="M526 130 L560 130" delay={1.4} color="#34d399" />
          <foreignObject x="560" y="22" width="200" height="220">
            <motion.div
              initial={{ opacity: 0, x: reduce ? 0 : motionTokens.distance.md }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: reduce ? 0 : 1.6, duration: motionTokens.duration.slow }}
              className="h-full rounded-xl bg-black/50 p-2 font-mono text-[10px] leading-relaxed text-white/80 ring-1 ring-emerald-400/30"
            >
              {"{"}
              {claims.map((c, i) => (
                <div key={i} className="pl-2">
                  <span className="text-sky-300">&quot;{c.label.toLowerCase().replace(/\s+/g, "_")}&quot;</span>:{" "}
                  {c.private ? (
                    <span className="rounded-full bg-slate-500/30 px-1.5 text-slate-200">[private]</span>
                  ) : (
                    <span className="text-emerald-300">&quot;{c.value.slice(0, 16)}{c.value.length > 16 ? "…" : ""}&quot;</span>
                  )}
                </div>
              ))}
              {"}"}
            </motion.div>
          </foreignObject>
        </svg>
      </figure>
    </div>
  );
}
