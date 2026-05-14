## Header Navigation Update

Update the main header nav items in `src/components/site/Header.tsx`.

**Current nav:** হোম, কোর্স, শপ, ওয়ার্কশপ, ব্লগ
**New nav:** Home, About, Courses, Shop, Blog

### Change
Replace the `NAV` constant in `src/components/site/Header.tsx`:

```ts
const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/courses", label: "Courses" },
  { to: "/shop", label: "Shop" },
  { to: "/blog", label: "Blog" },
] as const;
```

- Removes "Events / ওয়ার্কশপ" from the header
- Adds "About" → `/about` (route already exists)
- Switches all labels to English

### Out of scope
- No changes to footer, mobile drawer logic, or routes
- `/events` route remains accessible, just not shown in the top nav