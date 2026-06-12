# MCP Server Enhancement Plan — Smart Automation First

> **Priority:** Smart compound tools → Uncovered operations → Infrastructure hardening
> **Goal:** Make Hermes complete complex business tasks in 1 tool call instead of 4-8.

---

## 1. SMART AUTOMATION TOOLS — PHASE 1 (HIGHEST IMPACT)

### 1.1 Smart Booking (`captura.bookings.admin.smart_create`)
Replaces 3-4 tool calls with one. Handles fuzzy camera name matching, availability check, pricing calculation, and booking creation in a single call.

```
Input:
  customer_name, customer_phone, customer_email
  camera_query (e.g., "osmo", "r50", "action", "fuji")
  start_date, end_date
  pickup_method (default: pickup)
  special_requests (optional)

Internal flow:
  1. Fuzzy-match camera_query across camera names (case-insensitive contains)
  2. If multiple matches → return list, ask Hermes to pick
  3. Check availability for matched camera + date range
  4. Calculate total: totalDays × (discountedRate if threshold met else dailyRate)
  5. Create booking via /api/bookings/submit
  6. Return: { booking_id, camera_name, total_days, daily_rate, total_cost, deposit, discount_applied }
```

**Token savings:** 4 calls → 1 call (~75% reduction)

### 1.2 Daily Brief (`captura.admin.daily_brief`)
The single most-used tool Hermes should call at the start of every session.

```
Output:
  {
    date: "2026-06-12",
    pending_approvals: [{ id, customer_name, camera_name, total, created }],
    todays_pickups: [{ id, customer_name, camera_name, start_date }],
    todays_returns: [{ id, customer_name, camera_name, end_date, deposit_status }],
    overdue_payments: [{ id, customer_name, amount_due, days_overdue }],
    stats: {
      active_bookings: 6,
      available_cameras: 4,
      revenue_this_month: 2450,
      new_bookings_this_week: 3
    }
  }
```

**Token savings:** 5 tool calls → 1 call (~90% reduction; this is the biggest win)

### 1.3 Bulk Approve (`captura.bookings.admin.bulk_approve`)
```
Input: booking_ids: string[]
Internal: approve each via /api/bookings/[id]/approve sequentially
Output: { approved: [...], failed: [{ id, error }] }
```

**Token savings:** N calls → 1 call (linear gain)

### 1.4 Bulk Mark Returned (`captura.bookings.admin.bulk_mark_returned`)
```
Input: booking_ids: string[], default_condition: 'good'
Internal: mark each returned via /api/bookings/[id]/return-status
Output: { returned: [...], failed: [{ id, error }] }
```

**Token savings:** N calls → 1 call

### 1.5 Customer Follow-up (`captura.customers.admin.send_followup`)
```
Input: customer_id
Internal:
  1. Find completed bookings with no review
  2. Generate review request token
  3. Return: { review_url, customer_email, booking_summary }
Output: ready-to-send follow-up data
```

---

## 2. UNCOVERED OPERATIONS — PHASE 2

### 2.1 Studio & Photography Tools
| Tool | Purpose |
|---|---|
| `captura.studio.inquiries.list` | List quote requests (filter by status) |
| `captura.studio.inquiries.update_status` | Move inquiry through pipeline (new → contacted → quoted → booked) |
| `captura.studio.bookings.list` | List photography/videography bookings |
| `captura.studio.bookings.get` | Get booking with client details |

### 2.2 Review Management
| Tool | Purpose |
|---|---|
| `captura.reviews.list` | List reviews by status |
| `captura.reviews.approve` / `reject` / `feature` | Manage review pipeline |
| `captura.reviews.request` | Send review request to customer |

### 2.3 Notification Triggers
| Tool | Purpose |
|---|---|
| `captura.notifications.send_whatsapp` | Send WhatsApp confirmation |
| `captura.notifications.trigger_reminders` | Trigger pickup/return email reminders |

### 2.4 Photography Gallery
| Tool | Purpose |
|---|---|
| `captura.gallery.list` | List gallery images |
| `captura.gallery.toggle_active` | Show/hide images |

---

## 3. INFRASTRUCTURE HARDENING — PHASE 3

- **Retry logic** — 3 retries on Supabase transient errors (mirrors `captura-db.py:80-81`)
- **Rate limiting** — 60 req/min per tool, 120/min for reads
- **Memory cache** — 30s TTL for camera list, 60s for dashboard (saves Supabase egress)
- **Health tool** — `captura.health.status` for diagnostics
- **Compact output toggle** — `format: 'compact'` for fewer response tokens

---

## 4. IMPLEMENTATION ORDER

| Order | Item | Est. Time | Why First |
|---|---|---|---|
| 1 | `smart_create` | 2h | Highest token savings per booking |
| 2 | `daily_brief` | 1h | Hermes calls this first every session |
| 3 | `bulk_approve` | 0.5h | Batch operations save loops |
| 4 | `bulk_mark_returned` | 0.5h | Batch operations save loops |
| 5 | `send_followup` | 1h | Closes the booking → review loop |
| 6 | Studio inquiries CRUD | 2h | Uncovers major data silo |
| 7 | Reviews management | 1h | Uncovers review pipeline |
| 8 | Notification triggers | 1h | Enables Hermes to send messages |
| 9 | Gallery tools | 0.5h | Uncovers gallery data |
| 10 | Infrastructure hardening | 2h | Rate limits, retries, cache, health |

**Total estimated:** ~11.5 hours across 3 phases

---

## 5. ARCHITECTURAL NOTES

| Decision | Rationale |
|---|---|
| Compound tools call existing tool functions internally | Reuses tested logic, single source of truth |
| Fuzzy matching in `smart_create` uses simple substring | "osmo" matches "DJI Osmo Pocket 3" and "DJI Osmo Pocket 3 (ii)" — returns list for disambiguation |
| Bulk ops use sequential API calls (not parallel) | Avoids race conditions; booking state changes must be ordered |
| Cache uses `Map<string, { data, expiresAt }>` in memory | No external dependency; process lifecycle matches Hermes session |
| Write tools call app API routes | Preserves business logic (calendar blocks, notifications, mirror push) |

---

## END OF PLAN

