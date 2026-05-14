## Move Mission Pill to Top of Hero

**What**: "MISSION | Teach AI to 1M People" pill ekhon headline-er niche ache. Setake hero section-er ekdom upore (orbit system-er upore) niye jabo — jekhane red box mark kora ache.

**Where**: `src/components/site/SpaceHero.tsx`

**Changes**:
1. Mission pill `motion.div` block (currently between badge "Future of AI Learning" and paragraph text) ke remove kore hero-er top-e (OrbitSystem-er upore, first child hishebe) place korbo.
2. Centered thakbe, same glass-strong + shadow-neon-purple + gradient text style — shape, color, glow shob hubohu same thakbe.
3. Top spacing slight adjust (pt-28 → pill-er jonno breathing room).

**Result**: Pill ekdom upore center-e thakbe, orbit + headline-er flow clean hobe.
