## Goal
1. **Admin → Course editor**: lesson add experience ke shundor inline form e convert kora (ekhon browser `prompt()` use hoy — kharap UX).
2. **Course landing page (image 2)**: "13 min" jaiga te course-er **total duration auto-calculate** kore dekhabe (sob lessons-er `duration_seconds` jog kore), manual field-er upor depend na kore.

## Changes

### A) `src/routes/_admin/admin.courses_.$courseId.tsx` — Lesson add UI

**Replace `prompt()`-based `addLesson`** with an inline "Add lesson" card per module:
- Each module-er nicche ekta toggle button: **"+ Add lesson"**
- Click korle inline form khulbe with 3 fields:
  - **Title** (required)
  - **YouTube URL** (optional — paste korle existing auto-duration logic chole, ar `duration_seconds` populate hobe automatic)
  - **Preview checkbox** ("Free preview lesson")
- Buttons: **Add lesson** + **Cancel**
- Successful add → form reset, list refresh, toast "Lesson added"
- Add-time YouTube duration fetch ekhono kaaj korbe — same `getYoutubeDuration` server fn use korbo

Also: **Module add** o same pattern e inline kore debo (`prompt()` → inline input), karon consistency. FAQ row already inline.

Per-module footer-e show korbo: **"N lessons · Xh Ym total"** (sum of `duration_seconds` of lessons in that module) — admin-er jonno helpful.

### B) `src/routes/courses.$slug.tsx` — Total duration auto-display

Line 135 e ekhon dekhay: `formatDuration(course.duration_minutes)` (= manual field).

**Change**: compute `totalDurationMin` from lessons:
```ts
const totalDurationMin = Math.round(
  lessons.reduce((sum, l) => sum + (l.duration_seconds || 0), 0) / 60
);
const displayDuration = totalDurationMin > 0 ? totalDurationMin : course.duration_minutes;
```
Then render `formatDuration(displayDuration)`.

Effect: jodi lessons-e YouTube link diye duration auto-fill hoy, hero badge te real total (e.g. "2h 13m") dekhabe. Lessons na thakle fallback hisebe manual `duration_minutes` use hobe (backward compatible).

### C) Admin editor Basics card — label clarify

`Duration (minutes)` field-er nicche choto hint:
> "Lessons add korle total duration automatic dekhabe. Ei field optional fallback."

## Out of scope
- DB migration — no schema change
- Auto-update korar trigger Postgres-e — frontend compute enough
- Drag-and-drop lesson reorder
