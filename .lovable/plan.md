## লক্ষ্য

Top-right corner-এ user avatar (or initial) এ click করলে একটা dropdown menu open হবে — উপরে user-এর avatar + name + email, নিচে quick links: My Profile, My Courses, My Ebooks, Settings, Logout। ঠিক attached image-এর মতো।

Avatar/name নিজে customize করার feature already আছে — `/student/profile` page-এ avatar upload + display name edit আছে। নতুন kichu লাগবে না সেদিকে।

## পরিবর্তন

শুধু একটা ফাইল: `src/components/dashboard/DashboardShell.tsx`

- Header-এর avatar circle টাকে existing shadcn `DropdownMenu` দিয়ে wrap করব।
- Trigger: avatar (large হলে name-ও পাশে দেখাবে desktop-এ)।
- Dropdown content (project-এর dark glass theme অনুযায়ী, attached image-এর structure):
  - **Header row**: avatar + display_name + email (greyed)
  - Divider
  - **My Profile** → `/student/profile`
  - **My Courses** → `/student/courses`
  - **My Ebooks** → `/student/ebooks`
  - **Settings** → `/student/profile` (currently ওটাই settings page; future-এ আলাদা হলে route বদলানো trivial)
  - Divider
  - **Logout** → existing `signOut` + redirect (red-tinted)

### কেন এই menu items

Image-এ যা দেখানো হয়েছে সেগুলো student area-র জন্য। Admin/client shell-এ একই DashboardShell ব্যবহার হয়, তাই menu items গুলো `nav` prop থেকে পড়া যেতে পারে — কিন্তু image-এর items গুলো student-specific, অন্য role-এ wrong link হবে। তাই dropdown items dynamic করব: যদি current path `/student` দিয়ে শুরু হয় তবে student items দেখাব; নাহলে শুধু "Profile / Logout" minimal version।

## কী touch হচ্ছে না

- DB, RLS, profile schema, avatar upload flow, route structure — কিছুই না।
- Sidebar logout button অটুট থাকবে।
- `/student/profile` page-এ already avatar upload + name edit আছে, ওখান থেকে user নিজের photo/name দিতে পারবে।

ঠিক থাকলে implement করে দিচ্ছি।
