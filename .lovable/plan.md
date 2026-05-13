## Problem

`/programs` page এর "Enroll Now" / "Apply" বাটনগুলো `/programs` (নিজের পেজ) এ link করা — তাই click করলে কিছুই হয় না বলে মনে হয়। আবার `courses` table-এ এখনও কোনো course seed করা নেই, তাই সরাসরি `/student/courses/$slug` এ পাঠালেও 404-ই হবে।

## Fix

### 1. Database — seed 4 courses matching the 4 programs

Migration: `courses` table-এ insert করব (published=true) —

| program | slug |
|---|---|
| AI Free Class | `ai-free-class` |
| AI Creator Masterclass | `ai-creator-masterclass` |
| Vibe Coding Bootcamp | `vibe-coding-bootcamp` |
| 1:1 AI Business Mentorship | `ai-business-mentorship` |

প্রতিটা course-এ একটা placeholder module + intro lesson (is_preview=true) যাতে enroll না করেও preview পাওয়া যায়। Admin পরে `/admin/courses` থেকে content edit করতে পারবে।

### 2. Programs data — point each card to its slug

`src/lib/site-data.ts`: `PROGRAMS[].href` চারটাই বদলে `/student/courses/{slug}` এ map করব। 1:1 Mentorship-এর "Book Discovery" বাটন `/book` রাখাই থাকবে (সেটা enrollment না, discovery call)।

### 3. Unauthenticated redirect

`/student/courses/$slug` এখন `_student` layout এর under, যেটা session না থাকলে `/login` এ পাঠায়। সমস্যা: login এর পর user আবার course-এ ফিরে আসে না।

Fix: `_student.tsx`-এ redirect-এর সময় current pathname-কে `?returnTo=` query-এ pass করব, আর `login.tsx` + `signup.tsx`-এ login সফল হলে `returnTo` থাকলে সেখানে navigate করব।

### 4. Programs card CTA — use Link properly

বর্তমানে `<Link to={p.href}>` use হচ্ছে। TanStack Router type-strict; static path দিলে কাজ করে কিন্তু dynamic slug-এর জন্য `to="/student/courses/$slug"` + `params` pattern বেশি safe। `programs.tsx`-এ conditional render করব: যদি href dynamic course হয় → typed Link; না হলে normal Link।

## Files

- **Migration**: insert 4 courses + 4 modules + 4 preview lessons
- **Edit** `src/lib/site-data.ts` — update href values
- **Edit** `src/routes/programs.tsx` — typed Link for course routes
- **Edit** `src/routes/_student.tsx` — pass `returnTo` on unauth redirect
- **Edit** `src/routes/login.tsx` and `src/routes/signup.tsx` — honor `returnTo`

## Out of scope

- Real course content (admin will add via `/admin/courses`)
- Paid checkout (project is free-only per earlier decision)
- Mentorship booking flow changes
