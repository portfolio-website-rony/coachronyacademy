import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Check, X as XIcon, Image as ImageIcon } from "lucide-react";
import { useRealtime } from "@/lib/admin/use-realtime";

export const Route = createFileRoute("/_admin/admin/payments")({
  head: () => ({ meta: [{ title: "Payments — Admin" }] }),
  component: PaymentsPage,
});

type Payment = {
  id: string;
  amount: number;
  currency: string;
  method: string;
  transaction_id: string | null;
  status: string;
  notes: string | null;
  paid_at: string | null;
  created_at: string;
  screenshot_path: string | null;
};

const METHODS = ["bkash", "nagad", "rocket", "stripe", "sslcommerz", "cash", "other"];

function PaymentsPage() {
  const [rows, setRows] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => { void load(); }, []);
  useRealtime(["payments"], () => void load());

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
    setLoading(false);
    if (error) toast.error(error.message); else setRows((data as Payment[]) ?? []);
  }

  async function add(form: FormData) {
    const payload = {
      amount: Number(form.get("amount") || 0),
      currency: String(form.get("currency") || "BDT"),
      method: String(form.get("method") || "other"),
      transaction_id: String(form.get("txn") || "") || null,
      notes: String(form.get("notes") || "") || null,
      status: String(form.get("status") || "pending"),
      paid_at: form.get("status") === "paid" ? new Date().toISOString() : null,
    };
    const { error } = await supabase.from("payments").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Payment recorded");
    setShowForm(false);
    void load();
  }

  async function setStatus(id: string, status: "paid" | "verified" | "rejected" | "pending") {
    const patch = status === "paid" || status === "verified"
      ? { status, paid_at: new Date().toISOString() }
      : { status };
    const { error } = await supabase.from("payments").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    void load();
  }

  async function viewScreenshot(path: string) {
    const { data, error } = await supabase.storage.from("payment-screenshots").createSignedUrl(path, 3600);
    if (error) return toast.error(error.message);
    setPreviewUrl(data.signedUrl);
  }

  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("payments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) => r.filter((x) => x.id !== id));
  }

  const totalPaid = rows.filter((r) => r.status === "paid").reduce((a, b) => a + Number(b.amount), 0);
  const totalPending = rows.filter((r) => r.status === "pending").reduce((a, b) => a + Number(b.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Payments</h1>
          <p className="text-sm text-muted-foreground">
            Paid: ৳{totalPaid.toLocaleString()} • Pending: ৳{totalPending.toLocaleString()}
          </p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background shadow-glow">
          <Plus className="h-4 w-4" /> Record payment
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); void add(new FormData(e.currentTarget)); }}
          className="glass grid gap-3 rounded-2xl p-5 sm:grid-cols-2"
        >
          <input name="amount" type="number" step="0.01" placeholder="Amount *" required className="glass rounded-xl px-3 py-2 text-sm" />
          <input name="currency" defaultValue="BDT" placeholder="Currency" className="glass rounded-xl px-3 py-2 text-sm" />
          <select name="method" className="glass rounded-xl px-3 py-2 text-sm">
            {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select name="status" defaultValue="paid" className="glass rounded-xl px-3 py-2 text-sm">
            <option value="paid">paid</option>
            <option value="pending">pending</option>
            <option value="refunded">refunded</option>
          </select>
          <input name="txn" placeholder="Transaction ID" className="glass rounded-xl px-3 py-2 text-sm sm:col-span-2" />
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
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Txn</th><th className="px-4 py-3">Screenshot</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Actions</th></tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const verified = p.status === "paid" || p.status === "verified";
                  return (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-semibold">{p.currency} {Number(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs">{p.method}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.transaction_id ?? "—"}</td>
                    <td className="px-4 py-3">
                      {p.screenshot_path ? (
                        <button onClick={() => viewScreenshot(p.screenshot_path!)} className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-xs hover:bg-white/10">
                          <ImageIcon className="h-3 w-3" /> View
                        </button>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        verified ? "bg-[oklch(0.72_0.18_152/20%)] text-[oklch(0.85_0.15_152)]"
                        : p.status === "rejected" || p.status === "refunded" ? "bg-red-500/20 text-red-300"
                        : "bg-amber-500/20 text-amber-300"
                      }`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(p.paid_at ?? p.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {!verified && (
                          <button onClick={() => setStatus(p.id, "verified")} title="Verify & enroll" className="grid h-8 w-8 place-items-center rounded-lg bg-[oklch(0.72_0.18_152/20%)] text-[oklch(0.85_0.15_152)]"><Check className="h-3.5 w-3.5" /></button>
                        )}
                        {p.status !== "rejected" && (
                          <button onClick={() => setStatus(p.id, "rejected")} title="Reject" className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/15 text-amber-300"><XIcon className="h-3.5 w-3.5" /></button>
                        )}
                        <button onClick={() => remove(p.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/15 text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
                {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No payments yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
