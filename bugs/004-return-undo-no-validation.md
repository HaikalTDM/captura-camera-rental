# Bug: `return-status` endpoint doesn't protect against re-opening completed bookings

## Summary
When calling the return-status endpoint with `equipment_returned: true`, it auto-sets `booking_status: 'completed'`. However, there's no protection against calling it on an already completed or cancelled booking, and the undo path (setting `equipment_returned: false`) has no validation guard.

## Where it happens
**File:** `src/app/api/bookings/[id]/return-status/route.ts` (lines 57-66)

```typescript
} else {
  // If marking as not returned (undoing), clear return date
  updateData.equipment_return_date = null;
  
  // Keep the booking_status as provided (if undoing, frontend sends original status)
  if (booking_status && booking_status !== 'completed') {
    updateData.booking_status = booking_status;
    console.log('↺ Undoing return - Reverting booking status to:', booking_status);
  }
}
```

## Issues
1. **No guard on undoing a return** — Anyone can call this endpoint on a completed booking and set `equipment_returned: false`, which would re-open a rental that should be closed. This could:
   - Make the camera show as "available" incorrectly
   - Mess up revenue calculations
   - Allow duplicate bookings on the same dates
   
2. **The `booking_status` parameter is user-controlled** — On undo, the caller can pass ANY status (e.g., `'confirmed'`, `'cancelled'`) and it would be applied directly without validation.

3. **Should restore camera availability** — When undoing a return, the camera should be marked as unavailable again since it's still in the customer's possession.

## Expected behavior
When `equipment_returned` is set to `false`:
- Only allow if `booking_status` is `'completed'` (don't allow undoing if already cancelled/rejected)
- Set `booking_status` to `'confirmed'` (don't allow arbitrary status)
- Set `status` to `'active'` (re-open the rental)
- Set `equipment_returned: false`
- Clear return fields
- Optionally: trigger a notification to admin that a completed booking was re-opened

## Where to fix
**File:** `src/app/api/bookings/[id]/return-status/route.ts`

The `else` block (lines 57-66) needs:
1. Validation: `if (currentBooking.booking_status === 'cancelled' || currentBooking.booking_status === 'rejected')` → return 400
2. Auto-set `booking_status = 'confirmed'` (not user-provided)
3. Auto-set `status = 'active'`
4. Add an optional `admin_notes` field for audit trail

## Acceptance criteria
- Can't undo return on cancelled/rejected bookings (400 error)
- Undoing return always reverts to `'confirmed'` + `'active'` status
- Audit trail: admin can see when a return was undone
- Camera availability is properly restored in booking dates
