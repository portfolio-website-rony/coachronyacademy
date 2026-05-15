## Add Work Experience Section to About Page

Currently `<WorkExperience />` only renders on the home page (`/`). User wants it also on the About page (`/about`) — same component, same data source, no duplication of logic.

### Change

**File:** `src/routes/about.tsx`
- Import `WorkExperience` from `@/components/site/WorkExperience`
- Render `<WorkExperience />` between the "Social proof badges" section and the "Skill / Expertise grid" section (so it appears mid-page, after trust badges and before expertise cards — natural spot for credibility content)

### What stays the same

- Same admin panel manages it (CMS → Work Experience tab) — edits show up in both places automatically
- Same data, same marquee, same styling
- No DB or hook changes
