import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtime } from "@/lib/admin/use-realtime";
import { Loader2, Activity } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/activity")({
  head: () => ({ meta: [{ title: "Activity Log — Admin" }] }),
  component: ActivityPage,
});

type Row = {
  id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user_id: string | null;
};

function ActivityPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => { void load(); }, []);
  useRealtime(["activity_log"], () => void load());

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    setLoading(false);
    if (error) return toast.error(error.message);
    setRows((data as Row[]) ?? []);
  }

  const filtered = rows.filter((r) =>
    filter ? r.action.toLowerCase().includes(filter.toLowerCase()) : true,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Activity Log</h1>
        <p className="text-sm text-muted-foreground">Realtime feed of system events ({rows.length} latest).</p>
      </div>

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by action…"
        className="glass w-full max-w-sm rounded-xl px-3 py-2 text-sm"
      />

      <div className="glass overflow-hidden rounded-2xl">
        {loading ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <ul className="divide-y divide-white/5">
            {filtered.map((r) => (
              <li key={r.id} className="flex items-start gap-3 p-4 hover:bg-white/5">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary-glow">
                  <Activity className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm">{r.action}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()} {r.user_id && `• user: ${r.user_id.slice(0, 8)}…`}
                  </div>
                  {r.metadata && Object.keys(r.metadata).length > 0 && (
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-black/30 p-2 text-[11px] text-muted-foreground">
                      {JSON.stringify(r.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              </li>
            ))}
            {filtered.length === 0 && <li className="px-4 py-10 text-center text-sm text-muted-foreground">No activity recorded yet.</li>}
          </ul>
        )}
      </div>
    </div>
  );
}
