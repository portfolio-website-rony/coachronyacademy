## Goal
Hero-এ "AI", "Digital Products", "Future" — এই gradient lekha-গুলো এখন পেছনের glow shadow-এর কারণে faint/হালকা দেখাচ্ছে। একই color family রাখব, কিন্তু একটু deeper/darker করে দেব যাতে স্পষ্টভাবে read হয়।

## Changes (visual only)

### `src/styles.css`

**1. `--gradient-primary` (line 106) — gradient stops deeper করা**
এখন: light orange → bright glow → light gold (lightness ~0.7–0.85)
নতুন: একই hue range (orange/amber), কিন্তু lightness কমানো হবে ~0.55–0.65 এর মধ্যে এবং chroma একটু বাড়ানো — যাতে color burnt-orange / deep amber এর দিকে যায়, white-ish না থাকে।

```css
--gradient-primary: linear-gradient(
  135deg,
  oklch(0.62 0.22 35) 0%,    /* deep orange */
  oklch(0.58 0.20 30) 55%,   /* burnt orange mid */
  oklch(0.55 0.16 50) 100%   /* dark amber */
);
```

**2. `.glow-text` (lines 208–212) — shadow সামান্য নরম করা**
এখন shadow খুব bright (purple/blue glow), তাই deeper text-এর সাথে আরও balanced হবে যদি opacity একটু কমাই (55% → 35%, 35% → 20%) এবং blur একটু কমে। এতে glow থাকবে কিন্তু text-কে eat করবে না।

```css
.glow-text {
  text-shadow:
    0 0 18px oklch(0.78 0.2 290 / 35%),
    0 0 36px oklch(0.68 0.2 240 / 20%);
}
```

## Scope
- শুধু `src/styles.css`-এর ২টা token edit।
- কোনো component, layout, business logic touch হবে না।
- `text-gradient` যেখানেই use হয়েছে (hero ছাড়াও about heading ইত্যাদি) সবগুলোই একই deeper tone পাবে — consistent থাকবে।

## Out of scope
- Font, size, layout — অপরিবর্তিত।
- Glow-text class রিনেম বা remove — না।
