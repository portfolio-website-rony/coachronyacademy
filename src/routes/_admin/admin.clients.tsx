import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, MessageCircle, Mail, Trash2 } from "lucide-react";
import { useRealtime } from "@/lib/admin/use-realtime";

export const Route = createFileRoute("/_admin/admin/clients")({
  head: () => ({ meta: [{ title: "Clients — Admin" }] }),
  component: ClientsPage,
});

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  country: string | null;
  status: string;
  source: string | null;
  notes: string | null;
  created_at: string;
};

function ClientsPage() {
  const [rows, setRows] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { void load(); }, []);
  useRealtime(["clients"], () => void load());

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setLoading(false);
    if (error) toast.error(error.message); else setRows((data as Client[]) ?? []);
  }

  async function add(form: FormData) {
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || "") || null,
      phone: String(form.get("phone") || "") || null,
      whatsapp: String(form.get("whatsapp") || "") || null,
      country: String(form.get("country") || "") || null,
      source: String(form.get("source") || "") || null,
      notes: String(form.get("notes") || "") || null,
    };
    if (!payload.name) return toast.error("Name required");
    const { error } = await supabase.from("clients").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Client added");
    setShowForm(false);
    void load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this client?")) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) => r.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Clients</h1>
          <p className="text-sm text-muted-foreground">{rows.length} clients</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background shadow-glow">
          <Plus className="h-4 w-4" /> Add client
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); void add(new FormData(e.currentTarget)); }}
          className="glass grid gap-3 rounded-2xl p-5 sm:grid-cols-2"
        >
          <input name="name" placeholder="Name *" required className="glass rounded-xl px-3 py-2 text-sm" />
          <input name="email" type="email" placeholder="Email" className="glass rounded-xl px-3 py-2 text-sm" />
          <input name="phone" placeholder="Phone" className="glass rounded-xl px-3 py-2 text-sm" />
          <input name="whatsapp" placeholder="WhatsApp" className="glass rounded-xl px-3 py-2 text-sm" />
          <input name="country" placeholder="Country" className="glass rounded-xl px-3 py-2 text-sm" />
          <input name="source" placeholder="Source" className="glass rounded-xl px-3 py-2 text-sm" />
          <textarea name="notes" placeholder="Notes" rows={2} className="glass rounded-xl px-3 py-2 text-sm sm:col-span-2" />
          <div className="sm:col-span-2">
            <button className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background">Save</button>
          </div>
        </form>
      )}

      <div className="glass overflow-hidden rounded-2xl">
        {loading ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Country</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {c.email && <div>{c.email}</div>}
                      {c.phone && <div>{c.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs">{c.country ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">{c.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {(c.whatsapp || c.phone) && (
                          <a target="_blank" rel="noreferrer" href={`https://wa.me/${(c.whatsapp || c.phone)!.replace(/\D/g, "")}`} className="grid h-8 w-8 place-items-center rounded-lg bg-[oklch(0.72_0.18_152/20%)] text-[oklch(0.85_0.15_152)]"><MessageCircle className="h-3.5 w-3.5" /></a>
                        )}
                        {c.email && <a href={`mailto:${c.email}`} className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary-glow"><Mail className="h-3.5 w-3.5" /></a>}
                        <button onClick={() => remove(c.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/15 text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">No clients yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
