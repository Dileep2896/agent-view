"use client";
import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { motionTokens } from "@/lib/motion-tokens";

/** Tweens to `value` whenever it changes; jumps straight there under reduced motion. */
export function AnimatedNumber({ value, from, className, duration = motionTokens.duration.slow }: { value: number; from?: number; className?: string; duration?: number }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(from ?? value);
  const prev = useRef(from ?? value);

  useEffect(() => {
    if (reduce) {
      setShown(value);
      prev.current = value;
      return;
    }
    const controls = animate(prev.current, value, {
      duration,
      ease: motionTokens.easing.smooth,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, reduce, duration]);

  return <span className={className}>{shown}</span>;
}
