import { createFileRoute } from "@tanstack/react-router";
import { Section, GlassCard } from "@/components/site/Section";
import { LeadForm } from "@/components/site/LeadForm";
import { MessageCircle, Mail, Send, Facebook } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — CoachRony" },
      { name: "description", content: "WhatsApp, Messenger, email বা contact form — যেভাবে চান যোগাযোগ করুন CoachRony-র সাথে।" },
      { property: "og:title", content: "Contact CoachRony" },
      { property: "og:description", content: "Let's talk about your project or program." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <Section
      eyebrow="Contact"
      title={<>Let's <span className="text-gradient">talk</span></>}
      subtitle="যেকোনো প্রশ্ন, project বা collaboration — message পাঠান।"
    >
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <GlassCard className="!p-7" hover={false}>
            <h3 className="font-display text-xl font-semibold">Send a message</h3>
            <p className="mt-1 text-sm text-muted-foreground">আমরা সাধারণত 24 ঘণ্টার মধ্যে reply দিই।</p>
            <div className="mt-5">
              <LeadForm source="contact_page" />
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <a href="https://wa.me/881960254383" target="_blank" rel="noreferrer" className="block">
            <GlassCard className="flex items-center gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[oklch(0.72_0.18_152/20%)] text-[oklch(0.85_0.15_152)]">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">WhatsApp</div>
                <div className="text-xs text-muted-foreground">+881960254383</div>
              </div>
            </GlassCard>
          </a>
          <a href="https://m.me/coachronyacademy" target="_blank" rel="noreferrer" className="block">
            <GlassCard className="flex items-center gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/20 text-accent-glow">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Messenger</div>
                <div className="text-xs text-muted-foreground">m.me/coachronyacademy</div>
              </div>
            </GlassCard>
          </a>
          <a href="https://facebook.com/coachronyacademy" target="_blank" rel="noreferrer" className="block">
            <GlassCard className="flex items-center gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/20 text-accent-glow">
                <Facebook className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Facebook</div>
                <div className="text-xs text-muted-foreground">fb.com/coachronyacademy</div>
              </div>
            </GlassCard>
          </a>
          <a href="mailto:coachronyacademy@gmail.com" className="block">
            <GlassCard className="flex items-center gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/20 text-primary-glow">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Email</div>
                <div className="text-xs text-muted-foreground">coachronyacademy@gmail.com</div>
              </div>
            </GlassCard>
          </a>
        </div>
      </div>
    </Section>
  );
}
