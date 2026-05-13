import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_client/client/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, session, loading } = useAuthUser();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setName(profile.display_name ?? "");
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name, phone, whatsapp })
      .eq("id", session.user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  }

  if (loading) return <Loader2 className="h-5 w-5 animate-spin" />;

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="font-display text-2xl font-bold">Profile</h1>
      <form onSubmit={save} className="glass space-y-3 rounded-2xl p-6">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" maxLength={100} className="glass w-full rounded-xl px-4 py-3 text-sm outline-none" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" maxLength={30} className="glass w-full rounded-xl px-4 py-3 text-sm outline-none" />
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp" maxLength={30} className="glass w-full rounded-xl px-4 py-3 text-sm outline-none" />
        <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-background shadow-glow disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
        </button>
      </form>
    </div>
  );
}
