import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export function FAQ({ items }: { items: readonly { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-mont text-base font-semibold tracking-tight">{item.q}</span>
              {isOpen ? (
                <Minus className="h-4 w-4 shrink-0 text-primary" />
              ) : (
                <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </button>
            {isOpen && (
              <p className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
