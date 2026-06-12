# Session Summary — CAPTURA MCP Server Implementation

**Date:** June 12, 2026  
**Branch:** `master`  
**Commit:** `e55456c` — `feat(mcp): 32 tools, smart_create, bulk_approve, full Hermes integration`

---

## What We Built

A **Model Context Protocol (MCP) server** (`mcp-server/`) that gives Hermes (AI agent) structured read/write tools to manage the entire CAPTURA camera rental business via Supabase — no Python scripts, no CLI generation.

### Architecture
```
mcp-server/
├── src/
│   ├── index.ts              → StdioServerTransport bootstrap
│   ├── server.ts             → 32 MCP tools registered
│   ├── cli.ts                → CLI bridge for manual testing
│   ├── config.ts             → Env loading from ../.env.local
│   ├── supabase/client.ts    → Service-role Supabase client
│   ├── supabase/types.ts     → DB type definitions
│   ├── auth/api-key.ts       → SHA-256 API key validation
│   ├── auth/guard.ts         → 3-tier access (PUBLIC_READ, AUTH_READ, ADMIN_WRITE)
│   ├── validation/schemas.ts → 25 Zod schemas
│   ├── validation/validator.ts
│   ├── errors/handler.ts     → 8 error codes, MCP-formatted responses
│   ├── audit/logger.ts       → JSON stdout audit trail
│   └── tools/
│       ├── cameras.tools.ts    → list, get, check_availability, create, update, set_availability
│       ├── bookings.tools.ts   → list, get, search, today_returns, overdue, next_actions,
│       │                         create, smart_create, approve, bulk_approve, reject, cancel,
│       │                         mark_pickup, mark_return, complete, delete
│       ├── customers.tools.ts  → list, get, update
│       ├── payments.tools.ts   → record, mark_deposit_refunded
│       ├── invoices.tools.ts   → generate
│       └── admin.tools.ts      → get_settings, update_settings, dashboard_summary, revenue_report
├── dist/                    → Compiled JS output
├── package.json             → deps: @modelcontextprotocol/sdk, supabase-js, zod, dotenv
├── tsconfig.json            → NodeNext, ES2022
└── .env.example
```

### Key Tools (32 total)

| Tool | Purpose |
|------|---------|
| `captura.cameras.list` | List cameras with pricing |
| `captura.bookings.next_actions` | Action queue (pending, pickups, returns, overdue) |
| `captura.bookings.admin.smart_create` | **One call:** fuzzy camera match → availability → pricing → create booking |
| `captura.bookings.admin.bulk_approve` | Approve up to 50 bookings at once |
| `captura.bookings.admin.complete` | Pickup + return + refund in one call |
| `captura.admin.dashboard_summary` | KPIs for today/week/month/year |
| `captura.admin.revenue_report` | Revenue breakdown by camera or month |

### Smart tool details

**`smart_create`** replaces 4 separate calls:
1. Fuzzy-matches `camera_query` (e.g., "osmo", "r50", "fuji") against available cameras
2. Checks availability for date range
3. Calculates pricing with discount threshold
4. Creates booking + auto-creates/updates customer
5. If multiple matches → returns disambiguation list
6. Returns: `booking_id, camera_name, total_days, daily_rate, total_cost, deposit, discount_applied`

## Schema Issues Fixed During Audit

Hermes found 8 broken tools and 1 crash during a 32-tool audit. All fixed:

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| `customers.*` (3 tools) | `reliability` column doesn't exist in DB | Removed from SELECT + types |
| `bookings.search` | UUID mismatch in `id.eq.${query}` fallback | Rewrote: search customers first, then their bookings |
| `payments.admin.*` (2 tools) | `payment_records` table doesn't exist in DB | Rewrote to update bookings table columns directly |
| `invoices.admin.generate` | No FK `bookings→cameras` in schema cache | Fetch camera name separately |
| `admin.update_settings` | `description` column missing from `business_settings` | Removed from upsert |
| `admin.revenue_report` | No FK `bookings→cameras` in schema cache | Separate camera name lookup via `.in()` |
| `cameras.admin.create` | `purchase_date` is NOT NULL but not provided | Added default `new Date()` |
| `smart_create` crash | Multiple issues (name column + FK + error handling) | Fixed by all above fixes |
| **Customers INSERT** | `name` column NOT NULL but only `full_name` was set | Added `name: fields.customer_name` to INSERT and UPDATE |

## Business Knowledge Base

Created `docs/WHATSAPP_AI_KNOWLEDGE_BASE.md` with all rental policies, pricing, camera specs, and T&Cs extracted from the codebase.

**Key business rules captured:**
- Deposit: RM100 only (no separate booking deposit)
- Pickup location: No 78, Jalan Masjid, Selayang Pandang
- Discount thresholds: DJI + Fuji = 3 days, Canon R50 = 4 days
- Pricing: Osmo/Action = RM50/day (RM45 discounted), Canon R50 = RM60/day (RM55), Fuji = RM100/day (RM90)
- Late return: RM10/hour or RM50/day
- Cancellation: 24h+ full refund, <24h 50% charge
- No Insta360 X5 (removed), no R50 Mother, no social media promo, no weekly/monthly rates

## Documentation Created

| File | Purpose |
|------|---------|
| `docs/WHATSAPP_AI_KNOWLEDGE_BASE.md` | Business knowledge for WhatsApp AI agent |
| `docs/HERMES_AGENT_SETUP.md` | MCP-only Hermes setup (no Python, no CLI) |
| `docs/SETUP_REMOTE_HERMES.md` | Copy-paste instructions for remote PC setup |
| `.kilo/plans/mcp-server-implementation.md` | Architecture design plan |
| `.kilo/plans/mcp-enhancement-plan.md` | Enhancement roadmap (smart tools, uncovered ops, hardening) |
| `.kilo/plans/smart-create-plan.md` | Smart create + bulk approve implementation plan |

## Remote PC Setup (for Hermes on other machine)

1. `git pull` (this commit)
2. `cd mcp-server && npm install && npm run build`
3. Create `kilo.json` with MCP server config (see `SETUP_REMOTE_HERMES.md`)
4. Restart Hermes/Kilo
5. Feed behavior prompt from `SETUP_REMOTE_HERMES.md`

## What was deprecated

- `captura-db.py` (Python CLI) — replaced by MCP tools
- Local SQLite cache — no longer needed
- Mirror webhook (`serve-mirror`) — not needed for MCP
- All direct Supabase REST scripts — MCP handles everything

## Future Enhancement Plan (from `.kilo/plans/mcp-enhancement-plan.md`)

| Phase | Items | Status |
|-------|-------|--------|
| Smart automation | `daily_brief`, `send_followup`, `bulk_mark_returned` | Not started |
| Uncovered ops | Studio inquiries, reviews management, notification triggers, gallery | Not started |
| Infrastructure | Rate limiting, retry logic, memory cache, health tool | Not started |
