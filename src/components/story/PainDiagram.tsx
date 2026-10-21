"use client";
import { motion, useReducedMotion } from "motion/react";
import { User } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";

const agents = [
  { y: 40, label: "Recruiter agent" },
  { y: 130, label: "Sourcing agent" },
  { y: 220, label: "ATS agent" },
];

/** Candidate on the left, arrows animating out to three agents that each hold a "?" card. */
export function PainDiagram() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 520 260" className="w-full max-w-xl" role="img" aria-label="A candidate's profile flows to three AI agents, but the candidate cannot see what each agent receives">
      <foreignObject x="0" y="90" width="90" height="90">
        <div className="grid h-full w-full place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
          <User className="h-9 w-9 text-white/80" />
        </div>
      </foreignObject>
      <text x="45" y="200" textAnchor="middle" className="fill-white/60 text-[12px]">You</text>
      {agents.map((a, i) => (
        <g key={a.label}>
          <motion.path
            d={`M95 135 C 220 135, 260 ${a.y + 20}, 360 ${a.y + 20}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="4 6"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: reduce ? 0 : motionTokens.duration.story, delay: reduce ? 0 : 0.3 + i * 0.25, ease: motionTokens.easing.smooth }}
          />
          <motion.g
            initial={{ opacity: 0, scale: reduce ? 1 : 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: reduce ? 0 : 1 + i * 0.25, duration: motionTokens.duration.normal }}
            style={{ transformOrigin: `440px ${a.y + 20}px` }}
          >
            <rect x="365" y={a.y} width="150" height="40" rx="10" className="fill-night-800 stroke-white/20" />
            <text x="380" y={a.y + 25} className="fill-white/70 text-[12px]">{a.label}</text>
            <rect x="478" y={a.y + 8} width="26" height="24" rx="6" className="fill-amber-400/20" />
            <text x="491" y={a.y + 25} textAnchor="middle" className="fill-amber-200 text-[14px] font-semibold">?</text>
          </motion.g>
        </g>
      ))}
    </svg>
  );
}
