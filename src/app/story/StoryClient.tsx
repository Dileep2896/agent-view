"use client";
import { motion } from "motion/react";
import { ArrowRight, Check, Quote } from "lucide-react";
import { motionTokens, springs } from "@/lib/motion-tokens";
import { MetricCounter, ProgressRail, Section, WordReveal, useReveal } from "@/components/story/primitives";
import { PainDiagram } from "@/components/story/PainDiagram";
import { BeforeAfterDiagram, type DiagramClaim } from "@/components/story/BeforeAfterDiagram";
import { MiniDemo } from "@/components/story/MiniDemo";
import { ImpactRing } from "@/components/story/ImpactRing";
import { AppMark } from "@/components/AppMark";
import { PREDICATES } from "@/lib/types";

export interface StoryProps {
  numbers: { scoreBefore: number; scoreAfter: number; fieldsBefore: number; fieldsAfter: number };
  diagram: DiagramClaim[];
  demo: { label: string; value: string };
}

const PAIN_QUOTES = [
  { text: "I did a 10-minute AI career call. I have no idea what it now tells recruiters about me.", src: "job-seeker forum (paraphrased)" },
  { text: "Turns out it's just a database they are building.", src: "career forum (paraphrased)" },
  { text: "Is this a scam, or just a way to collect my data?", src: "recruiting forum (paraphrased)" },
];

const REASONS = [
  "Candidate context is the supply side, and it bounds every search",
  "Makes the “you stay in control” promise checkable",
  "Fits the MCP-style card + private-question contracts agents already call",
];

export function StoryClient({ numbers, diagram, demo }: StoryProps) {
  const { item } = useReveal();
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="starfield pointer-events-none fixed inset-0 opacity-70" />
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,.22),transparent_65%)]" />
      <ProgressRail />

      <Section id="domain" eyebrow="01 · The domain" title={<>Recruiters now read you <span className="text-white/40">through an</span> AI agent.</>}>
        <WordReveal
          className="max-w-3xl text-xl text-white/70 sm:text-2xl"
          text="Resumes made careers readable. LinkedIn made them filterable. Agents make them understood."
        />
        <motion.div variants={item} className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { node: <MetricCounter to={10} suffix=" min" />, label: "AI career call that becomes your agent-readable profile" },
            { node: <MetricCounter to={PREDICATES.length} />, label: "private questions an agent can ask about you" },
            { node: <MetricCounter to={0} />, label: "raw private values sent to agents (tested: 3 members × 32 settings)" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
              <div className="font-mono text-4xl font-semibold text-white sm:text-5xl">{s.node}</div>
              <div className="mt-2 text-sm text-white/60">{s.label}</div>
            </div>
          ))}
        </motion.div>
        <motion.p variants={item} className="mt-6 text-xs text-white/40">
          AI recruiting tools now turn a short voice or text conversation into a structured profile that people and recruiters&apos; agents search, score and question. The person it describes rarely sees what those agents receive.
        </motion.p>
      </Section>

      <Section id="pain" eyebrow="02 · The pain" title="You told an AI your career story. What does it tell other AIs?">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div variants={item}>
            <PainDiagram />
            <p className="mt-6 max-w-lg text-white/70">
              Today, consent is one abstract switch: &ldquo;AI Visibility&rdquo;. Candidates can&apos;t see the card a recruiter&apos;s agent actually receives, or which part of their call produced each claim. Every hidden category drops a person out of agent search.
            </p>
          </motion.div>
          <div className="space-y-3">
            {PAIN_QUOTES.map((q, i) => (
              <motion.blockquote
                key={q.src}
                initial={{ opacity: 0, x: motionTokens.distance.xl }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ ...springs.gentle, delay: 0.3 + i * 0.15 }}
                className="rounded-2xl border border-white/10 bg-night-900/80 p-5"
              >
                <Quote className="mb-2 h-4 w-4 text-amber-300" aria-hidden="true" />
                <p className="text-lg text-white">{q.text}</p>
                <footer className="mt-2 font-mono text-[11px] uppercase tracking-wider text-white/40">source: {q.src}</footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </Section>

      <Section id="decision" eyebrow="03 · The decision" title="Two features made the shortlist. One bounds the whole marketplace.">
        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 1 }}
            whileInView={{ opacity: 0.4, scale: 0.97 }}
            viewport={{ once: true, margin: "-160px" }}
            transition={{ delay: 0.9, duration: motionTokens.duration.slow }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <div className="font-mono text-xs text-white/40">OPTION A · demand side</div>
            <h3 className="mt-2 text-xl font-semibold">Explain recruiter match scores</h3>
            <p className="mt-2 text-sm text-white/60">&ldquo;Why this fit&rdquo; evidence cards for the 95% match. Useful, but recruiter-side tools in this space already ship rubric scoring with cited criteria.</p>
          </motion.div>
          <motion.div
            initial={{ y: 0, boxShadow: "0 0 0 0 rgba(56,189,248,0)" }}
            whileInView={{ y: -motionTokens.distance.sm, boxShadow: "0 20px 60px -20px rgba(56,189,248,.6)" }}
            viewport={{ once: true, margin: "-160px" }}
            transition={{ delay: 0.9, ...springs.gentle }}
            className="relative rounded-2xl border border-accent/60 bg-accent/10 p-6"
          >
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.3, ...springs.snappy }}
              className="absolute -right-3 -top-3 grid h-9 w-9 place-items-center rounded-full bg-emerald-400 text-night-950"
            >
              <Check className="h-5 w-5" aria-label="chosen" />
            </motion.span>
            <div className="font-mono text-xs text-sky-200">OPTION B · supply side</div>
            <h3 className="mt-2 text-xl font-semibold">Agent View for candidates</h3>
            <p className="mt-2 text-sm text-white/70">Show each professional the exact card and answers an agent receives, with every claim cited to their own words.</p>
          </motion.div>
        </div>
        <ul className="mt-8 space-y-3">
          {REASONS.map((r, i) => (
            <motion.li
              key={r}
              initial={{ opacity: 0, x: -motionTokens.distance.md }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.5 + i * 0.2, ...springs.gentle }}
              className="flex items-center gap-3 text-lg"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400/20 text-emerald-300">
                <Check className="h-4 w-4" aria-hidden="true" />
              </span>
              {r}
            </motion.li>
          ))}
        </ul>
      </Section>

      <Section id="feature" eyebrow="04 · The feature" title="Agent View: every claim cited, every field controlled, every agent card inspectable.">
        <motion.div variants={item}>
          <BeforeAfterDiagram claims={diagram} />
        </motion.div>
        <motion.div variants={item} className="mt-6 grid items-center gap-6 lg:grid-cols-[2fr_1fr]">
          <MiniDemo label={demo.label} value={demo.value} />
          <a
            href="/agent-view"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-medium text-white shadow-lg shadow-accent/30 transition hover:bg-sky-500"
          >
            Open Agent View <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </motion.div>
      </Section>

      <Section id="impact" eyebrow="05 · The impact" title="Trust you can inspect is consent you can scale.">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <motion.div variants={item} className="space-y-6">
            <ImpactRing before={numbers.scoreBefore} after={numbers.scoreAfter} />
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="text-sm text-white/60">Agent-relevant fields visible</div>
              <div className="mt-1 font-mono text-4xl font-semibold">
                <span className="text-white/40">{numbers.fieldsBefore}</span>
                <span className="mx-3 text-white/30">→</span>
                <MetricCounter from={numbers.fieldsBefore} to={numbers.fieldsAfter} className="text-emerald-300" />
              </div>
              <p className="mt-2 text-xs text-white/40">
                Computed live from Maya&apos;s seed data: before, she hid goals, preferences and every private answer. After seeing her agent card she emphasized two strengths and made salary, work authorization and availability answerable, while her employer stayed private. Score {numbers.scoreBefore} → {numbers.scoreAfter}.
              </p>
            </div>
          </motion.div>
          <motion.div variants={item}>
            <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-white/50">Expected business impact (hypotheses)</h3>
            <ul className="space-y-3">
              {["Higher AI Visibility opt-in rate", "Fewer hidden categories per member", "More warm intros per member"].map((h) => (
                <li key={h} className="flex items-center gap-3 rounded-xl border border-white/10 bg-night-900/70 px-4 py-3">
                  <AppMark className="h-4 w-4 text-accent-soft" />
                  {h}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </Section>
    </div>
  );
}
