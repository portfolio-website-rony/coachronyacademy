## লক্ষ্য

`/student/courses` (My Courses) page-এ student যেগুলো enroll করেছে শুধু সেগুলো উপরে দেখাবে। বাকি (যেগুলো এখনো enroll করেনি) আলাদা একটা "Browse more courses" section-এ নিচে দেখাবে — সেখান থেকে enroll করতে পারবে।

## পরিবর্তন

শুধু একটা ফাইল: `src/routes/_student/student.courses.index.tsx`

### UI structure (নতুন)

```
Page heading: "My courses"

[Section 1 — "My enrolled courses"]
  - শুধু enrolled courses (Continue → button)
  - যদি কোনো enrolled course না থাকে: "You haven't enrolled in any course yet — browse below."

[Section 2 — "Browse more courses"]
  - বাকি published courses যেগুলো student এখনো enroll করেনি (Enroll free button)
  - সব enrolled হলে এই section হাইড।
```

### Logic

- বর্তমান data fetching (courses + enrollments) same রাখব।
- Render-এ courses কে `enrolled` আর `available` দুই array-এ split করে দুইটা grid-এ দেখাব।
- Card design, enroll function, navigation link — সব same।

## কী অপরিবর্তিত

- Database, RLS, enrollment flow, video player, route structure — কিছুই touch হচ্ছে না।
- Heading text এর বাইরে কোনো design change নাই।

ঠিক থাকলে implement করে দিচ্ছি।
