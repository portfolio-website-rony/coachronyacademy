## Goal
Admin panel → Users page-এ প্রতিটি user-এর জন্য "Reset password" button যোগ করব, যাতে admin যেকোনো user-এর জন্য নতুন password set করতে পারে।

## Changes

### 1. `src/lib/admin/users.functions.ts`
নতুন server function `resetUserPassword` যোগ করব:
- `requireSupabaseAuth` + `assertAdmin()` দিয়ে শুধু admin call করতে পারবে
- Input: `{ userId: uuid, newPassword: string (min 8) }` — Zod validate
- `supabaseAdmin.auth.admin.updateUserById(userId, { password })` দিয়ে password update
- Return: `{ ok: true }`

### 2. `src/routes/_admin/admin.users.tsx`
- নতুন **Key** icon button যোগ করব actions column-এ (Shield ও Trash-এর পাশে)
- Click করলে `prompt()` দিয়ে নতুন password চাইবে (min 8 chars validate)
- Confirm-এ `resetUserPassword` server fn call → success toast: "Password reset for {email}"
- Email-এ user-কে notify করা হবে না — admin মুখে/অন্য চ্যানেলে নতুন password শেয়ার করবে

## Two options for admin UI
আমি **inline prompt** ব্যবহার করব (simple, কোনো extra modal নয়) — fastest path।
চাইলে পরে dedicated modal/drawer-এ upgrade করা যাবে।

## Security notes
- শুধু admin role-এর user এই function call করতে পারবে (server-side enforced)
- Password Zod-এ min 8 char check
- নিজের password এভাবেই reset করা যাবে (no self-block, কারণ valid use case)

## Out of scope
- Email notification user-কে — চাইলে পরে যোগ করব
- Force-logout user's existing sessions — চাইলে পরে যোগ করা যাবে
