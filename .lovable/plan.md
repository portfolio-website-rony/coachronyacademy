## Remove sidebar footer buttons

The student sidebar currently shows "Back to site" and "Logout" at the bottom (highlighted red in your screenshot). These are duplicates — the same actions already exist in the profile avatar dropdown in the header.

### Change
**`src/components/dashboard/DashboardShell.tsx`**
- Remove the entire bottom footer block of the sidebar (the `<div className="shrink-0 border-t border-white/10 p-3">` containing the "Back to site" `<Link>` and the "Logout" `<button>`).
- Remove the now-unused `logout` function, `useNavigate`, `supabase`, `toast`, `LogOut`, and `Home` imports.
- Sidebar will end cleanly after the nav list.

No other files, routes, or logic change. Header dropdown keeps handling logout and back-to-site.