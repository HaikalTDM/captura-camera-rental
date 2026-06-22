# Captura Telegram Bot — UI/UX Design

## Design Principle

Telegram bot UI should be compact, task-first, and button-driven.

The dashboard should not be a full report. It should be a clean command center that shows the owner what needs attention.

## Final Dashboard Layout

```text
📸 C A P T U R A
Camera Rental · Studio

━━━━━━━━━━━━━━━━━━━━
📅 Mon, 22 Jun 2026
🟡 6 actions · next 3 days

👀 3-Day Work Queue

Today
[1] Haikal — pickup | R50 | 3PM | RM80 due
[2] Aisyah — return | A7IV | 6PM | check deposit

Tomorrow
[3] Danial — pickup | FX3 | delivery | deposit unpaid
[4] Nurul — approve | R6 II | 24–26 Jun

Wed, 24 Jun
[5] Amir — return | R50 | final unpaid

Thu, 25 Jun
[6] Farah — pickup | A6400 | ready

💰 Money
Today: RM 180
Month: RM 2,430
All-time: RM 18,920
Pending: RM 120

📦 3-Day Summary
Pickups: 3
Returns: 2
Approvals: 1
Overdue: 0

━━━━━━━━━━━━━━━━━━━━
Tap a number below.

v3.2 · MCP · Owner · Updated 9:42 AM
```

## Dashboard Inline Keyboard

```text
[1] [2] [3]
[4] [5] [6]
[➕ New Booking] [📅 Today]
[📈 Analytics] [⋯ More]
```

## Quiet Mode Dashboard

When there are no actions:

```text
📸 C A P T U R A
Camera Rental · Studio

━━━━━━━━━━━━━━━━━━━━
📅 Mon, 22 Jun 2026
🟢 Quiet today

👀 3-Day Work Queue
No pickups, returns, approvals, or overdue rentals.

💰 Money
Today: RM 0
Month: RM 2,430
All-time: RM 18,920
Pending: RM 0

✅ Suggested Action
No urgent action. You can check availability or create a new booking.

━━━━━━━━━━━━━━━━━━━━
v3.2 · MCP · Owner · Updated 9:42 AM
```

Quiet mode keyboard:

```text
[➕ New Booking] [📷 Cameras]
[📈 Analytics] [⋯ More]
```

## At-a-Glance Line Format

Use one consistent format:

```text
[number] Customer — action | item | date/time | signal
```

Examples:

```text
[1] Haikal — pickup | R50 | Today 3PM | RM80 due
[2] Amir — overdue | FX3 | +1 day | contact
[3] Aisyah — return | A7IV | Today 6PM | deposit
[4] Danial — payment | R6 II | RM120 due
[5] Nurul — approve | R50 | 24–26 Jun
```

## Status and Signal Badges

Use small, meaningful signals:

```text
💰 unpaid
⚠️ overdue
🚚 delivery
🪪 ID missing
⭐ low reliability
🛠 needs repair
✅ ready
```

Examples:

```text
[1] Haikal — pickup | R50 | Today 3PM | 💰 RM80 due
[2] Amir — overdue | FX3 | +1 day | ⚠️ contact
[3] Danial — pickup | A7IV | Tomorrow | 🚚 delivery
[4] Farah — pickup | R6 II | Thu | 🪪 ID missing
```

## Detail Screen: Pickup

```text
📸 Pickup Preparation

Customer: Haikal
Camera: Canon R50
Pickup: Today, 3PM
Method: Pickup
Payment: RM80 due
Deposit: Paid
Reliability: Good

🧰 Prepare
• Camera body
• Battery
• Charger
• Memory card
• Camera bag
• Check condition before handover

✅ Suggested Next Step
Prepare R50 and collect RM80 before handover.
```

Buttons:

```text
[✅ Mark Picked Up]
[💰 Record Payment]
[📲 Send Pickup Info]
[📝 Add Note]
[⬅️ Back]
```

## Detail Screen: Return

```text
📦 Return Preparation

Customer: Aisyah
Camera: Sony A7IV
Return: Today, 6PM
Deposit: RM300
Payment: Paid

🧰 Check on Return
• Camera body
• Lens/caps
• Battery
• Charger
• Accessories
• Physical condition

✅ Suggested Next Step
Inspect equipment, then mark as returned.
```

Buttons:

```text
[✅ Mark Returned]
[⚠️ Report Issue]
[💸 Refund Deposit]
[📲 Send Reminder]
[⬅️ Back]
```

## Detail Screen: Overdue

```text
⚠️ Overdue Rental

Customer: Amir
Camera: Sony FX3
Due: Yesterday
Overdue: +1 day
Payment: Paid
Phone: Available

✅ Suggested Next Step
Contact customer now and confirm return time.
```

Buttons:

```text
[📲 Contact Customer]
[✅ Mark Returned]
[⏰ Extend Rental]
[💰 Add Late Fee]
[⬅️ Back]
```

## Detail Screen: Pending Approval

```text
🟣 Pending Approval

Customer: Nurul
Camera: Canon R50
Dates: 24 Jun → 26 Jun
Total: RM180
Deposit: RM100
Source: WhatsApp

✅ Suggested Next Step
Check availability and approve booking.
```

Buttons:

```text
[✅ Approve]
[❌ Reject]
[📷 Check Camera]
[📲 Contact Customer]
[⬅️ Back]
```

## Detail Screen: Payment

```text
💰 Payment Needed

Customer: Danial
Camera: Canon R6 II
Booking: 24 Jun → 26 Jun
Amount Due: RM120
Payment Type: Final payment

✅ Suggested Next Step
Record payment or send a reminder.
```

Buttons:

```text
[💰 Record Payment]
[📲 Send Reminder]
[⬅️ Back]
```

## State-Aware Button Rules

Do not show the same buttons for every booking.

### Pending Approval

```text
[✅ Approve]
[❌ Reject]
[📷 Check Camera]
[📲 Contact]
[⬅️ Back]
```

### Pickup

```text
[✅ Mark Picked Up]
[💰 Record Payment]
[📲 Pickup Info]
[📝 Note]
[⬅️ Back]
```

### Return

```text
[✅ Mark Returned]
[⚠️ Report Issue]
[💸 Refund Deposit]
[📲 Reminder]
[⬅️ Back]
```

### Overdue

```text
[📲 Contact Customer]
[✅ Mark Returned]
[⏰ Extend Rental]
[💰 Add Late Fee]
[⬅️ Back]
```

### Completed

```text
[🧾 Generate Invoice]
[⭐ Request Review]
[📲 Send Receipt]
[⬅️ Back]
```

## More Menu

Keep secondary tools inside the More menu.

```text
⋯ More

[🔍 Search Customer]
[📷 Cameras]
[🔔 Reminders]
[🧾 Invoices]
[⚙️ Settings]
[⬅️ Back]
```

## Clean Chat UX

The bot should behave like a single-screen app.

Recommended flow:

```text
Dashboard
→ tap [1]
→ same message edits into task detail
→ tap action
→ same message edits into result or confirmation
→ dashboard refreshes
```

Avoid:

```text
Dashboard message
Task detail message
Payment message
Success message
Another dashboard message
```

## Success UX

For simple actions, use a small success notification/toast and refresh the screen.

Examples:

```text
✅ Payment recorded
✅ Pickup marked
✅ Return marked
✅ Reminder sent
```

For dangerous actions, show confirmation first.

Confirmation needed for:

```text
Cancel booking
Reject booking
Refund deposit
Mark camera damaged
Delete data
```

## Main UX Rules

1. Main screen shows only the most important tasks.
2. Detail screen shows full booking information.
3. Every screen has a Back button.
4. Use edit-in-place instead of sending new messages.
5. Delete temporary input messages after processing.
6. Keep buttons to 1–2 per row, except number rows.
7. Do not repeat the large logo on dashboard.
8. Do not show raw database field names.
9. Use owner-friendly wording.
10. Always show when the dashboard was updated.
