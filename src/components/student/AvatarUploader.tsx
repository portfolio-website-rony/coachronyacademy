import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function AvatarUploader({
  userId,
  currentUrl,
  displayName,
  onChange,
}: {
  userId: string;
  currentUrl: string | null;
  displayName: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return toast.error("Max 3MB");
    if (!file.type.startsWith("image/")) return toast.error("Image files only");

    setBusy(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `avatars/${userId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("cms-media").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (upErr) {
      setBusy(false);
      return toast.error(upErr.message);
    }
    const { data } = supabase.storage.from("cms-media").getPublicUrl(path);
    const url = data.publicUrl;
    const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
    setBusy(false);
    if (dbErr) return toast.error(dbErr.message);
    onChange(url);
    toast.success("Avatar updated");
  }

  async function remove() {
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
    setBusy(false);
    if (error) return toast.error(error.message);
    onChange(null);
  }

  const initials = (displayName ?? "U").slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <div className="relative grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-gradient-primary text-2xl font-bold text-background shadow-glow">
        {currentUrl ? (
          <img src={currentUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-black/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10 disabled:opacity-50"
        >
          <Camera className="h-4 w-4" /> Upload photo
        </button>
        {currentUrl && (
          <button
            onClick={remove}
            disabled={busy}
            className="ml-2 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-muted-foreground hover:text-destructive disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> Remove
          </button>
        )}
        <p className="text-xs text-muted-foreground">PNG / JPG up to 3MB</p>
      </div>
    </div>
  );
}
