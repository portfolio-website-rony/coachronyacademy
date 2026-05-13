
# Dynamic Course Sales + Payment Platform

## Honest scope note

আপনি সব একসাথে চাইছেন — আমি deliver করব, কিন্তু **bKash / Nagad / SSLCommerz live integration**-এর জন্য আপনাকে merchant credentials দিতে হবে (sandbox মোডে আগে test হবে)। Stripe Lovable-এর built-in integration দিয়ে seamless হবে। এজন্য কাজটা **2 milestones**-এ ভাগ করছি — কিন্তু একটাই plan, একটাই approval।

---

## Milestone 1 — Sales page + DB + manual payment + Stripe + coupons + analytics + countdown

### 1.1 Database migration

**Extend `courses` table** with:
- `tagline`, `long_description`, `promo_video_url`
- `price` (numeric), `discount_price` (numeric, nullable), `currency` (default 'BDT')
- `duration_minutes`, `language` (default 'bn')
- `instructor_name`, `instructor_bio`, `instructor_avatar_url`
- `learn_outcomes` (text[]), `who_for` (text[]), `requirements` (text[])
- `offer_ends_at` (timestamptz, nullable) — countdown
- `payment_methods_enabled` (jsonb, default `{"bkash":true,"nagad":true,"stripe":true,"sslcommerz":true,"manual":true}`)

**New tables:**
- `course_faqs` (course_id, question, answer, display_order)
- `course_testimonials` (course_id, author, role, quote, avatar_url, rating, display_order)
- `coupons` (id, course_id nullable for global, code unique, kind 'percent'|'flat', value, max_uses, used_count, expires_at, active)
- `coupon_redemptions` (coupon_id, user_id, payment_id, redeemed_at)
- `course_views` (course_id, user_id nullable, session_id, viewed_at, referrer) — for analytics
- Extend `payments` table: add `course_id`, `user_id`, `coupon_id`, `gateway` ('bkash'|'nagad'|'stripe'|'sslcommerz'|'manual'), `gateway_ref`, `gateway_payload` jsonb

**RLS:** public read for FAQs/testimonials of published courses; admins manage all; users read own payments + own redemptions; coupons readable by anon for code lookup via SECURITY DEFINER function `validate_coupon(code, course_id)`.

**Trigger:** when `payments.status` flips to `'verified'` AND `course_id` is set → auto-insert into `enrollments` (idempotent on unique `(user_id, course_id)`).

### 1.2 Public sales page — `/courses/$slug`

**New public route** (not under `_student` — accessible to anonymous visitors for SEO + conversion):
```
src/routes/courses.$slug.tsx
```
Sections (all glass + dark + animated):
1. **Hero** — banner, title, tagline, promo video (YouTube embed), CTA buttons, countdown timer if `offer_ends_at`
2. **What you'll learn** — `learn_outcomes` grid with checkmarks
3. **Course curriculum** — modules + lessons accordion (preview lessons playable)
4. **Instructor** — avatar, name, bio
5. **Who this is for + Requirements**
6. **Testimonials** — carousel from `course_testimonials`
7. **FAQ** — accordion from `course_faqs`
8. **Pricing card** — sticky on desktop, floating bottom bar on mobile; shows discount strike-through, coupon input, "Enroll Now"
9. **Final CTA**

`head()` per-course meta with og:image = `cover_url`. View tracked into `course_views` (server fn).

### 1.3 Checkout flow — `/courses/$slug/checkout`

- Requires login (redirect with `returnTo`)
- Shows order summary, coupon entry, payment method selector (only enabled methods shown)
- Free course (price=0 or 100% coupon) → instant enrollment, skip payment
- Manual payment → screenshot upload + txn ID → `payments.status='pending'` → admin verifies → trigger creates enrollment
- Stripe → Stripe Checkout Session → success webhook marks payment verified
- bKash/Nagad/SSLCommerz → gateway redirect → callback verifies → marks payment verified

Server functions in `src/lib/checkout.functions.ts`:
- `createCheckoutSession({ courseId, gateway, couponCode? })`
- `validateCoupon({ code, courseId })`
- `submitManualPayment({ courseId, txnId, screenshotPath, gateway, couponCode? })`
- `trackCourseView({ courseSlug })`

### 1.4 Stripe (built-in Lovable Payments)

Recommend running `recommend_payment_provider` then `enable_stripe_payments`. After enable: create Stripe products per course, checkout session redirects to Stripe, webhook at `/api/public/webhooks/stripe` verifies signature → marks `payments.verified` → trigger enrolls.

### 1.5 Admin enhancements — `/admin/courses/$courseId`

Add tabs: **Details / Modules / Pricing & Payments / FAQ / Testimonials / Coupons / Analytics**
- Pricing tab: price, discount, currency, offer_ends_at, per-method enable toggles
- FAQ/Testimonials: CRUD lists
- Coupons: CRUD, copy code, see redemption count
- Analytics tab: views, enrollments, revenue, conversion rate (enrollments/views), completion rate, recent payments

New admin page `/admin/payments` (already exists) → enhance with course filter, verify/reject buttons, screenshot preview.

### 1.6 Programs page update

`src/lib/site-data.ts` PROGRAMS hrefs already point to `/student/courses/$slug` — change to `/courses/$slug` (public sales page). The `Apply` button on mentorship stays `/book`.

---

## Milestone 2 — bKash, Nagad, SSLCommerz live gateways

After Milestone 1 ships and you've supplied credentials via `add_secret`:

- **bKash**: `BKASH_APP_KEY`, `BKASH_APP_SECRET`, `BKASH_USERNAME`, `BKASH_PASSWORD`, `BKASH_BASE_URL` (sandbox/prod). Server route `/api/public/webhooks/bkash` + `src/lib/payments/bkash.functions.ts` (grant token → create payment → execute payment).
- **Nagad**: `NAGAD_MERCHANT_ID`, `NAGAD_MERCHANT_NUMBER`, `NAGAD_PUBLIC_KEY`, `NAGAD_PRIVATE_KEY`, `NAGAD_BASE_URL`. PGP signing in `src/lib/payments/nagad.functions.ts`.
- **SSLCommerz**: `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWD`, `SSLCOMMERZ_SANDBOX` flag. `src/lib/payments/sslcommerz.functions.ts` + IPN route.

All three follow the same shape: `initiate(courseId, paymentId)` → redirect URL → user pays → callback `/api/public/payments/{gateway}/callback` verifies signature → marks payment verified → enrollment trigger fires.

Until creds arrive, those buttons in checkout show "Coming soon — use Stripe or manual upload".

---

## Files

**Migrations** (1 file): schema extension + new tables + RLS + enrollment trigger
**New routes**: `courses.$slug.tsx`, `courses.$slug.checkout.tsx`, `api/public/webhooks/stripe.ts`, `api/public/payments/{bkash,nagad,sslcommerz}/callback.ts`
**New components**: `CourseHero`, `CourseCurriculum`, `CourseInstructor`, `CourseFAQ`, `CourseTestimonials`, `PricingCard`, `CountdownTimer`, `CouponInput`, `PaymentMethodSelector`, `StickyMobileCTA`
**New libs**: `src/lib/checkout.functions.ts`, `src/lib/coupons.functions.ts`, `src/lib/analytics.functions.ts`, `src/lib/payments/{stripe,bkash,nagad,sslcommerz}.functions.ts`
**Admin updates**: enhanced `admin.courses.$courseId.tsx` with tabs, enhanced `admin.payments.tsx` with verify flow, new `admin.coupons.tsx`
**Edits**: `site-data.ts` (hrefs to `/courses/$slug`), `programs.tsx`

---

## Out of scope / explicit non-goals

- Recurring subscriptions (one-time only)
- Refund automation (manual via admin)
- Multi-currency conversion
- Affiliate / referral system
- Email/SMS receipts (notifications stay in-app for MVP)

---

## What I need from you after approval

1. **Approval to run migration** (tool will ask separately)
2. **Decide Stripe**: do I run `recommend_payment_provider` + `enable_stripe_payments` now, or skip Stripe in M1?
3. **bKash/Nagad/SSLCommerz creds** — only when ready for M2; M1 ships without them
