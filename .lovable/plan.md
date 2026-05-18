
# Plan: Update "Vibe Coding Bootcamp" with full new content

Target course in DB: **Vibe Coding Bootcamp** (`slug: vibe-coding-bootcamp`, id `671bde3f-...`).
Currently it has only **1 module / 1 lesson / 3 FAQs**. We will fully replace its content with the new bootcamp structure (10 modules, ~52 classes, new FAQs, hero copy, outcomes, etc.).

All changes happen in the database (course content lives there and renders automatically on `/courses/vibe-coding-bootcamp`). **No frontend code changes are needed.** After this is done, you only need to open the admin panel and paste the YouTube link into each lesson — everything else (titles, ordering, descriptions, module grouping, preview flags) will already be set.

---

## 1. Update course fields (`courses` table)

Update the existing row (keeps id, slug, price, enrollments intact):

- **title**: `Vibe Coding Bootcamp`
- **tagline**: `Build Real AI-Powered Websites, SaaS & Digital Products Without Traditional Coding`
- **description**: Short pitch — "AI-Powered Website & SaaS Building Program by CoachRony. 8 weeks practical bootcamp in Bangla."
- **long_description**: Full "About this program / Why this program is different / What you will build" sections combined (multi-paragraph, whitespace-pre-line).
- **learn_outcomes** (array, 12 items): AI-Powered Website Development, Vibe Coding Workflow & Systems, PRD & Database Planning, Landing Page Creation, Ecommerce Website Development, LMS & Course Platform Building, SaaS Product Workflow, API & Payment Integration, Client Project Delivery System, AI Prompt Engineering for Development, Modern UI/UX Structure, GitHub & Deployment Workflow.
- **who_for** (array, 8 items): Beginners, Freelancers, Entrepreneurs, Course creators, Agency owners, Students, Digital marketers, Developers wanting AI workflows.
- **requirements** (array, 5 items): Laptop/Desktop, Stable Internet, Basic computer knowledge, Learning mindset, 8–10 hours weekly commitment.
- **instructor_name**: `Coach Rony`
- **instructor_bio**: From the "Meet Your Instructor" section.
- **level / language / currency / price**: untouched.

## 2. Replace curriculum (`course_modules` + `course_lessons`)

- Delete the existing 1 module (`Getting Started`) and its 1 lesson (`Welcome & Introduction`) for this course only.
- Insert **10 new modules** with `display_order` 1–10:

  1. Introduction to Vibe Coding (4 classes)
  2. Mastering Lovable AI (6 classes)
  3. Landing Page Mastery (6 classes)
  4. Ecommerce Website Development (11 classes)
  5. Modern UI/UX Design Workflow (4 classes)
  6. LMS & Course Platform Development (6 classes)
  7. SaaS Product Building (5 classes)
  8. AI Automation & Advanced Workflow (4 classes)
  9. Freelancing & Client Delivery (5 classes)
  10. Final Project & Graduation (1 class)

- For each class, insert a `course_lessons` row with:
  - `title` = "Class N — <name>" exactly as provided
  - `description` = the sub-bullets from your content joined as a short paragraph (so students see what the class covers)
  - `display_order` = 1..N within the module
  - `duration_seconds` = 0 (you can set later, or it will auto-fill once you paste the YouTube URL if the auto-duration feature is wired)
  - `is_preview` = `true` for **Module 1 → Class 1 (Welcome & Program Overview)** only; everything else `false`
  - `youtube_url` = `NULL` ← **you fill this from the admin panel later**

Total: **~52 lessons** inserted, all ready to receive video URLs.

## 3. Replace FAQs (`course_faqs`)

Delete the existing 3 FAQs for this course and insert the 6 new ones from your content:
1. Is this beginner friendly?
2. Do I need coding experience?
3. Will I build real projects?
4. Will I get lifetime access?
5. Is there community support?
6. Will I receive a certificate?

## 4. Out of scope

- No changes to pricing, discount, offer countdown, cover image, promo video, payment methods, or the public course detail page UI.
- No changes to testimonials (left untouched — add later from admin if you want).
- No frontend code changes — `src/routes/courses.$slug.tsx` already renders modules, lessons, outcomes, who-for, requirements, and FAQs from these tables.

---

## Technical details

One SQL migration containing:

```text
BEGIN;
UPDATE courses SET title=..., tagline=..., description=..., long_description=...,
  learn_outcomes=..., who_for=..., requirements=...,
  instructor_name=..., instructor_bio=...
WHERE id = '671bde3f-bafc-4a5f-b560-5a4bc28085dc';

DELETE FROM course_lessons WHERE module_id IN
  (SELECT id FROM course_modules WHERE course_id = '671bde3f-...');
DELETE FROM course_modules WHERE course_id = '671bde3f-...';
DELETE FROM course_faqs    WHERE course_id = '671bde3f-...';

-- Insert 10 modules with deterministic UUIDs via WITH ... RETURNING,
-- then insert all ~52 lessons referencing those module ids in one statement.
-- Insert 6 FAQs.
COMMIT;
```

After approval I will run this as a single migration. You can then go to **Admin → Courses → Vibe Coding Bootcamp → Edit** and paste the YouTube URL into each lesson; ordering, titles and descriptions will already be correct.
