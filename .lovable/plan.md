## লক্ষ্য

Attached image-এর মতো student dashboard-এর **উপরে public site-এর header** আর **নিচে footer** persist করবে। মাঝে এখনকার sidebar + content layout আগের মতোই থাকবে (Dashboard, My Courses, Workshops, Ebooks, Bundles, Certificates ইত্যাদি)।

অর্থাৎ student area-এ user যেদিকেই navigate করুক — top-এ logo + Bangla nav (হোম/কোর্স/বান্ডেল/ওয়ার্কশপ/ই-বুক/ব্লগ) + notification bell + theme toggle + avatar dropdown সব সময় দেখাবে; left sidebar শুধু dashboard-এর ভেতরের পাতাগুলো switch করবে।

## পরিবর্তন কোথায়

মূলত দুটি জায়গা:

### 1. `src/components/site/Header.tsx` — upgrade করব

বর্তমান header-এ English nav + "Login / Book a Call" button আছে। Image-এর সাথে মেলাতে যোগ হবে:
- **Search input** (logo-এর পাশে, desktop-এ)
- **Bangla nav labels** project-এর বাকি জায়গায় ব্যবহৃত wording অনুসারে: হোম, কোর্স, বান্ডেল, ওয়ার্কশপ, ই-বুক, ব্লগ
- **Notification bell** — logged-in হলে existing `<UserBell />` reuse
- **Theme toggle pill** (sun/moon) — visual only এখন (dark theme লেখা আছে), পরে hook up করা trivial
- **Avatar dropdown** — logged-in হলে existing `DashboardShell`-এর avatar dropdown logic-ই reuse করব (My Profile / My Courses / My Ebooks / Settings / Logout)। Logged-out হলে আগের মতো Login button।

Mobile-এ একই content hamburger menu-তে থাকবে।

### 2. `src/components/dashboard/DashboardShell.tsx` — top header অংশ সরাব

DashboardShell এখন নিজের একটা top header (welcome text + bell + avatar) render করে। নতুন setup-এ সেটা duplicate হয়ে যাবে, তাই DashboardShell-এর top `<header>` block remove করে শুধু **sidebar + main content** রাখব। Avatar dropdown-এর সব logic site Header-এ চলে যাবে।

Sidebar-এর ভেতরের brand/logo, nav items, logout — সব আগের মতোই থাকবে।

### 3. Student/Client/Admin layout-এ Header + Footer wrap

`src/routes/_student.tsx`, `src/routes/_client.tsx`, এবং `src/routes/_admin.tsx`-এ DashboardShell-কে `<Header />` আর `<Footer />`-এর মাঝে wrap করব:

```text
<Header />
<DashboardShell>      // sidebar + main
  <Outlet />
</DashboardShell>
<Footer />
```

এতে dashboard-এর যেকোনো page-এ top header আর footer দেখাবে।

## যা touch হচ্ছে না

- Routes, DB, RLS, profile schema, avatar upload, course/ebook logic — কিছুই না।
- Public marketing pages (Home, About, Courses ইত্যাদি) আগের মতোই কাজ করবে — শুধু header upgrade হওয়ায় ওগুলোতেও নতুন nav/search/bell/avatar দেখাবে (যেটা আসলে user চাইছে)।

## ছোট কিছু সিদ্ধান্ত আপনার confirm দরকার

1. **Search box** এখন static থাকবে (সাবমিট করলে `/courses?q=...`-এ যাবে), নাকি এই step-এ skip করব?
2. **Theme toggle pill** শুধু visual রাখব (image-এর মতো দেখাবে কিন্তু এখন কিছু করবে না), নাকি আসলেই light/dark switch implement করব?
3. **Footer**-ও কি sticky-style সব dashboard page-এ চাই, নাকি শুধু header টা enough?

ঠিক থাকলে implement করে দিচ্ছি।