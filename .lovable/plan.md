## Goal
Admin panel এ একটা Coupons management page যোগ করব, যেখান থেকে coupon তৈরি, edit, validity/limit সেট, on/off, ও delete করা যাবে। Checkout page এ যে coupon validation আগে থেকেই কাজ করে (`validate_coupon` RPC), সেটাই backend — UI টাই missing।

## পেজ: `/admin/coupons`

নতুন route file: `src/routes/_admin/admin.coupons.tsx`

### Coupon তৈরি / edit ফর্ম
- **Code** (text, auto-uppercase, unique)
- **Discount type**: Percent (%) / Fixed amount (BDT)
- **Value** (number) — percent হলে 1–100, fixed হলে amount
- **Course scope**: "All courses" অথবা dropdown থেকে নির্দিষ্ট course (`courses` table থেকে load) — null হলে সব কোর্সে কাজ করবে
- **Validity / expiry date** (date+time picker, optional — খালি = কোনো expiry নাই)
- **Max uses** (number, optional — খালি = unlimited)
- **Active** toggle

### List view (table)
Columns: Code · Type+Value · Course · Used / Max · Expires · Status (Active/Inactive/Expired) · Actions (Edit, Toggle active, Copy code, Delete)

### Features
- Realtime refresh (`useRealtime(["coupons"])`) যাতে কোথাও থেকে change হলেই list update হয়
- "Copy code" বাটন — clipboard এ কোড কপি
- Quick preview: প্রতি coupon-এ "X times used" + expiry countdown
- Search by code
- Validation:
  - code: 3–40 chars, A-Z 0-9 `_-` only
  - percent value ≤ 100
  - expiry future date (যদি দেওয়া হয়)

## Navigation
`src/components/admin/AdminShell.tsx` এর NAV array তে নতুন এন্ট্রি যোগ:
- "Coupons" — icon: `Ticket` (lucide-react) — Payments-এর পরে।

## Database
কোনো migration লাগবে না — `coupons` table ও `validate_coupon` function আগে থেকেই আছে এবং payment verified হলে `auto_enroll_on_payment` trigger automatic-ই `used_count` bump করে।

## Out of scope
- Checkout flow এ পরিবর্তন (already works)
- Coupon analytics / per-user redemption history page (পরে দরকার হলে আলাদা)
