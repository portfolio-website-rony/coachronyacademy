## Goal
Admin course editor-e modules ar lessons re-order korar feature add kora — up/down arrow buttons diye (simple, reliable). Drag-and-drop chaile pore add korbo, but starting with buttons karon code change kom + mobile-friendly + no extra dependency.

## Changes

### `src/routes/_admin/admin.courses_.$courseId.tsx`

**1) Add `moveModule(index, dir: -1 | 1)` helper:**
- Swap `display_order` between current module ar neighbor
- Bulk update via 2 supabase calls (update both rows)
- Re-fetch modules list (or local optimistic swap)
- Toast "Reordered"

**2) Add `moveLesson(moduleId, index, dir: -1 | 1)` helper:**
- Same pattern but scoped to lessons of that module (filter by module_id, sort by display_order)
- Swap display_order between two lessons
- Bulk update + refresh

**3) Module card UI — add up/down buttons:**
- Beside the module title input, add two icon buttons (`ChevronUp`, `ChevronDown` from lucide-react)
- Disable up button on first module, down on last
- Click → call `moveModule`

**4) Lesson row UI — add up/down buttons:**
- Similar two icon buttons at the start of each lesson row
- Disable on first/last lesson within module
- Click → call `moveLesson`

**5) Defensive normalization (optional but small):**
- Before swap, if any `display_order` values are duplicates/null, normalize them to 0..n-1 first to guarantee swap works

### Why up/down buttons over drag-and-drop
- No new dependency (`@dnd-kit/*` would add ~30KB)
- Works on touch + keyboard accessible
- Simpler code, fewer bugs
- Can layer drag-and-drop on top later if needed

## Out of scope
- Drag-and-drop (can add later with @dnd-kit if requested)
- Cross-module lesson move (lesson stays in its module)
- DB schema change — `display_order` column already exists
