## সমস্যা

`/student/courses` page-এ সব course-ই "Enroll free" হিসেবে দেখাচ্ছে — কারণ button click করলেই সরাসরি `enrollments` table-এ insert হয়ে যাচ্ছে, course-এর `price` দেখাও হচ্ছে না, check-ও হচ্ছে না।

আসলে `courses` table-এ `price` এবং `discount_price` field already আছে এবং admin panel (Edit Course page) থেকে এগুলো এডিট করা যায়। শুধু student-side UI সেটা respect করছে না।

## সমাধান

Course free কিনা সেটা ঠিক হবে এই rule দিয়ে:

- **Free** → `discount_price === 0` অথবা (`discount_price` null হলে `price === 0`)
- **Paid** → effective price > 0

### পরিবর্তন (শুধু একটা ফাইল)

`src/routes/_student/student.courses.index.tsx`:

1. `Course` type-এ `price` আর `discount_price`, `currency` যোগ; SELECT query-তেও যোগ।
2. `CourseCard`-এ একটা small price badge — Free হলে "Free" green pill, paid হলে `৳1,500` (discount থাকলে original strike-through সহ)।
3. Button logic:
   - **Enrolled** → আগের মতো "Continue →" link.
   - **Not enrolled + Free** → আগের মতো instant enroll button ("Enroll free").
   - **Not enrolled + Paid** → "Enroll now — ৳X" button যেটা `/courses/$slug/checkout` route-এ পাঠাবে (এটা already exists)। সরাসরি insert হবে না।
4. "Browse more courses" section-এর subtitle থেকে "Free enrollment" line সরিয়ে neutral text।

### Admin panel

Admin Edit Course page-এ already `price` আর `discount_price` field আছে — ওখানে কিছু change লাগবে না। Admin price = 0 দিলে free, > 0 দিলে paid হবে — এটাই control।

## কী touch হচ্ছে না

- Database schema, RLS, `enrollments` flow, checkout page, payment verification, video player — কিছুই না।
- Admin UI-এ কোনো নতুন field বা toggle add হচ্ছে না (price field দিয়েই free/paid control হচ্ছে)।

ঠিক থাকলে implement করে দিচ্ছি।
