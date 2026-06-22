# Captura Telegram Bot — Brainstorm Summary

## Purpose

Captura is a small camera rental and studio business. The Telegram bot should reduce daily work for the owner by showing the most important actions, payments, and preparation tasks in one clean interface.

The bot should not feel like a static report. It should feel like a lightweight business command center inside Telegram.

## Main UX Goal

Open Telegram, see what matters, tap once, take action, done.

The bot should answer:

1. Who needs my attention?
2. What camera or booking is involved?
3. What do I need to prepare?
4. Is there any payment, overdue rental, return, or approval?
5. What is the next action?

## Current Dashboard Problems

The previous dashboard had a strong brand feel but was not practical enough.

Issues identified:

- The logo image was too large and dominated the chat.
- The useful data was too small and buried.
- The bot showed numbers but did not guide the owner.
- Buttons were crowded.
- The dashboard was too static.
- `Finacials` was misspelled and should be `Financials`.
- `Pending` appeared in multiple places without clear meaning.
- The bot needed a cleaner flow where old messages disappear or update.

## Core Direction

The bot should move from:

```text
Static dashboard
```

to:

```text
Action-first 3-day work queue
```

The dashboard should prioritize tasks, not raw database data.

## Key Decisions

### 1. Bookings remain the main backend entity

Bookings are still the source of truth.

However, the Telegram interface should convert bookings into `ActionItems`.

Example:

```text
Booking → Pickup task
Booking → Return task
Booking → Payment task
Booking → Approval task
Booking → Overdue task
```

### 2. Dashboard should show a 3-day work queue

The dashboard should show:

```text
Today + next 3 days
```

If today is Monday, the dashboard should include:

```text
Monday    — today
Tuesday   — tomorrow
Wednesday — +2 days
Thursday  — +3 days
```

Overdue items should always show, even if older than 3 days.

### 3. Main dashboard should include money snapshot

The owner wants these on the main page:

```text
Today revenue / money
This month
All-time
Pending
```

Recommended compact section:

```text
💰 Money
Today: RM 180
Month: RM 2,430
All-time: RM 18,920
Pending: RM 120
```

### 4. Numbered task selection

The dashboard should display numbered items:

```text
[1] Haikal — pickup | R50 | Today 3PM | RM80 due
[2] Aisyah — return | A7IV | Today 6PM | check deposit
[3] Danial — pickup | FX3 | Tomorrow | delivery
```

Inline keyboard:

```text
[1] [2] [3]
[4] [5] [6]
[➕ New Booking] [📅 Today]
[📈 Analytics] [⋯ More]
```

Tapping a number opens the detail screen for that task.

### 5. Clean Chat Mode

The Telegram chat should stay clean.

Recommended behavior:

```text
One active dashboard message.
Tap menu/button.
Same message edits into the next screen.
Temporary messages are deleted after use.
```

This makes the bot feel like a lightweight app instead of a messy chat log.

## Small Business UX Philosophy

The owner should not need to think like an admin.

Bad:

```text
booking_status: confirmed
equipment_picked_up: false
final_payment_paid: false
```

Good:

```text
Status: Pickup today
Payment: RM80 due
Next step: Prepare R50 and collect payment.
```

The bot should speak like a helpful assistant, not a database.

## Main Screens Discussed

1. Dashboard
2. Task Detail
3. Action Confirmation
4. Payment Entry
5. New Booking
6. Today View
7. Analytics
8. More Menu
9. Search Customer
10. Camera Inventory

The owner should spend most of their time in this flow:

```text
Dashboard → Task Detail → Action Done → Dashboard
```

## Final Product Direction

The best version is:

```text
Main page = clean 3-day command center
Number buttons = quick access
Detail page = preparation + actions
After action = refreshed dashboard
Old chat = cleaned or edited away
```
