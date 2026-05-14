## লক্ষ্য

লেসন ভিডিওতে যেন কেউ YouTube-এ গিয়ে video না দেখতে পারে, share button না পায়, এবং download/screen recording নিরুৎসাহিত হয়।

## কী পরিবর্তন হবে

শুধু `src/components/learn/YouTubePlayer.tsx` ফাইল আপডেট হবে। অন্য কোনো logic/route/data পরিবর্তন হবে না।

### 1. YouTube branding ও share button লুকানো

YouTube IFrame API সরাসরি share button hide করার option দেয় না, তাই overlay দিয়ে block করতে হবে:

- Player container-এর উপরে `relative` wrapper।
- **Top bar overlay** (top-right কোণে ~120px × 50px): video title + share/CC/settings button যেই এলাকায় আসে, সেটার উপরে transparent div বসিয়ে click block করা — তবে play/pause-এর জন্য center ফাঁকা থাকবে।
- **Bottom-right YouTube logo overlay**: ছোট transparent div, যাতে কেউ logo-তে click করে YouTube-এ যেতে না পারে।
- `playerVars`-এ `modestbranding: 1`, `rel: 0`, `iv_load_policy: 3`, `fs: 0` (fullscreen disable, কারণ fullscreen-এ share বের হয়), `disablekb: 1` যোগ করা।

### 2. Right-click + drag block

- Player wrapper-এ `onContextMenu={e => e.preventDefault()}` — right-click "copy video URL" block।
- CSS: `user-select: none`, `-webkit-user-drag: none`।

### 3. Screen recording deterrent

ব্রাউজারে screen recording **পুরোপুরি বন্ধ করা সম্ভব না** (এটা OS-level, browser এর hand এর বাইরে)। তবে কিছু deterrent দেওয়া যায়:

- ভিডিওর উপরে subtle watermark overlay (logged-in user-এর email/নাম, কম opacity-তে) — recording হলে চেনা যাবে কে করেছে।
- DevTools/Print-screen শুধু visual deterrent হিসেবে, কিন্তু এটা bypass করা সহজ।

**সততার সাথে**: screen recording 100% বন্ধ করা যায় না কোনো web app-এ (Netflix/YouTube-ও পারে না সব ক্ষেত্রে)। শুধু কঠিন করা যায়।

## কী অপরিবর্তিত থাকবে

- Speed selector, progress tracking, lesson navigation, enrollment logic — সব same।
- Video play/pause normal কাজ করবে।

## একটা প্রশ্ন

Watermark overlay-তে user-এর কোন info দেখাব?
- (a) Email
- (b) Full name
- (c) কিছু না — শুধু share/logo block যথেষ্ট

জানালে সেইভাবে implement করব।
