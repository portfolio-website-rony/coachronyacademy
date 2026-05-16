## Plan: Email verification বন্ধ করা

**সমস্যা:** এখন signup করলে user-কে email verify করতে হয়, না করলে "Email not confirmed" error আসে।

**সমাধান:** Supabase auth settings-এ `auto_confirm_email` enable করব। এর পর নতুন signup-এ email automatic confirm হয়ে যাবে — verification ছাড়াই সরাসরি login হবে।

### Steps
1. `supabase--configure_auth` tool দিয়ে `auto_confirm_email: true` set করব।
2. বিদ্যমান unconfirmed user (যেমন `throny2000@gmail.com`) — এদের জন্য একটা migration দিয়ে `auth.users.email_confirmed_at` set করে দেব যাতে তারা এখনই login করতে পারে।

### কোনো code change লাগবে না
শুধু backend setting + এক migration। Frontend / login flow অপরিবর্তিত থাকবে।

### Note
Production-এর জন্য email verification রাখা সাধারণত safer (fake email আটকায়)। আপনি এখন off করতে চাইলে পরে আবার on করা যাবে।
