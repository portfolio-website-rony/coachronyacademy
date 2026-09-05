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

  curriculum: {
    headline: ["Complete AI Solution Builder Curriculum"],
    modules: [
      {
        no: "01",
        title: "AI Solution Thinking",
        topics: ["Problem Finding", "Market Research", "Idea Validation", "AI Use Cases", "Solution Architecture", "Product Thinking"],
      },
      {
        no: "02",
        title: "Vibe Coding",
        topics: ["AI-assisted Coding", "Prompting for Development", "UI Building", "Frontend", "Backend", "Database", "Authentication", "API", "Debugging", "Deployment"],
      },
      {
        no: "03",
        title: "Automation & n8n",
        topics: ["Workflow Fundamentals", "Triggers", "Actions", "Webhooks", "API", "AI Nodes", "Database", "Conditions", "Multi-step Workflows", "Error Handling", "Production Workflows"],
      },
      {
        no: "04",
        title: "AI Agents",
        topics: ["Agent Architecture", "Knowledge", "Memory", "Tools", "APIs", "Support Agents", "Sales Agents", "Business Agents", "Human Handoff"],
      },
      {
        no: "05",
        title: "Product & SaaS",
        topics: ["Product Architecture", "SaaS UI", "Authentication", "Database", "AI Integration", "Automation", "Payment", "Dashboard", "Deployment", "Security Fundamentals"],
      },
      {
        no: "06",
        title: "Business & Monetization",
        topics: ["Personal Branding", "Portfolio", "Client Hunting", "Proposal", "Pricing", "Digital Products", "Services", "Agency", "SaaS", "Sales", "Recurring Revenue"],
      },
    ],
  },

  gallery: {
    headline: ["Build a Portfolio You Can Actually Show"],
    sub: "নিচের preview গুলো placeholder — batch-এ আপনি নিজের version build করবেন।",
    items: [
      {
        title: "AI Website",
        category: "Web",
        desc: "AI-assisted copy, clean structure ও lead capture সহ business website।",
        tech: ["Lovable", "React", "SEO"],
        preview: { url: "yourbrand.com", kind: "site" as const },
      },
      {
        title: "AI Dashboard",
        category: "Product",
        desc: "Data view, filter ও AI summary সহ internal dashboard।",
        tech: ["React", "Supabase", "Charts"],
        preview: { url: "dashboard.app", kind: "dashboard" as const },
      },
      {
        title: "Automation Workflow",
        category: "Automation",
        desc: "Trigger থেকে action পর্যন্ত multi-step production workflow।",
        tech: ["n8n", "Webhooks", "API"],
        preview: { url: "automation.internal", kind: "flow" as const },
      },
      {
        title: "AI Agent",
        category: "Agent",
        desc: "Knowledge, memory ও tools সহ business agent, human handoff সমেত।",
        tech: ["LLM", "RAG", "Tools"],
        preview: { url: "agent.app", kind: "chat" as const },
      },
      {
        title: "SaaS Product",
        category: "SaaS",
        desc: "Auth, database, payment ও AI feature সহ subscription product।",
        tech: ["Next.js", "Supabase", "Payments"],
        preview: { url: "app.yoursaas.com", kind: "dashboard" as const },
      },
      {
        title: "Business System",
        category: "System",
        desc: "Lead → CRM → follow-up পর্যন্ত সম্পূর্ণ business operating system।",
        tech: ["Automation", "CRM", "AI"],
        preview: { url: "system.business", kind: "flow" as const },
      },
    ],
    caseStudyCta: { label: "Case study দেখুন →", href: "#enroll" },
  },

  experience: {
    headline: ["এটা শুধু একটি Course নয়—", "এটা একটি Live Building Environment"],
    steps: [
      { no: "01", title: "JOIN", desc: "Live Batch Community" },
      { no: "02", title: "BUILD", desc: "Real Projects" },
      { no: "03", title: "IMPLEMENT", desc: "Apply to Your Own Idea or Business" },
      { no: "04", title: "LAUNCH", desc: "Put Your Solution Live" },
    ],
    includes: ["Live Sessions", "Q&A", "Community", "Project Guidance", "Resource Library", "Updates"],
    /** Editable batch details — fill in real values before publishing. */
    details: {
      batchName: "Batch 01 — AI Solution Builder",
      startDate: "TBA",
      classSchedule: "TBA",
      duration: "TBA",
      sessionCount: "TBA",
      supportDuration: "TBA",
    },
  },

  bonuses: {
    headline: ["Program-এর সাথে আরও যা পাবেন"],
    items: [
      { name: "AI Prompt Library", desc: "Development, content ও business prompt-এর ready collection।", value: "Included" },
      { name: "n8n Automation Templates", desc: "Import করেই ব্যবহার করার মতো workflow template।", value: "Included" },
      { name: "SaaS Starter Templates", desc: "Auth ও database সহ SaaS project starter।", value: "Included" },
      { name: "AI Agent Templates", desc: "Support, sales ও business agent-এর base structure।", value: "Included" },
      { name: "Business Automation Templates", desc: "Lead, CRM ও follow-up automation blueprint।", value: "Included" },
      { name: "Client Proposal Templates", desc: "Scope, pricing ও deliverable সহ proposal format।", value: "Included" },
      { name: "Product Launch Checklist", desc: "Launch-এর আগে ও পরে ধাপে ধাপে checklist।", value: "Included" },
      { name: "AI Business Blueprint", desc: "Service, product ও SaaS path-এর decision framework।", value: "Included" },
    ],
  },

  audience: {
    headline: ["Who is this for?"],
    items: [
      { title: "Freelancer", desc: "AI solution দিয়ে service scope বাড়ান এবং higher-value project নিন।" },
      { title: "Business Owner", desc: "নিজের business-এর manual কাজ automate করে সময় ও খরচ কমান।" },
      { title: "Creator", desc: "Content ও product pipeline automate করে output বাড়ান।" },
      { title: "Student", desc: "Real project ও portfolio দিয়ে career শুরু করার base তৈরি করুন।" },
      { title: "Agency Owner", desc: "Team-এর delivery system standardize করে retainer service দিন।" },
      { title: "Digital Entrepreneur", desc: "Idea থেকে digital product বা SaaS পর্যন্ত পুরো path follow করুন।" },
    ],
  },

  why: {
    headline: ["কেন CoachRony-এর AI Solution Builder System?"],
    points: [
      { no: "01", title: "REAL PROBLEMS", desc: "Learn from practical problems." },
      { no: "02", title: "REAL BUILD", desc: "Build actual projects." },
      { no: "03", title: "REAL BUSINESS", desc: "Understand service, product and SaaS opportunities." },
      { no: "04", title: "AI-FIRST", desc: "Use modern AI-assisted workflows." },
    ],
  },

  socialProof: {
    headline: ["Student Voices"],
    sub: "Real testimonial যোগ হওয়ার আগ পর্যন্ত এখানে placeholder দেখানো হচ্ছে।",
    placeholderText: "Student testimonial will appear here.",
    /** Add real entries here only — never placeholder-as-real. */
    testimonials: [] as { name: string; role?: string; quote: string }[],
    showcase: {
      title: "Student Project Showcase",
      sub: "Batch শেষে student project গুলো এখানে যুক্ত হবে।",
      placeholderText: "Student project will appear here.",
      projects: [] as { title: string; category: string; url?: string }[],
    },
  },

  offer: {
    headline: ["একটি Complete AI Solution Building System"],
    stack: [
      "AI Solution Builder Program",
      "Live Sessions",
      "Real Projects",
      "Vibe Coding System",
      "Automation System",
      "AI Agent System",
      "SaaS Building System",
      "Business System",
      "Templates",
      "Bonuses",
      "Community",
    ],
    programPrice: "৳ 14,999",
    referencePrice: "",
    discountText: "",
    batchLabel: "Batch 01 — AI Solution Builder",
    startDate: "TBA",
    ctaText: "Live Batch-এ Join করুন →",
    ctaHref: "/contact",
  },

  faq: [
    { q: "Coding না জানলে কি করতে পারব?", a: "হ্যাঁ, শুরু করা যায়। AI-assisted workflow অনেক barrier কমায়, তবে logic, testing ও debugging program-এর অংশ হিসেবেই শেখানো হয়।" },
    { q: "n8n আগে না জানলেও কি হবে?", a: "হবে। Automation module শুরু হয় workflow fundamentals থেকে — trigger, action, webhook ধাপে ধাপে।" },
    { q: "আমি beginner হলে কি join করতে পারব?", a: "পারবেন। Curriculum fundamentals থেকে শুরু হয় এবং প্রতিটি module-এ guided build থাকে। নিয়মিত practice প্রয়োজন।" },
    { q: "নিজের business-এর জন্য ব্যবহার করতে পারব?", a: "হ্যাঁ। Implement ধাপে নিজের idea বা business-এর উপরেই project apply করা হয়।" },
    { q: "SaaS বানানো শেখানো হবে?", a: "Product & SaaS module-এ architecture, auth, database, payment, dashboard ও deployment cover করা হয়।" },
    { q: "Client project-এর জন্য ব্যবহার করা যাবে?", a: "যাবে। Business module-এ proposal, pricing ও delivery structure নিয়ে কাজ করা হয়।" },
    { q: "কোন AI tools ব্যবহার করা হবে?", a: "Tools section-এ উল্লেখ করা AI, build, automation ও deployment tool গুলো ব্যবহার করা হয়। Tool পরিবর্তন হলে batch-এ update দেওয়া হয়।" },
    { q: "Live class কীভাবে হবে?", a: "Online live session আকারে, Q&A ও project guidance সহ। Schedule enrollment section-এ দেওয়া থাকে।" },
    { q: "Support কীভাবে পাব?", a: "Live Q&A এবং private community-র মাধ্যমে। Support duration enrollment details-এ উল্লেখ থাকে।" },
    { q: "Program শেষ হওয়ার পর কী থাকবে?", a: "আপনার build করা project, portfolio, templates ও resource library — access period অনুযায়ী।" },
    { q: "Payment-এর পর কীভাবে access পাব?", a: "Payment confirm হওয়ার পর আমাদের team যোগাযোগ করে batch onboarding ও community access সম্পন্ন করে।" },
  ],

  finalCta: {
    title: "AI শেখার সময় শেষ। এবার Build করার সময়।",
    sub: "Problem → Solution → Build → Automate → Launch → Sell → Grow",
    cta: { label: "AI Solution Builder Live Batch-এ Join করুন →", href: "#offer" },
  },

  stickyCta: { label: "Live Batch-এ Join করুন →", href: "#offer" },
};

export type LiveBatchConfig = typeof liveBatch;
