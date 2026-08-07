so# Hermes MCP Setup — Remote PC Instructions

Copy everything below and paste to Hermes on the other PC.

---

## Step 1: Copy MCP server to the other PC

Copy this folder:
```
captura-camera-rental/mcp-server/
```

To the same path on the other PC, or anywhere. Just update `cwd` in step 2 if different.

You need the `.env.local` file from the main project too. Copy it to `mcp-server/../.env.local`. Required env vars:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Step 2: Create MCP config

Create file `kilo.json` in the project root (next to the `mcp-server/` folder):

```json
{
  "mcpServers": {
    "captura": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "./mcp-server"
    }
  }
}
```

Then restart Hermes/Kilo.

---

## Step 3: Verify

Ask Hermes: "List the captura cameras"

It should call `captura.cameras.list` and return the inventory. If it says the tool doesn't exist, the MCP config path is wrong.

---

## Step 4: Feed this behavior prompt to Hermes

```
USE CAPTURA MCP FOR ALL BOOKING OPERATIONS

Session start: Call captura.bookings.next_actions to see what's pending.

New booking: Use captura.bookings.admin.smart_create with camera_query (e.g. "osmo", "r50", "action", "fuji"). It handles camera matching, availability, and pricing automatically.

Approve bookings: Use captura.bookings.admin.bulk_approve with booking_ids array.

Daily checks: captura.bookings.today_returns and captura.bookings.overdue.

Complete workflow: captura.bookings.admin.complete handles pickup + return + refund in one call.

Reports: captura.admin.dashboard_summary for KPIs, captura.admin.revenue_report for revenue breakdown.

Camera inventory: captura.cameras.list.

Never write Python or Supabase queries for Captura data.
```

---

## Tool quick reference

| What you want | MCP tool |
|---|---|
| What's happening today? | `captura.bookings.next_actions` |
| Book a camera for someone | `captura.bookings.admin.smart_create` |
| Approve pending bookings | `captura.bookings.admin.bulk_approve` |
| Check camera availability | `captura.cameras.check_availability` |
| See all cameras + pricing | `captura.cameras.list` |
| Find a booking | `captura.bookings.search` |
| Mark equipment returned | `captura.bookings.admin.mark_return` |
| Complete booking fully | `captura.bookings.admin.complete` |
| Cancel a booking | `captura.bookings.admin.cancel` |
| Record a payment | `captura.payments.admin.record` |
| Refund deposit | `captura.payments.admin.mark_deposit_refunded` |
| Revenue report | `captura.admin.revenue_report` |
| Update camera pricing | `captura.cameras.admin.update` |
| Toggle camera on/off | `captura.cameras.admin.set_availability` |
| Dashboard KPIs | `captura.admin.dashboard_summary` |
