import { cn } from "@/lib/utils";

const MAP: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  contacted: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  booked: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  converted: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  closed: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  failed: "bg-red-500/15 text-red-300 border-red-500/30",
  refunded: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  scheduled: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-300 border-red-500/30",
  active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  inactive: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status?.toLowerCase() ?? "";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        MAP[key] ?? "bg-white/5 text-muted-foreground border-white/10",
        className,
      )}
    >
      {status}
    </span>
  );
}
