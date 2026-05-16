## Goal
Admin panel-e course edit page-e jokhon YouTube link paste kora hobe, tokhon duration (minutes) **automatically** populate hobe. Same behavior lesson-er YouTube URL → lesson `duration_seconds` o auto-fill korbo.

## How it works
YouTube oEmbed-e duration thake na, ar API key dorkar holey extra setup lage. Tai ekta **server function** banabo je YouTube watch page-er HTML fetch kore `"lengthSeconds":"NNN"` regex diye duration ber korbe. No API key, no user setup.

## Changes

### 1. New file — `src/lib/admin/youtube-duration.functions.ts`
- `getYoutubeDuration` server fn (`createServerFn` + `requireSupabaseAuth` + admin check)
- Zod input: `{ url: string }`
- Server-side: fetch `https://www.youtube.com/watch?v=<id>` with a normal browser User-Agent, regex `"lengthSeconds":"(\d+)"`, return `{ seconds: number }`
- Returns `{ seconds: 0 }` if URL invalid / parsing fails (no throw → graceful)

### 2. `src/routes/_admin/admin.courses_.$courseId.tsx`
- Import `getYoutubeDuration` + `useServerFn`
- **Promo Video URL field**: `onBlur` (and after paste) → if URL valid → call server fn → set `course.duration_minutes = Math.round(seconds / 60)`
  - Show a small inline hint while loading: "Fetching duration…"
  - Toast on success: "Duration auto-filled: X min"
- **Lesson `youtube_url` field** (same file, line ~763): same behavior → set `l.duration_seconds = seconds`
- Don't overwrite if fetch fails or returns 0; admin can still manually edit

### 3. No DB migration needed — existing `duration_minutes` / `duration_seconds` columns used as-is

## UX
- Auto-fill triggers on blur of the URL input (paste + tab/click away)
- Small "Auto" badge next to the duration field after auto-fill
- Manual edit always wins (just type over the value)

## Out of scope
- Total course duration auto-sum from all lessons (separate request)
- Live courses / non-YouTube providers
