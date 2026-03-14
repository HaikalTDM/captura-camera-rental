# 🤖 n8n — Captura Tools API
*Last updated: 2026-03-15*
*Base URL (local dev): http://localhost:3000*
*Base URL (production): https://www.captura.my*

All routes are public GET endpoints, but you should treat them as Internal APIs to be called by your n8n workflows (typically using the **HTTP Request Node**). 
These endpoints use the Supabase Admin service role internally to retrieve data without RLS blocking. Do NOT expose them publicly without a secret key if you want them secured in the future.

---

## NODE 1: Business Summary Snapshot
**When to use:** Use this in a scheduled trigger (e.g. Cron node every morning at 8 AM) or when analyzing the day's operations.

```
GET /api/n8n/summary
```

**Returns JSON:**
- `today` — current date (YYYY-MM-DD)
- `cameras` — all cameras with live availability status
- `pending_approvals` — bookings awaiting Haikal's approval
- `active_rentals` — cameras currently out with customers
- `todays_pickups` — customers picking up gear today
- `todays_returns` — customers returning gear today
- `overdue_payments` — completed bookings with unpaid final balances

**n8n Setup:**
- Method: `GET`
- URL: `https://www.captura.my/api/n8n/summary`
- Auth: None

---

## NODE 2: List Cameras
**When to use:** When your Agent node needs to know pricing, specs, or what gear exists in the catalog.

```
GET /api/n8n/cameras
```

**Returns JSON:** Array of cameras (`id`, `name`, `brand`, `type`, `daily_rate`, `deposit_amount`, `is_available`, etc.)

**n8n Setup:**
- Method: `GET`
- URL: `https://www.captura.my/api/n8n/cameras`

---

## NODE 3: Check Availability
**When to use:** Crucial for chatbot agents. Always run this node to check for calendar conflicts before telling a customer a camera is available.

```
GET /api/n8n/availability
```

**Query Parameters (Set these in the HTTP Request node):**
| Param | Type | Description |
|---|---|---|
| `camera_id` | UUID | The camera's Supabase UUID |
| `start_date` | YYYY-MM-DD | First rental day |
| `end_date` | YYYY-MM-DD | Last rental day (inclusive) |

**Returns JSON:**
- `available: true/false` — whether the camera is free
- `conflicts` — array of overlapping bookings if blocked
- `blocked_dates` — array of admin calendar blocks if blocked

---

## NODE 4: Query Bookings
**When to use:** When you need to summarize upcoming rentals, sync to a Google Calendar, or answer Customer Support queries.

```
GET /api/n8n/bookings
```

**Optional Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `status` | string | Filter by `booking_status`: `pending_approval`, `confirmed`, `completed`, `cancelled`, `rejected` |
| `camera_id` | UUID | Filter to one specific camera |
| `customer_id` | UUID | Filter to one specific customer |
| `date` | YYYY-MM-DD | Find all bookings overlapping this date |
| `limit` | number | Max results (default: 20) |

---

## NODE 5: Query Customers
**When to use:** Finding customer details or checking their reliability/history score.

```
GET /api/n8n/customers
```

**Optional Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `search` | string | Search by name, email, or phone number |
| `id` | UUID | Get one specific customer with full booking history |

---

## CAMERA ID REFERENCE
*Use these UUIDs in your HTTP Request nodes when querying `availability` or `bookings`.*

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
