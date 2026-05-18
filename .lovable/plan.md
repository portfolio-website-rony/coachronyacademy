## সমস্যা

Coupon তৈরি করার সময় error:
> new row for relation "coupons" violates check constraint "coupons_kind_check"

কারণ: ডাটাবেসের `coupons.kind` কলামে শুধু `'percent'` অথবা `'flat'` allow, কিন্তু admin form `'fixed'` পাঠাচ্ছে।

## ফিক্স (1 ফাইল)

`src/routes/_admin/admin.coupons.tsx`-এ frontend value-কে DB-র সাথে মেলানো:

- `Coupon` ও form-এর `kind` type: `"percent" | "flat"` (আগের `"fixed"` বাদ)
- `emptyForm()` default `kind: "percent"` (অপরিবর্তিত)
- `<select>` option value: `"fixed"` → `"flat"` (label "Fixed amount (BDT)" থাকবে)
- টেবিলের display logic: `c.kind === "percent" ? ... : ৳...` (অপরিবর্তিত, কিন্তু flat check যেহেতু else branch, ঠিক আছে)
- `startEdit`-এ cast টাইপ আপডেট

## DB / migration লাগবে না

`validate_coupon` ও checkout flow ইতিমধ্যে `flat` ব্যবহার করছে — তাই কোনো migration দরকার নেই, শুধু UI স্ট্রিং ফিক্স।

## টেস্ট

Plan approve হলে আমি ফিক্স করব, তারপর তুমি আবার "Fixed amount (BDT)" select করে ৳6000 coupon তৈরি করে দেখো — error চলে যাবে।
