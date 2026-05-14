## Plan: Remove float motion from hero stat cards, keep style

The four stat cards (10K+ Students, 5K+ Projects, 98% Success Rate, 50+ Countries) currently bob up and down via the `animate-float` class. The user wants them to stay perfectly still while keeping the exact same glass style, neon border, icons, gradient numbers, and labels.

### Change

**`src/components/site/hero/FloatingStat.tsx`**
- Remove `animate-float` class from the card wrapper.
- Remove the inline `style={{ animationDelay: ... }}` (no longer needed).
- Keep everything else: `glass-strong neon-border rounded-2xl px-4 py-3`, the framer-motion mount fade-in (initial opacity/y), the count-up number animation, icon, label.

### Not changed
- Count-up number animation stays (per previous request).
- Initial fade-in on mount stays (one-time, not looping).
- No changes to `SpaceHero.tsx` or any other file.