import type { ReactNode } from "react";

export function BrowserMockup({
  url = "coachrony.com",
  children,
  className = "",
}: {
  url?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.14_0.02_270)] shadow-card ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <div className="ml-3 flex-1 truncate rounded-md border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-muted-foreground">
          {url}
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

/** Lightweight abstract product previews (no stock imagery). */
export function MockPreview({ kind }: { kind: "site" | "chat" | "flow" | "dashboard" }) {
  if (kind === "chat") {
    return (
      <div className="space-y-2.5">
        <div className="ml-auto h-6 w-2/3 rounded-lg bg-primary/25" />
        <div className="h-6 w-4/5 rounded-lg bg-white/[0.06]" />
        <div className="h-6 w-3/5 rounded-lg bg-white/[0.06]" />
        <div className="ml-auto h-6 w-1/2 rounded-lg bg-primary/25" />
        <div className="h-9 rounded-lg border border-white/10 bg-black/30" />
      </div>
    );
  }
  if (kind === "flow") {
    return (
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-1 items-center gap-2">
            <div className="h-10 flex-1 rounded-lg border border-white/10 bg-white/[0.05]" />
            {i < 3 && <div className="h-px w-3 bg-primary/50" />}
          </div>
        ))}
      </div>
    );
  }
  if (kind === "dashboard") {
    return (
      <div className="grid grid-cols-3 gap-2.5">
        <div className="col-span-1 h-24 rounded-lg border border-white/10 bg-white/[0.04]" />
        <div className="col-span-2 h-24 rounded-lg border border-white/10 bg-gradient-to-tr from-primary/20 to-transparent" />
        <div className="col-span-3 h-10 rounded-lg border border-white/10 bg-white/[0.04]" />
      </div>
    );
  }
  return (
    <div className="space-y-2.5">
      <div className="h-14 rounded-lg bg-gradient-to-r from-primary/25 to-transparent" />
      <div className="grid grid-cols-3 gap-2.5">
        <div className="h-12 rounded-lg bg-white/[0.05]" />
        <div className="h-12 rounded-lg bg-white/[0.05]" />
        <div className="h-12 rounded-lg bg-white/[0.05]" />
      </div>
      <div className="h-3 w-2/3 rounded bg-white/[0.06]" />
    </div>
  );
}
