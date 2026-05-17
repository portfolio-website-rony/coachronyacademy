## Show enrolled student counts per course (Admin)

Add a "Students" column to **Admin → Courses** showing how many users have enrolled in each course, and let admins click the number to see the full list of enrolled students.

### Changes

**1. `src/routes/_admin/admin.courses.tsx`** — list page
- After loading courses, fetch enrollment counts in one query:
  `supabase.from("enrollments").select("course_id").in("course_id", ids)` → group by `course_id` in JS to build `{ [courseId]: count }`.
- Add a new **Students** column in the table showing the count (e.g. `12`), styled as a chip.
- Wrap the count in a `<Link to="/admin/courses/$courseId/students" params={{ courseId: c.id }}>` so admin can drill in.

**2. New route `src/routes/_admin/admin.courses_.$courseId.students.tsx`** — enrolled students page
- Header: course title + total count.
- Fetch enrollments for the course joined with profile info:
  ```
  supabase
    .from("enrollments")
    .select("id,status,enrolled_at,completed_at,user_id,profile:profiles(display_name,avatar_url,phone)")
    .eq("course_id", courseId)
    .order("enrolled_at", { ascending: false });
  ```
- Render a table: Avatar + name, status badge (active/completed), enrolled date, completed date, phone (if any).
- Empty state when zero enrollments.
- Back link to `/admin/courses/{id}` (edit) and `/admin/courses` (list).

### Out of scope
- Email column (not in `profiles`; would need admin auth API — can add later via a server fn if you want).
- Manual enroll/unenroll from this page.
- CSV export.

Want me to also add email (via a small server function using `supabaseAdmin`) on the students page?