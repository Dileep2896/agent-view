import { cn } from "@/lib/cn";

export function Panel({ title, action, className, children, id }: { title: string; action?: React.ReactNode; className?: string; children: React.ReactNode; id?: string }) {
  return (
    <section aria-labelledby={id} className={cn("flex min-h-0 flex-col rounded-2xl border border-white/10 bg-night-900/70 shadow-xl shadow-black/30", className)}>
      <header className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <h2 id={id} className="text-sm font-semibold tracking-tight text-white/90">{title}</h2>
        <div className="ml-auto">{action}</div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
    </section>
  );
}
