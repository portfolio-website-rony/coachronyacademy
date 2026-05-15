## Plan: Add "Learn with Coach Rony" Course

### Course Details
- **Title:** Learn with Coach Rony — 10 Day Digital Product Challenge
- **Slug:** `learn-with-coach-rony`
- **Type:** Live (scheduled classes)
- **Price:** ৳ 10,000 BDT
- **Language:** Bangla
- **Level:** Beginner
- **Tagline:** "Freelancing থেকে Digital Product Business — ১০ দিনে প্রথম income এর roadmap"
- **Description:** এই ১০ দিনের challenge-এ শিখবেন কিভাবে freelancing থেকে নিজের digital product business শুরু করবেন। Website setup, Facebook marketing, এবং প্রথম ১,০০০ থেকে ১০,০০০ টাকা income করার সম্পূর্ণ roadmap।
- **Cover image:** Placeholder (you'll upload later via admin)
- **Promo video:** Empty for now
- **Published:** `true` (so it appears on `/courses`)

### What gets created (single migration / insert)
1. **Course row** in `courses` table with the above fields.
2. **10 placeholder modules** in `course_modules`:
   - Day 1 — Niche Selection & Mindset
   - Day 2 — Digital Product Idea Validation
   - Day 3 — Website Setup
   - Day 4 — Product Creation
   - Day 5 — Sales Page & Payment Setup
   - Day 6 — Facebook Page & Content Strategy
   - Day 7 — Facebook Marketing & Ads Basics
   - Day 8 — First ১,০০০ Taka Roadmap
   - Day 9 — Scaling to ১০,০০০ Taka
   - Day 10 — Long-term Business Setup
3. Each module gets one placeholder lesson so structure is editable from the admin panel later.
4. `learn_outcomes`, `who_for`, `requirements` left as small placeholder arrays — editable from admin.

### Where it appears
- Listed on `/courses`
- Detail page at `/courses/learn-with-coach-rony`
- Editable from admin CMS → Courses (titles, lessons, video URLs, schedule, cover, price all editable)

### Next steps after approval
You can edit any placeholder content (module titles, lesson videos, cover image, live schedule URL, learn outcomes, etc.) from the admin panel. Just give me details when ready and I can also pre-fill them.
