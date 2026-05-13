## Goal
Transform the CoachRony admin panel into a fully functional, realtime, production-ready management system backed by Lovable Cloud. The dashboard, charts, and table-pages already query Supabase, but most pages are read-only listings without CRUD modals, realtime updates, filtering, exports, or notifications. This plan fills those gaps in focused phases.

## Current state (verified)
- Dashboard `/admin` already pulls live stats + 30-day revenue + lead-source pie from Supabase.
- All admin pages exist (`leads`, `bookings`, `meetings`, `clients`, `payments`, `cms`, `settings`) but are mostly read tables.
- DB schema is in place: `leads`, `lead_notes`, `bookings`, `clients`, `payments`, `cms_*`, `notifications`, `activity_log`, `profiles`, `user_roles`, plus storage buckets `cms-media` (public) and `payment-screenshots` (private). RLS is set up correctly.
- Auth, role guards, and admin redirect already work.

## What's missing (the actual scope)
1. **Realtime** subscriptions on `leads`, `bookings`, `payments`, `notifications`.
2. **CRUD modals/drawers** for every entity (create/edit/delete + status change).
3. **Search, filter, status tabs, pagination, CSV export** on leads/bookings/clients/payments.
4. **Lead detail drawer**: notes timeline (`lead_notes`), tags, status pipeline, convert→client.
5. **Booking detail**: reschedule, cancel, complete, attach meeting link, link to client.
6. **Meetings page**: countdown, "Join" button (Google Meet/Zoom URL), session notes, recording URL field.
7. **Clients CRM**: profile drawer with tabs (Bookings · Payments · Notes · Tags · Activity).
8. **Payments**: create payment, mark paid, upload proof to `payment-screenshots`, signed-URL preview, revenue chart per method.
9. **CMS editor**: forms for `cms_programs`, `cms_services`, `cms_blog_posts`, `cms_portfolio`, `cms_testimonials`, `cms_site_settings`. Image upload to `cms-media`. Markdown editor for blog content. Draft/publish toggle, slug, SEO fields (title/description) stored in `cms_site_settings` per page.
9. **Notifications** bell in admin header: unread count, dropdown list, mark-read, realtime new-notification toast. DB triggers to auto-insert notifications when a `lead`/`booking`/`payment` row is created.
10. **Analytics** tab on dashboard: bookings-per-day bar, conversion funnel (leads→booked→converted), revenue by method, user growth from `profiles.created_at`.
11. **Activity log** writes on every admin mutation (use existing `activity_log` table).
12. **UX polish**: skeleton loaders, empty states everywhere, sonner toasts on every mutation, animated stat counters, mobile sidebar already exists.

## Database changes (one migration)
- `bookings`: add `rescheduled_from uuid`, `cancelled_reason text`.
- Triggers: `notify_admin_on_new_lead`, `notify_admin_on_new_booking`, `notify_admin_on_new_payment` — insert one row into `notifications` for every admin user.
- Trigger `set_updated_at` on tables missing it (clients, cms_*, payments).
- Enable Realtime publication on: `leads`, `bookings`, `payments`, `notifications`, `lead_notes`.
- (Optional) View `admin_dashboard_stats` for a single fast stats query.

## Frontend architecture
- New folder `src/components/admin/` for shared pieces:
  - `DataTable.tsx` (sortable, paginated, with search + status filter chips)
  - `StatusBadge.tsx`, `EmptyState.tsx`, `Skeleton.tsx`, `ConfirmDialog.tsx`
  - `LeadDrawer.tsx`, `BookingDrawer.tsx`, `ClientDrawer.tsx`, `PaymentDialog.tsx`
  - `NotificationBell.tsx` (in `AdminShell` header)
  - `RichEditor.tsx` (lightweight markdown via `react-markdown` + textarea, no heavy deps)
  - `ImageUploader.tsx` (uploads to `cms-media` / `payment-screenshots`)
- Shared hooks `src/lib/admin/`:
  - `use-realtime-table.ts` — generic realtime list hook (`postgres_changes` + React Query cache invalidation)
  - `use-stats.ts` — dashboard stats with realtime invalidation
  - `use-notifications.ts`
  - `use-csv-export.ts`
- Adopt **TanStack Query** (already in project) for caching + invalidation across pages.

## Phased delivery
**Phase 1 — Foundations (this turn after approval)**
- DB migration (triggers, realtime publication, columns).
- React Query provider wired in `__root.tsx`.
- Shared `DataTable`, `EmptyState`, `Skeleton`, `StatusBadge`, `ConfirmDialog`.
- Realtime hook + dashboard auto-refresh.
- Notification bell in `AdminShell` header.

**Phase 2 — Leads & Bookings**
- Leads: search/filter/tabs, drawer with notes + tags + status pipeline + convert-to-client + CSV export.
- Bookings: calendar + list view, reschedule/cancel/complete, attach meet link.

**Phase 3 — Meetings, Clients, Payments**
- Meetings: today/upcoming/past tabs, countdown, join button, notes & recording.
- Clients CRM drawer with tabbed history.
- Payments: create/mark-paid, screenshot upload + signed URL preview, method analytics.

**Phase 4 — CMS & Settings**
- CMS forms for all five content tables + site-settings (hero, contact, social, SEO).
- Settings: profile, password change, manage admins (assign role).

**Phase 5 — Polish**
- Skeletons, animated counters, additional analytics charts, activity log inserts.

## Out of scope (call out explicitly)
- Real Stripe / bKash / Nagad / SSLCommerz payment processing — only manual entry + proof upload. (Can be added later via Lovable's built-in Stripe payments or a webhook route.)
- Native Google Meet / Zoom API integration — we just store and open the meeting link the admin pastes in.
- Email/SMS sending for notifications — in-app only for now.

## Confirmation needed
The full scope is large (4–5 build turns). After you approve, I'll start with **Phase 1** (DB triggers + realtime + shared components + notifications bell + dashboard auto-refresh) so you can see the foundation working end-to-end, then continue phase by phase.