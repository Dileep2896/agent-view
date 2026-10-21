import { cn } from "@/lib/cn";

const tones = {
  neutral: "bg-white/10 text-white/80 ring-white/15",
  good: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  bad: "bg-rose-500/15 text-rose-300 ring-rose-400/30",
  warn: "bg-amber-500/15 text-amber-200 ring-amber-400/30",
  accent: "bg-accent/20 text-sky-200 ring-accent/40",
  muted: "bg-slate-500/15 text-slate-300 ring-slate-400/25",
} as const;

export type Tone = keyof typeof tones;

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", tones[tone], className)}>
      {children}
    </span>
  );
}
