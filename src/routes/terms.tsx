import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — CoachRony" },
      { name: "description", content: "Terms of use for CoachRony website ও programs।" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <Section eyebrow="Legal" title="Terms & Conditions">
      <div className="prose prose-invert mx-auto max-w-3xl space-y-5 text-sm leading-relaxed text-muted-foreground">
        <p>Last updated: May 2026</p>
        <h3 className="text-foreground">1. Acceptance</h3>
        <p>This site ব্যবহার করলে আপনি এই terms মেনে নিচ্ছেন।</p>
        <h3 className="text-foreground">2. Programs & courses</h3>
        <p>Course content for personal use only। Redistribution allowed না।</p>
        <h3 className="text-foreground">3. Refunds</h3>
        <p>Refund policy প্রতিটি program page-এ আলাদাভাবে উল্লেখ করা থাকবে।</p>
        <h3 className="text-foreground">4. Liability</h3>
        <p>Results vary. কোনো গ্যারান্টি দেওয়া হয় না।</p>
        <h3 className="text-foreground">5. Contact</h3>
        <p>coachronyacademy@gmail.com</p>
      </div>
    </Section>
  );
}
