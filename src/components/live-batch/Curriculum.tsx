import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type CurriculumModule = {
  no: string;
  title: string;
  topics: readonly string[];
};

export function Curriculum({ modules }: { modules: readonly CurriculumModule[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="grid gap-3">
      {modules.map((m, i) => {
        const isOpen = open === i;
        return (
          <div
            key={m.no}
            className={`overflow-hidden rounded-2xl border transition ${
              isOpen ? "border-primary/30 bg-white/[0.04]" : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center gap-4 px-6 py-5 text-left"
            >
              <span className="font-mont text-sm font-semibold tracking-[0.2em] text-primary">
                {m.no}
              </span>
              <span className="flex-1 font-mont text-base font-semibold tracking-tight sm:text-lg">
                {m.title}
              </span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                {m.topics.length} topics
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="border-t border-white/10 px-6 py-5">
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {m.topics.map((t) => (
                    <div key={t} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
