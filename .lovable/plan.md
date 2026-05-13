I found why payment is not showing: `/courses/$slug/checkout` is being treated as a child route of `/courses/$slug`, but the course detail route does not render an Outlet, so the course landing page appears instead of the checkout form.

Plan:

1. Fix checkout route rendering
- Convert `src/routes/courses.$slug.checkout.tsx` from a child route to a standalone route by changing its route path to `/courses/$slug/checkout/`.
- This avoids needing to add an Outlet to the course detail page and keeps `/courses/$slug` as the sales page.
- Verify that opening `/courses/ai-creator-masterclass/checkout` shows the checkout/payment UI, not the course page.

2. Improve the checkout payment options UI
- Make the checkout page clearly show payment options for the course: bKash, Nagad, manual payment proof upload, and disabled/coming-soon options where the gateway is not live yet.
- Add clearer Bangla instructions for sending payment, transaction ID entry, screenshot upload, coupon, and final submission.
- Keep the existing secure pending-payment flow: student submits payment proof, admin verifies from `/admin/payments`, then enrollment is created automatically.

3. Make admin payment verification practical
- Update the admin payments table to show course/student-related payment rows more clearly where current data allows.
- Keep the existing “mark paid” action so admin can approve pending manual payments and trigger enrollment.

4. Optional gateway note
- True live bKash/Nagad merchant API payment needs merchant credentials/secrets from those providers. For now I’ll make the working manual bKash/Nagad proof flow polished and usable; live gateway API can be added after credentials are available.