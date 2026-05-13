import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";

export function ImageUploader({
  value,
  onChange,
  folder = "uploads",
  bucket = "cms-media",
  aspect = "video",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  bucket?: string;
  aspect?: "video" | "square";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      setUploading(false);
      return toast.error(error.message);
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    toast.success("Image uploaded");
  }

  const aspectCls = aspect === "square" ? "aspect-square" : "aspect-video";

  return (
    <div className="space-y-2">
      <div className={`relative ${aspectCls} w-full overflow-hidden rounded-xl border border-dashed border-white/15 bg-background/40`}>
        {value ? (
          <>
            <img src={value} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-muted-foreground backdrop-blur hover:text-destructive"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid h-full w-full place-items-center text-muted-foreground hover:bg-white/5"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-xs">
                <ImageIcon className="h-7 w-7 opacity-60" />
                Click to upload image
              </div>
            )}
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {value ? "Replace image" : "Upload image"}
        </button>
        <input
          type="url"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="…or paste image URL"
          className="flex-1 min-w-[200px] rounded-lg border border-white/10 bg-background/40 px-2.5 py-1.5 text-xs outline-none focus:border-primary"
        />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
