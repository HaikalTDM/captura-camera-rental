# CAPTURA Telegram Bot — Phased Overhaul Plan

**Date:** 2026-06-13  
**File:** `bot/captura_bot.py` (1439 lines, v3.0)  
**Context:** Bot manages the CAPTURA camera rental business via Telegram, communicating with an MCP server subprocess and Supabase REST API.

---

## Phase 1: Bug Fixes & Immediate Corrections

### 1.1 Menu Button Labels Misleading
**Root Cause:** `make_main_menu()` at line 580–581 labels buttons "📦 Pickups Today" and "🔙 Returns Today", but the views (`show_pickups`, `show_returns`) query a **3-day window**, not just today.
**Fix:**
- Rename to "📦 Pickups (3d)" and "🔙 Returns (3d)"
- Add a separate "Today Only" filter toggle inside each view

### 1.2 Cache Staleness After State Mutations
**Root Cause:** The 30-second caches for `_pending_cache` and `_overdue_cache` are not invalidated after approve/reject/pickup/return/cancel actions. User taps approve → returns to pending view → sees the same list because cache hasn't expired.
**Fix:**
- Add `invalidate_cache("pending")` and `invalidate_cache("overdue")` calls inside `approve_booking()`, `reject_booking()`, `mark_picked_up()`, `mark_returned()`, `cancel_booking()`
```python
def invalidate_cache(key: str):
    global _pending_cache, _pending_cache_ts, _overdue_cache, _overdue_cache_ts
    if key == "pending":
        _pending_cache = []
        _pending_cache_ts = 0
    elif key == "overdue":
        _overdue_cache = []
        _overdue_cache_ts = 0
```

### 1.3 Active Rentals & Overdue Returning No Data
**Root Cause:** Three possible causes:
1. MCP server is down → fallback DB queries hit schema column mismatch (`booking_status` vs `status`)
2. Cache returns stale empty results from a previous failed fetch
3. Data genuinely doesn't exist

**Fix:**
- Add explicit `booking_status` fallback detection in `get_active_bookings()` and `get_overdue_bookings()` — if `booking_status=eq.active` returns 0 rows, retry with `status=eq.active`
- Add debug logging: log the raw row count from each query
- In `show_active` and `show_overdue`, display a "No data" message that distinguishes "empty" from "error":
```python
if bookings is None:
    await reply_text(update, "⚠️ Failed to fetch data. MCP may be down.")
elif len(bookings) == 0:
    await reply_text(update, "✨ Nothing here.")
```

### 1.4 Dashboard Not Syncing with Database
**Root Cause:** `gather_stats()` tries MCP first, falls back to direct DB only if `metrics_today` is empty. If MCP returns stale or partial data, the dashboard shows it without falling back. The MCP `dashboard_summary` tool queries bookings with `gte('created_at', dateFrom)` which filters by `created_at`, not `start_date` — this causes revenue numbers to reflect when bookings were created, not when the rental happens.
**Fix:**
- Add a `force_refresh` parameter to skip MCP and go direct DB
- Add `start_date`-based revenue fallback
- Log MCP vs DB values for comparison during debugging

### 1.5 Pricing View Missing Detail
**Root Cause:** `show_pricing()` at line 849–859 only displays: name, daily rate, deposit, discount threshold.
**Fix:** Expand pricing to include:
- Brand + Model on a sub-line
- Camera type label (Action / Mirrorless / DSLR / Compact)
- Weekly rate and monthly rate with savings calculation (e.g., "RM280/wk · RM900/mo")
- Current availability status with next available date if booked
- Total quantity info
- Equipment specs (resolution, features) from `specifications` JSONB

### 1.6 Returns Workflow — Numbered List + Keyboard
**Current behavior:** `show_returns()` shows inline keyboard buttons with full text: `"✅ Amirul — DJI Osmo Pocket 3 | 2024-06-15"`. Tapping opens booking detail.
**Required behavior (matching customer search pattern):**
1. Text message with numbered list:
   ```
   🔙 Returns (3 days) — 5 bookings
   
   1. Amirul — DJI Osmo Pocket 3 | End 2024-06-15
   2. Badrul — Canon R50 | End 2024-06-16
   3. Cahaya — Fuji X-T30 | End 2024-06-17
   ```
2. Inline keyboard with numbered buttons:
   ```
   [1] [2] [3] [4] [5]
   [⚡ Mark All Returned]
   [◀ Back] [🏠 Home]
   ```
3. Tapping [1] opens booking detail for booking #1

**Implementation:** Already have `make_numbered_booking_keyboard()` — extend `show_returns()` (and `show_pickups()`, `show_active()`, `show_overdue()`, `show_pending()`) to render text list + numbered keyboard. Store booking list in `_search_sessions` keyed by `chat_id` + a view prefix (e.g., `returns:{chat_id}`).

### 1.7 Home Button Disappearing / Design Changes Not Applied
**Root Cause A (disappearing):** When `reply_text()` is called from a callback query, it **edits** the existing message. If the view changes (e.g., pending → approve → success), the old keyboard is replaced. The Home button IS present in `make_main_menu()` and `make_back_row()`, but some views like the post-approve confirmation keyboard at line 939–941 don't include it. Every view must eventually offer a path back to Home.
**Fix:** Audit every keyboard path — ensure ALL views include either `make_back_row()` or `make_main_menu()`. Specifically:
- Post-approve keyboard (line 939): add `🏠 Home` button
- Post-pickup keyboard (line 1035): add `🏠 Home` button
- Confirmation keyboards: add `🏠 Home` as third button

**Root Cause B (changes not applied):** The bot process was NOT restarted after writing the v3.0 file. The running process still executes the old code.
**Fix:** Restart the bot process after deploying code changes.

### 1.8 `pickup_date` / `pickup_method` Column Discrepancy
**Root Cause:** The DB schema migration file shows no `pickup_date`, `equipment_picked_up`, `equipment_pickup_date`, `equipment_returned`, `equipment_return_date`, or `booking_status` columns. These must have been added via later migrations to the deployed DB, or the bot is querying columns that don't exist. If the columns are missing, `get_pickups_window()` will fail silently.
**Fix:** Run a schema check query on bot startup to verify required columns exist:
```python
async def verify_schema():
    """Check that expected columns exist on the bookings table."""
    try:
        row = await supabase_get("bookings?select=booking_status,pickup_date,equipment_picked_up&limit=1")
        # Success — columns exist
    except Exception as e:
        log.error(f"SCHEMA CHECK FAILED: {e}")
```

---

## Phase 2: Visual Redesign

### 2.1 Unified Card-Style Layout
Replace raw Markdown text blocks with structured "cards":
```
┌─────────────────────────────┐
│ 📊 Dashboard                │
│ ─────────────────────────── │
│ ⏳ Pending    3    ⚠️ Ovrd 1│
│ 📦 Pickups    2    🔙 Rtrns 0│
│ 📸 Active     4    🏁 Done  12│
│ 💰 Today  RM 450            │
│ 📅 Month  RM 8,200          │
└─────────────────────────────┘
```
Use Telegram's monospace code blocks for the stat grid:
```
⏳ `  3` Pending   ⚠️ `  1` Overdue
📦 `  2` Pickups   🔙 `  0` Returns
```

### 2.2 Section Headers & Dividers
Consistent divider style across all views:
```
━━━━━━━━━━━━━━━━━━━━━━━
```
Use Unicode box-drawing characters for visual hierarchy.

### 2.3 Status Badge Colors
Leverage Markdown formatting for colored status:
- `✅ *Confirmed*` (bold + emoji)
- `⚠️ *Overdue*` (emphasis via emoji)
- `🟢 Available` / `🔴 Booked`

### 2.4 Emoji System Standardization
| Context | Emoji |
|---------|-------|
| Pending | ⏳ |
| Confirmed | ✅ |
| Active / Picked Up | 📦 |
| Completed / Returned | 🏁 |
| Cancelled | 🚫 |
| Rejected | ❌ |
| Overdue | ⚠️ |
| Revenue | 💰 |
| Customer | 👤 |
| Camera | 📸 |
| Calendar | 📅 |
| Location | 📍 |
| Phone | 📱 |
| Email | 📧 |
| Back nav | ◀ |
| Home | 🏠 |
| Refresh | 🔄 |
| WhatsApp | 💬 |
| Search | 🔍 |
| Warning | ⚠️ |
| Success | ✅ |
| Error | ❌ |

Apply consistently across ALL views — no mixing of icons.

---

## Phase 3: Functional Upgrade

### 3.1 Pagination for All Booking Lists
**Current:** All lists hard-coded `limit=30` with no way to see older entries.
**Implement:**
- `[1] [2] ... [5]` numbered keyboard
- `[◀ Prev] [Next ▶]` pagination buttons at bottom
- Store paginated results in `_search_sessions[key]` with offset tracking
- Supabase `range` parameter for offset-based pagination:
```python
async def get_paginated_bookings(query_params, offset: int, limit: int):
    return await supabase_get("bookings", {
        **query_params,
        "offset": str(offset),
        "limit": str(limit),
    })
```

### 3.2 Booking Lifecycle State Machine
Enforce valid state transitions:
```
pending_approval → confirmed (via approve)
pending_approval → rejected (via reject)
confirmed → active (via mark_pickup)
confirmed → completed (via mark_return) [skip pickup]
active → completed (via mark_return)
* → cancelled (via cancel)
```
Add validation before each action to prevent invalid transitions (e.g., can't pick up an already-completed booking).

### 3.3 Multi-Booking Bulk Actions
**Current:** "Approve All" approves everything, no filter.
**Add:**
- Toggle selection: tap to select/unselect individual bookings, then bulk act
- Counter: "3/5 selected"
- Multi-select keyboard pattern:
```
[☐ Amirul — RM150]  → tap → [☑ Amirul — RM150]
[☑ Badrul — RM240]  → tap → [☐ Badrul — RM240]
[Approve Selected (2)] [Cancel]
```

### 3.4 Notification Preferences
**Current:** Push alerts always on at fixed interval.
**Add:**
- `/notify on|off` — toggle push alerts
- `/notify interval 120` — change poll interval
- `/notify quiet 22:00-08:00` — quiet hours

### 3.5 Booking Detail Enrichment
Add to `show_booking_detail`:
- Payment status (deposit paid? final payment paid?)
- Customer ID card number
- Booking source (website/phone/whatsapp/walk-in)
- Days remaining until start/end
- Late fee calculation for overdue bookings
- Edit capability: change dates, camera, or customer info inline

---

## Phase 4: Innovation & Optimization

### 4.1 Daily Brief Customization
**Current:** Morning brief at 8-10 AM, hard-coded.
**Add:**
- Choose brief time: `/brief time 09:00`
- Choose brief content sections: `/brief sections pickups,returns,overdue,revenue`
- On-demand brief: `/brief` (no schedule change, just triggers immediately)
- Brief history: view last 7 days of briefs

### 4.2 Keyboard Shortcuts / Slash Command Expansion
**Add missing commands:**
- `/active` — show active rentals
- `/pickups` — show pickup window
- `/returns` — show return window
- `/overdue` — show overdue
- `/analytics` — show analytics
- `/search <query>` — search customers (already exists but add to /help)
- `/id <booking_id>` — jump directly to booking by UUID
- `/stats` — alias for `/dashboard`

### 4.3 Performance Optimizations
**1. Connection pooling for Supabase:**
Replace per-request `httpx.AsyncClient(timeout=...)` with a persistent `httpx.AsyncClient` instance:
```python
http_client = httpx.AsyncClient(timeout=15, limits=httpx.Limits(max_keepalive_connections=5))
```
**2. MCP health monitoring:**
- Track MCP response times
- Auto-restart if 3 consecutive calls fail
- Health endpoint: `/mcp_status` command shows uptime, last error, call count

**3. Prefetch on /start:**
Cache the next view's data in background after showing home:
```python
asyncio.create_task(prefetch_views())  # fetch pending, active, overdue
```

### 4.4 WhatsApp Reminders Automation
**Current:** Morning brief shows overdue bookings but no automated reminders.
**Add:**
- `/remind_overdue` — sends WhatsApp reminder to all overdue customers
- `/remind_pickups` — sends tomorrow's pickup reminder
- `/remind_returns` — sends tomorrow's return reminder
- Template-based messages with customer name, camera, dates, and location

### 4.5 Photo Check-In / Check-Out
**Add:** When marking pickup or return, prompt for photo upload:
- Mark Picked Up → "Send a photo of the equipment condition"
- Mark Returned → "Send a photo of the returned equipment"
- Photos stored via Telegram file ID to Supabase storage

### 4.6 Rental Agreement Generation
**Add:** Generate and send rental agreement PDF from booking details:
- `/agreement <booking_id>` → generates PDF with customer info, camera, dates, terms
- Sends via Telegram document attachment
- Stores PDF URL in booking metadata

### 4.7 Concurrent Booking Conflict Detection
**Current:** `check` command uses MCP's `check_availability`. Add visual calendar:
- `/calendar <camera_name>` → shows 7-day availability grid
- `/calendar` → shows all cameras availability overview

### 4.8 Revenue Forecasting
- `/forecast` → project this month's revenue based on confirmed + pending bookings
- Show projected vs actual comparison

---

## Implementation Order

| Step | Phase | Est. Time | Dependencies |
|------|-------|-----------|--------------|
| 1.1 Menu label fix | 1 | 5 min | None |
| 1.2 Cache invalidation | 1 | 10 min | None |
| 1.3 Active/Overdue debug | 1 | 20 min | Schema verification |
| 1.4 Dashboard sync fix | 1 | 15 min | None |
| 1.5 Pricing enrichment | 1 | 15 min | Camera data |
| 1.6 Returns numbered list | 1 | 30 min | Existing numbered keyboard builder |
| 1.7 Home button audit | 1 | 15 min | None |
| 1.8 Schema verification | 1 | 10 min | DB access |
| 2.1 Card-style layout | 2 | 30 min | Phase 1 complete |
| 2.2–2.4 Visual polish | 2 | 20 min | Phase 2.1 |
| 3.1 Pagination | 3 | 2 hr | Phase 2 |
| 3.2 State machine | 3 | 1 hr | Phase 3.1 |
| 3.3–3.5 Enrichment | 3 | 2 hr | Phase 3.1 |
| 4.1–4.8 Innovation | 4 | 4 hr | Phase 3 |

---

## Deployment Checklist
- [ ] Restart bot service after code deploys
- [ ] Verify MCP server is running (`node mcp-server/dist/index.js`)
- [ ] Verify environment variables: `CAPTURA_BOT_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `BOT_CHAT_ID`
- [ ] Check `/tmp/captura-bot-debug.log` for errors after restart
- [ ] Test `/start` → Home screen renders with live stats
- [ ] Test `Pending` → shows bookings → tap Approve → returns to pending view (no stale cache)
- [ ] Test `Pricing` → shows brand, rates, availability
- [ ] Test `Returns` → shows numbered list + keyboard, tap number opens detail
