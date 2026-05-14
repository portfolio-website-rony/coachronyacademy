## Goal
Stats bar-er number-gulo (157,680,000+, 43,800+, 10,000+, 500+, 50+) scroll-e elei count-up animate hobe — same effect jeta hero-r FloatingStat-e ache.

## Changes

1. **New file `src/components/site/CountUp.tsx`**
   - Extract reusable `CountUp` + `parseValue` from `FloatingStat.tsx` (no logic change).
   - Export as named `CountUp`.

2. **Update `src/components/site/hero/FloatingStat.tsx`**
   - Remove local `parseValue` + `CountUp`, import from `@/components/site/CountUp` instead. Keeps existing behavior identical.

3. **Update `src/routes/index.tsx`**
   - Import `CountUp`, replace `{s.value}` (line 35) with `<CountUp raw={s.value} />`. Styling/layout untouched.

## Notes
- `157,680,000+` will animate as a comma-formatted integer count-up over ~1.8s, triggered once when the bar enters viewport.
- `useReducedMotion` respected.
- Pure frontend/visual change; no data or business logic touched.