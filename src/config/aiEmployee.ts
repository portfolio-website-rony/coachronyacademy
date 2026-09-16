export const PAYMENT_LINK = "PAYMENT_LINK";

export const aiEmployee = {
  brand: {
    name: "CoachRony Academy",
    descriptor: "AI Coach | Digital Educator | Consultant",
  },
  program: {
    name: "Build Your Own 24/7 AI Employee",
    label: "4-Day Live Program",
    regularPrice: "৳2,990",
    offerPrice: "৳690",
    dates: "Date will be announced",
    classTime: "Live class time will be announced",
  },
  paymentLink: PAYMENT_LINK,
  contact: {
    email: "coachronyacademy@gmail.com",
    phone: "+8801960254383",
    messenger: "https://m.me/coachronyacademy",
  },
  cta: {
    primary: "মাত্র ৳690-এ Join করুন",
    offer: "৳690 দিয়ে Join করুন",
    final: "৳690-এ Join করুন",
    demo: "AI Employee কীভাবে কাজ করে দেখুন",
  },
  hero: {
    headline: "Build Your Own 24/7 AI Employee",
    subheadline:
      "AI-কে সহজ ভাষায় Command দিন, আর আপনার Business-এর কাজগুলো AI দিয়ে Smartভাবে করানো শিখুন।",
    support:
      "মাত্র ৪ দিনে দেখুন কীভাবে AI ব্যবহার করে আপনার নিজের AI Employee তৈরি ও ব্যবহার করা যায়।",
  },
  problems: [
    "একই প্রশ্নের উত্তর বারবার দেওয়া",
    "Customer Follow-up",
    "Repetitive Business Tasks",
    "Manual কাজের পিছনে অনেক সময় দেওয়া",
  ],
  curriculum: [
    {
      day: "DAY 01",
      title: "AI Employee Foundation",
      description: "AI Employee কী, কোথায় ব্যবহার করবেন এবং কীভাবে কাজের জন্য AI প্রস্তুত করবেন।",
    },
    {
      day: "DAY 02",
      title: "Build Your AI Employee",
      description: "AI ব্যবহার করে নিজের AI Employee-এর basic system তৈরি করা।",
    },
    {
      day: "DAY 03",
      title: "Automation & Business Tasks",
      description: "Customer communication, repetitive tasks, workflow এবং automation নিয়ে কাজ করা।",
    },
    {
      day: "DAY 04",
      title: "Launch & Real-World Use",
      description: "আপনার AI Employee-কে বাস্তব Business workflow-এ ব্যবহার করার basic process।",
    },
  ],
  buildShowcase: ["Website", "Software", "AI Agent", "Business Automation", "AI Employee", "SaaS"],
  comparison: {
    before: ["Manual Work", "Repeated Replies", "Follow-up manually", "Time consuming", "Multiple tasks"],
    after: ["AI Assisted Work", "Smart Responses", "Automated Workflow", "More Time", "AI Employee Support"],
  },
  audience: ["Entrepreneur", "Freelancer", "Student", "Job Holder", "Small Business Owner"],
  bonuses: [
    "Practical AI Employee Templates",
    "AI Prompt / Command Templates",
    "Business Automation Resources",
    "Recorded Session Access",
    "Community Support",
  ],
  valueStack: [
    "4-Day Live Training",
    "AI Employee Building",
    "Automation Concepts",
    "Practical Resources",
    "Recorded Access",
    "Community Support",
  ],
  faqs: [
    {
      q: "AI Employee কী?",
      a: "এটি একটি AI-powered assistant বা system, যা আপনার নির্দেশনা ও workflow অনুযায়ী business task-এ সহায়তা করে।",
    },
    {
      q: "Coding জানা লাগবে কি?",
      a: "না। Beginner-friendly process-এ সহজ ভাষায় AI-কে command দেওয়া থেকে শুরু করা হবে।",
    },
    {
      q: "৪ দিনে কী শেখানো হবে?",
      a: "AI Employee-এর foundation, basic build, automation concept এবং বাস্তব workflow-এ ব্যবহার শেখানো হবে।",
    },
    {
      q: "Live class না দেখতে পারলে কী হবে?",
      a: "Program-এর recorded session access থাকবে, তাই পরে দেখে নিতে পারবেন।",
    },
    {
      q: "কারা Join করতে পারবেন?",
      a: "Entrepreneur, freelancer, student, job holder এবং small business owner—beginner হলেও join করতে পারবেন।",
    },
    {
      q: "Program শেষে কী করতে পারবো?",
      a: "নিজের প্রয়োজন অনুযায়ী একটি basic AI Employee system তৈরি ও business workflow-এ ব্যবহার শুরু করতে পারবেন।",
    },
    {
      q: "কীভাবে Join করবো?",
      a: "Join button-এ click করে registration ও payment process সম্পন্ন করুন।",
    },
  ],
} as const;

export type AiEmployeeConfig = typeof aiEmployee;