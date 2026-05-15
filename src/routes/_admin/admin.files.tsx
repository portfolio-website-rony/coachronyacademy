import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Download, Trash2, Upload, FileIcon, ImageIcon } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/files")({
  head: () => ({ meta: [{ title: "Files — Admin" }] }),
  component: FilesPage,
});

const BUCKETS = [
  { id: "cms-media", label: "CMS Media", canUpload: true, isPublic: true },
  { id: "payment-screenshots", label: "Payment Screenshots", canUpload: false, isPublic: false },
] as const;

type FileRow = {
  name: string;
  id: string | null;
  updated_at: string | null;
  created_at: string | null;
  size: number;
  contentType?: string;
};

function FilesPage() {
  const [bucket, setBucket] = useState<typeof BUCKETS[number]>(BUCKETS[0]);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { void load(); }, [bucket.id]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.storage.from(bucket.id).list("", {
      limit: 500, sortBy: { column: "created_at", order: "desc" },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setFiles(
      (data ?? [])
        .filter((f) => f.name && f.name !== ".emptyFolderPlaceholder")
        .map((f) => ({
          name: f.name,
          id: f.id ?? null,
          updated_at: f.updated_at ?? null,
          created_at: f.created_at ?? null,
          size: (f.metadata as any)?.size ?? 0,
          contentType: (f.metadata as any)?.mimetype,
        })),
    );
  }

  async function getUrl(name: string) {
    if (bucket.isPublic) {
      const { data } = supabase.storage.from(bucket.id).getPublicUrl(name);
      return data.publicUrl;
    }
    const { data, error } = await supabase.storage.from(bucket.id).createSignedUrl(name, 3600);
    if (error) { toast.error(error.message); return null; }
    return data.signedUrl;
  }

  async function preview(name: string) {
    const url = await getUrl(name);
    if (url) setPreviewUrl(url);
  }

  async function download(name: string) {
    const url = await getUrl(name);
    if (url) window.open(url, "_blank");
  }

  async function remove(name: string) {
    if (!confirm(`Delete ${name}?`)) return;
    const { error } = await supabase.storage.from(bucket.id).remove([name]);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    setFiles((f) => f.filter((x) => x.name !== name));
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket.id).upload(path, file);
    setUploading(false);
    if (error) return toast.error(error.message);
    toast.success("Uploaded");
    e.target.value = "";
    void load();
  }

  function isImage(name: string, ct?: string) {
    if (ct?.startsWith("image/")) return true;
    return /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(name);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Files & Storage</h1>
          <p className="text-sm text-muted-foreground">Browse, preview, download or delete uploaded files.</p>
        </div>
        {bucket.canUpload && (
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background shadow-glow">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
            <input type="file" className="hidden" onChange={upload} disabled={uploading} />
          </label>
        )}
      </div>

      <div className="flex gap-2">
        {BUCKETS.map((b) => (
          <button key={b.id} onClick={() => setBucket(b)} className={`rounded-xl px-4 py-2 text-sm font-medium transition ${bucket.id === b.id ? "bg-gradient-primary text-background shadow-glow" : "glass text-muted-foreground hover:text-foreground"}`}>
            {b.label}
          </button>
        ))}
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        {loading ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : files.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">No files in this bucket.</div>
        ) : (
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {files.map((f) => (
              <div key={f.name} className="glass group rounded-xl p-3">
                <button onClick={() => preview(f.name)} className="block aspect-video w-full overflow-hidden rounded-lg bg-white/5">
                  {isImage(f.name, f.contentType) ? (
                    <FileThumb bucket={bucket} name={f.name} isPublic={bucket.isPublic} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center"><FileIcon className="h-8 w-8 text-muted-foreground" /></div>
                  )}
                </button>
                <div className="mt-2 truncate text-xs font-medium" title={f.name}>{f.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {(f.size / 1024).toFixed(1)} KB • {f.created_at ? new Date(f.created_at).toLocaleDateString() : "—"}
                </div>
                <div className="mt-2 flex gap-1">
                  <button onClick={() => download(f.name)} className="grid h-7 w-7 place-items-center rounded-md bg-white/5 hover:bg-white/10"><Download className="h-3 w-3" /></button>
                  <button onClick={() => remove(f.name)} className="grid h-7 w-7 place-items-center rounded-md bg-red-500/15 text-red-300 hover:bg-red-500/25"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {previewUrl && (
        <div onClick={() => setPreviewUrl(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div onClick={(e) => e.stopPropagation()} className="glass max-h-[90vh] max-w-4xl overflow-auto rounded-2xl p-3">
            {/\.(png|jpe?g|gif|webp|svg|avif)$/i.test(previewUrl.split("?")[0]) ? (
              <img src={previewUrl} alt="" className="max-h-[80vh] rounded-xl" />
            ) : (
              <iframe src={previewUrl} className="h-[80vh] w-[80vw] rounded-xl bg-white" />
            )}
            <div className="mt-3 flex justify-end gap-2">
              <a href={previewUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-white/10 px-3 py-1.5 text-xs">Open</a>
              <button onClick={() => setPreviewUrl(null)} className="rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-background">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FileThumb({ bucket, name, isPublic }: { bucket: typeof BUCKETS[number]; name: string; isPublic: boolean }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    (async () => {
      if (isPublic) {
        const { data } = supabase.storage.from(bucket.id).getPublicUrl(name);
        if (active) setSrc(data.publicUrl);
      } else {
        const { data } = await supabase.storage.from(bucket.id).createSignedUrl(name, 3600);
        if (active && data) setSrc(data.signedUrl);
      }
    })();
    return () => { active = false; };
  }, [bucket.id, name, isPublic]);
  if (!src) return <div className="flex h-full items-center justify-center"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>;
  return <img src={src} alt={name} className="h-full w-full object-cover" />;
}
