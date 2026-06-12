# ~~Bug: `pickup-status` endpoint doesn't handle "undo" pickup correctly~~

## ~~Summary~~
## ~~Fixed~~
This bug was fixed on 2026-05-17.

## What was fixed
- ✅ Clear `equipment_condition_pickup` when undoing pickup
- ✅ Guard: can't undo pickup on completed/cancelled/rejected bookings (returns 400)
- ~~Clear `pickup_date`~~ (this field is not used in the bookings table — only `equipment_pickup_date`)

