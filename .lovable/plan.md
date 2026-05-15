## Goal

Existing `/admin` panel আছে এবং Leads, Bookings, Meetings, Clients, Courses, Students, Community, Payments, CMS, Settings সব আছে। কিন্তু **supervisor (super-admin) এর জন্য কিছু critical view missing**:

| Missing | Why it matters |
|---|---|
| **Users & Auth viewer** | সব signed-up user, role, last login, account_type এক জায়গায় দেখা যায় না |
| **Files / Storage browser** | `cms-media` ও `payment-screenshots` bucket-এর সব file browse/download/delete করা যায় না |
| **Activity Log viewer** | `activity_log` table আছে কিন্তু UI নেই |
| **Payment screenshot preview** | payments page-এ screenshot signed URL দিয়ে দেখা যায় না (verify করতে হলে দরকার) |

## What I'll build

### 1. New route: `/admin/users` (Users & Auth)
- সব profile + role list (search, filter by role/account_type)
- Promote / demote role (admin / student / client)
- Last login, signup date, email, phone
- Server-fn দিয়ে `supabaseAdmin.auth.admin.listUsers()` call করে auth.users data merge

### 2. New route: `/admin/files` (Storage browser)
- Two tabs: **CMS Media** + **Payment Screenshots**
- File grid + preview + signed-URL download + delete
- Upload to cms-media থেকে directly

### 3. New route: `/admin/activity` (Activity Log)
- `activity_log` table-এর realtime feed
- Filter by user, action, date range

### 4. Enhance `/admin/payments`
- প্রতি row-এ screenshot thumbnail + click করলে signed URL preview modal
- Verify / reject button (status update + auto-enroll trigger fire হবে)

### 5. AdminShell update
- Sidebar-এ ৩টা নতুন nav item: **Users**, **Files**, **Activity**

## Technical notes

- **Server function** `src/lib/admin/users.functions.ts` — uses `supabaseAdmin` to list auth users (browser client RLS দিয়ে auth.users access করা যায় না)। `requireSupabaseAuth` middleware + admin role check।
- **Storage browser** — browser client থেকে `supabase.storage.from(bucket).list()` কাজ করে যেহেতু admin RLS bypass-এর জন্য bucket policy already configured আছে। Signed URL `createSignedUrl(path, 3600)`।
- কোনো DB schema change লাগবে না — সব existing tables/buckets ব্যবহার হবে।
- কোনো নতুন secret বা integration লাগবে না।

## Files to create
```
src/lib/admin/users.functions.ts          (server fn)
src/routes/_admin/admin.users.tsx
src/routes/_admin/admin.files.tsx
src/routes/_admin/admin.activity.tsx
src/components/admin/PaymentScreenshotPreview.tsx
```

## Files to modify
```
src/components/admin/AdminShell.tsx       (3 nav items)
src/routes/_admin/admin.payments.tsx      (screenshot preview + verify button)
```

Approve করলে আমি implement শুরু করব।