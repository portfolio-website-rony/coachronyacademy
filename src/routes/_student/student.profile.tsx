import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { toast } from "sonner";
import { Loader2, BadgeCheck, ShieldAlert, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarUploader } from "@/components/student/AvatarUploader";
import { AchievementBadges } from "@/components/student/AchievementBadges";

export const Route = createFileRoute("/_student/student/profile")({
  head: () => ({ meta: [{ title: "Profile — CoachRony" }] }),
  component: ProfilePage,
});

type SocialLinks = {
  website?: string;
  youtube?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
};

const urlOpt = z.string().trim().max(300).url().optional().or(z.literal(""));
const socialSchema = z.object({
  website: urlOpt,
  youtube: urlOpt,
  facebook: urlOpt,
  instagram: urlOpt,
  linkedin: urlOpt,
});

const accountSchema = z.object({
  display_name: z.string().trim().min(1, "Required").max(100),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
  bio: z.string().trim().max(500).optional().or(z.literal("")),
});

function ProfilePage() {
  const { session, loading } = useAuthUser();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bio, setBio] = useState("");
  const [social, setSocial] = useState<SocialLinks>({});
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);

  // Password
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (!session) return;
    void supabase
      .from("profiles")
      .select("display_name,phone,whatsapp,bio,avatar_url,social_links,created_at")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setDisplayName(data.display_name ?? "");
        setPhone(data.phone ?? "");
        setWhatsapp(data.whatsapp ?? "");
        setBio(data.bio ?? "");
        setAvatar(data.avatar_url ?? null);
        setSocial((data.social_links as SocialLinks) ?? {});
        setCreatedAt(data.created_at ?? null);
      });
  }, [session]);

  async function saveAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    const parsed = accountSchema.safeParse({ display_name: displayName, phone, whatsapp, bio });
    if (!parsed.success) return toast.error(parsed.error.errors[0]?.message ?? "Invalid input");
    setSavingAccount(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, phone, whatsapp, bio })
      .eq("id", session.user.id);
    setSavingAccount(false);
    error ? toast.error(error.message) : toast.success("Profile saved");
  }

  async function saveSocial(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    const parsed = socialSchema.safeParse(social);
    if (!parsed.success) return toast.error(parsed.error.errors[0]?.message ?? "Invalid URL");
    setSavingSocial(true);
    const cleaned = Object.fromEntries(Object.entries(social).filter(([, v]) => v));
    const { error } = await supabase.from("profiles").update({ social_links: cleaned }).eq("id", session.user.id);
    setSavingSocial(false);
    error ? toast.error(error.message) : toast.success("Social links saved");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw1.length < 8) return toast.error("Min 8 characters");
    if (pw1 !== pw2) return toast.error("Passwords don't match");
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    setSavingPw(false);
    if (error) return toast.error(error.message);
    setPw1(""); setPw2("");
    toast.success("Password updated");
  }

  async function resendVerification() {
    if (!session?.user.email) return;
    const { error } = await supabase.auth.resend({ type: "signup", email: session.user.email });
    error ? toast.error(error.message) : toast.success("Verification email sent");
  }

  if (loading || !session) return <Loader2 className="h-5 w-5 animate-spin" />;

  const verified = !!session.user.email_confirmed_at;

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-gradient-primary text-xl font-bold text-background">
            {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : (displayName || "U").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold">{displayName || "Your profile"}</h1>
              {verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary-glow">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-semibold text-yellow-300">
                  <ShieldAlert className="h-3 w-3" /> Unverified
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {session.user.email}
              {createdAt && ` · Member since ${new Date(createdAt).toLocaleDateString()}`}
            </div>
          </div>
        </div>
        {!verified && (
          <button
            onClick={resendVerification}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
          >
            <Mail className="h-3.5 w-3.5" /> Resend verification
          </button>
        )}
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="bg-white/5">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <form onSubmit={saveAccount} className="glass space-y-4 rounded-2xl p-6">
            <AvatarUploader userId={session.user.id} currentUrl={avatar} displayName={displayName} onChange={setAvatar} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Display name">
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} className={inputCls} />
              </Field>
              <Field label="Phone">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} className={inputCls} />
              </Field>
              <Field label="WhatsApp">
                <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} maxLength={30} className={inputCls} />
              </Field>
              <Field label="Email" hint="Contact support to change">
                <input value={session.user.email ?? ""} disabled className={`${inputCls} opacity-60`} />
              </Field>
            </div>
            <Field label="Short bio">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} rows={3} className={inputCls} />
            </Field>
            <button disabled={savingAccount} className={btnPrimary}>
              {savingAccount && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
            </button>
          </form>
        </TabsContent>

        <TabsContent value="social">
          <form onSubmit={saveSocial} className="glass space-y-4 rounded-2xl p-6">
            <p className="text-sm text-muted-foreground">Add full URLs (https://…)</p>
            {(["website", "youtube", "facebook", "instagram", "linkedin"] as const).map((k) => (
              <Field key={k} label={k[0].toUpperCase() + k.slice(1)}>
                <input
                  value={social[k] ?? ""}
                  onChange={(e) => setSocial((s) => ({ ...s, [k]: e.target.value }))}
                  placeholder={`https://${k === "website" ? "yourdomain.com" : k + ".com/username"}`}
                  maxLength={300}
                  className={inputCls}
                />
              </Field>
            ))}
            <button disabled={savingSocial} className={btnPrimary}>
              {savingSocial && <Loader2 className="h-4 w-4 animate-spin" />} Save links
            </button>
          </form>
        </TabsContent>

        <TabsContent value="security">
          <form onSubmit={changePassword} className="glass max-w-md space-y-4 rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold">Change password</h3>
            <Field label="New password">
              <input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} minLength={8} className={inputCls} />
            </Field>
            <Field label="Confirm password">
              <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} minLength={8} className={inputCls} />
            </Field>
            <button disabled={savingPw} className={btnPrimary}>
              {savingPw && <Loader2 className="h-4 w-4 animate-spin" />} Update password
            </button>
          </form>
        </TabsContent>
      </Tabs>

      <AchievementBadges userId={session.user.id} />
    </div>
  );
}

const inputCls = "glass w-full rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-background shadow-glow disabled:opacity-60";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}
