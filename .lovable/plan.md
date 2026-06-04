
# Admin Students পেজ — সব তথ্য এক জায়গায়

## লক্ষ্য
`/admin/students` পেজে প্রতিটি স্টুডেন্টের নাম, ইমেইল, ফোন, এবং তার এনরোল করা সব কোর্স একসাথে দেখা যাবে। বর্তমানে প্রতিটি এনরোলমেন্ট আলাদা সারিতে দেখায় এবং ইমেইল নেই।

## কী পরিবর্তন হবে

### 1. নতুন server function: `listAllStudents`
ফাইল: `src/lib/admin/students.functions.ts` (নতুন)
- `requireSupabaseAuth` + `assertAdmin` দিয়ে protect করা
- `supabaseAdmin` ব্যবহার করে:
  - সব `enrollments` (course সহ) আনা
  - সংশ্লিষ্ট `profiles` (display_name, phone, avatar)
  - `auth.admin.listUsers()` থেকে email
  - প্রতি enrollment-এর progress (lesson_progress / total lessons)
- প্রতি user-এর জন্য grouped output:
  ```
  { user_id, email, name, phone, avatar_url,
    courses: [{ enrollment_id, title, status, progress, enrolled_at, completed_at }] }
  ```

### 2. `src/routes/_admin/admin.students.tsx` রিরাইট
- ক্লায়েন্ট-সাইড supabase queries সরিয়ে নতুন server function ব্যবহার
- লেআউট: প্রতি স্টুডেন্ট একটি কার্ড/সারি
  - বাম পাশে: avatar + name + email + phone
  - ডান পাশে: enrolled কোর্সের লিস্ট (badge সহ status + progress bar)
  - কোর্স সংখ্যা, completed কোর্স সংখ্যা
- উপরে সার্চ বার (name / email / phone / course title)
- প্রতিটি কোর্স row-তে Revoke বাটন (আগের মতো)

### 3. Sidebar/NAV অপরিবর্তিত
"Students" লিঙ্ক আগে থেকেই `AdminShell` এ আছে — শুধু পেজের কন্টেন্ট উন্নত হবে।

## টেকনিক্যাল ডিটেইল
- Email শুধু server-side পাওয়া যায় (auth.admin), তাই অবশ্যই server function লাগবে — ক্লায়েন্ট থেকে সরাসরি query করা যাবে না।
- Existing `listAllUsers` pattern (`src/lib/admin/users.functions.ts`) follow করব।
- Progress calculation server-side aggregate করা হবে (N+1 এড়াতে একবারে fetch + group)।
- Revoke action আগের `supabase.from("enrollments").delete()` রেখে দেব (RLS admin policy আছে), অথবা একই ফাইলে `revokeEnrollment` server fn যোগ করব।

## কী পরিবর্তন হবে না
- কোনো DB schema change নেই
- অন্য কোনো admin পেজ touch করা হবে না
- Coupon/checkout logic অপরিবর্তিত
