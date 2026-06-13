# Admin Workflow Streamlining Plan

Goal: surface unused MCP backend capabilities in the Telegram bot to speed up
day-to-day admin work, with an **approval-based** model — the bot proposes an
action, the admin confirms it before anything mutates.

Bookings creation is intentionally **out of scope** (handled via the website).

---

## 1. Current State

The MCP server (`mcp-server/src/server.ts`) exposes **32 tools**. The bot
(`bot/captura_bot.py`) actively uses ~10 — booking lifecycle plus dashboard
reads. The rest are unused and map directly onto the target workflow.

### Tools available vs. used

| Area | MCP tool | In bot? |
|---|---|---|
| Payment chasing | `captura.payments.admin.record` | No |
| Deposit refund | `captura.payments.admin.mark_deposit_refunded` | No |
| Invoicing | `captura.invoices.admin.generate` | No |
| Camera inventory | `captura.cameras.admin.update` | No |
| Camera availability | `captura.cameras.admin.set_availability` | No |
| Customer edit | `captura.customers.admin.update` | No |
| Schedule | `captura.bookings.next_actions` | Partial |
| Revenue | `captura.admin.revenue_report` | No |
| Reminders | `send_whatsapp()` + customer lookup | Link only |

### Architecture facts the plan builds on

- **Mutation pattern**: every mutating action calls `mcp.call_tool()` first with
  a `supabase_patch()` fallback. Template: `approve_booking()` at
  `bot/captura_bot.py:580`.
- **Confirmation flow already exists**: `make_confirm_keyboard(action, id, label, back_cb)`
  at `bot/captura_bot.py:805` emits `do_<action>:<id>` callbacks, handled in the
  dispatcher chain starting `bot/captura_bot.py:1178`. This is the hook for the
  approve-each-action requirement.
- **WhatsApp**: `send_whatsapp(phone, message)` at `bot/captura_bot.py:524` posts
  to the bridge (`WHATSAPP_BRIDGE_URL`). Reminders need templates + triggers only.
- **Routing**: callbacks dispatched via the `elif data.startswith(...)` chain at
  `bot/captura_bot.py:1127`; menus built by `make_main_menu()` at `:750`;
  booking-detail actions by `make_booking_actions()` at `:776`.

---

## 2. Workflow Features

### F1 — Payment chasing
Surface outstanding balances and record payments from the booking detail view.

- Add **💰 Record Payment** button to `make_booking_actions()` for `confirmed` /
  `active` bookings → callback `pay:<booking_id>`.
- `pay:` opens a small inline keyboard for `payment_type` (deposit/final/refund)
  and `payment_method` (cash/bank_transfer/online); amount defaults to the
  booking balance, editable via a follow-up text prompt.
- Confirm step routes through `make_confirm_keyboard("recordpay", id, ...)` →
  `do_recordpay:` handler calls `captura.payments.admin.record`.
- After recording, offer **📤 Send Receipt** (WhatsApp template).

### F2 — Customer reminders
Send templated WhatsApp nudges for upcoming pickups, due returns, and overdue.

- New view **⏰ Reminders** in main menu, built from `bookings.next_actions`.
- Each row gets a **📨 Remind** button → `remind:<booking_id>` → preview the
  message → confirm → `send_whatsapp()`.
- Templates: pickup-tomorrow, return-due-today, overdue, payment-due. Store as a
  dict near the existing message strings.

### F3 — Invoicing
Generate an invoice for a completed/active booking.

- Add **🧾 Generate Invoice** to `make_booking_actions()` → `inv:<booking_id>`
  → confirm → `captura.invoices.admin.generate`.
- Reply with invoice number + offer to WhatsApp the link to the customer.

### F4 — Camera inventory
Toggle availability and edit rates without leaving Telegram.

- New view **📷 Cameras** in main menu, listing cameras from `cameras.list`.
- Per-camera: **🟢/🔴 Toggle Availability** → confirm →
  `captura.cameras.admin.set_availability`; **✏️ Edit Rate** → text prompt →
  confirm → `captura.cameras.admin.update`.

### F5 — Schedule visibility
Promote `bookings.next_actions` into a single prioritized "What needs doing"
screen (pickups due, returns due, overdue, pending) with deep-links into each
booking detail.

### F6 — Revenue snapshot
Add **📈 Revenue** to the analytics view calling `captura.admin.revenue_report`
for week/month, formatted with `format_currency()`.

---

## 3. Cross-cutting Conventions

- **Always confirm before mutating.** Reuse `make_confirm_keyboard()`; add new
  `do_<action>` branches in the dispatcher rather than new ad-hoc flows.
- **MCP-first, Supabase-fallback** for any new mutation, matching
  `approve_booking()`.
- **Invalidate caches** after mutations via `invalidate_cache()`.
- **Text-input flows** (amount, rate) use the existing per-chat session pattern
  (`_search_sessions` style state keyed by `chat_id`).
- Register any new top-level command in the `CommandHandler` block at
  `bot/captura_bot.py:1737` and the menu builder.

---

## 4. Suggested Sequencing

1. **F1 Payment chasing** + **F3 Invoicing** — highest daily value, both hang off
   the existing booking-detail view and confirm flow. Smallest blast radius.
2. **F2 Reminders** — reuses `send_whatsapp()`; mostly templates + a new view.
3. **F5 Schedule** — read-only, low risk, improves visibility immediately.
4. **F4 Camera inventory** — introduces text-input editing; do after the
   confirm/text-prompt plumbing from F1 is proven.
5. **F6 Revenue** — small, additive analytics read.

---

## 5. Open Questions / Assumptions

- Assumes the booking object already carries a balance/outstanding figure for
  F1 defaults; verify field name before implementing (check `get_booking()`
  payload).
- Assumes `invoices.admin.generate` returns a shareable URL; confirm the return
  shape when wiring F3.
- Reminder triggering is **manual** (admin taps Remind). A scheduled/automatic
  reminder pass is a possible later phase but is not included here, consistent
  with the approval-based model.
