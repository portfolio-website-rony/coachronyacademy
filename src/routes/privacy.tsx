import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — CoachRony" },
      { name: "description", content: "How CoachRony collects, uses ও protects your data।" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <Section eyebrow="Legal" title="Privacy Policy">
      <div className="prose prose-invert mx-auto max-w-3xl space-y-5 text-sm leading-relaxed text-muted-foreground">
        <p>Last updated: May 2026</p>
        <h3 className="text-foreground">1. Information we collect</h3>
        <p>আপনি যখন form submit করেন, আমরা name, email, phone ও message সংগ্রহ করি।</p>
        <h3 className="text-foreground">2. How we use it</h3>
        <p>আপনার সাথে যোগাযোগ, course updates, ও service delivery-র জন্য।</p>
        <h3 className="text-foreground">3. Data sharing</h3>
        <p>আমরা আপনার ব্যক্তিগত তথ্য কোনো third party-কে বিক্রি করি না।</p>
        <h3 className="text-foreground">4. Cookies & analytics</h3>
        <p>Site usage analyze করতে cookies ও analytics tools ব্যবহার করি।</p>
        <h3 className="text-foreground">5. Contact</h3>
        <p>প্রশ্ন থাকলে coachronyacademy@gmail.com-এ ইমেইল করুন।</p>
      </div>
    </Section>
  );
}
