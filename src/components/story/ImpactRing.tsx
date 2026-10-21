"use client";
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ScoreRing } from "@/components/ScoreRing";

/** Discoverability ring that animates from Maya's "before" score to her "after" score when scrolled into view. */
export function ImpactRing({ before, after }: { before: number; after: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [v, setV] = useState(before);
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setV(after), 400);
    return () => clearTimeout(t);
  }, [inView, after]);
  return (
    <div ref={ref}>
      <ScoreRing value={v} from={before} size={140} label="Maya's discoverability" />
    </div>
  );
}
