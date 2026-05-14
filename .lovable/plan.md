## Plan: Add count-up animation to hero stats

Add a number counting animation to the four stat cards (10K+ Students, 5K+ Projects, 98% Success Rate, 50+ Countries) in the hero section. Existing float animation, glass styling, icons, and labels stay exactly the same.

### Changes

**1. Update `src/components/site/hero/FloatingStat.tsx`**
- Accept an optional numeric `value` (or parse the string like `"10K+"`, `"5K+"`, `"98%"`, `"50+"`).
- Add a `useCountUp` effect using `framer-motion`'s `useMotionValue` + `animate` (already a dependency) that:
  - Starts at 0
  - Animates to the target number over ~1.8s with `easeOut`
  - Triggers once when the card scrolls into view (`useInView` from framer-motion)
- Render the animated number with the original suffix preserved (`K+`, `%`, `+`).
- Keep the existing `animate-float`, glass styling, delay, icon, label — nothing else changes.

**2. No changes to `SpaceHero.tsx`**
- The same `value="10K+"` etc. props keep working; the parsing happens inside `FloatingStat`.

### Technical notes
- Parse logic: extract leading number + multiplier (`K` → ×1000, `M` → ×1000000) and suffix (`+`, `%`).
- During animation, format back: if original had `K`, show `Math.round(n/1000) + "K"` etc.
- Use `useRef` + `useInView(ref, { once: true, margin: "-50px" })` so the count starts when visible.
- Respect `prefers-reduced-motion`: skip animation and show final value immediately.