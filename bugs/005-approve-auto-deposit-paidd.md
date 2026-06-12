# Bug: `approve` endpoint auto-sets `deposit_paid` which bypasses payment verification

## Summary
When a booking is approved, the `/approve` endpoint automatically sets `deposit_paid: true` and `deposit_paid_date` — regardless of whether the customer actually paid. The deposit is marked as paid before any real payment verification occurs.

## Where it happens
**File:** `src/app/api/bookings/[id]/approve/route.ts` (lines 69-78)

```typescript
const { data: updatedBooking, error: updateError } = await supabase
  .from('bookings')
  .update({
    booking_status: 'confirmed',
    approved_at: timestamp,
    deposit_paid: true,              // ← Problem: auto-set
    deposit_paid_date: booking.deposit_paid_date || timestamp,
    admin_notes: admin_notes || null,
    updated_at: timestamp
  })
```

## Issues
1. **No payment verification** — Admin can approve a booking without the customer having paid the deposit. The deposit gets auto-marked as paid.
2. **Inconsistent with website flow** — When customers book via the website, the `deposit_paid` field is set to `true` at submission time (line in `submit/route.ts`), so the deposit is already paid before approval. The approve endpoint should NOT touch the deposit field in this case.
3. **Creates false confidence in reports** — The dashboard and reports show deposits as collected when they may not have been.
4. **The `admin_notes` field exists** — It's meant for admin remarks, but there's no distinction between "approved + deposit verified" vs "approved, deposit pending".

## Expected behavior
When approving a booking:
- Set `booking_status: 'confirmed'` and `approved_at`
- Only set `deposit_paid: true` if it was already `true` (preserve existing state)
- OR: Remove auto-deposit from approve endpoint entirely; let the `deposit` endpoint handle deposit status separately
- Add a separate field like `deposit_verified: boolean` if approval requires deposit confirmation

## Where to fix
**File:** `src/app/api/bookings/[id]/approve/route.ts`

Change the update from:
```typescript
.update({
  booking_status: 'confirmed',
  approved_at: timestamp,
  deposit_paid: true,
  deposit_paid_date: booking.deposit_paid_date || timestamp,
  admin_notes: admin_notes || null,
  updated_at: timestamp
})
```

To either:
```typescript
// Option A: Preserve existing deposit state
.update({
  booking_status: 'confirmed',
  approved_at: timestamp,
  admin_notes: admin_notes || null,
  updated_at: timestamp
})
```

OR

```typescript
// Option B: Only set deposit if it was already paid
.update({
  booking_status: 'confirmed',
  approved_at: timestamp,
  deposit_paid: booking.deposit_paid,  // preserve existing value
  deposit_paid_date: booking.deposit_paid_date,
  admin_notes: admin_notes || null,
  updated_at: timestamp
})
```

## Acceptance criteria
- Approving a booking with `deposit_paid: false` should NOT auto-set it to `true`
- Approving a booking with `deposit_paid: true` should preserve it
- Dashboard reports accurately reflect actual deposit collection
- No regression in website booking flow (where deposit is already set before approval)
