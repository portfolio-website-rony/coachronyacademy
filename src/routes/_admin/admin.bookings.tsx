import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Link2, Check, X } from "lucide-react";
import { useRealtime } from "@/lib/admin/use-realtime";

export const Route = createFileRoute("/_admin/admin/bookings")({
  head: () => ({ meta: [{ title: "Bookings — Admin" }] }),
  component: BookingsPage,
});

type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  topic: string | null;
  preferred_date: string;
  preferred_time: string;
  status: string;
  meeting_link: string | null;
  meeting_provider: string | null;
  meeting_status: string;
  notes: string | null;
  created_at: string;
};

function BookingsPage() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [linkDraft, setLinkDraft] = useState("");
  const [providerDraft, setProviderDraft] = useState("meet");

  useEffect(() => { void load(); }, []);
  useRealtime(["bookings"], () => void load());

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("preferred_date", { ascending: false });
    setLoading(false);
    if (error) toast.error(error.message);
    else setRows((data as Booking[]) ?? []);
  }

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    toast.success(`Marked ${status}`);
  }

  async function saveLink(id: string) {
    const { error } = await supabase
      .from("bookings")
      .update({ meeting_link: linkDraft, meeting_provider: providerDraft, status: "confirmed" })
      .eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) =>
      r.map((x) =>
        x.id === id
          ? { ...x, meeting_link: linkDraft, meeting_provider: providerDraft, status: "confirmed" }
          : x
      )
    );
    setEditing(null);
    setLinkDraft("");
    toast.success("Link attached");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Bookings</h1>
        <p className="text-sm text-muted-foreground">{rows.length} bookings</p>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        {loading ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Date / Time</th>
                  <th className="px-4 py-3">Topic</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Meeting</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="font-medium">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.email}</div>
                      {b.phone && <div className="text-xs text-muted-foreground">{b.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div>{b.preferred_date}</div>
                      <div className="text-muted-foreground">{b.preferred_time}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">{b.topic ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          b.status === "confirmed"
                            ? "bg-[oklch(0.72_0.18_152/20%)] text-[oklch(0.85_0.15_152)]"
                            : b.status === "cancelled"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {editing === b.id ? (
                        <div className="flex gap-1">
                          <select
                            value={providerDraft}
                            onChange={(e) => setProviderDraft(e.target.value)}
                            className="glass rounded-lg px-2 py-1 text-xs"
                          >
                            <option value="meet">Meet</option>
                            <option value="zoom">Zoom</option>
                            <option value="other">Other</option>
                          </select>
                          <input
                            value={linkDraft}
                            onChange={(e) => setLinkDraft(e.target.value)}
                            placeholder="Paste link"
                            className="glass w-44 rounded-lg px-2 py-1 text-xs"
                          />
                          <button onClick={() => saveLink(b.id)} className="rounded-lg bg-primary/20 p-1.5"><Check className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setEditing(null)} className="rounded-lg bg-white/5 p-1.5"><X className="h-3.5 w-3.5" /></button>
                        </div>
                      ) : b.meeting_link ? (
                        <a target="_blank" rel="noreferrer" href={b.meeting_link} className="inline-flex items-center gap-1 text-xs text-primary-glow hover:underline">
                          <Link2 className="h-3.5 w-3.5" /> {b.meeting_provider ?? "link"}
                        </a>
                      ) : (
                        <button
                          onClick={() => { setEditing(b.id); setLinkDraft(""); setProviderDraft("meet"); }}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          + Add link
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setStatus(b.id, "confirmed")} className="rounded-lg bg-white/5 px-2 py-1 text-xs hover:bg-white/10">Confirm</button>
                        <button onClick={() => setStatus(b.id, "cancelled")} className="rounded-lg bg-white/5 px-2 py-1 text-xs hover:bg-white/10">Cancel</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No bookings yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
