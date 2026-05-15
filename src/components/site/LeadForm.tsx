import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { safeName, safeOptionalEmail, safeOptionalPhone, safeOptionalText } from "@/lib/security/schemas";

const schema = z.object({
  name: safeName,
  email: safeOptionalEmail,
  phone: safeOptionalPhone,
  message: safeOptionalText(1000),
});

export function LeadForm({
  source = "contact",
  interest,
  buttonLabel = "Send Message",
  compact = false,
}: {
  source?: string;
  interest?: string;
  buttonLabel?: string;
  compact?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email") ?? "",
      phone: fd.get("phone") ?? "",
      message: fd.get("message") ?? "",
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      message: parsed.data.message || null,
      source,
      interest: interest ?? null,
    });
    setLoading(false);
    if (error) {
      toast.error("Couldn't submit. Please try again.");
      return;
    }
    toast.success("ধন্যবাদ! আমরা শীঘ্রই যোগাযোগ করবো।");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className={compact ? "grid gap-3" : "grid gap-3 sm:grid-cols-2"}>
        <input
          name="name"
          required
          placeholder="Your name / আপনার নাম"
          className="glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60"
        />
      </div>
      <input
        name="phone"
        placeholder="WhatsApp / Phone"
        className="glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60"
      />
      <textarea
        name="message"
        rows={compact ? 3 : 5}
        placeholder="আপনার মেসেজ লিখুন..."
        className="glass rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60"
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-background shadow-glow transition hover:opacity-90 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {buttonLabel}
      </button>
    </form>
  );
}
