import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }] }),
  component: SettingsPage,
});

type Contact = {
  whatsapp: string;
  messenger: string;
  facebook: string;
  email: string;
  youtube?: string;
  instagram?: string;
};

function SettingsPage() {
  const [contact, setContact] = useState<Contact>({
    whatsapp: "", messenger: "", facebook: "", email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { void load(); }, []);

  async function load() {
    const { data } = await supabase.from("cms_site_settings").select("value").eq("key", "contact").maybeSingle();
    if (data?.value) setContact({ ...contact, ...(data.value as Contact) });
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("cms_site_settings").upsert({ key: "contact", value: contact }, { onConflict: "key" });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Saved");
  }

  if (loading) return <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground">Site-wide contact links shown across the public website.</p>
      </div>

      <div className="glass max-w-2xl space-y-3 rounded-2xl p-6">
        <h3 className="font-semibold">Contact & social</h3>
        {(["whatsapp", "messenger", "facebook", "email", "youtube", "instagram"] as const).map((k) => (
          <div key={k}>
            <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">{k}</label>
            <input
              value={contact[k] ?? ""}
              onChange={(e) => setContact((c) => ({ ...c, [k]: e.target.value }))}
              className="glass w-full rounded-xl px-3 py-2 text-sm"
            />
          </div>
        ))}
        <button onClick={save} disabled={saving} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background shadow-glow disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
        </button>
      </div>

      <PixelCard />
    </div>
  );
}

function PixelCard() {
  const [id, setId] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void supabase.from("cms_site_settings").select("value").eq("key", "tracking").maybeSingle().then(({ data }) => {
      const v = (data?.value ?? {}) as { fb_pixel_id?: string; fb_pixel_enabled?: boolean };
      setId(v.fb_pixel_id ?? "");
      setEnabled(!!v.fb_pixel_enabled);
    });
  }, []);

  async function save() {
    const clean = id.trim();
    if (clean && !/^\d{5,20}$/.test(clean)) {
      toast.error("Pixel ID শুধু সংখ্যা হতে হবে (যেমন 123456789012345)");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("cms_site_settings").upsert(
      { key: "tracking", value: { fb_pixel_id: clean, fb_pixel_enabled: enabled && !!clean } },
      { onConflict: "key" },
    );
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Facebook Pixel সেভ হয়েছে");
  }

  return (
    <div className="glass max-w-2xl space-y-3 rounded-2xl p-6">
      <h3 className="font-semibold">Facebook Pixel</h3>
      <p className="text-xs text-muted-foreground">
        Facebook Events Manager → Data Sources থেকে Pixel ID কপি করে এখানে বসান। চালু করলে পুরো ওয়েবসাইটে প্রতিটি পেজ ভিজিট (PageView) ট্র্যাক হবে।
      </p>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Pixel ID</label>
        <input
          value={id}
          inputMode="numeric"
          placeholder="123456789012345"
          onChange={(e) => setId(e.target.value.replace(/\D/g, ""))}
          className="glass w-full rounded-xl px-3 py-2 text-sm"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Pixel চালু রাখুন
      </label>
      <button onClick={save} disabled={saving} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-background shadow-glow disabled:opacity-60">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Pixel
      </button>
    </div>
  );
}

