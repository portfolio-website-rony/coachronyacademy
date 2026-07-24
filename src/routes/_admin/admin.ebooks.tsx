import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, Upload, Eye, EyeOff, FileText } from "lucide-react";
import { MediaUploader } from "@/components/admin/MediaUploader";

export const Route = createFileRoute("/_admin/admin/ebooks")({
  head: () => ({ meta: [{ title: "Ebooks — Admin" }] }),
  component: AdminEbooksPage,
});

type Ebook = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  file_url: string | null;
  author: string | null;
  pages: number | null;
  price: number | null;
  is_free: boolean;
  published: boolean;
  sort_order: number;
  download_count: number;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\u0980-\u09FF]+/g, "-").replace(/^-|-$/g, "");
}

function AdminEbooksPage() {
  const [items, setItems] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Ebook | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("ebooks").select("*").order("sort_order").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as Ebook[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  function newEbook() {
    setEditing({
      id: "",
      title: "",
      slug: "",
      description: "",
      cover_url: null,
      file_url: null,
      author: null,
      pages: null,
      price: 0,
      is_free: true,
      published: false,
      sort_order: 0,
      download_count: 0,
    });
  }

  async function togglePublish(e: Ebook) {
    const { error } = await supabase.from("ebooks").update({ published: !e.published }).eq("id", e.id);
    if (error) return toast.error(error.message);
    toast.success(!e.published ? "Published" : "Unpublished");
    void load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this ebook?")) return;
    const { error } = await supabase.from("ebooks").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    void load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ebooks</h1>
          <p className="text-sm text-muted-foreground">Publish PDF ebooks — students can view & download.</p>
        </div>
        <button onClick={newEbook} className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background shadow-glow">
          <Plus className="h-4 w-4" /> New Ebook
        </button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary-glow" /></div>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-muted-foreground">No ebooks yet. Click "New Ebook".</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <div key={e.id} className="glass overflow-hidden rounded-2xl">
              <div className="aspect-[3/4] w-full overflow-hidden bg-background/40">
                {e.cover_url ? (
                  <img src={e.cover_url} alt={e.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-muted-foreground"><FileText className="h-10 w-10" /></div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold line-clamp-1">{e.title}</div>
                    <div className="text-xs text-muted-foreground">{e.author ?? "—"}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${e.published ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-muted-foreground"}`}>
                    {e.published ? "Live" : "Draft"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {e.is_free ? "Free" : `৳${e.price ?? 0}`} · {e.download_count} downloads
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button onClick={() => setEditing(e)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5">Edit</button>
                  <button onClick={() => togglePublish(e)} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5">
                    {e.published ? <><EyeOff className="h-3 w-3" /> Unpublish</> : <><Eye className="h-3 w-3" /> Publish</>}
                  </button>
                  <button onClick={() => remove(e.id)} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <EbookEditor
          value={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); void load(); }}
        />
      )}
    </div>
  );
}

function EbookEditor({ value, onClose, onSaved }: { value: Ebook; onClose: () => void; onSaved: () => void }) {
  const [e, setE] = useState<Ebook>(value);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const pdfRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof Ebook>(k: K, v: Ebook[K]) {
    setE((p) => ({ ...p, [k]: v }));
  }

  async function uploadPdf(file: File) {
    if (file.type !== "application/pdf") return toast.error("Please upload a PDF file");
    if (file.size > 50 * 1024 * 1024) return toast.error("File must be under 50MB");
    setUploadingPdf(true);
    const path = `ebooks/${Date.now()}-${slugify(file.name.replace(/\.pdf$/i, ""))}.pdf`;
    const { error } = await supabase.storage.from("cms-media").upload(path, file, {
      cacheControl: "3600", upsert: false, contentType: "application/pdf",
    });
    if (error) { setUploadingPdf(false); return toast.error(error.message); }
    const { data } = supabase.storage.from("cms-media").getPublicUrl(path);
    set("file_url", data.publicUrl);
    setUploadingPdf(false);
    toast.success("PDF uploaded");
  }

  async function save() {
    if (!e.title.trim()) return toast.error("Title is required");
    const slug = e.slug.trim() || slugify(e.title);
    setSaving(true);
    const payload = {
      title: e.title.trim(),
      slug,
      description: e.description,
      cover_url: e.cover_url,
      file_url: e.file_url,
      author: e.author,
      pages: e.pages,
      price: e.is_free ? 0 : (e.price ?? 0),
      is_free: e.is_free,
      published: e.published,
      sort_order: e.sort_order,
    };
    const { error } = e.id
      ? await supabase.from("ebooks").update(payload).eq("id", e.id)
      : await supabase.from("ebooks").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur">
      <div className="glass max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{e.id ? "Edit Ebook" : "New Ebook"}</h2>
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Cover Image</label>
              <MediaUploader
                value={e.cover_url}
                mediaType="image"
                onChange={(v) => set("cover_url", v)}
                folder="ebook-covers"
                aspect="square"
                maxMb={5}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">PDF File</label>
              {e.file_url ? (
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-background/40 p-3 text-xs">
                  <FileText className="h-4 w-4 text-primary-glow" />
                  <a href={e.file_url} target="_blank" rel="noreferrer" className="flex-1 truncate text-primary-glow hover:underline">
                    View uploaded PDF
                  </a>
                  <button onClick={() => set("file_url", null)} className="text-muted-foreground hover:text-destructive">Remove</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => pdfRef.current?.click()}
                  disabled={uploadingPdf}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-background/40 px-3 py-6 text-xs text-muted-foreground hover:bg-white/5 disabled:opacity-50"
                >
                  {uploadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploadingPdf ? "Uploading..." : "Upload PDF (max 50MB)"}
                </button>
              )}
              <input
                ref={pdfRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(ev) => {
                  const f = ev.target.files?.[0];
                  if (f) void uploadPdf(f);
                  ev.target.value = "";
                }}
              />
              <input
                type="url"
                value={e.file_url ?? ""}
                onChange={(ev) => set("file_url", ev.target.value || null)}
                placeholder="…or paste PDF URL"
                className="mt-2 w-full rounded-lg border border-white/10 bg-background/40 px-2.5 py-1.5 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Field label="Title">
              <input value={e.title} onChange={(ev) => set("title", ev.target.value)} className={inp} />
            </Field>
            <Field label="Slug (URL)">
              <input value={e.slug} onChange={(ev) => set("slug", ev.target.value)} placeholder="auto from title" className={inp} />
            </Field>
            <Field label="Author">
              <input value={e.author ?? ""} onChange={(ev) => set("author", ev.target.value || null)} className={inp} />
            </Field>
            <Field label="Description">
              <textarea rows={4} value={e.description ?? ""} onChange={(ev) => set("description", ev.target.value || null)} className={inp} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pages">
                <input type="number" value={e.pages ?? ""} onChange={(ev) => set("pages", ev.target.value ? Number(ev.target.value) : null)} className={inp} />
              </Field>
              <Field label="Sort Order">
                <input type="number" value={e.sort_order} onChange={(ev) => set("sort_order", Number(ev.target.value) || 0)} className={inp} />
              </Field>
            </div>

            <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-background/40 p-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={e.is_free} onChange={(ev) => set("is_free", ev.target.checked)} />
                Free
              </label>
              {!e.is_free && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Price ৳</span>
                  <input type="number" value={e.price ?? 0} onChange={(ev) => set("price", Number(ev.target.value) || 0)} className="w-24 rounded-lg border border-white/10 bg-background/40 px-2 py-1 text-sm" />
                </div>
              )}
              <label className="ml-auto flex items-center gap-2">
                <input type="checkbox" checked={e.published} onChange={(ev) => set("published", ev.target.checked)} />
                Published
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5">Cancel</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-background shadow-glow disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const inp = "w-full rounded-lg border border-white/10 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
