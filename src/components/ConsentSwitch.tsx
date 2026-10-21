"use client";
import * as Switch from "@radix-ui/react-switch";

export function ConsentSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <Switch.Root
        id="consent"
        checked={checked}
        onCheckedChange={onChange}
        aria-labelledby="consent-label"
        className="relative h-6 w-11 shrink-0 rounded-full bg-white/15 transition-colors data-[state=checked]:bg-emerald-500"
      >
        <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px]" />
      </Switch.Root>
      <label id="consent-label" htmlFor="consent" className="text-sm">
        <span className="font-medium text-white">Discoverable by AI agents</span>
        <span className="block text-xs text-white/50">{checked ? "AI Visibility consent on" : "Agents receive nothing"}</span>
      </label>
    </div>
  );
}
