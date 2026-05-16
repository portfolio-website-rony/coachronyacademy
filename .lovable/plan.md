## সমস্যা

ডাটাবেইসে সব ফাংশন (`handle_new_user`, `on_new_lead`, `on_new_booking`, `set_updated_at`, `bootstrap_first_admin`, ইত্যাদি) আছে — কিন্তু **কোনো trigger attach করা নেই** (`There are no triggers in the database`)।

এই কারণে লাইভ সাইটে:

- নতুন ইউজার signup করলে `profiles` + `user_roles` row তৈরি হচ্ছে না → পরের বার login করতে গেলে role/permission নেই, dashboard খালি।
- নতুন lead / booking / payment / enrollment আসলে admin notification তৈরি হচ্ছে না।
- কোনো table-এ row update করলে `updated_at` auto-update হচ্ছে না।
- First admin auto-bootstrap কাজ করছে না।

Forms নিজেরা কাজ করছে (API test-এ 201 আসছে), Work Experience-ও লোড হচ্ছে — শুধু trigger-নির্ভর সব behavior bhanga।

## পরিকল্পনা

একটি migration দিয়ে নিচের সব trigger পুনরায় তৈরি করব (function-গুলো ইতিমধ্যে আছে, শুধু trigger বাইন্ড করা):

### Auth triggers (`auth.users` table)
- `on_auth_user_created` → `handle_new_user()` (signup-এ profile + role তৈরি)
- `on_auth_user_created_bootstrap_admin` → `bootstrap_first_admin()