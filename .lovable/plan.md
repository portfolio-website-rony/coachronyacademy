## সমস্যা যা পাওয়া গেছে

- Backend healthy আছে এবং ডেটা আছে: leads, bookings, subscribers, profiles, roles, site settings সব টেবিলে ডেটা আছে।
- Work experience ডেটাও database-এ আছে, কিন্তু সাইটে না দেখানোর সম্ভাব্য কারণ হচ্ছে frontend read/request বা asset/loading issue।
- সবচেয়ে বড় backend সমস্যা: public/authenticated role-এর table grants খালি দেখাচ্ছে। RLS policy থাকলেও table privilege না থাকলে login-related role reads, form insert, এবং CMS reads কাজ নাও করতে পারে।
- Database triggers তালিকায় খালি দেখাচ্ছে, তাই signup করলে profile/role auto-create এবং lead/booking notification trigger কাজ নাও করতে পারে।

## Plan

1. **Database permissions ঠিক করা**
   - `leads`, `bookings`, `subscribers`, `cms_site_settings`, `profiles`, `user_roles` টেবিলে দরকারি anon/authenticated privileges restore করব।
   - Public visitors যেন lead/booking/subscriber submit করতে পারে এবং site settings/work experience পড়তে পারে।
   - Logged-in users যেন নিজের profile/roles পড়তে পারে, admin যেন admin data manage করতে পারে।

2. **Missing triggers restore করা**
   - New signup হলে profile ও role auto-create করার trigger ফিরিয়ে আনব।
   - New lead/booking হলে admin notification trigger ফিরিয়ে আনব।
   - Updated rows-এর timestamp trigger দরকার হলে existing tables অনুযায়ী restore করব।

3. **Frontend error visibility improve করা**
   - Login/signup/form submit failure হলে generic “kaj hocce na” না দেখিয়ে actual helpful message দেখাবে।
   - Work experience fetch fail করলে silently hide না করে console/error handling যোগ করব, যাতে future debugging সহজ হয়।

4. **Work experience display verify/fix করা**
   - `cms_site_settings.work_experience` থেকে items load হচ্ছে কিনা নিশ্চিত করব।
   - Logo image URL কাজ না করলে fallback icon/name দেখানোর behavior রাখব, যাতে section পুরোপুরি hidden না হয়।
   - Home এবং About page-এ section render হচ্ছে কিনা verify করব।

5. **Validation**
   - Public lead form, booking form, signup/login flow, admin role check, এবং work experience read path test করব।
   - Database query দিয়ে নতুন submitted rows আসছে কিনা confirm করব।

## Technical details

- Database changes migration দিয়ে হবে, direct source edit নয়।
- Auth/admin security server-side role table অনুযায়ী থাকবে; client-side fake admin check করা হবে না।
- Existing security schemas (`safeName`, `safeEmail`, etc.) বজায় থাকবে।