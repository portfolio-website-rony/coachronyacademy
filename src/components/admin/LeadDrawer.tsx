import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, MessageCircle, Mail, Loader2, UserPlus, Trash2, Tag, Send } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { StatusBadge } from "@/components/admin/StatusBadge";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string;
  interest: string | null;
  status: string;
  tags: string[] | null;
  client_id: string | null;
  created_at: string;
};

type Note = {
  id: string;
  note: string;
  created_at: string;
  created_by: string | null;
};

const STATUSES = ["new", "contacted", "booked", "converted", "closed"];

export function LeadDrawer({
  leadId,
  onClose,
  onChanged,
}: {
  leadId: string | null;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [tagDraft, setTagDraft] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!leadId) {
      setLead(null);
      setNotes([]);
      return;
    }
    void load(leadId);
  }, [leadId]);

  async function load(id: string) {
    setLoading(true);
    const [{ data: l }, { data: n }] = await Promise.all([
      supabase.from("leads").select("*").eq("id", id).maybeSingle(),
      supabase.from("lead_notes").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
    ]);
    setLead((l as Lead) ?? null);
    setNotes((n as Note[]) ?? []);
    setLoading(false);
  }

  async function setStatus(status: string) {
    if (!lead) return;
    const { error } = await supabase.from("leads").update({ status }).eq("id", lead.id);
    if (error) return toast.error(error.message);
    setLead({ ...lead, status });
    toast.success(`Status: ${status}`);
    onChanged?.();
  }

  async function addNote() {
    if (!lead || !noteDraft.trim()) return;
    setPosting(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error, data } = await supabase
      .from("lead_notes")
      .insert({ lead_id: lead.id, note: noteDraft.trim(), created_by: auth.user?.id ?? null })
      .select()
      .single();
    setPosting(false);
    if (error) return toast.error(error.message);
    setNotes((p) => [data as Note, ...p]);
    setNoteDraft("");
  }

  async function deleteNote(id: string) {
    const { error } = await supabase.from("lead_notes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setNotes((p) => p.filter((n) => n.id !== id));
  }

  async function addTag() {
    if (!lead || !tagDraft.trim()) return;
    const tags = Array.from(new Set([...(lead.tags ?? []), tagDraft.trim()]));
    const { error } = await supabase.from("leads").update({ tags }).eq("id", lead.id);
    if (error) return toast.error(error.message);
    setLead({ ...lead, tags });
    setTagDraft("");
  }

  async function removeTag(t: string) {
    if (!lead) return;
    const tags = (lead.tags ?? []).filter((x) => x !== t);
    const { error } = await supabase.from("leads").update({ tags }).eq("id", lead.id);
    if (error) return toast.error(error.message);
    setLead({ ...lead, tags });
  }

  async function convertToClient() {
    if (!lead) return;
    if (lead.client_id) {
      toast.info("Already linked to a client");
      return;
    }
    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        notes: lead.message,
      })
      .select()
      .single();
    if (error || !client) return toast.error(error?.message ?? "Failed");
    await supabase.from("leads").update({ client_id: client.id, status: "converted" }).eq("id", lead.id);
    toast.success("Converted to client");
    setLead({ ...lead, client_id: client.id, status: "converted" });
    onChanged?.();
  }

  async function deleteLead() {
    if (!lead) return;
    if (!confirm(`Delete lead "${lead.name}"?`)) return;
    const { error } = await supabase.from("leads").delete().eq("id", lead.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    onChanged?.();
    onClose();
  }

  if (!leadId) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-lg flex-col border-l border-white/10 bg-[oklch(0.16_0.02_270)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-lg font-bold">Lead details</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading || !lead ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-xl font-bold">{lead.name}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <StatusBadge status={lead.status} />
                  <span>· source: {lead.source}</span>
                  <span>· {format(new Date(lead.created_at), "PP")}</span>
                </div>
              </div>
              <button
                onClick={deleteLead}
                className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 grid gap-2 rounded-2xl border border-white/10 p-4 text-sm">
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-primary-glow hover:underline">
                  <Mail className="h-3.5 w-3.5" /> {lead.email}
                </a>
              )}
              {lead.phone && (
                <a
                  href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[oklch(0.85_0.15_152)] hover:underline"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> {lead.phone}
                </a>
              )}
              {lead.interest && <div className="text-xs text-muted-foreground">Interest: {lead.interest}</div>}
              {lead.message && (
                <div className="mt-1 rounded-lg bg-white/5 p-3 text-xs text-muted-foreground whitespace-pre-wrap">
                  {lead.message}
                </div>
              )}
            </div>

            <div className="mt-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status pipeline</div>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
                      lead.status === s
                        ? "border-primary/60 bg-primary/20 text-foreground"
                        : "border-white/10 text-muted-foreground hover:bg-white/5"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Tag className="h-3 w-3" /> Tags
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {(lead.tags ?? []).map((t) => (
                  <button
                    key={t}
                    onClick={() => removeTag(t)}
                    className="group inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs"
                    title="Click to remove"
                  >
                    {t}
                    <X className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                  </button>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void addTag();
                  }}
                  className="flex"
                >
                  <input
                    value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    placeholder="+ add tag"
                    className="glass w-28 rounded-full px-3 py-0.5 text-xs"
                  />
                </form>
              </div>
            </div>

            {!lead.client_id && (
              <button
                onClick={convertToClient}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background shadow-glow"
              >
                <UserPlus className="h-4 w-4" /> Convert to client
              </button>
            )}
            {lead.client_id && (
              <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                Linked to client
              </div>
            )}

            <div className="mt-6">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes & timeline</div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void addNote();
                }}
                className="flex gap-2"
              >
                <input
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Write a note…"
                  className="glass flex-1 rounded-xl px-3 py-2 text-sm"
                />
                <button
                  disabled={posting || !noteDraft.trim()}
                  className="inline-flex items-center gap-1 rounded-xl bg-primary/20 px-3 py-2 text-xs disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
              <ul className="mt-3 space-y-2">
                {notes.map((n) => (
                  <li key={n.id} className="group rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">
                    <div className="whitespace-pre-wrap">{n.note}</div>
                    <div className="mt-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span>{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
                      <button
                        onClick={() => deleteNote(n.id)}
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3 text-red-300" />
                      </button>
                    </div>
                  </li>
                ))}
                {notes.length === 0 && (
                  <li className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-muted-foreground">
                    No notes yet.
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
