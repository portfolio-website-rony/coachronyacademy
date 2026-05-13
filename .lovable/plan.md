## Findings
- Sidebar clicks do update the URL (for example `/admin/leads`), but the visible content stays on the Dashboard.
- Root cause: `src/routes/_admin/admin.tsx` is currently acting as a parent route for `/admin/*` but renders the Dashboard directly and does not render an `<Outlet />`, so child pages like Leads, Bookings, Meetings, Clients, Payments, CMS, and Settings cannot appear.
- Several pages already have partial database functionality, but I will verify each workflow after the route fix.

## Implementation plan
1. Fix admin route structure
   - Convert `/admin` into a layout route that renders the Dashboard for the base route and renders child pages via `<Outlet />`.
   - Keep the sidebar/header shell unchanged.
   - Do not edit `src/routeTree.gen.ts` manually; let TanStack regenerate it.

2. Preserve the Dashboard
   - Move/keep the existing dashboard analytics UI as the `/admin` index view.
   - Ensure dashboard cards and charts still load live database counts and realtime updates.

3. Verify each admin section opens correctly
   - `/admin/leads` shows the Leads list/search/actions.
   - `/admin/bookings` shows bookings search/filter/table/drawer workflow.
   - `/admin/meetings` shows meeting schedule and completion controls.
   - `/admin/clients` shows client CRM list and add/delete actions.
   - `/admin/payments` shows payment records and add/mark-paid/delete actions.
   - `/admin/cms` shows CMS management.
   - `/admin/settings` shows settings form.

4. Fix obvious broken page actions found during verification
   - If a page opens but a button/form fails due to a clear code issue, fix that specific issue.
   - Likely candidate: Settings save should use a conflict target for the `cms_site_settings.key` upsert if the table supports it.

5. Final validation
   - Click every sidebar item in the preview and confirm the URL, active nav item, and page content match.
   - Check console/network errors after navigation and after one safe UI action where possible.
   - Avoid destructive actions unless they are clearly test-safe.