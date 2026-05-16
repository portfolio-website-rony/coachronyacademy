## Problem found

- Lovable Cloud backend/auth is healthy.
- New user creation is currently not showing in the database, so the latest signup attempt likely failed before account creation.
- The signup page still tells users to “Check your email to confirm”, even though email verification was intentionally disabled.
- The database trigger that should create profiles/roles for new users is missing, so even successful new signups can get stuck after login because `/student` depends on a `student` role.
- The login/signup forms also need consistent validation/error messaging so the exact blocker is visible.

## Plan

1. **Restore auth user setup trigger**
   - Add the missing trigger on new auth users so every signup automatically creates:
     - a profile
     - the correct user role (`student` or `client`)
   - Keep the first-admin bootstrap behavior intact if still needed.

2. **Backfill existing users**
   - For any user who already exists but has no profile/role, create the missing profile and role.
   - Confirm all existing users are email-confirmed.

3. **Fix signup UX**
   - Change the success message from “check your email” to “account created, you can sign in now”.
   - Keep redirecting users to login after signup.

4. **Improve form diagnostics**
   - Validate login email/password with the shared security schemas.
   - Show clearer messages for common cases like weak password, invalid email, existing account, or invalid login credentials.

5. **Verify**
   - Test signup with a new email.
   - Confirm the new account appears with `email_confirmed_at`, profile, and `student` role.
   - Test login redirects correctly to `/student`.