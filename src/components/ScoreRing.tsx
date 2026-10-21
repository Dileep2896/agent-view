"use client";
import { motion, useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import { AnimatedNumber } from "./AnimatedNumber";

export function ScoreRing({ value, label = "Discoverability", size = 72, from }: { value: number; label?: string; size?: number; from?: number }) {
  const reduce = useReducedMotion();
  const r = 15.5;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="3" />
          <motion.circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            stroke="url(#ring)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c * (1 - (from ?? value) / 100) }}
            animate={{ strokeDashoffset: c * (1 - value / 100) }}
            transition={reduce ? { duration: 0 } : { duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth }}
          />
          <defs>
            <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
        </svg>
        <AnimatedNumber value={value} from={from} className="absolute inset-0 grid place-items-center font-mono text-lg font-semibold tabular-nums" />
      </div>
      <div className="text-xs leading-tight text-white/60">
        <div className="font-medium text-white/90">{label}</div>
        share of agent-relevant
        <br />
        fields agents can use
      </div>
    </div>
  );
}
