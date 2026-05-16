## লক্ষ্য
Supabase linter এর সব ২৪টি WARN ক্লিয়ার করা — তারপর আবার রি-রান করে নিশ্চিত করা।

## সমস্যা বিশ্লেষণ (২৪টি WARN, ৪ গ্রুপ)

**Group A — RLS "Always True" (৪টি):** `bookings`, `leads`, `subscribers`, `course_views` টেবিলে public/anon INSERT policy `WITH CHECK (true)` ব্যবহার করছে। এগুলো ইচ্ছাকৃত পাবলিক জমা endpoint কিন্তু basic validation যোগ করা দরকার।

**Group B — Public bucket listing (১টি):** `cms-media` bucket এ broad `SELECT` policy আছে যা file listing allow করে। পাবলিক bucket এর জন্য individual file CDN URL এ serve হয় — policy ছাড়াই কাজ করে।

**Group C+D — SECURITY DEFINER functions (১০+১০=২০টি):** public schema এর ১০টি function anon ও authenticated উভয়ের জন্য executable। বেশিরভাগই trigger function, কারো client থেকে call করার দরকার নেই।

## পরিকল্পনা

### Migration ১: Function lockdown
- **Trigger-only functions** (anon/authenticated থেকে EXECUTE revoke):
  `set_updated_at`, `handle_new_user`, `bootstrap_first_admin`, `on_new_comment`, `on_new_booking`, `on_new_payment`, `on_new_enrollment`, `on_new_lead`, `bump_post_likes`, `bump_post_comments`, `maybe_complete_enrollment`, `auto_enroll_on_payment`, `notify_admins`
- **RLS helper + RPC functions** (`has_role`, `is_enrolled`, `validate_coupon`): এগুলো `public` schema থেকে নতুন `private` schema-তে move। RLS policy গুলো reference update। `validate_coupon` কে `public` এ একটা thin wrapper হিসেবে রেখে দিব authenticated user দের জন্য (RPC API থেকে call করতে হয়) — তবে এই একটাও warn করবে; বিকল্পে wrapper কে SECURITY INVOKER করব যেটা warning ক্লিয়ার করবে।

### Migration ২: Storage tightening
- `cms-media` bucket এর broad public SELECT policy drop — পাবলিক bucket এর file গুলো CDN URL দিয়েই accessible থাকবে, শুধু listing বন্ধ হবে।

### Migration ৩: RLS policy validation
চারটা পাবলিক INSERT policy এ `true` এর জায়গায় basic field validation:
- `bookings`: `name`, `email`, `preferred_date`, `preferred_time` non-empty + length cap
- `leads`: `name` non-empty + length cap
- `subscribers`: `email` non-empty + format-like check
- `course_views`: `course_id IS NOT NULL`

### Verification
সব migration এর পরে `supabase--linter` আবার চালিয়ে confirm করব সব ২৪টি ক্লিয়ার হয়েছে।

## টেকনিক্যাল নোট
- `validate_coupon` move করলে frontend এ `supabase.rpc("validate_coupon", ...)` call টা public schema এ wrapper দিয়ে কাজ করতে থাকবে — কোনো frontend code change লাগবে না।
- RLS policy reference করা functions (`has_role`, `is_enrolled`) policy expression এ schema-qualified করে update করব।
- কোনো trigger বা existing data নষ্ট হবে না।
