# Captura Telegram Bot — Features and Implementation Spec

## Existing Project Data

### Core Entities

#### Bookings

Main entity.

Relevant fields:

```text
id
customer_id
camera_id
start_date
end_date
total_days
total_amount
deposit_amount
deposit_paid
final_payment_paid
deposit_refunded
booking_status
status
pickup_date
pickup_method
pickup_address
equipment_picked_up
equipment_returned
booking_source
whatsapp_message_sent
discount_amount
admin_notes
```

Booking statuses:

```text
pending_approval
confirmed
active
completed
cancelled
rejected
```

Legacy status:

```text
pending
confirmed
active
completed
cancelled
```

Use `booking_status` as the source of truth. Use legacy `status` only as fallback.

#### Customers

```text
id
full_name
email
phone
whatsapp
id_number
address
emergency_contact_name
emergency_contact_phone
total_bookings
reliability_score
```

#### Cameras

```text
id
name
brand
model
type
daily_rate
weekly_rate
monthly_rate
deposit_amount
is_available
total_quantity
available_quantity
condition
serial_number
location
```

#### Payment Records

```text
id
booking_id
payment_type
amount
payment_method
payment_reference
payment_date
```

Payment types:

```text
deposit
final
refund
```

Payment methods:

```text
cash
bank_transfer
online
```

#### Invoices

```text
id
booking_id
invoice_number
status
customer/business/booking snapshots in JSONB
```

## Available MCP Tools

```text
cameras.list
cameras.get
cameras.check_availability

bookings.list
bookings.get
bookings.search
bookings.overdue
bookings.next_actions
bookings.today_returns

admin.approve
admin.reject
admin.cancel
admin.mark_pickup
admin.mark_return
admin.complete
admin.smart_create
admin.bulk_approve

customers.list
customers.get

payments.admin.record
payments.admin.mark_deposit_refunded

invoices.admin.generate

admin.dashboard_summary
admin.revenue_report
admin.get_settings
admin.update_settings
```

## Main Feature: Action Items

The Telegram bot should display `ActionItems`, not raw bookings.

### ActionItem Shape

```ts
type ActionItem = {
  id: string
  bookingId: string
  actionType:
    | "overdue"
    | "return"
    | "pickup"
    | "payment"
    | "approval"
    | "active"
    | "completion"
    | "invoice"
  priority: number
  customerName: string
  cameraName: string
  dateLabel: string
  timeLabel?: string
  signal?: string
  amountDue?: number
  statusLabel: string
}
```

## Action Item Generation Rules

### Overdue

Condition:

```text
booking_status = active
equipment_returned = false
end_date < today
```

Action item:

```text
[1] Amir — overdue | FX3 | +1 day | contact
```

Priority: highest.

Always show overdue items, even outside the 3-day horizon.

### Return Today / Return Soon

Condition:

```text
booking_status = active
equipment_returned = false
end_date between today and today + 3 days
```

Action item:

```text
[2] Aisyah — return | A7IV | Today 6PM | deposit
```

### Pickup Today / Pickup Soon

Condition:

```text
booking_status = confirmed
equipment_picked_up = false
pickup_date between today and today + 3 days
```

Fallback:

```text
Use start_date if pickup_date is missing.
```

Action item:

```text
[3] Haikal — pickup | R50 | Today 3PM | RM80 due
```

### Payment Pending

Condition:

```text
deposit_paid = false
OR final_payment_paid = false
```

Prioritize payment tasks if the booking starts within the 3-day horizon or is already active.

Action item:

```text
[4] Danial — payment | R6 II | RM120 due
```

### Pending Approval

Condition:

```text
booking_status = pending_approval
start_date within today + 3 days
```

Action item:

```text
[5] Nurul — approve | R50 | 24–26 Jun
```

### Completion

Condition:

```text
equipment_returned = true
booking_status != completed
```

Action item:

```text
[6] Aisyah — complete | A7IV | invoice
```

## Priority Order

```text
1. Overdue
2. Today return
3. Today pickup
4. Today payment
5. Tomorrow pickup/return
6. +2 days pickup/return
7. +3 days pickup/return
8. Pending approval
9. Completion / invoice task
```

## Dashboard Settings

Recommended configurable settings:

```text
dashboard_horizon_days = 3
dashboard_max_items = 6
show_overdue_always = true
show_money_snapshot = true
show_all_time_revenue = true
business_timezone = Asia/Kuala_Lumpur
```

These can be stored in `business_settings`.

## Money Logic

Recommended main section:

```text
💰 Money
Today: RM 180
Month: RM 2,430
All-time: RM 18,920
Pending: RM 120
```

Recommended definitions:

```text
Today = money collected today
Month = revenue collected this month
All-time = total collected revenue
Pending = unpaid deposit/final payment still owed
```

Accounting recommendation:

```text
Refundable deposit should not be treated as true revenue unless the business intentionally counts cash collected instead of revenue.
```

If the owner prefers simplicity, label the section as `Money` instead of `Revenue`.

## Dashboard Data Strategy

Use these MCP tools:

```text
admin.dashboard_summary
admin.revenue_report
bookings.next_actions
bookings.overdue
bookings.today_returns
bookings.list
```

Best approach:

1. Call `admin.dashboard_summary` for KPIs.
2. Call `admin.revenue_report` for month and all-time values.
3. Call `bookings.next_actions` for the work queue if it supports a 3-day horizon.
4. If `bookings.next_actions` does not support horizon days, build the queue from bookings manually.
5. Fetch full details only when the owner taps a number.

## Numbered Button Mapping

The visible number is only for UI.

Button text:

```text
[1]
```

Callback data should include real IDs:

```text
task:pickup:booking_abc123
```

Do not use only:

```text
task:1
```

Reason:

If the dashboard refreshes, task number 1 may point to a different booking.

## Callback Data Suggestions

Keep callback data short and structured.

Examples:

```text
dash
task:p:bk123
task:r:bk123
task:o:bk123
pay:bk123
pickup:bk123
return:bk123
approve:bk123
reject:bk123
more
back:dash
```

Possible abbreviation:

```text
p = pickup
r = return
o = overdue
a = approval
pay = payment
```

## Clean Chat Mode

### Goal

Keep Telegram clean by using one active dashboard message.

### Session State

Store per owner chat:

```ts
type ChatSession = {
  chatId: number
  activeMessageId?: number
  currentScreen?: string
  currentBookingId?: string
  cleanupMessageIds: number[]
  lastRenderedAt?: string
}
```

### Navigation Rule

On every inline button click:

```text
1. answerCallbackQuery
2. delete cleanup messages
3. edit active message if possible
4. if edit fails, send new message and save message_id
5. render next screen
```

### Temporary Input Flow

Example payment entry:

```text
Bot edits screen: Enter payment amount
User replies: RM80
Bot records payment
Bot deletes prompt message
Bot deletes user reply
Bot edits dashboard/detail screen
```

## Telegram Capabilities Used

Relevant Telegram Bot API capabilities:

- `editMessageText` to update one message instead of sending many.
- `editMessageReplyMarkup` to update only inline buttons.
- `deleteMessage` to delete recent messages.
- `deleteMessages` to batch delete recent messages.
- `answerCallbackQuery` to clear button loading state and show short success notifications.
- `ForceReply` for clean step-by-step user input.
- `setMyCommands` for command menu.
- `setChatMenuButton` for a custom bot menu button.
- Telegram Mini Apps as a future option for full app-like UI.

References:

- https://core.telegram.org/bots/api
- https://core.telegram.org/bots/features
- https://core.telegram.org/bots/webapps

## Important Telegram Limitation

Message deletion is limited. The bot cannot guarantee deletion of very old messages.

Design rule:

```text
Edit messages first.
Delete recent temporary messages second.
If deletion fails, ignore safely.
```

## Suggested Bot Commands

```text
/dashboard - Open owner dashboard
/new - Create new booking
/today - View today’s tasks
/search - Search customer or booking
/cameras - Manage camera inventory
/analytics - View revenue and booking analytics
/settings - Bot settings
```

## Suggested Menu Button

Use the bot menu button for:

```text
Dashboard
```

Or, if a Mini App is added later:

```text
Open Captura
```

## Implementation Modules

Suggested modules or files:

```text
dashboard.renderer.ts
dashboard.actions.ts
dashboard.keyboard.ts
dashboard.clean-chat.ts
dashboard.money.ts
dashboard.queue.ts
booking-detail.renderer.ts
telegram.callbacks.ts
telegram.session.ts
```

Adjust names based on the existing project structure.

## Core Functions

```ts
buildDashboardData()
buildActionQueue(bookings, settings)
renderDashboard(data)
renderTaskDetail(actionItem, booking)
buildDashboardKeyboard(actionItems)
buildTaskKeyboard(actionItem, booking)
getDashboardStatus(actionItems)
formatMoney(amount)
formatDateLabel(date)
safeEditOrSendMessage(chatId, messageId, content)
cleanupChatMessages(chatId, messageIds)
```

## Error Handling

If MCP fails:

```text
⚠️ Could not fetch live dashboard.
Showing last known data.
```

If a task no longer exists:

```text
This booking has changed or no longer exists.
Dashboard refreshed.
```

If edit fails:

```text
Send a fresh dashboard and store the new message_id.
```

If delete fails:

```text
Ignore safely and continue.
```

## Testing Checklist

### Dashboard Rendering

- All values zero.
- 1 pickup today.
- 1 return today.
- 1 overdue rental.
- 1 payment due.
- 1 pending approval.
- More than 6 action items.
- Missing pickup_date.
- Missing customer name.
- Missing camera name.

### Action Queue

- Overdue always appears.
- Today tasks appear before future tasks.
- Future tasks only within 3 days.
- Pending payment appears when deposit or final payment is unpaid.
- Completed bookings do not appear.

### Clean Chat

- Dashboard edits in place.
- Back button edits in place.
- Temporary user replies are deleted.
- Cleanup failure does not break the bot.
- Old message edit failure sends a new dashboard.

### Buttons

- Number buttons open correct booking.
- Callback uses booking ID, not visual number.
- Pickup buttons only show on pickup tasks.
- Return buttons only show on return tasks.
- Confirmation appears for dangerous actions.

## Future Enhancements

### Mini App

Build later if needed for:

```text
visual booking calendar
drag-and-drop scheduling
camera inventory grid
analytics charts
multi-step booking form
```

### Accessories

Wire accessories to the prep checklist.

Example:

```text
R50 booking includes:
- Camera body
- Battery
- Charger
- Memory card
- Tripod
```

### Maintenance

Use `maintenance_records` and camera condition to warn:

```text
🛠 R50 needs repair before pickup
```

### Peak Seasons

Use Malaysian holidays and peak-season events to show:

```text
🔥 Peak period this weekend
Check camera availability early.
```

## Final Product Summary

The final bot should feel like this:

```text
Here is what needs attention.
Tap the number.
See the details.
Tap the action.
The bot updates the system.
The chat stays clean.
```
