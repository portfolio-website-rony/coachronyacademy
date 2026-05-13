import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Mail, MessageCircle, Loader2, Link2, Calendar, Clock, Trash2, Check, RotateCcw, Ban, Video } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "@/components/admin/StatusBadge";

type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  topic: string | null;
  notes: string | null;
  preferred_date: string;
  preferred_time: string;
  status: string;
  meeting_link: string | null;
  meeting_provider: string | null;
  meeting_status: string;
  cancelled_reason: string | null;
  rescheduled_from: string | null;
  completed_at: string | null;
  recording_url: string | null;
  session_notes: string | null;
  client_id: string | null;
  created_at: string;
};

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export function BookingDrawer({
  bookingId,
  onClose,
  onChanged,
}: {
  bookingId: string | null;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const [b, setB] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");
  const [providerDraft, setProviderDraft] = useState("meet");
  const [reschedDate, setReschedDate] = useState("");
  const [reschedTime, setReschedTime] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setB(null);
      return;
    }
    void load(bookingId);
  }, [bookingId]);

  async function load(id: string) {
    setLoading(true);
    const { data } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
    const row = data as Booking | null;
    setB(row);
    setLinkDraft(row?.meeting_link ?? "");
    setProviderDraft(row?.meeting_provider ?? "meet");
    setSessionNotes(row?.session_notes ?? "");
    setReschedDate(row?.preferred_date ?? "");
    setReschedTime(row?.preferred_time ?? "");
    setLoading(false);
  }

  async function patch(updates: Partial<Booking>, msg?: string) {
    if (!b) return;
    const { error } = await supabase.from("bookings").update(updates).eq("id", b.id);
    if (error) return toast.error(error.message);
    setB({ ...b, ...updates });
    if (msg) toast.success(msg);
    onChanged?.();
  }

  async function saveMeetingLink() {
    if (!linkDraft.trim()) return toast.error("Paste a link");
    await patch(
      { meeting_link: linkDraft.trim(), meeting_provider: providerDraft, status: b?.status === "pending" ? "confirmed" : b?.status },
      "Meeting link saved"
    );
  }

  async function reschedule() {
    if (!b || !reschedDate || !reschedTime) return;
    await patch(
      { preferred_date: reschedDate, preferred_time: reschedTime, rescheduled_from: b.id, status: "confirmed" },
      "Rescheduled"
    );
  }

  async function cancel() {
    await patch({ status: "cancelled", cancelled_reason: cancelReason || null, meeting_status: "cancelled" }, "Cancelled");
    setCancelReason("");
  }

  async function complete() {
    await patch(
      { status: "completed", meeting_status: "completed", completed_at: new Date().toISOString(), session_notes: sessionNotes || null },
      "Marked complete"
    );
  }

  async function del() {
    if (!b || !confirm(`Delete booking for ${b.name}?`)) return;
    const { error } = await supabase.from("bookings").delete().eq("id", b.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    onChanged?.();
    onClose();
  }

  if (!bookingId) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-lg flex-col border-l border-white/10 bg-[oklch(0.16_0.02_270)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-lg font-bold">Booking details</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading || !b ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-xl font-bold">{b.name}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <StatusBadge status={b.status} />
                  <span>· created {format(new Date(b.created_at), "PP")}</span>
                </div>
              </div>
              <button
                onClick={del}
                className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 grid gap-2 rounded-2xl border border-white/10 p-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{b.preferred_date}</span>
                <Clock className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
                <span>{b.preferred_time}</span>
              </div>
              {b.email && (
                <a href={`mailto:${b.email}`} className="flex items-center gap-2 text-primary-glow hover:underline">
                  <Mail className="h-3.5 w-3.5" /> {b.email}
                </a>
              )}
              {b.phone && (
                <a
                  href={`https://wa.me/${b.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[oklch(0.85_0.15_152)] hover:underline"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> {b.phone}
                </a>
              )}
              {b.topic && <div className="text-xs text-muted-foreground">Topic: {b.topic}</div>}
              {b.notes && (
                <div className="mt-1 rounded-lg bg-white/5 p-3 text-xs text-muted-foreground whitespace-pre-wrap">
                  {b.notes}
                </div>
              )}
            </div>

            <div className="mt-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</div>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => patch({ status: s }, `Status: ${s}`)}
                    className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
                      b.status === s
                        ? "border-primary/60 bg-primary/20 text-foreground"
                        : "border-white/10 text-muted-foreground hover:bg-white/5"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Video className="h-3 w-3" /> Meeting link
              </div>
              <div className="flex gap-2">
                <select
                  value={providerDraft}
                  onChange={(e) => setProviderDraft(e.target.value)}
                  className="glass rounded-lg px-2 py-1.5 text-xs"
                >
                  <option value="meet">Meet</option>
                  <option value="zoom">Zoom</option>
                  <option value="other">Other</option>
                </select>
                <input
                  value={linkDraft}
                  onChange={(e) => setLinkDraft(e.target.value)}
                  placeholder="https://…"
                  className="glass flex-1 rounded-lg px-3 py-1.5 text-xs"
                />
                <button
                  onClick={saveMeetingLink}
                  className="rounded-lg bg-primary/20 px-3 py-1.5 text-xs"
                >
                  Save
                </button>
              </div>
              {b.meeting_link && (
                <a
                  href={b.meeting_link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-primary-glow hover:underline"
                >
                  <Link2 className="h-3 w-3" /> Open {b.meeting_provider ?? "link"}
                </a>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <RotateCcw className="h-3 w-3" /> Reschedule
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={reschedDate}
                  onChange={(e) => setReschedDate(e.target.value)}
                  className="glass flex-1 rounded-lg px-3 py-1.5 text-xs"
                />
                <input
                  type="time"
                  value={reschedTime}
                  onChange={(e) => setReschedTime(e.target.value)}
                  className="glass rounded-lg px-3 py-1.5 text-xs"
                />
                <button onClick={reschedule} className="rounded-lg bg-primary/20 px-3 py-1.5 text-xs">
                  Update
                </button>
              </div>
            </div>

            {b.status !== "cancelled" && (
              <div className="mt-5 rounded-2xl border border-white/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Ban className="h-3 w-3" /> Cancel
                </div>
                <div className="flex gap-2">
                  <input
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Reason (optional)"
                    className="glass flex-1 rounded-lg px-3 py-1.5 text-xs"
                  />
                  <button onClick={cancel} className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs text-red-300">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {b.status !== "completed" && (
              <div className="mt-5 rounded-2xl border border-white/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Check className="h-3 w-3" /> Complete session
                </div>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Session notes…"
                  rows={3}
                  className="glass w-full rounded-lg px-3 py-2 text-xs"
                />
                <button
                  onClick={complete}
                  className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-xs font-semibold text-background shadow-glow"
                >
                  <Check className="h-3.5 w-3.5" /> Mark complete
                </button>
              </div>
            )}

            {b.completed_at && (
              <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                Completed {format(new Date(b.completed_at), "PPp")}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
