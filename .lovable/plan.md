Screenshot-এ দেখা যাচ্ছে hero image container ফাঁকা — শুধু alt text "The Success Code 30-Day Challenge" corner-এ দেখাচ্ছে, image load fail করেছে। আগের check-এ CDN থেকে HTTP 200 এসেছিল এবং Playwright-এও image render হয়েছিল, তাই এটা user-এর browser-specific issue হতে পারে (cache/service worker/ad blocker), অথবা preview vs published host-এ path resolution-এর সমস্যা।

## Diagnosis Plan

**Step 1 — Confirm exactly কোন URL fail করছে**
User-কে জিজ্ঞেস করব:
- কোন URL থেকে দেখছেন (preview `lovable.app` / published `coachronyacademy.lovable.app` / অন্য)
- Browser DevTools → Network tab-এ `success-code-hero.jpg` request-এর status code কী

**Step 2 — Reproduce করার চেষ্টা**
- Preview এবং published দুই host-এই আবার Playwright দিয়ে image load verify করব
- Response headers-এ `Content-Disposition: attachment` আছে কিনা check করব (থাকলে browser image render করবে না, download করবে)
- Cache header এবং CORS check

**Step 3 — Root cause অনুযায়ী fix**
সম্ভাব্য fix গুলো:
- যদি `Content-Disposition: attachment` return করে → asset re-upload with correct content-type, বা `<img>` না ব্যবহার করে CSS `background-image` ব্যবহার
- যদি user-এর browser cache → hard refresh instruction যথেষ্ট (কোন code change লাগবে না)
- যদি path resolution issue → absolute URL ব্যবহার করব pointer JSON থেকে
- যদি এড blocker `/__l5e/` block করছে → asset URL prefix change করা possible না, তাই alternate path-এ (যেমন `/public/`) copy করব

**Step 4 — Verify**
তিনটা page (`/success-code`, `/success-code-v2`, `/success-code-challenge`) fresh browser session-এ open করে confirm করব image visible।

## Question for you

প্লিজ একটু বলুন:
1. কোন URL-এ দেখছেন — preview link নাকি `coachronyacademy.lovable.app`?
2. একই browser-এ **Ctrl+Shift+R** (hard refresh) দিয়ে reload করলে image আসে কি?
3. Browser DevTools (F12) → **Network** tab খুলে page reload দিয়ে `hero.jpg` filter করুন — status code কী দেখায় (200 / 403 / blocked)?

এই তথ্য পেলে exact কারণ ধরে সরাসরি fix করে দেব।