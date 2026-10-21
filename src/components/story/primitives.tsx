"use client";
import { motion, useInView, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { motionTokens, springs } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

/** Entrance variants; under reduced motion they become plain fades. */
export function useReveal() {
  const reduce = useReducedMotion();
  return {
    container: { hidden: {}, visible: { transition: { staggerChildren: motionTokens.stagger.normal, delayChildren: 0.1 } } },
    item: {
      hidden: { opacity: 0, y: reduce ? 0 : motionTokens.distance.lg },
      visible: { opacity: 1, y: 0, transition: reduce ? { duration: motionTokens.duration.fast } : springs.gentle },
    },
    reduce: !!reduce,
  };
}

export function Section({ id, eyebrow, title, children, className }: { id: string; eyebrow: string; title: React.ReactNode; children: React.ReactNode; className?: string }) {
  const { container, item } = useReveal();
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("relative flex min-h-screen items-center px-4 py-24", className)}>
      <motion.div className="mx-auto w-full max-w-6xl" variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-120px" }}>
        <motion.p variants={item} className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-accent-soft">
          {eyebrow}
        </motion.p>
        <motion.h2 variants={item} id={`${id}-title`} className="max-w-4xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          {title}
        </motion.h2>
        <div className="mt-10">{children}</div>
      </motion.div>
    </section>
  );
}

/** Reveals a line one word at a time. */
export function WordReveal({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <motion.p
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : motionTokens.stagger.normal } } }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          aria-hidden="true"
          className="inline-block pr-[0.25em]"
          variants={{
            hidden: { opacity: 0, y: reduce ? 0 : motionTokens.distance.sm, filter: reduce ? "none" : "blur(6px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth } },
          }}
        >
          {w}
        </motion.span>
      ))}
    </motion.p>
  );
}

/** Counts from `from` to `to` once the element scrolls into view. */
export function MetricCounter({ to, from = 0, prefix = "", suffix = "", decimals = 0, className }: { to: number; from?: number; prefix?: string; suffix?: string; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [v, setV] = useState(from);
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setV(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = motionTokens.duration.story * 1000 * 1.4;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, from, to]);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/** Scroll-linked progress rail down the left edge. */
export function ProgressRail() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <div aria-hidden="true" className="fixed left-3 top-20 z-30 hidden h-[calc(100vh-7rem)] w-[3px] rounded-full bg-white/10 md:block">
      <motion.div className="h-full w-full origin-top rounded-full bg-gradient-to-b from-accent to-emerald-400" style={{ scaleY }} />
    </div>
  );
}
