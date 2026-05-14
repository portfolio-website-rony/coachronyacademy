## সমস্যাটা
Student checkout-এ free course submit করলে শুধু `payments` টেবিলে `pending` payment তৈরি হচ্ছে। কিন্তু enrollment trigger শুধু payment `verified/paid/succeeded` হলে enrollment বানায়। তাই UI-তে “enrolled” মনে হলেও `enrollments` টেবিলে row তৈরি হচ্ছে না, Student Dashboard-এ Enrolled = 0 থাকে এবং course/lesson access দেখা যায় না।

## Fix plan
1. **Checkout free enrollment ঠিক করা**
   - Free course হলে payment flow bypass/auto-complete করে সরাসরি `enrollments` row তৈরি করা হবে।
   - Duplicate enroll click করলে error না দিয়ে existing enrollment ধরে course learning page-এ পাঠাবে।

2. **Existing broken free enrollments recover করা**
   - যেসব free payments `pending` অবস্থায় আছে এবং amount `0`, সেগুলো থেকে missing enrollments backfill করা হবে।
   - এতে আপনার `MD RONY` account-এ করা আগের free enrollments Student Dashboard-এ দেখাবে।

3. **Student Dashboard course UX ঠিক করা**
   - “My courses” card থেকে course detail page খোলা থাকবে।
   - Course detail page-এ enrolled হলে clear “Continue learning” এবং curriculum lesson “Watch” links থাকবে।
   - No course/lesson/missing enrollment হলে blank skeleton না রেখে readable message দেখাবে।

4. **Lesson access stable করা**
   - Lesson route enrollment loaded না হওয়া পর্যন্ত locked state দেখাবে না।
   - Enrolled student সব lesson খুলতে পারবে, progress save/mark complete কাজ করবে।

## Technical changes
- Update `src/routes/courses_.$slug.checkout.tsx` free checkout submit logic.
- Update `src/routes/_student/student.tsx` to avoid bad links/empty course rows and improve enrolled-course CTAs.
- Update `src/routes/_student/student.courses.$slug.tsx` and lesson route loading/empty states as needed.
- Add a database migration to backfill free pending payments into enrollments and make future free payment/enrollment behavior reliable.