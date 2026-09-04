/**
 * Central configuration for the /live-batch page.
 * Everything editable (price, dates, curriculum, projects, FAQ, CTA) lives here.
 */

export const liveBatch = {
  brand: "COACHRONY ACADEMY — LIVE BATCH",
  program: "AI Solution Builder — Live Batch",

  hero: {
    label: "COACHRONY ACADEMY — LIVE BATCH",
    headline: ["AI দিয়ে শুধু শেখা নয়—", "এবার Real Problem-এর Real Solution Build করুন।"],
    sub: "Vibe Coding + AI + Automation ব্যবহার করে Website, Software, SaaS, AI Agent, Digital Product এবং Business Automation তৈরি করে Market-এ Launch করার Complete System।",
    primaryCta: { label: "Live Batch-এ Join করুন →", href: "#enroll" },
    secondaryCta: { label: "Program দেখুন ↓", href: "#system" },
    proof: ["Live Batch", "Real Project Based", "Vibe Coding + Automation", "Build → Launch → Sell"],
  },

  enrollment: {
    batchName: "Batch 01 — AI Solution Builder",
    price: "৳ 14,999",
    referencePrice: "৳ 24,999",
    startDate: "15 October 2026",
    duration: "12 Weeks · Live",
    seatsText: "Limited enrollment — প্রতি batch-এ মাত্র 30 জন",
    note: "Enrollment এখন open. Seat confirm হয় payment order অনুযায়ী।",
    cta: { label: "Seat Confirm করুন", href: "/contact" },
    includes: [
      "Weekly live build sessions",
      "Real project based curriculum",
      "Recording + resource access",
      "Private community support",
    ],
  },

  problems: {
    headline: ["AI সম্পর্কে জানেন।", "কিন্তু নিজের কিছু Build করতে পারছেন?"],
    items: [
      { title: "অনেক AI Tool — কিন্তু Clear System নেই", desc: "প্রতিদিন নতুন tool, কিন্তু কোনটা কোথায় ব্যবহার করবেন সেই framework নেই।" },
      { title: "Coding নিয়ে Confusion", desc: "কোথা থেকে শুরু করবেন, কোন stack, কীভাবে debug করবেন — সব অস্পষ্ট।" },
      { title: "Automation জানেন — Complete Workflow বানাতে পারেন না", desc: "একটা node চালাতে পারেন, কিন্তু end-to-end business workflow দাঁড় করানো হয় না।" },
      { title: "Idea আছে — Product নেই", desc: "Idea খাতায় থেকে যায়, কখনো live product হয় না।" },
      { title: "Skill আছে — Business Model নেই", desc: "কাজ পারেন, কিন্তু সেটা service, product না SaaS — সিদ্ধান্ত নেই।" },
    ],
    closing:
      "এই Program আপনাকে আরও Tool শেখানোর জন্য নয়। Tool ব্যবহার করে Real Solution Build করার জন্য।",
  },

  transformation: [
    "Problem", "Idea", "AI Solution", "Vibe Coding", "Automation", "Product", "Launch", "Customer", "Revenue",
  ],

  projects: [
    {
      title: "AI Business Website",
      category: "Web",
      desc: "Brand-ready website with AI copy, SEO structure ও lead capture — deploy পর্যন্ত।",
      tags: ["Lovable", "React", "SEO"],
      preview: { url: "yourbrand.com", kind: "site" as const },
    },
    {
      title: "AI Personal Assistant",
      category: "Agent",
      desc: "Personal knowledge + memory যুক্ত assistant যেটা daily কাজ handle করে।",
      tags: ["OpenAI", "Memory", "Tools"],
      preview: { url: "assistant.app", kind: "chat" as const },
    },
    {
      title: "Business Automation System",
      category: "Automation",
      desc: "Lead → CRM → Notification → Follow-up পর্যন্ত সম্পূর্ণ automated pipeline।",
      tags: ["n8n", "Webhooks", "API"],
      preview: { url: "automation.internal", kind: "flow" as const },
    },
    {
      title: "AI Customer Support Agent",
      category: "Agent",
      desc: "Knowledge base থেকে উত্তর, escalation rule সহ support agent।",
      tags: ["RAG", "WhatsApp", "Supabase"],
      preview: { url: "support.ai", kind: "chat" as const },
    },
    {
      title: "AI Content Automation System",
      category: "Content",
      desc: "Idea → script → asset → schedule — পুরো content pipeline automated।",
      tags: ["n8n", "Claude", "Sheets"],
      preview: { url: "content.studio", kind: "flow" as const },
    },
    {
      title: "Lead Generation System",
      category: "Growth",
      desc: "Landing page + form + qualification agent + CRM sync।",
      tags: ["Landing", "Agent", "CRM"],
      preview: { url: "leads.system", kind: "dashboard" as const },
    },
    {
      title: "AI SaaS Product",
      category: "SaaS",
      desc: "Auth, database, billing ও AI feature সহ subscription-ready product।",
      tags: ["Next.js", "Supabase", "Payments"],
      preview: { url: "app.yoursaas.com", kind: "dashboard" as const },
    },
    {
      title: "Your Own AI Solution",
      category: "Capstone",
      desc: "নিজের market-এর একটা real problem নিয়ে capstone solution build ও launch।",
      tags: ["Capstone", "Launch", "Portfolio"],
      preview: { url: "your-idea.live", kind: "site" as const },
    },
  ],

  pillars: [
    { no: "01", title: "THINK", desc: "Problem Finding + Solution Design" },
    { no: "02", title: "BUILD", desc: "Vibe Coding + Website + Software + SaaS" },
    { no: "03", title: "AUTOMATE", desc: "n8n + API + AI Workflow + Business Automation" },
    { no: "04", title: "LAUNCH", desc: "Product + Portfolio + Marketing + Deployment" },
    { no: "05", title: "GROW", desc: "Client Acquisition + Sales + Recurring Revenue" },
  ],

  vibeCoding: {
    headline: ["Coding-এর Traditional Barrier কমিয়ে", "AI-assisted ভাবে Software Build করুন।"],
    steps: ["IDEA", "PROMPT", "AI CODE", "TEST", "DEBUG", "DATABASE", "API", "DEPLOY", "LIVE PRODUCT"],
    examples: ["Website", "Web App", "Dashboard", "SaaS"],
    disclaimer:
      "AI-assisted development traditional barrier কমায় — তবে testing, debugging এবং product thinking সমান গুরুত্বপূর্ণ থাকে। কোনো tool স্বয়ংক্রিয়ভাবে production-quality software নিশ্চিত করে না।",
  },

  automation: {
    headline: ["Manual Work বাদ দিয়ে", "Business Automation তৈরি করুন।"],
    flow: ["Customer", "Form / WhatsApp / Facebook", "Automation", "AI Agent", "Database", "Action", "Notification", "Follow-up"],
    useCases: [
      "Lead Collection", "Customer Support", "Content Automation",
      "Email Automation", "Order Automation", "CRM Automation",
    ],
  },

  agent: {
    headline: ["AI Agent শুধু Chat করবে না—", "Business-এর কাজেও সাহায্য করবে।"],
    blocks: ["Knowledge", "Memory", "Tools", "API", "Actions"],
    examples: ["Sales Agent", "Support Agent", "Lead Qualification Agent", "Content Agent", "Business Assistant"],
  },

  saas: {
    headline: ["আপনার Idea থেকে", "একটি Live SaaS Product"],
    lifecycle: ["Idea", "UI/UX", "Database", "Authentication", "AI/API", "Automation", "Payment", "Dashboard", "Deployment", "Subscription"],
  },

  business: {
    headline: ["Build করার পর—", "এগুলো দিয়ে Business করবেন কীভাবে?"],
    paths: [
      { title: "FREELANCING", steps: ["AI Solution", "Client", "Project", "Payment"] },
      { title: "AI AGENCY", steps: ["Automation", "Business Client", "Monthly Retainer"] },
      { title: "DIGITAL PRODUCT", steps: ["Knowledge", "Product", "Landing Page", "Sales"] },
      { title: "SAAS", steps: ["Problem", "Software", "Subscription", "Recurring Revenue"] },
    ],
    disclaimer: "কোনো income guarantee দেওয়া হয় না। ফলাফল নির্ভর করে আপনার effort, market ও execution-এর উপর।",
  },

  tools: [
    { category: "AI", items: ["ChatGPT", "Claude", "Gemini", "OpenAI"] },
    { category: "Build", items: ["Lovable", "React", "Next.js", "Supabase", "Firebase"] },
    { category: "Automation", items: ["n8n", "API", "Webhooks", "AI Agents"] },
    { category: "Deployment", items: ["GitHub", "Vercel", "Cloud / Hosting"] },
    { category: "Marketing", items: ["Facebook", "WhatsApp", "Email", "Landing Page", "Analytics"] },
  ],

  finalFlow: ["SKILL", "SOLUTION", "PRODUCT / SERVICE / SAAS", "CUSTOMER", "REVENUE"],

  faq: [
    { q: "আমি beginner — পারবো তো?", a: "হ্যাঁ। Program শুরু হয় fundamentals দিয়ে এবং প্রতিটি module-এ guided build session থাকে। তবে নিয়মিত practice প্রয়োজন।" },
    { q: "Coding না জানলে হবে?", a: "AI-assisted workflow traditional barrier অনেকটা কমায়। তবুও logic, testing ও debugging শেখানো হয় — সেটাই program-এর অংশ।" },
    { q: "Class কীভাবে হবে?", a: "Live session + recording। প্রতি সপ্তাহে build task এবং feedback থাকে।" },
    { q: "Recording পাবো?", a: "হ্যাঁ, প্রতিটি live session-এর recording batch access period পর্যন্ত পাওয়া যাবে।" },
    { q: "Job বা income guarantee আছে?", a: "না। আমরা system, project ও portfolio তৈরিতে সাহায্য করি — income আপনার execution-এর উপর নির্ভরশীল।" },
    { q: "কীভাবে enroll করবো?", a: "Enrollment card থেকে seat confirm করুন — আমাদের team যোগাযোগ করে batch onboarding সম্পন্ন করবে।" },
  ],

  finalCta: {
    title: "Learn Less. Build More.",
    sub: "পরের batch শুরু হওয়ার আগেই নিজের প্রথম real AI solution build করা শুরু করুন।",
    cta: { label: "Live Batch-এ Join করুন →", href: "/contact" },
  },
};

export type LiveBatchConfig = typeof liveBatch;
