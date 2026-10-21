"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Lock } from "lucide-react";
import { PRIVATE_TOKEN, type AgentCard, type WithheldCard } from "@/lib/types";
import { motionTokens, springs } from "@/lib/motion-tokens";

function Value({ v }: { v: unknown }) {
  if (v === PRIVATE_TOKEN)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/25 px-2 py-0.5 text-slate-200 ring-1 ring-slate-400/40">
        <Lock className="h-3 w-3" aria-hidden="true" />
        {PRIVATE_TOKEN}
      </span>
    );
  if (v === null) return <span className="text-white/40">null</span>;
  if (typeof v === "string") return <span className="text-emerald-300">{JSON.stringify(v)}</span>;
  if (typeof v === "object") {
    const entries = Object.entries(v as Record<string, unknown>);
    if (!entries.length) return <span className="text-white/60">{"{}"}</span>;
    return (
      <span>
        {"{"}
        {entries.map(([k, val], i) => (
          <span key={k} className="block pl-4">
            <span className="text-sky-300">{JSON.stringify(k)}</span>: <span className={val === "match" ? "text-emerald-300" : val === "no_match" ? "text-rose-300" : "text-amber-200"}>{JSON.stringify(val)}</span>
            {i < entries.length - 1 ? "," : ""}
          </span>
        ))}
        {"}"}
      </span>
    );
  }
  return <span className="text-amber-200">{String(v)}</span>;
}

function ContextLines({ text }: { text: string }) {
  const lines = text ? text.split("\n") : [];
  if (!lines.length) return <span className="text-emerald-300">{'""'}</span>;
  return (
    <span>
      <span className="text-emerald-300">&quot;</span>
      {lines.map((l, i) => (
        <span key={l} className={l.startsWith("[emphasized]") ? "block whitespace-pre-wrap break-words pl-4 text-sky-200" : "block whitespace-pre-wrap break-words pl-4 text-emerald-300"}>
          {l}
          {i < lines.length - 1 ? <span className="text-white/30">\n</span> : null}
        </span>
      ))}
      <span className="text-emerald-300">&quot;</span>
    </span>
  );
}

/** Pretty-printed MCP card with redactions rendered as pill tokens; rows animate in/out as fields change. */
export function AgentCardJson({ card }: { card: AgentCard | WithheldCard }) {
  const reduce = useReducedMotion();
  const entries = Object.entries(card);
  const row = (k: string, v: unknown, i: number) => (
    <>
      <span className="text-sky-300">{JSON.stringify(k)}</span>: {k === "memberContext" ? <ContextLines text={String(v)} /> : <Value v={v} />}
      {i < entries.length - 1 ? "," : ""}
    </>
  );
  return (
    <pre data-testid="agent-card-json" className="overflow-x-auto rounded-xl bg-black/40 p-3 font-mono text-[12px] leading-relaxed text-white/80 ring-1 ring-white/10" aria-label="Agent card JSON">
      {"{"}
      {reduce ? (
        entries.map(([k, v], i) => (
          <div key={k} className="pl-4">
            {row(k, v, i)}
          </div>
        ))
      ) : (
        <AnimatePresence initial={false} mode="popLayout">
          {entries.map(([k, v], i) => (
            <motion.div
              key={`${"withheld" in card ? "w" : "c"}-${k}`}
              layout="position"
              initial={{ opacity: 0, x: -motionTokens.distance.sm }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: motionTokens.distance.sm }}
              transition={springs.gentle}
              className="pl-4"
            >
              {row(k, v, i)}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
      {"}"}
    </pre>
  );
}
