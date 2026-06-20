# Cloudflare migration plan — সত্যি কথা প্রথমে

## ⚠️ গুরুত্বপূর্ণ বাস্তবতা

এই Lovable project থেকে **Lovable Cloud (Supabase) disconnect করা যায় না** — এটা platform-এর rule. তাই "এই project-টাই Cloudflare backend-এ চলবে" এটা সম্ভব না।

তোমার দুটো realistic path আছে। আমি দুটোই execute করতে পারি — তুমি বললে।

---

## Path A — Domain + Hosting Cloudflare-এ, Backend Lovable Cloud-এ (Recommended)

**কী হবে:**
- `coachrony.com` Cloudflare DNS-এ থাকবে (তুমি যা চাইছিলে)
- Frontend Lovable hosting থেকে serve হবে, Cloudflare proxy-র পেছনে
- Backend (database, auth, payments, users, courses) Lovable Cloud-এ unchanged থাকবে
- **কোনো data loss নেই**, কোনো user-কে password reset করতে হবে না
- 1 দিনে সব live

**Steps:**
1. Lovable-এ `coachrony.com` connect (Settings → Domains → Connect Domain)
2. Cloudflare DNS: A record `@` → `185.158.133.1`, A record `www` → `185.158.133.1`, TXT `_lovable` → Lovable-এর verification value
3. Cloudflare-এ proxy mode (orange cloud) ON — Lovable connect dialog-এর "Advanced → uses Cloudflare proxy" check করতে হবে
4. SSL auto-provision (5 min – 72 hr)
5. Vercel deployment delete

**সুবিধা:** Cloudflare CDN/DDoS/cache পাবে, কিন্তু backend reliable Lovable Cloud-এ। তোমার সব visitor data, enrollments, payments, leads — সব intact।

---

## Path B — সব data CSV export করে দেব, তুমি নিজে নতুন Cloudflare app বানাবে

**কী হবে:**
- আমি সব 36 tables-এর data CSV-তে export করে `/mnt/documents/coachrony-backup/` এ দেব:
  - `profiles.csv`, `user_roles.csv`, `enrollments.csv`, `payments.csv`, `leads.csv`, `bookings.csv`, `courses.csv`, `course_modules.csv`, `course_lessons.csv`, `lesson_progress.csv`, `community_posts.csv`, `community_comments.csv`, `notifications.csv`, `cms_*` tables, ইত্যাদি
  - সব storage files (cms-media, payment-screenshots) এর list + download URL
  - Full database schema SQL dump
- তুমি এই data নিয়ে আলাদা Cloudflare project (D1 + R2 + Workers + Cloudflare Access/Better-Auth) বানাবে — Lovable-এর বাইরে
- এই Lovable project unchanged থাকবে (চাইলে পরে delete করতে পারবে)

**গুরুত্বপূর্ণ limitation:**
- User passwords export করা যায় না (Supabase Auth-এ encrypted) — সব user-কে Cloudflare-এ password reset/re-signup করতে হবে
- Cloudflare D1 = SQLite, Postgres-এর enum/RLS/triggers নেই — সব logic rewrite লাগবে
- এটা কয়েক সপ্তাহের development work, Lovable platform-এ possible না

---

## আমার সুপারিশ

**Path A করো।** তুমি যে আসল problem solve করতে চাইছ (coachrony.com Cloudflare-এ + 404 fix), সেটা Path A-তে fully solved হয়, data loss ছাড়া, complexity ছাড়া। Cloudflare-এর সব benefit (CDN, DDoS, caching, analytics) পাবে।

Path B শুধু যদি Lovable platform পুরোপুরি ছাড়তে চাও — তাহলে আমি data export টা পরিষ্কার ভাবে দিয়ে দেব, কিন্তু নতুন app build আমি এই project-এ করতে পারব না।

---

## এই plan approve করলে আমি কী করব

- **Path A:** তোমাকে Cloudflare DNS configuration step-by-step দেব, Lovable Domain connect করব, Vercel cleanup guide দেব
- **Path B:** সব tables `/mnt/documents/coachrony-backup/` এ CSV হিসেবে export করব, schema SQL ও storage file list সহ, একটা README দিয়ে কীভাবে Cloudflare-এ import করবে সেটা ব্যাখ্যা করব

**তুমি কোনটা চাও — A, B, নাকি দুটোই (data export + Path A)?**
