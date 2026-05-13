## Goal
"Ready to level up?" সেকশনে LeadForm-এর নিচে দুটো quick-contact button যোগ করা — **WhatsApp** এবং **Direct Call** — যাতে user form fill না করেও সরাসরি যোগাযোগ করতে পারে।

## Changes

### `src/routes/index.tsx` — LEAD CAPTURE section
- `useContactSettings()` hook import ও call করা (already exists in `src/lib/site-settings.ts`, defaults: `whatsapp: "8801700000000"`)।
- `GlassCard`-এর ভেতর `<LeadForm />`-এর নিচে একটা small divider ("or") + ২টো button row:
  - **WhatsApp button** — green tone, `MessageCircle` (lucide) icon, opens `https://wa.me/{whatsapp}?text=...` নতুন tab-এ।
  - **Call button** — primary/outline, `Phone` icon, `tel:+{whatsapp}` link।
- দুটো button mobile-এ stacked, sm+ এ side-by-side (`grid-cols-1 sm:grid-cols-2 gap-3`)।
- Existing `Button` component reuse, `asChild` pattern with `<a>`।

```text
┌── GlassCard ─────────────────┐
│  [LeadForm fields]           │
│  [Get Free Consultation]     │
│  ──────  or  ──────          │
│  [💬 WhatsApp] [📞 Call Now] │
└──────────────────────────────┘
```

## Scope
- শুধু `src/routes/index.tsx`-এর LEAD CAPTURE section।
- LeadForm component, settings, অন্য সেকশন — touch হবে না।
- Component হিসেবে `useContactSettings` hook ব্যবহার, যাতে admin-এ number update করলে এখানেও sync হয়।

## Out of scope
- Form logic বা validation — অপরিবর্তিত।
- Floating action button (already exists separately) — touch করা হবে না।
