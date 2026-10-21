"use client";
import type { Visibility } from "@/lib/types";
import { Segmented } from "./ui/segmented";

const OPTIONS = [
  { value: "emphasize" as const, label: "Emphasize", title: "Lead with this; counts 1.5x in matching" },
  { value: "visible" as const, label: "Visible", title: "Agents can see this" },
  { value: "private" as const, label: "Private", title: "Agents never see this" },
];

export const visibilityTone = (v: Visibility) =>
  v === "emphasize" ? "bg-accent text-white" : v === "visible" ? "bg-emerald-500/80 text-night-950" : "bg-slate-600 text-white";

export function VisibilityControl({ label, value, onChange, size }: { label: string; value: Visibility; onChange: (v: Visibility) => void; size?: "xs" | "sm" }) {
  return <Segmented label={label} value={value} options={OPTIONS} onChange={onChange} toneFor={visibilityTone} size={size} />;
}
