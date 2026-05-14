## Goal
Hero section-এ uploaded "Mission | Teach AI to 1M People" badge image-টি header section-এর ঠিক নিচে add করা।

## Steps

1. **Copy uploaded image to project**
   - `user-uploads://image-29.png` → `src/assets/mission-badge.png`

2. **Update `src/components/site/hero/SpaceHero.tsx`**
   - Import the badge image as ES6 module
   - Currently the existing text-based "Mission | Teach AI to 1M People" pill (lines ~71-79, the `motion.div` with Rocket-style mission text) sits below the H1
   - Replace that text-based mission pill with the uploaded image, OR add the image at the very top of the hero content (just below header) — based on user request "header section-er niche thakbe", will place it as the first element above the OrbitSystem
   - Use `<img>` with proper alt text, centered, max-width constrained (~400px), with subtle entrance animation matching existing motion style
   - Keep the existing mission text pill removed to avoid duplication (since the image already conveys the same message)

## Technical notes
- Image will be imported: `import missionBadge from "@/assets/mission-badge.png"`
- Rendered as `<motion.img>` with framer-motion fade-in
- No business logic, no data changes — pure presentational addition
- Responsive: scales down on mobile via `max-w-full` + `w-[380px]`

## Question
Image-টি কি **header-এর ঠিক নিচে** (hero-এর top-এ, OrbitSystem-এর আগে) বসবে, নাকি **existing text mission pill-এর জায়গায়** (H1-এর নিচে) replace করবে? Plan-এ আমি **hero-এর top-এ** রেখেছি এবং duplicate text pill remove করেছি — confirm করলে implement করব।
