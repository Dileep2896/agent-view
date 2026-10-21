"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { CheckCircle2, EyeOff, Radar } from "lucide-react";
import type { Category, Claim, Member, PredicateState, Profile, Transcript, Visibility, VisibilitySettings } from "@/lib/types";
import { applyVisibility, resolveClaimVisibility } from "@/lib/visibility";
import { memberRef, toAgentCard } from "@/lib/card";
import { matchQuery, parseQuery } from "@/lib/query";
import { answerPredicate, questionsForQuery } from "@/lib/predicates";
import { discoverabilityScore, visibleFieldCount } from "@/lib/score";
import { sampleQueries } from "@/seed/queries";
import { motionTokens, springs } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";
import { Panel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TranscriptPane } from "@/components/TranscriptPane";
import { ClaimList } from "@/components/ClaimList";
import { ConsentSwitch } from "@/components/ConsentSwitch";
import { ScoreRing } from "@/components/ScoreRing";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { AgentCardJson } from "@/components/AgentCardJson";
import { QueryBox } from "@/components/QueryBox";
import { PredicateList } from "@/components/PredicateList";
import { saveSettings } from "./actions";

interface Props {
  members: Member[];
  profile: Profile;
  transcript: Transcript;
  initialSettings: VisibilitySettings;
}

const SAVE_DEBOUNCE_MS = 600;

export function AgentView({ members, profile, transcript, initialSettings }: Props) {
  const memberId = profile.member.id;
  const samples = useMemo(() => {
    const own = sampleQueries.filter((q) => q.memberId === memberId);
    return [...own, ...sampleQueries.filter((q) => q.memberId !== memberId)];
  }, [memberId]);

  const [settings, setSettings] = useState(initialSettings);
  const [query, setQuery] = useState(samples[0]?.text ?? "");
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null);
  const [pulseKey, setPulseKey] = useState(0);

  // Same pure functions the API uses, so feedback is instant and identical to what agents get.
  const projection = useMemo(() => applyVisibility(profile, settings), [profile, settings]);
  const parsed = useMemo(() => parseQuery(query), [query]);
  const match = useMemo(() => matchQuery(projection, parsed), [projection, parsed]);
  const card = useMemo(() => toAgentCard(projection, memberRef(memberId), match.verdicts), [projection, memberId, match.verdicts]);
  const predicates = useMemo(
    () => questionsForQuery(parsed).map((q) => ({ q, answer: answerPredicate(profile, settings, q) })),
    [parsed, profile, settings],
  );
  const score = discoverabilityScore(profile, settings);
  const fields = visibleFieldCount(profile, settings);

  // Debounced persistence through the server action.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await saveSettings(memberId, settings);
        if (!r.ok) toast.error(`Could not save: ${r.error ?? "unknown error"}`);
      } catch {
        toast.error("Could not save your settings. They will be kept on this page.");
      }
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [settings, memberId]);

  const visibilityOf = (c: Claim) => resolveClaimVisibility(c, settings);
  const select = (id: string) => {
    setActiveClaimId(id);
    setPulseKey((k) => k + 1);
  };
  const setCategory = (cat: Category, v: Visibility) =>
    setSettings((s) => {
      // A category default resets per-claim overrides in that category so the change is visible at once.
      const ids = new Set(profile.claims.filter((c) => c.category === cat).map((c) => c.id));
      const claimOverrides = Object.fromEntries(Object.entries(s.claimOverrides).filter(([id]) => !ids.has(id)));
      return { ...s, categoryDefaults: { ...s.categoryDefaults, [cat]: v }, claimOverrides };
    });
  const setClaim = (id: string, v: Visibility) => setSettings((s) => ({ ...s, claimOverrides: { ...s.claimOverrides, [id]: v } }));
  const setPredicate = (c: Claim, st: PredicateState) =>
    c.predicate && setSettings((s) => ({ ...s, predicateStates: { ...s.predicateStates, [c.predicate!]: st } }));

  const withheld = "withheld" in card;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-accent-soft">Agent View</p>
          <h1 className="text-2xl font-semibold tracking-tight">See exactly what AI agents learn about you</h1>
          <nav aria-label="Member" className="mt-2 flex flex-wrap gap-1.5 text-xs">
            {members.map((m) => (
              <a
                key={m.id}
                href={`/agent-view?member=${m.id}`}
                aria-current={m.id === memberId ? "page" : undefined}
                className={cn(
                  "rounded-full border px-2.5 py-1",
                  m.id === memberId ? "border-white/40 bg-white/10 text-white" : "border-white/10 text-white/60 hover:text-white",
                )}
              >
                {m.name}
              </a>
            ))}
          </nav>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-6">
          <ScoreRing value={score} />
          <div className="text-xs text-white/60">
            <div className="font-mono text-lg font-semibold text-white tabular-nums">
              <AnimatedNumber value={fields} />/{profile.claims.length}
            </div>
            fields agents can use
          </div>
          <ConsentSwitch checked={settings.consent} onChange={(consent) => setSettings((s) => ({ ...s, consent }))} />
        </div>
      </div>

      <div className="grid gap-4 lg:h-[calc(100vh-13rem)] lg:min-h-[640px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1.2fr)]">
        <Panel id="pane-transcript" title="Your career call" action={<span className="text-[11px] text-white/40">click a highlight</span>}>
          <TranscriptPane transcript={transcript} claims={profile.claims} visibilityOf={visibilityOf} activeClaimId={activeClaimId} pulseKey={pulseKey} onSelect={select} />
        </Panel>

        <Panel id="pane-claims" title="What the AI learned" action={<span className="text-[11px] text-white/40">{profile.claims.length} claims, each cited</span>}>
          <ClaimList
            claims={profile.claims}
            settings={settings}
            activeClaimId={activeClaimId}
            onSelect={select}
            onCategory={setCategory}
            onClaim={setClaim}
            onPredicate={setPredicate}
          />
        </Panel>

        <Panel id="pane-agents" title="How agents see you" action={<Badge tone="accent">search_people</Badge>}>
          <div className="space-y-4">
            <QueryBox value={query} onChange={setQuery} samples={samples} />

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={withheld ? "withheld" : match.surfaces ? "surfaces" : "hidden"}
                initial={{ opacity: 0, y: motionTokens.distance.sm }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -motionTokens.distance.sm }}
                transition={springs.snappy}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1",
                  withheld ? "bg-slate-500/10 ring-slate-400/30" : match.surfaces ? "bg-emerald-500/10 ring-emerald-400/30" : "bg-rose-500/10 ring-rose-400/30",
                )}
                role="status"
              >
                {withheld ? <EyeOff className="h-5 w-5 text-slate-300" aria-hidden="true" /> : match.surfaces ? <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" /> : <Radar className="h-5 w-5 text-rose-300" aria-hidden="true" />}
                <div className="text-sm">
                  <div className="font-medium">
                    {withheld ? "Withheld: no AI Visibility consent" : match.surfaces ? "You would surface for this search" : "You would not surface"}
                  </div>
                  <div className="text-xs text-white/50">
                    {withheld ? "Agents receive only your ref and the withheld marker." : `Surfaces at a match score of 60+ with no required no_match.`}
                  </div>
                </div>
                {!withheld && (
                  <div className="ml-auto text-right">
                    <div className="font-mono text-2xl font-semibold tabular-nums">
                      <AnimatedNumber value={match.score} />
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-white/40">match</div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div>
              <h3 className="mb-1 text-xs font-medium text-white/60">The exact card an agent receives</h3>
              <AgentCardJson card={card} />
            </div>

            <PredicateList items={predicates} />
          </div>
        </Panel>
      </div>
    </div>
  );
}
