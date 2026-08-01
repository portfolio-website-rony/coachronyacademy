## Problem
Admin panel এ **Users** এবং **Payments** পেজে গেলে page blank/crash হয়ে যাচ্ছে, তাই user role toggle বা payment verify কিছুই করা যাচ্ছে না।

## Suspected cause (needs confirmation)
`src/lib/admin/users.functions.ts` এবং `src/lib/admin/youtube-duration.functions.ts` module-scope এ `@/integrations/supabase/client.server` import করছে। এটা server-only module, client bundle এ leak হলে route chunk load-time এ throw করে — result: blank page। `students.functions.ts` এতে সঠিক pattern (`await import(...)` handler-এর ভিতরে) ব্যবহার করা আছে, ওটাই কাজ করছে।

Payments পেজ direct supabase client দিয়ে RLS-এর মাধ্যমে চালানোর কথা, তাই crash এর কারণ আলাদা হতে পারে — Playwright দিয়ে exact error verify করা লাগবে।

## Plan

1. **Reproduce & capture exact error**
   - Playwright দিয়ে signed-in admin session restore করে `/admin/users` এবং `/admin/payments` visit করে console error + screenshot নেব — root cause confirm করতে।

2. **Fix server-only import leak** (`src/lib/admin/users.functions.ts`, `src/lib/admin/youtube-duration.functions.ts`)
   - Module-scope `import { supabaseAdmin } from "@/integrations/supabase/client.server"` সরিয়ে প্রত্যেক `.handler()` ভিতরে `const { supabaseAdmin } = await import("@/integrations/supabase/client.server")` করব (students.functions.ts যেভাবে করে)।

3. **Fix payments page (only if Step 1 shows a bug there)**
   - Console error অনুযায়ী targeted fix — e.g. RLS-related error message, missing column, বা component-level throw।

4. **Verify**
   - Preview restart → Playwright দিয়ে দুই পেজ open, `Verify` button + `Make admin` button ক্লিক করে ok toast আসে confirm।

## Out of scope
- DB schema / RLS পরিবর্তন (existing policies ঠিক আছে)।
- UI redesign।
