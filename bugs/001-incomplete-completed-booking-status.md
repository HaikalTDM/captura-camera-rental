# Bug: Inconsistent booking status when marked "completed"

## Summary
When a booking's status is changed to `"completed"`, the app only updates the `booking_status` and `status` fields. It leaves `equipment_returned`, `equipment_return_date`, `equipment_condition_return`, and sometimes `equipment_picked_up` as `false` / `null`.

A completed booking logically implies the equipment was picked up and returned, so all fields should be consistent.

## Where it happens
- n8n workflows that flip status to "completed"
- Admin panel status overrides
- Direct DB updates or manual fixes
- The `/approve` route or any non-return-path flow

The `return-status` endpoint works correctly, but anything that sets `booking_status: 'completed'` directly skips the return fields.

## Current behavior
```json
{
  "booking_status": "completed",
  "status": "completed",
  "equipment_picked_up": true,
  "equipment_returned": false,
  "equipment_pickup_date": "2026-05-17T10:47:38.864+00:00",
  "equipment_return_date": null,
  "equipment_condition_return": null
}
```

## Expected behavior
When a booking is marked completed, all fields should be set:
- `booking_status: "completed"`
- `status: "completed"`
- `equipment_picked_up: true`
- `equipment_pickup_date: <now>` (if not already set)
- `equipment_condition_pickup: "good"` (if not already set)
- `equipment_returned: true`
- `equipment_return_date: <now>`
- `equipment_condition_return: "good"` (if not already set)
- `equipment_return_notes: "Marked completed via API"`

## Where to fix
**Priority:** Create a dedicated `/complete` endpoint that can be used by n8n, admin panel, and the CLI wrapper.

**New endpoint:** `POST /api/bookings/[id]/complete`

Path: `src/app/api/bookings/[id]/complete/route.ts`

This should be a clean POST handler similar to `deposit-refund/route.ts` or `return-status/route.ts`. It should:
1. Accept `equipment_condition_return` and `equipment_return_notes` as optional params
2. Load the current booking to avoid overwriting intentional values
3. Update all completion fields atomically in one Supabase call
4. Return the updated booking with customer data (like other endpoints do)

## Example usage
```bash
curl -X POST "https://www.captura.my/api/bookings/{id}/complete" \
  -H "Content-Type: application/json" \
  -d '{"equipment_condition_return": "excellent"}'
```

## Acceptance criteria
- New endpoint returns 200 with updated booking
- All completion fields are set (status, pickup, return)
- Optional fields (`equipment_condition_return`) are respected if provided, otherwise default to `"good"`
- Existing fields that are already set are not overwritten (defensive update)
- Similar pattern to other booking API routes (`deposit-refund`, `return-status`)
- Include camera data in response (like other routes do)

## Bonus (optional)
Update the admin panel's `handlePrimaryAction` or any n8n node to use this new endpoint instead of directly setting `booking_status`. This is lower priority since the endpoint itself fixes the data integrity issue.
