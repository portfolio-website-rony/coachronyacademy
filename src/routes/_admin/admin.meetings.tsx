import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Video, Copy, Check } from "lucide-react";
import { useRealtime } from "@/lib/admin/use-realtime";

export const Route = createFileRoute("/_admin/admin/meetings")({
  head: () => ({ meta: [{ title: "Meetings — Admin" }] }),
  component: MeetingsPage,
});

type Booking = {
  id: string;
  name: string;
  email: string;
  preferred_date: string;
  preferred_time: string;
  meeting_link: string | null;
  meeting_provider: string | null;
  meeting_status: string;
  session_notes: string | null;
};

function MeetingsPage() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"today" | "upcoming" | "past">("upcoming");
  const [loading, setLoading] = useState(true);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  useEffect(() => { void load(); }, []);
  useRealtime(["bookings"], () => void load());

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("id, name, email, preferred_date, preferred_time, meeting_link, meeting_provider, meeting_status, session_notes")
      .order("preferred_date");
    setLoading(false);
    if (error) toast.error(error.message);
    else setRows((data as Booking[]) ?? []);
  }

  const today = new Date().toISOString().split("T")[0];
  const filtered = rows.filter((r) =>
    tab === "today" ? r.preferred_date === today
      : tab === "upcoming" ? r.preferred_date >= today
      : r.preferred_date < today
  );

  async function complete(id: string) {
    const notes = notesDraft[id] ?? "";
    const { error } = await supabase
      .from("bookings")
      .update({ meeting_status: "completed", session_notes: notes, completed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Marked complete");
    void load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Meetings</h1>
        <p className="text-sm text-muted-foreground">Run your sessions from here.</p>
      </div>

      <div className="glass inline-flex rounded-xl p-1">
        {(["today", "upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-sm capitalize ${
              tab === t ? "bg-gradient-primary text-background font-semibold" : "text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((b) => (
            <div key={b.id} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{b.name}</div>
                  <div className="text-xs text-muted-foreground">{b.email}</div>
                  <div className="mt-1 text-xs">{b.preferred_date} • {b.preferred_time}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {b.meeting_link ? (
                    <>
                      <a
                        target="_blank" rel="noreferrer" href={b.meeting_link}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-background shadow-glow"
                      >
                        <Video className="h-3.5 w-3.5" /> Join
                      </a>
                      <button
                        onClick={() => { void navigator.clipboard.writeText(b.meeting_link!); toast.success("Copied"); }}
                        className="glass inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs"
                      >
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">No link — set in Bookings</span>
                  )}
                  <span className={`rounded-full px-2 py-1 text-xs ${
                    b.meeting_status === "completed" ? "bg-[oklch(0.72_0.18_152/20%)] text-[oklch(0.85_0.15_152)]" : "bg-white/10"
                  }`}>{b.meeting_status}</span>
                </div>
              </div>
              {b.meeting_status !== "completed" && (
                <div className="mt-4 flex gap-2">
                  <input
                    value={notesDraft[b.id] ?? b.session_notes ?? ""}
                    onChange={(e) => setNotesDraft((d) => ({ ...d, [b.id]: e.target.value }))}
                    placeholder="Session notes..."
                    className="glass flex-1 rounded-xl px-3 py-2 text-xs"
                  />
                  <button onClick={() => complete(b.id)} className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-xs">
                    <Check className="h-3.5 w-3.5" /> Mark complete
                  </button>
                </div>
              )}
              {b.session_notes && b.meeting_status === "completed" && (
                <div className="mt-3 rounded-xl bg-white/5 p-3 text-xs text-muted-foreground">{b.session_notes}</div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">No meetings.</div>
          )}
        </div>
      )}
    </div>
  );
}
