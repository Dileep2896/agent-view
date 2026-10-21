"use client";
import { useRef } from "react";
import { cn } from "@/lib/cn";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  title?: string;
}

/** Accessible single-select segmented control (radiogroup with roving tabindex + arrow keys). */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  size = "sm",
  toneFor,
}: {
  label: string;
  value: T | undefined;
  options: SegmentOption<T>[];
  onChange: (v: T) => void;
  size?: "xs" | "sm";
  toneFor?: (v: T) => string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const idx = Math.max(0, options.findIndex((o) => o.value === value));

  function onKey(e: React.KeyboardEvent, i: number) {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + options.length) % options.length;
    const opt = options[next];
    if (!opt) return;
    onChange(opt.value);
    refs.current[next]?.focus();
  }

  return (
    <div role="radiogroup" aria-label={label} className="inline-flex shrink-0 rounded-lg bg-black/30 p-0.5 ring-1 ring-white/10">
      {options.map((o, i) => {
        const checked = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={i === idx ? 0 : -1}
            title={o.title}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              "rounded-md font-medium transition-colors",
              size === "xs" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-1 text-xs",
              checked ? (toneFor?.(o.value) ?? "bg-white/15 text-white") : "text-white/50 hover:text-white/80",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
