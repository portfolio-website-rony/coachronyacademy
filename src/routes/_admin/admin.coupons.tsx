import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Pencil, Copy, Ticket, Search, Power } from "lucide-react";
import { useRealtime } from "@/lib/admin/use-realtime";

export const Route = createFileRoute("/_admin/admin/coupons")({
  head: () => ({ meta: [{ title: "Coupons — Admin" }] }),
  component: CouponsPage,
});

type Coupon = {
  id: string;
  code: string;
  kind: string; // 'percent' | 'flat'
  value: number;
  course_id: string | null;
  active: boolean;
  expires_at: string | null;
  max_uses: number | null;
  used_count: number;
  created_at: string;
};

type CourseLite = { id: string; title: string };

const CODE_RE = /^[A-Z0-9_-]{3,40}$/;

function emptyForm() {
  return {
    id: "" as string | "",
    code: "",
    kind: "percent" as "percent" | "fixed",
    value: "" as string,
    course_id: "" as string,
    expires_at: "" as string, // datetime-local
    max_uses: "" as string,
    active: true,
  };
}

function CouponsPage() {
  const [rows, setRows] = useState<Coupon[]>([]);
  const [courses, setCourses] = useState<CourseLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void load();
    void loadCourses();
  }, []);
  useRealtime(["coupons"], () => void load());

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) return toast.error(error.message);
    setRows((data as Coupon[]) ?? []);
  }

  async function loadCourses() {
    const { data } = await supabase.from("courses").select("id,title").order("title");
    setCourses((data as CourseLite[]) ?? []);
  }

  function startCreate() {
    setForm(emptyForm());
    setShowForm(true);
  }

  function startEdit(c: Coupon) {
    setForm({
      id: c.id,
      code: c.code,
      kind: (c.kind as "percent" | "fixed") ?? "percent",
      value: String(c.value ?? ""),
      course_id: c.course_id ?? "",
      expires_at: c.expires_at ? toLocalInput(c.expires_at) : "",
      max_uses: c.max_uses != null ? String(c.max_uses) : "",
      active: c.active,
    });
    setShowForm(true);
  }

  function toLocalInput(iso: string) {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const code = form.code.trim().toUpperCase();
    if (!CODE_RE.test(code)) {
      return toast.error("Code: 3–40 chars, A–Z, 0–9, _ or - only");
    }
    const value = Number(form.value);
    if (!Number.isFinite(value) || value <= 0) return toast.error("Value must be positive");
    if (form.kind === "percent" && value > 100) return toast.error("Percent ≤ 100");

    const expiresAt = form.expires_at ? new Date(form.expires_at) : null;
    if (expiresAt && expiresAt.getTime() < Date.now()) {
      return toast.error("Expiry must be in the future");
    }
    const maxUses = form.max_uses ? Number(form.max_uses) : null;
    if (maxUses != null && (!Number.isInteger(maxUses) || maxUses <= 0)) {
      return toast.error("Max uses must be a positive integer");
    }

    const payload = {
      code,
      kind: form.kind,
      value,
      course_id: form.course_id || null,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
      max_uses: maxUses,
      active: form.active,
    };

    setSaving(true);
    const res = form.id
      ? await supabase.from("coupons").update(payload).eq("id", form.id)
      : await supabase.from("coupons").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success(form.id ? "Coupon updated" : "Coupon created");
    setShowForm(false);
    setForm(emptyForm());
    void load();
  }

  async function toggleActive(c: Coupon) {
    const { error } = await supabase.from("coupons").update({ active: !c.active }).eq("id", c.id);
    if (error) return toast.error(error.message);
    void load();
  }

  async function remove(c: Coupon) {
    if (!confirm(`Delete coupon "${c.code}"?`)) return;
    const { error } = await supabase.from("coupons").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    setRows((r) => r.filter((x) => x.id !== c.id));
  }

  async function copy(code: string) {
    await navigator.clipboard.writeText(code);
    toast.success(`Copied ${code}`);
  }

  const courseMap = useMemo(() => {
    const m = new Map<string, string>();
    courses.forEach((c) => m.set(c.id, c.title));
    return m;
  }, [courses]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => r.code.toLowerCase().includes(term));
  }, [rows, q]);

  function statusOf(c: Coupon): { label: string; cls: string } {
    if (!c.active) return { label: "Inactive", cls: "bg-white/10 text-muted-foreground" };
    if (c.expires_at && new Date(c.expires_at).getTime() < Date.now())
      return { label: "Expired", cls: "bg-red-500/20 text-red-300" };
    if (c.max_uses != null && c.used_count >= c.max_uses)
      return { label: "Exhausted", cls: "bg-amber-500/20 text-amber-300" };
    return {
      label: "Active",
      cls: "bg-[oklch(0.72_0.18_152/20%)] text-[oklch(0.85_0.15_152)]",
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Coupons</h1>
          <p className="text-sm text-muted-foreground">
            Create discount codes, set validity & usage limits. Verified payments
            auto‑increment usage.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background shadow-glow"
        >
          <Plus className="h-4 w-4" /> New coupon
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={save}
          className="glass grid gap-3 rounded-2xl p-5 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
              Code *
            </label>
            <input
              value={form.code}
              onChange={(e) =>
                setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
              }
              placeholder="WELCOME20"
              required
              className="glass w-full rounded-xl px-3 py-2 text-sm uppercase tracking-wider"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              3–40 chars · A–Z · 0–9 · _ · -
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
              Discount type *
            </label>
            <select
              value={form.kind}
              onChange={(e) =>
                setForm((f) => ({ ...f, kind: e.target.value as "percent" | "fixed" }))
              }
              className="glass w-full rounded-xl px-3 py-2 text-sm"
            >
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed amount (BDT)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
              Value *
            </label>
            <input
              type="number"
              min={1}
              step="0.01"
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              placeholder={form.kind === "percent" ? "20" : "500"}
              required
              className="glass w-full rounded-xl px-3 py-2 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
              Applies to
            </label>
            <select
              value={form.course_id}
              onChange={(e) => setForm((f) => ({ ...f, course_id: e.target.value }))}
              className="glass w-full rounded-xl px-3 py-2 text-sm"
            >
              <option value="">All courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
              Expires at (optional)
            </label>
            <input
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
              className="glass w-full rounded-xl px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
              Max uses (optional)
            </label>
            <input
              type="number"
              min={1}
              step="1"
              value={form.max_uses}
              onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
              placeholder="Unlimited"
              className="glass w-full rounded-xl px-3 py-2 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="h-4 w-4"
            />
            <span className="text-sm">Active</span>
          </label>

          <div className="flex gap-2 sm:col-span-2">
            <button
              disabled={saving}
              className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background disabled:opacity-50"
            >
              {saving ? "Saving…" : form.id ? "Update coupon" : "Create coupon"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm());
              }}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="glass overflow-hidden rounded-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 p-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by code…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
            <Ticket className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {rows.length === 0 ? "No coupons yet. Create your first one." : "No matches."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Used</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const st = statusOf(c);
                  return (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold tracking-wider">{c.code}</span>
                          <button
                            onClick={() => copy(c.code)}
                            title="Copy code"
                            className="grid h-6 w-6 place-items-center rounded-md bg-white/5 hover:bg-white/10"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {c.kind === "percent"
                          ? `${Number(c.value)}%`
                          : `৳${Number(c.value).toLocaleString()}`}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {c.course_id ? (courseMap.get(c.course_id) ?? "—") : "All courses"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {c.used_count}
                        {c.max_uses != null ? ` / ${c.max_uses}` : ""}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {c.expires_at ? new Date(c.expires_at).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => toggleActive(c)}
                            title={c.active ? "Deactivate" : "Activate"}
                            className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 hover:bg-white/10"
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => startEdit(c)}
                            title="Edit"
                            className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 hover:bg-white/10"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => remove(c)}
                            title="Delete"
                            className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/15 text-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
