import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Bot, BriefcaseBusiness, Check, ChevronDown, CircleCheck,
  Clock3, Code2, Gift, GraduationCap, Headphones, Layers3, MessageSquareText,
  Rocket, Sparkles, UserRound, UsersRound, Workflow, X,
} from "lucide-react";
import { aiEmployee } from "@/config/aiEmployee";
import { AiDashboard } from "@/components/ai-employee/AiDashboard";
import { AiEmployeeDemo } from "@/components/ai-employee/AiEmployeeDemo";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-coachrony.png";

export const Route = createFileRoute("/ai-employee")({
  head: () => ({
    meta: [
      { title: "Build Your Own 24/7 AI Employee | CoachRony" },
      { name: "description", content: "৪ দিনের live program-এ beginner-friendly উপায়ে নিজের AI Employee তৈরি ও business workflow-এ ব্যবহার শিখুন।" },
      { property: "og:title", content: "Build Your Own 24/7 AI Employee" },
      { property: "og:description", content: "মাত্র ৪ দিনে নিজের AI-powered business assistant তৈরি ও ব্যবহার শিখুন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AiEmployeePage,
});

const icons = [MessageSquareText, Clock3, Workflow, Layers3];
const audienceIcons = [BriefcaseBusiness, UserRound, GraduationCap, Headphones, UsersRound];
const showcaseIcons = [Code2, Layers3, Bot, Workflow, Sparkles, Rocket];

function PaymentLink({ label, className = "" }: { label: string; className?: string }) {
  return (
    <a
      href={aiEmployee.paymentLink}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ai-blue px-6 font-mont text-sm font-bold text-ai-foreground shadow-ai transition hover:bg-ai-blue/90 ${className}`}
    >
      {label}<ArrowRight className="h-4 w-4" />
    </a>
  );
}

function SectionHeading({ label, title, sub }: { label?: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {label && <p className="mb-3 text-[11px] font-bold uppercase text-ai-cyan">{label}</p>}
      <h2 className="font-mont text-3xl leading-tight sm:text-4xl">{title}</h2>
      {sub && <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-ai-soft sm:text-base">{sub}</p>}
    </div>
  );
}

function Section({ children, id, muted = false }: { children: React.ReactNode; id?: string; muted?: boolean }) {
  return (
    <section id={id} className={`px-5 py-18 sm:py-24 ${muted ? "border-y border-ai-line bg-ai-panel/45" : ""}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function AiEmployeePage() {
  const c = aiEmployee;

  return (
    <div className="min-h-screen bg-ai-background font-body text-ai-foreground pb-20 md:pb-0">
      <header className="border-b border-ai-line bg-ai-background/90 px-5 backdrop-blur-md">
        <div className="mx-auto flex h-17 max-w-6xl items-center justify-between">
          <img src={logo} alt="CoachRony Academy" width="1152" height="512" className="h-auto w-32 sm:w-36" />
          <PaymentLink label={c.program.offerPrice + "-এ Join"} className="min-h-10 px-4 text-xs" />
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-5 pb-18 pt-16 sm:pb-24 sm:pt-22">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,var(--ai-blue),transparent_65%)] opacity-10" />
          <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-ai-cyan/25 bg-ai-cyan/8 px-3 py-1.5 text-[11px] font-bold uppercase text-ai-cyan">
                <span className="h-1.5 w-1.5 rounded-full bg-ai-cyan" /> {c.program.label}
              </span>
              <h1 className="mt-6 max-w-3xl font-mont text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">{c.hero.headline}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-ai-foreground/90">{c.hero.subheadline}</p>
              <p className="mt-3 max-w-xl text-sm leading-7 text-ai-soft">{c.hero.support}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PaymentLink label={c.cta.primary} />
                <a href="#demo" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-ai-line bg-ai-surface px-6 font-mont text-sm font-semibold hover:border-ai-cyan/35">
                  {c.cta.demo}<ChevronDown className="h-4 w-4 text-ai-cyan" />
                </a>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ai-soft">
                {[c.program.label, "Beginner Friendly", "Live + Recorded Access"].map((item) => <span key={item} className="flex items-center gap-2"><CircleCheck className="h-3.5 w-3.5 text-ai-success" />{item}</span>)}
              </div>
            </div>
            <AiDashboard />
          </div>
        </section>

        <Section muted>
          <SectionHeading label="The Problem" title="প্রতিদিন একই কাজ করতে করতে কি আপনার সময় চলে যাচ্ছে?" />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {c.problems.map((problem, index) => {
              const Icon = icons[index];
              return <div key={problem} className="rounded-lg border border-ai-line bg-ai-surface p-5"><Icon className="h-5 w-5 text-ai-cyan" /><p className="mt-5 text-sm font-semibold leading-6">{problem}</p></div>;
            })}
          </div>
          <p className="mx-auto mt-10 max-w-3xl text-center font-mont text-xl font-semibold">সব কাজ নিজে করার বদলে কিছু কাজ যদি আপনার AI Employee করে দেয়?</p>
        </Section>

        <Section>
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div className="rounded-lg border border-ai-cyan/20 bg-ai-panel p-6">
              <Bot className="h-8 w-8 text-ai-cyan" />
              <div className="mt-8 space-y-3">
                {["আপনার instruction বুঝবে", "Workflow অনুযায়ী সহায়তা করবে", "Repetitive task সহজ করবে"].map((item) => <div key={item} className="flex items-center gap-3 border-b border-ai-line pb-3 text-sm"><Check className="h-4 w-4 text-ai-success" />{item}</div>)}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-ai-cyan">The Opportunity</p>
              <h2 className="mt-3 font-mont text-3xl leading-tight sm:text-4xl">এখন আপনার Business-এর জন্য AI Employee তৈরি করার সময়।</h2>
              <p className="mt-5 leading-8 text-ai-soft">AI Employee হলো এমন একটি AI-powered system, যাকে নির্দিষ্ট কাজের জন্য নির্দেশনা দেওয়া যায় এবং সে আপনার workflow অনুযায়ী কাজ করতে সাহায্য করতে পারে।</p>
              <div className="mt-6 border-l-2 border-ai-cyan pl-5"><p className="font-semibold">আপনাকে AI Developer হতে হবে না।</p><p className="mt-2 text-sm leading-6 text-ai-soft">আমরা Practicalভাবে দেখাবো কীভাবে AI-কে কাজ শেখাতে হয়।</p></div>
            </div>
          </div>
        </Section>

        <Section id="demo" muted>
          <SectionHeading label="Interactive Demo" title="একবার দেখে নিন — AI Employee কীভাবে কাজ করতে পারে" sub="একটি customer request থেকে reply, follow-up, task এবং lead update—পুরো flow দেখুন।" />
          <div className="mx-auto mt-10 max-w-4xl"><AiEmployeeDemo /></div>
        </Section>

        <Section>
          <SectionHeading label="4-Day Roadmap" title="৪ দিনে আপনি কী কী শিখবেন?" />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {c.curriculum.map((day, index) => <article key={day.day} className="rounded-lg border border-ai-line bg-ai-panel p-6"><div className="flex items-start justify-between gap-4"><span className="text-xs font-bold text-ai-cyan">{day.day}</span><span className="font-mont text-4xl font-bold text-ai-line">0{index + 1}</span></div><h3 className="mt-7 font-mont text-xl">{day.title}</h3><p className="mt-3 text-sm leading-7 text-ai-soft">{day.description}</p></article>)}
          </div>
        </Section>

        <Section muted>
          <SectionHeading label="Build Showcase" title="শুধু শিখবেন না — Build করে দেখবেন" />
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
            {c.buildShowcase.map((item, index) => { const Icon = showcaseIcons[index]; return <div key={item} className="group min-h-34 rounded-lg border border-ai-line bg-ai-surface p-5"><Icon className="h-5 w-5 text-ai-cyan" /><p className="mt-8 font-mont text-sm font-semibold sm:text-base">{item}</p></div>; })}
          </div>
        </Section>

        <Section>
          <SectionHeading label="Transformation" title="Manual থেকে AI-Assisted Workflow" />
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-ai-line bg-ai-panel p-6"><div className="flex items-center gap-2 text-xs font-bold text-ai-soft"><X className="h-4 w-4" /> BEFORE</div><div className="mt-6 space-y-3">{c.comparison.before.map((item) => <div key={item} className="rounded-md bg-ai-surface px-4 py-3 text-sm text-ai-soft">{item}</div>)}</div></div>
            <div className="rounded-lg border border-ai-cyan/30 bg-ai-blue/10 p-6"><div className="flex items-center gap-2 text-xs font-bold text-ai-cyan"><Check className="h-4 w-4" /> AFTER</div><div className="mt-6 space-y-3">{c.comparison.after.map((item) => <div key={item} className="flex items-center gap-3 rounded-md border border-ai-cyan/15 bg-ai-panel px-4 py-3 text-sm"><Check className="h-4 w-4 text-ai-success" />{item}</div>)}</div></div>
          </div>
        </Section>

        <Section muted>
          <SectionHeading label="Who It Is For" title="এই Program কার জন্য?" sub="আপনি Coding Expert না হলেও এই Journey শুরু করতে পারবেন।" />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{c.audience.map((item, index) => { const Icon = audienceIcons[index]; return <div key={item} className="rounded-lg border border-ai-line bg-ai-surface p-5 text-center"><Icon className="mx-auto h-5 w-5 text-ai-cyan" /><p className="mt-4 text-sm font-semibold">{item}</p></div>; })}</div>
        </Section>

        <Section>
          <SectionHeading label="Included Resources" title="Join করলে কী পাবেন?" />
          <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{c.bonuses.map((bonus, index) => <div key={bonus} className="flex min-h-24 items-start gap-4 rounded-lg border border-ai-line bg-ai-panel p-5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-ai-blue/15 text-ai-cyan"><Gift className="h-4 w-4" /></span><div><p className="text-[10px] font-bold uppercase text-ai-soft">Bonus {String(index + 1).padStart(2, "0")}</p><p className="mt-2 text-sm font-semibold">{bonus}</p></div></div>)}</div>
        </Section>

        <Section id="offer" muted>
          <div className="mx-auto grid max-w-5xl overflow-hidden rounded-lg border border-ai-cyan/30 bg-ai-panel lg:grid-cols-[1.1fr_.9fr]">
            <div className="p-7 sm:p-10"><p className="text-[11px] font-bold uppercase text-ai-cyan">আজকের Special Enrollment</p><h2 className="mt-4 font-mont text-3xl sm:text-4xl">৪ দিনের AI Employee Program</h2><div className="mt-7 flex items-end gap-4"><span className="font-mont text-5xl font-bold text-ai-cyan">{c.program.offerPrice}</span><span className="pb-1 text-lg text-ai-soft line-through">{c.program.regularPrice}</span></div><p className="mt-4 text-sm text-ai-soft">এই Special Offer পরিবর্তিত হতে পারে।</p><PaymentLink label={c.cta.offer} className="mt-7 w-full sm:w-auto" /></div>
            <div className="border-t border-ai-line bg-ai-surface p-7 sm:p-10 lg:border-l lg:border-t-0"><p className="text-xs font-bold uppercase text-ai-soft">Everything included</p><div className="mt-6 space-y-4">{c.valueStack.map((item, index) => <div key={item} className="flex items-center gap-3 text-sm"><span className="grid h-5 w-5 place-items-center rounded-full bg-ai-success/15 text-ai-success"><Check className="h-3 w-3" /></span>{item}{index < c.valueStack.length - 1 && <span className="ml-auto text-ai-line">+</span>}</div>)}</div></div>
          </div>
          <p className="mt-8 text-center font-mont text-xl font-semibold">আজ Join করুন মাত্র {c.program.offerPrice}-এ</p>
        </Section>

        <Section>
          <SectionHeading label="FAQ" title="আপনার প্রশ্নের সহজ উত্তর" />
          <div className="mx-auto mt-10 max-w-3xl divide-y divide-ai-line overflow-hidden rounded-lg border border-ai-line bg-ai-panel">
            {c.faqs.map((faq, index) => <details key={faq.q} open={index === 0} className="group"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-sm font-semibold sm:px-6"><span>{faq.q}</span><ChevronDown className="h-4 w-4 shrink-0 text-ai-cyan transition group-open:rotate-180" /></summary><p className="px-5 pb-5 text-sm leading-7 text-ai-soft sm:px-6">{faq.a}</p></details>)}
          </div>
        </Section>

        <section className="px-5 py-20 sm:py-28"><div className="mx-auto max-w-5xl rounded-lg border border-ai-cyan/30 bg-ai-blue/10 px-6 py-14 text-center sm:px-10"><p className="text-xs font-bold uppercase text-ai-cyan">{c.program.label}</p><h2 className="mx-auto mt-5 max-w-3xl font-mont text-3xl leading-tight sm:text-5xl">AI শুধু ব্যবহার করবেন না — এবার নিজের AI Employee তৈরি করুন।</h2><p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-ai-soft sm:text-base">আপনার Business-এর repetitive কাজগুলোকে Smart করার Journey শুরু করুন।</p><PaymentLink label={c.cta.final} className="mt-8 w-full sm:w-auto" /></div></section>
      </main>

      <footer className="border-t border-ai-line px-5 py-10"><div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><img src={logo} alt="CoachRony Academy" width="1152" height="512" className="h-auto w-32" /><p className="mt-3 text-xs text-ai-soft">{c.brand.descriptor}</p></div><nav className="flex flex-wrap gap-5 text-xs text-ai-soft"><Link to="/privacy" className="hover:text-ai-foreground">Privacy Policy</Link><Link to="/terms" className="hover:text-ai-foreground">Terms</Link><Link to="/contact" className="hover:text-ai-foreground">Contact</Link></nav></div></footer>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ai-line bg-ai-background/95 p-3 backdrop-blur-md md:hidden"><PaymentLink label={`${c.program.offerPrice}-এ Join করুন`} className="w-full" /></div>
    </div>
  );
}