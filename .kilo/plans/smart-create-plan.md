# Plan: smart_create + bulk_approve MCP Tools + Hermes Setup Doc

## Files to Change

### 1. `mcp-server/src/tools/bookings.tools.ts` — Add 2 new compound functions

**`smartCreateBooking(fields)`** — single compound function that does:
1. Fuzzy-match `camera_query` against Supabase camera names (case-insensitive substring)
2. If 0 matches → return "No camera found matching 'X'"
3. If 2+ matches → return list of options with IDs, names, and daily rates (Hermes picks, re-calls with exact `camera_id`)
4. If 1 match → proceed
5. Call `checkAvailability()` for the matched camera
6. If not available → return conflict details
7. Calculate pricing: `totalDays = end-start+1`, apply discount threshold from camera record
8. Call existing `createBooking()` function
9. Return `{ booking_id, camera_name, total_days, daily_rate, total_cost, deposit, discount_applied }`

Zod schema:
```
camera_query: string (e.g., "osmo", "r50")
customer_name, customer_email, customer_phone (required)
start_date, end_date (YYYY-MM-DD)
pickup_method: 'pickup' | 'delivery' (default: pickup)
special_requests: string (optional)
```

**`bulkApproveBookings(bookingIds, notes)`**:
1. Array of booking IDs
2. Call `approveBooking()` sequentially for each
3. Collect successes and failures
4. Return `{ approved: [...ids], failed: [{id, error}] }`

Zod schema:
```
booking_ids: string[] (UUIDs)
notes: string (optional)
```

### 2. `mcp-server/src/validation/schemas.ts` — Add 2 new schemas

```typescript
smartCreateSchema: camera_query, customer_name, customer_email, customer_phone, start_date, end_date, pickup_method, special_requests
bulkApproveSchema: booking_ids (z.array(z.string().uuid())), notes
```

### 3. `mcp-server/src/auth/guard.ts` — Register new tools

```
'captura.bookings.admin.smart_create': ADMIN_WRITE
'captura.bookings.admin.bulk_approve': ADMIN_WRITE
```

### 4. `mcp-server/src/server.ts` — Register 2 new tools

Register `captura.bookings.admin.smart_create` and `captura.bookings.admin.bulk_approve` with their Zod schemas and auth gates.

### 5. `docs/HERMES_AGENT_SETUP.md` — Replace with MCP-only version

Remove all CLI/`captura-db.py` references. Structure:
- Install MCP server
- Hermes MCP client config  
- Full tool catalog
- Hermes behavior prompt (updated with smart_create + bulk_approve)
- What was removed (no CLI, no Python, no local SQLite, no mirror)

---

## Implementation Order
1. Add `smartCreateBooking` + `bulkApproveBookings` to `bookings.tools.ts`
2. Add schemas to `schemas.ts`
3. Add auth entries to `guard.ts`
4. Register tools in `server.ts`
5. Build: `tsc`
6. Test: `node dist/cli.js bookings smart-create --camera-query "osmo" ...`
7. Rewrite `HERMES_AGENT_SETUP.md` as MCP-only
