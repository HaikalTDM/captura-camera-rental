# 🦅 ZeroClaw — Captura TOOLS.md
*Last updated: 2026-03-14*
*Base URL (local dev): http://localhost:3000*
*Base URL (production): https://captura.my*

All routes are public GET endpoints — no authentication headers required.
They use the Supabase Admin service role internally. Do NOT expose these routes on the public internet without adding a secret key guard.

---

## TOOL 1: Business Summary Snapshot
**When to use:** Call this FIRST at the start of any session or when Haikal asks "what's going on today?" to get full situational awareness.

```
GET /api/zeroclaw/summary
```

**Returns:**
- `today` — current date (YYYY-MM-DD)
- `cameras` — all cameras with live availability status
- `pending_approvals` — bookings awaiting Haikal's approval
- `active_rentals` — cameras currently out with customers
- `todays_pickups` — customers picking up gear today
- `todays_returns` — customers returning gear today
- `overdue_payments` — completed bookings with unpaid final balances

**Example call:**
```
GET /api/zeroclaw/summary
```

---

## TOOL 2: List Cameras
**When to use:** When asked about available gear, pricing, or camera specs.

```
GET /api/zeroclaw/cameras
```

**Returns:** Array of cameras with `id, name, brand, type, daily_rate, deposit_amount, is_available, available_quantity, total_quantity, condition, description`

**Example call:**
```
GET /api/zeroclaw/cameras
```

---

## TOOL 3: Check Availability
**When to use:** Before confirming a booking date to a customer. Always run this to check for conflicts.

```
GET /api/zeroclaw/availability?camera_id=<UUID>&start_date=<YYYY-MM-DD>&end_date=<YYYY-MM-DD>
```

**Required params:**
| Param | Type | Description |
|---|---|---|
| `camera_id` | UUID | The camera's Supabase UUID |
| `start_date` | YYYY-MM-DD | First rental day |
| `end_date` | YYYY-MM-DD | Last rental day (inclusive) |

**Returns:**
- `available: true/false` — whether the camera is free
- `conflicts` — array of overlapping bookings if blocked
- `blocked_dates` — array of admin calendar blocks if blocked

**Example call:**
```
GET /api/zeroclaw/availability?camera_id=508eb0ae-8895-4f5a-a445-5777dcb28ddb&start_date=2026-03-20&end_date=2026-03-22
```

---

## TOOL 4: Query Bookings
**When to use:** When asked about upcoming bookings, booking history, payments, or a specific rental.

```
GET /api/zeroclaw/bookings
```

**Optional query params:**
| Param | Type | Description |
|---|---|---|
| `status` | string | Filter by `booking_status`: `pending_approval`, `confirmed`, `completed`, `cancelled`, `rejected` |
| `camera_id` | UUID | Filter to one specific camera |
| `customer_id` | UUID | Filter to one specific customer |
| `date` | YYYY-MM-DD | Find all bookings overlapping this date |
| `limit` | number | Max results (default: 20) |

**Returns:** Array of bookings with joined `customers` and `cameras` data.

**Example calls:**
```
GET /api/zeroclaw/bookings?status=pending_approval
GET /api/zeroclaw/bookings?date=2026-03-20
GET /api/zeroclaw/bookings?camera_id=508eb0ae-8895-4f5a-a445-5777dcb28ddb
```

---

## TOOL 5: Query Customers
**When to use:** When asked to find a customer, check their booking history, or verify contact details.

```
GET /api/zeroclaw/customers
```

**Optional query params:**
| Param | Type | Description |
|---|---|---|
| `search` | string | Search by name, email, or phone number |
| `id` | UUID | Get one specific customer with full booking history |

**Returns:** Customer records with `full_name`, `email`, `phone`, `whatsapp`, `reliability_score`, `total_bookings`. If `id` is provided, also returns last 10 bookings for that customer.

**Example calls:**
```
GET /api/zeroclaw/customers?search=Haikal
GET /api/zeroclaw/customers?id=<customer-uuid>
GET /api/zeroclaw/customers
```

---

## CAMERA ID REFERENCE
*These are the confirmed camera UUIDs from Supabase. Use these for availability checks.*

| Camera Name | UUID |
|---|---|
| Canon R50 | `508eb0ae-8895-4f5a-a445-5777dcb28ddb` |
| Fujifilm X-T30 II | `f39185a0-2f3b-4176-a4f6-821fba8274de` |
| DJI Osmo Pocket 3 | `67cf0e0b-90f4-4bd9-a0f9-b9cbb652cc44` |
| DJI Action 5 Pro | `12290ecb-a4b2-4c6c-9709-c3ac6151a553` |
| Canon R50 - Mother | `4349682c-194e-47ae-828e-eb581eb24bd0` |
| DJI Osmo Pocket 3 (ii) | `599fed58-9970-4cd5-b193-9010b6ccc704` |

---

## BOOKING STATUS REFERENCE

| Status | Meaning |
|---|---|
| `pending_approval` | Customer submitted, waiting for Haikal to approve |
| `confirmed` | Approved, customer is scheduled to pick up |
| `completed` | Rental finished |
| `cancelled` | Customer cancelled |
| `rejected` | Haikal rejected the booking request |

---

*ZeroClaw — Captura Integration v1.0*
*Built by Gates on 2026-03-14*
