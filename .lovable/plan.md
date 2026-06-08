## Manual Enrollment from Admin Panel

Add ability for admin to manually enroll a user into a course by entering their email address.

### Where it goes
On the **Admin → Students** page (`src/routes/_admin/admin.students.tsx`), add a new **"Manual Enroll"** button next to the existing "Download CSV" button. Clicking it opens a dialog with:

- **Email** input (required) — the student's registered email
- **Course** select (required) — dropdown of all published courses
- **Status** select — defaults to `active` (options: active, completed)
- **Enroll** button

### How it works
1. New server function `manualEnroll` in `src/lib/admin/students.functions.ts`:
   - Admin-gated (`requireSupabaseAuth` + `assertAdmin`)
   - Input: `{ email, courseId, status }` (validated with Zod)
   - Looks up the user by email via `supabaseAdmin.auth.admin.listUsers` (paginated search)
   - If user not found → return clear error ("No user with this email. Ask them to sign up first.")
   - If found → upsert into `enrollments` (unique on `user_id + course_id`) with chosen status
   - Returns `{ ok, alreadyEnrolled }` so UI can show the right toast
2. New server function `listCoursesForEnroll` — returns `id, title, slug` of all courses (admin needs to pick from any, not just published)
3. On success → toast + refetch the students list (existing `useQuery`)

### Notes
- Email validation uses the existing `safeEmail` schema from `src/lib/security/schemas.ts`
- We do NOT create new users — admin must invite/the student must sign up first (keeps auth flow clean and avoids accidental account creation)
- Existing `auto_enroll_on_payment` trigger is untouched; this is a separate manual path

### Files touched
- `src/lib/admin/students.functions.ts` — add `manualEnroll` + `listCoursesForEnroll`
- `src/routes/_admin/admin.students.tsx` — add button, dialog, form, mutation
