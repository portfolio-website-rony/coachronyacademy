import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageCircle, Mail, Loader2, Download, Eye } from "lucide-react";
import { useRealtime } from "@/lib/admin/use-realtime";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { LeadDrawer } from "@/components/admin/LeadDrawer";

export const Route = createFileRoute("/_admin/admin/leads")({
  head: () => ({ meta: [{ title: "Leads — Admin" }] }),
  component: LeadsPage,
});

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string;
  interest: string | null;
  status: string;
  created_at: string;
};

const STATUSES = ["new", "contacted", "booked", "converted", "closed"];

function LeadsPage() {
  const [rows, setRows] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => { void load(); }, []);
  useRealtime(["leads", "lead_notes"], () => void load());


  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) toast.error(error.message);
    else setRows((data as Lead[]) ?? []);
  }

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  function exportCsv() {
    const headers = ["Name", "Email", "Phone", "Source", "Status", "Message", "Created"];
    const csv = [
      headers.join(","),
      ...filtered.map((l) =>
        [l.name, l.email, l.phone, l.source, l.status, l.message, l.created_at]
          .map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = rows.filter((r) => {
    const matchQ =
      !q ||
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      (r.email ?? "").toLowerCase().includes(q.toLowerCase()) ||
      (r.phone ?? "").includes(q);
    const matchS = statusFilter === "all" || r.status === statusFilter;
    return matchQ && matchS;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Leads</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} leads</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            placeholder="Search name / email / phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="glass rounded-xl px-3 py-2 text-sm outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass rounded-xl px-3 py-2 text-sm outline-none"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={exportCsv} className="glass inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm">
            <Download className="h-4 w-4" /> CSV
          </button>
        </div>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="font-medium">{l.name}</div>
                      {l.message && <div className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">{l.message}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {l.email && <div>{l.email}</div>}
                      {l.phone && <div>{l.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs">{l.source}</td>
                    <td className="px-4 py-3">
                      <select
                        value={l.status}
                        onChange={(e) => setStatus(l.id, e.target.value)}
                        className="glass rounded-lg px-2 py-1 text-xs"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(l.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setActiveId(l.id)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 hover:bg-white/15"
                          title="Open"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {l.phone && (
                          <a
                            target="_blank"
                            rel="noreferrer"
                            href={`https://wa.me/${l.phone.replace(/\D/g, "")}`}
                            className="grid h-8 w-8 place-items-center rounded-lg bg-[oklch(0.72_0.18_152/20%)] text-[oklch(0.85_0.15_152)] hover:scale-110"
                            title="WhatsApp"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {l.email && (
                          <a
                            href={`mailto:${l.email}`}
                            className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary-glow hover:scale-110"
                            title="Email"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No leads found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LeadDrawer leadId={activeId} onClose={() => setActiveId(null)} onChanged={() => void load()} />
    </div>
  );
}

