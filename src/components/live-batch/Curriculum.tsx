import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export type CurriculumModule = {
  no: string;
  title: string;
  topics: readonly string[];
};

export function Curriculum({ modules }: { modules: readonly CurriculumModule[] }) {
  // All modules visible by default
  const [open, setOpen] = useState<Set<number>>(() => new Set(modules.map((_, i) => i)));

  const allOpen = open.size === modules.length;
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const totalTopics = modules.reduce((n, m) => n + m.topics.length, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mont font-semibold text-primary">
            {modules.length} Modules
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mont">
            {totalTopics} Topics
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(allOpen ? new Set() : new Set(modules.map((_, i) => i)))}
          className="rounded-full border border-white/15 px-4 py-1.5 font-mont text-xs font-semibold text-foreground/80 transition hover:border-primary/40 hover:text-primary"
        >
          {allOpen ? "সব বন্ধ করুন" : "সব দেখুন"}
        </button>
      </div>

      <div className="grid gap-3">
        {modules.map((m, i) => {
          const isOpen = open.has(i);
          return (
            <div
              key={m.no}
              className={`group overflow-hidden rounded-2xl border transition-all duration-300 ${
                isOpen
                  ? "border-primary/30 bg-gradient-to-b from-primary/[0.07] to-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border font-mont text-sm font-bold transition ${
                    isOpen
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : "border-white/10 bg-white/[0.03] text-muted-foreground"
                  }`}
                >
                  {m.no}
                </span>
                <span className="flex-1">
                  <span className="block font-mont text-base font-semibold tracking-tight sm:text-lg">
                    {m.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {m.topics.length} topics
                  </span>
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-primary transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-white/10 px-5 py-5 sm:px-6">
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {m.topics.map((t) => (
                        <div
                          key={t}
                          className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground/85 transition hover:border-primary/25 hover:bg-primary/[0.06]"
                        >
                          <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="leading-snug">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
