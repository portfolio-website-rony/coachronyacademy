## Problem
The site `Header` is `sticky top-0 z-40`, but the dashboard sidebar is `lg:static`. When the user scrolls, the sidebar moves up with the page and slides *behind* the sticky header — causing the visual overlap shown in the screenshot.

## Fix (one file)
**`src/components/dashboard/DashboardShell.tsx`** — change the `<aside>` classes only:

- Replace `lg:static lg:translate-x-0` with:
  - `lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:translate-x-0 lg:self-start`
- Add `lg:z-30` (mobile drawer keeps `z-40`, header stays `z-40` so it always sits above).

Result: on desktop the sidebar stays pinned just below the header while the main content scrolls. No more overlap.

## Out of scope
- No changes to `Header.tsx`, routes, auth, or any logic.
- Mobile drawer behavior unchanged.
