import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { MediaUploader } from "@/components/admin/MediaUploader";

export const Route = createFileRoute("/_admin/admin/cms")({
  head: () => ({ meta: [{ title: "CMS — Admin" }] }),
  component: CmsPage,
});

const TABS = [
  { key: "blog", label: "Blog", table: "cms_blog_posts" },
  { key: "testimonials", label: "Testimonials", table: "cms_testimonials" },
  { key: "portfolio", label: "Portfolio", table: "cms_portfolio" },
  { key: "services", label: "Services", table: "cms_services" },
  { key: "programs", label: "Programs", table: "cms_programs" },
  { key: "banners", label: "Page Banners", table: "cms_page_banners" },
] as const;

type Row = Record<string, unknown> & { id?: string; page?: string };

function CmsPage() {
  const [tab, setTab] = useState<typeof TABS[number]>(TABS[0]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Portfolio form state
  const [pfEditId, setPfEditId] = useState<string | null>(null);
  const [pfEdit, setPfEdit] = useState<Row | null>(null);
  const [pfCover, setPfCover] = useState<string | null>(null);
  const [pfMediaType, setPfMediaType] = useState<"image" | "video">("image");
  const [pfMediaUrl, setPfMediaUrl] = useState<string | null>(null);

  function resetPortfolioForm() {
    setPfEditId(null); setPfEdit(null);
    setPfCover(null); setPfMediaUrl(null); setPfMediaType("image");
  }

  function loadPortfolioForEdit(r: Row) {
    setPfEditId(String(r.id));
    setPfEdit(r);
    setPfCover((r.cover_url as string) ?? null);
    setPfMediaType(((r.media_type as "image" | "video") ?? "image"));
    setPfMediaUrl((r.media_url as string) ?? null);
    setShowForm(true);
  }

  // Banner form state
  const [bnPage, setBnPage] = useState("portfolio");
  const [bnTitle, setBnTitle] = useState("");
  const [bnSubtitle, setBnSubtitle] = useState("");
  const [bnMediaType, setBnMediaType] = useState<"image" | "video">("image");
  const [bnMediaUrl, setBnMediaUrl] = useState<string | null>(null);

  useEffect(() => { void load(); setShowForm(false); }, [tab]);

  async function load() {
    setLoading(true);
    const orderCol = tab.key === "banners" ? "page" : "created_at";
    const { data, error } = await supabase.from(tab.table).select("*").order(orderCol, { ascending: tab.key === "banners" });
    setLoading(false);
    if (error) toast.error(error.message); else setRows((data as Row[]) ?? []);
  }

  async function remove(id: string, key?: string) {
    if (!confirm("Delete?")) return;
    let error;
    if (tab.key === "banners") {
      ({ error } = await supabase.from("cms_page_banners").delete().eq("page", key ?? ""));
    } else {
      ({ error } = await supabase.from(tab.table).delete().eq("id" as never, id as never));
    }
    if (error) return toast.error(error.message);
    void load();
  }

  async function togglePublished(row: Row) {
    if (tab.key === "banners") return;
    const { error } = await supabase.from(tab.table).update({ published: !row.published } as never).eq("id" as never, (row.id ?? "") as never);
    if (error) return toast.error(error.message);
    void load();
  }

  function loadBannerForEdit(p: string) {
    const r = rows.find((x) => x.page === p);
    setBnPage(p);
    setBnTitle((r?.title as string) ?? "");
    setBnSubtitle((r?.subtitle as string) ?? "");
    setBnMediaType(((r?.media_type as "image" | "video") ?? "image"));
    setBnMediaUrl((r?.media_url as string) ?? null);
    setShowForm(true);
  }

  async function submit(form: FormData) {
    let payload: Record<string, unknown> = {};
    let result;
    if (tab.key === "blog") {
      payload = {
        title: String(form.get("title") || ""),
        slug: String(form.get("slug") || "").toLowerCase().replace(/\s+/g, "-"),
        excerpt: String(form.get("excerpt") || ""),
        content: String(form.get("content") || ""),
        cover_url: String(form.get("cover_url") || "") || null,
        published: form.get("published") === "on",
      };
      result = await supabase.from(tab.table).insert(payload as never);
    } else if (tab.key === "testimonials") {
      payload = {
        author: String(form.get("author") || ""),
        role: String(form.get("role") || "") || null,
        quote: String(form.get("quote") || ""),
        avatar_url: String(form.get("avatar_url") || "") || null,
        rating: Number(form.get("rating") || 5),
        published: form.get("published") === "on",
      };
      result = await supabase.from(tab.table).insert(payload as never);
    } else if (tab.key === "portfolio") {
      payload = {
        title: String(form.get("title") || ""),
        category: String(form.get("category") || "") || null,
        description: String(form.get("description") || "") || null,
        cover_url: pfCover,
        media_type: pfMediaType,
        media_url: pfMediaUrl,
        link: String(form.get("link") || "") || null,
        display_order: Number(form.get("display_order") || 0),
        published: form.get("published") === "on",
      };
      result = pfEditId
        ? await supabase.from("cms_portfolio").update(payload as never).eq("id", pfEditId)
        : await supabase.from("cms_portfolio").insert(payload as never);
    } else if (tab.key === "services") {
      payload = {
        title: String(form.get("title") || ""),
        description: String(form.get("description") || "") || null,
        icon: String(form.get("icon") || "") || null,
        published: form.get("published") === "on",
      };
      result = await supabase.from(tab.table).insert(payload as never);
    } else if (tab.key === "programs") {
      payload = {
        title: String(form.get("title") || ""),
        description: String(form.get("description") || "") || null,
        price: String(form.get("price") || "") || null,
        features: String(form.get("features") || "").split(",").map((s) => s.trim()).filter(Boolean),
        published: form.get("published") === "on",
      };
      result = await supabase.from(tab.table).insert(payload as never);
    } else if (tab.key === "banners") {
      payload = {
        page: bnPage.trim().toLowerCase(),
        title: bnTitle || null,
        subtitle: bnSubtitle || null,
        media_type: bnMediaType,
        media_url: bnMediaUrl,
      };
      result = await supabase.from(tab.table).upsert(payload as never, { onConflict: "page" });
    }
    if (result?.error) return toast.error(result.error.message);
    toast.success("Saved");
    setShowForm(false);
    resetPortfolioForm();
    void load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Content Management</h1>
        <p className="text-sm text-muted-foreground">Edit your website content here.</p>
      </div>

      <div className="glass flex flex-wrap gap-1 rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t); setShowForm(false); }}
            className={`rounded-lg px-4 py-1.5 text-sm ${tab.key === t.key ? "bg-gradient-primary text-background font-semibold" : "text-muted-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            if (showForm) { resetPortfolioForm(); setShowForm(false); }
            else { resetPortfolioForm(); setShowForm(true); }
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background shadow-glow"
        >
          <Plus className="h-4 w-4" /> {tab.key === "banners" ? "Set / Update Banner" : `New ${tab.label.slice(0, -1)}`}
        </button>
      </div>

      {showForm && (
        <form key={pfEditId ?? "new"} onSubmit={(e) => { e.preventDefault(); void submit(new FormData(e.currentTarget)); }} className="glass grid gap-3 rounded-2xl p-5">
          {tab.key === "portfolio" && pfEditId && (
            <div className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary-glow">
              Editing: <strong>{String(pfEdit?.title ?? "")}</strong>
            </div>
          )}
          {tab.key === "blog" && (<>
            <input name="title" placeholder="Title *" required className="glass rounded-xl px-3 py-2 text-sm" />
            <input name="slug" placeholder="slug-url *" required className="glass rounded-xl px-3 py-2 text-sm" />
            <input name="excerpt" placeholder="Excerpt" className="glass rounded-xl px-3 py-2 text-sm" />
            <input name="cover_url" placeholder="Cover image URL" className="glass rounded-xl px-3 py-2 text-sm" />
            <textarea name="content" placeholder="Content (markdown)" rows={6} className="glass rounded-xl px-3 py-2 text-sm" />
          </>)}
          {tab.key === "testimonials" && (<>
            <input name="author" placeholder="Author *" required className="glass rounded-xl px-3 py-2 text-sm" />
            <input name="role" placeholder="Role / title" className="glass rounded-xl px-3 py-2 text-sm" />
            <textarea name="quote" placeholder="Quote *" required rows={3} className="glass rounded-xl px-3 py-2 text-sm" />
            <input name="avatar_url" placeholder="Avatar URL" className="glass rounded-xl px-3 py-2 text-sm" />
            <input name="rating" type="number" min={1} max={5} defaultValue={5} className="glass rounded-xl px-3 py-2 text-sm" />
          </>)}
          {tab.key === "portfolio" && (<>
            <input name="title" placeholder="Title *" required className="glass rounded-xl px-3 py-2 text-sm" />
            <input name="category" placeholder="Category (e.g. Landing Page, AI Video)" className="glass rounded-xl px-3 py-2 text-sm" />
            <textarea name="description" placeholder="Description" rows={3} className="glass rounded-xl px-3 py-2 text-sm" />
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Cover image (thumbnail)</label>
              <ImageUploader value={pfCover} onChange={setPfCover} folder="portfolio" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Project media (optional — image or video)</label>
              <div className="mb-2 flex gap-2">
                <button type="button" onClick={() => setPfMediaType("image")} className={`rounded-lg px-3 py-1 text-xs ${pfMediaType === "image" ? "bg-gradient-primary text-background" : "glass"}`}>Image</button>
                <button type="button" onClick={() => setPfMediaType("video")} className={`rounded-lg px-3 py-1 text-xs ${pfMediaType === "video" ? "bg-gradient-primary text-background" : "glass"}`}>Video</button>
              </div>
              <MediaUploader value={pfMediaUrl} mediaType={pfMediaType} onChange={setPfMediaUrl} folder="portfolio" />
            </div>
            <input name="link" placeholder="External link (optional)" className="glass rounded-xl px-3 py-2 text-sm" />
            <input name="display_order" type="number" defaultValue={0} placeholder="Display order" className="glass rounded-xl px-3 py-2 text-sm" />
          </>)}
          {tab.key === "services" && (<>
            <input name="title" placeholder="Title *" required className="glass rounded-xl px-3 py-2 text-sm" />
            <textarea name="description" placeholder="Description" rows={3} className="glass rounded-xl px-3 py-2 text-sm" />
            <input name="icon" placeholder="Icon name (lucide)" className="glass rounded-xl px-3 py-2 text-sm" />
          </>)}
          {tab.key === "programs" && (<>
            <input name="title" placeholder="Title *" required className="glass rounded-xl px-3 py-2 text-sm" />
            <textarea name="description" placeholder="Description" rows={3} className="glass rounded-xl px-3 py-2 text-sm" />
            <input name="price" placeholder="Price" className="glass rounded-xl px-3 py-2 text-sm" />
            <input name="features" placeholder="Features (comma separated)" className="glass rounded-xl px-3 py-2 text-sm" />
          </>)}
          {tab.key === "banners" && (<>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Page</label>
              <select value={bnPage} onChange={(e) => setBnPage(e.target.value)} className="glass w-full rounded-xl px-3 py-2 text-sm">
                <option value="portfolio">Portfolio</option>
                <option value="services">Services</option>
                <option value="about">About</option>
                <option value="blog">Blog</option>
                <option value="programs">Programs</option>
                <option value="contact">Contact</option>
              </select>
            </div>
            <input value={bnTitle} onChange={(e) => setBnTitle(e.target.value)} placeholder="Banner title (optional)" className="glass rounded-xl px-3 py-2 text-sm" />
            <input value={bnSubtitle} onChange={(e) => setBnSubtitle(e.target.value)} placeholder="Banner subtitle (optional)" className="glass rounded-xl px-3 py-2 text-sm" />
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Banner media</label>
              <div className="mb-2 flex gap-2">
                <button type="button" onClick={() => setBnMediaType("image")} className={`rounded-lg px-3 py-1 text-xs ${bnMediaType === "image" ? "bg-gradient-primary text-background" : "glass"}`}>Image</button>
                <button type="button" onClick={() => setBnMediaType("video")} className={`rounded-lg px-3 py-1 text-xs ${bnMediaType === "video" ? "bg-gradient-primary text-background" : "glass"}`}>Video</button>
              </div>
              <MediaUploader value={bnMediaUrl} mediaType={bnMediaType} onChange={setBnMediaUrl} folder="banners" />
            </div>
          </>)}
          {tab.key !== "banners" && (
            <label className="flex items-center gap-2 text-sm">
              <input name="published" type="checkbox" defaultChecked /> Published
            </label>
          )}
          <div><button className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background">Save</button></div>
        </form>
      )}

      <div className="glass overflow-hidden rounded-2xl">
        {loading ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No items yet.</div>
        ) : (
          <ul className="divide-y divide-white/5">
            {rows.map((r) => (
              <li key={String(r.id ?? r.page)} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{String(r.title ?? r.author ?? r.page ?? r.id)}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {tab.key === "banners"
                      ? `${String(r.media_type ?? "image")} · ${String(r.subtitle ?? r.media_url ?? "")}`
                      : String(r.excerpt ?? r.quote ?? r.description ?? r.category ?? "")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {tab.key === "banners" ? (
                    <button onClick={() => loadBannerForEdit(String(r.page))} className="rounded-lg bg-white/10 px-2 py-1 text-xs">Edit</button>
                  ) : (
                    <button onClick={() => togglePublished(r)} className={`rounded-lg px-2 py-1 text-xs ${r.published ? "bg-[oklch(0.72_0.18_152/20%)] text-[oklch(0.85_0.15_152)]" : "bg-white/10"}`}>
                      {r.published ? "published" : "draft"}
                    </button>
                  )}
                  <button onClick={() => remove(String(r.id ?? ""), r.page as string | undefined)} className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/15 text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
