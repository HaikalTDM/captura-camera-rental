# Hermes + CAPTURA MCP Server

Hermes interacts with CAPTURA exclusively through the MCP server. No Python CLI. No Supabase scripts. No local SQLite.

## Install

```bash
cd mcp-server
npm install
npm run build
```

The MCP server reads env from `../.env.local` automatically. No extra config needed.

## MCP Client Configuration

Add to Hermes's MCP client config:

```json
{
  "mcpServers": {
    "captura": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/captura-camera-rental/mcp-server"
    }
  }
}
```

## Available Tools (32 total)

### Camera Tools (6)
| Tool | Access | Use |
|---|---|---|
| `captura.cameras.list` | public | List cameras (filter: available_only/all, sort) |
| `captura.cameras.get` | public | Get single camera by ID |
| `captura.cameras.check_availability` | public | Check camera availability for date range |
| `captura.cameras.admin.create` | admin | Add new camera |
| `captura.cameras.admin.update` | admin | Update camera pricing/details |
| `captura.cameras.admin.set_availability` | admin | Toggle camera on/off |

### Booking Tools (20)
| Tool | Access | Use |
|---|---|---|
| `captura.bookings.list` | auth | List bookings (filter by status, date, camera) |
| `captura.bookings.get` | auth | Single booking with customer info |
| `captura.bookings.search` | auth | Search by customer name/email/phone |
| `captura.bookings.today_returns` | auth | Today's expected returns |
| `captura.bookings.overdue` | auth | Overdue final payments |
| `captura.bookings.next_actions` | auth | Action queue (pending, pickups, returns, overdue) |
| `captura.bookings.admin.create` | admin | Create manual booking |
| `captura.bookings.admin.smart_create` | admin | **Smart booking**: fuzzy camera name → check availability → calculate price → create booking. One call. |
| `captura.bookings.admin.approve` | admin | Approve pending booking |
| `captura.bookings.admin.bulk_approve` | admin | **Bulk approve** up to 50 bookings at once |
| `captura.bookings.admin.reject` | admin | Reject with reason |
| `captura.bookings.admin.cancel` | admin | Cancel booking (confirm required) |
| `captura.bookings.admin.mark_pickup` | admin | Mark equipment picked up |
| `captura.bookings.admin.mark_return` | admin | Mark equipment returned |
| `captura.bookings.admin.complete` | admin | Full workflow: pickup + return + refund in one call |
| `captura.bookings.admin.delete` | admin | Permanently delete booking (confirm required) |

### Customer Tools (3)
| Tool | Access | Use |
|---|---|---|
| `captura.customers.list` | auth | List customers (search, paginate) |
| `captura.customers.get` | auth | Single customer with booking count |
| `captura.customers.admin.update` | admin | Update customer details |

### Payment & Invoice (3)
| Tool | Access | Use |
|---|---|---|
| `captura.payments.admin.record` | admin | Record payment (deposit/final/refund) |
| `captura.payments.admin.mark_deposit_refunded` | admin | Mark deposit refunded |
| `captura.invoices.admin.generate` | admin | Generate invoice for booking |

### Admin Tools (4)
| Tool | Access | Use |
|---|---|---|
| `captura.admin.get_settings` | public | Get all business settings |
| `captura.admin.update_settings` | admin | Update business setting |
| `captura.admin.dashboard_summary` | auth | Dashboard KPIs (today/week/month/year) |
| `captura.admin.revenue_report` | auth | Revenue breakdown by camera or month |

## Smart Tools (highest value)

### `captura.bookings.admin.smart_create`
Instead of 4 separate calls, one call handles everything:

```
Input:
  camera_query: "osmo" | "r50" | "action" | "fuji"
  customer_name, customer_email, customer_phone
  start_date, end_date
  pickup_method: "pickup" | "delivery" (default: pickup)

What it does:
  1. Fuzzy-matches camera_query against available cameras
  2. Checks availability for the date range
  3. Calculates pricing with discount threshold
  4. Creates the booking

Returns: booking_id, camera_name, total_days, daily_rate, total_cost, deposit, discount_applied

If multiple cameras match (e.g., "osmo" matches two variants), it returns them for disambiguation.
```

### `captura.bookings.admin.bulk_approve`
```
Input:
  booking_ids: ["id1", "id2", ...]
  notes: string (optional)

Returns: { approved: [...], failed: [{ id, error }] }
```

## Hermes Behavior Prompt

```
Use the CAPTURA MCP server for ALL Captura operations. Never write Python or Supabase queries.

SESSION START: Call captura.bookings.next_actions to see the operational queue.

BOOKING: Use captura.bookings.admin.smart_create for new bookings. It handles camera matching, availability, and pricing automatically.

APPROVING: Use captura.bookings.admin.bulk_approve to approve multiple pending bookings at once.

CHECKING: Use captura.bookings.today_returns and captura.bookings.overdue for daily checks.

COMPLETING: Use captura.bookings.admin.complete for the full pickup→return→refund flow on a single booking.

REPORTING: Use captura.admin.dashboard_summary for KPIs and captura.admin.revenue_report for revenue.

CAMERAS: Use captura.cameras.list for inventory and captura.cameras.check_availability before booking.

SETTINGS: Use captura.admin.get_settings for business config; captura.admin.update_settings to change values.
```

## What was removed

The old `captura-db.py` CLI, local SQLite cache, mirror webhook server, and all Supabase REST API calls are deprecated. Hermes now uses MCP tools exclusively.

---

## MCP Server maintenance

```bash
cd mcp-server
npm run build          # rebuild after code changes
node dist/index.js     # start via stdio (for MCP clients)
node dist/cli.js --help  # CLI bridge for manual use
```
