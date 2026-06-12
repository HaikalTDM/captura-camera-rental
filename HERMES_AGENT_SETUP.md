# Hermes CLI for Captura

Use one reusable CLI instead of generating a new Python script every session.

## What this solves

- Reads become one short command instead of 30-50 lines of generated code.
- Booking state changes reuse the existing app routes, so Hermes does not need to know table internals.
- Output stays compact by default, which keeps token usage low.
- Hermes can read from a local SQLite mirror when Supabase is unavailable or quota-blocked.

## Files

- CLI: `scripts/captura-db.py`
- This guide: `docs/HERMES_AGENT_SETUP.md`

## Env requirements

The CLI reads env values from these locations, in this order:

1. Repo `.env.local`
2. Repo `.env`
3. `~/.hermes/.env`
4. Process environment

Required values:

- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Recommended value:

- `CAPTURA_BASE_URL`
  - Local dev: `http://localhost:3000`
  - Production: `https://captura.my`
- `CAPTURA_LOCAL_DB_PATH`
  - Optional override for the local SQLite cache
  - Default: `~/.hermes/data/captura.db`

## Install

Linux/macOS:

```bash
mkdir -p ~/.hermes/bin
cp scripts/captura-db.py ~/.hermes/bin/captura-db
chmod +x ~/.hermes/bin/captura-db
```

If Hermes runs from another directory, add `CAPTURA_BASE_URL`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` to `~/.hermes/.env`.

## Commands

Health:

```bash
~/.hermes/bin/captura-db health
```

Initial sync:

```bash
~/.hermes/bin/captura-db sync
```

Operations summary:

```bash
~/.hermes/bin/captura-db summary
```

Latest booking created:

```bash
~/.hermes/bin/captura-db latest --by created_at
```

Latest booking by rental start:

```bash
~/.hermes/bin/captura-db latest --by start_date
```

Pending approvals:

```bash
~/.hermes/bin/captura-db bookings --booking-status pending_approval --limit 10
```

Shortcut for pending approvals:

```bash
~/.hermes/bin/captura-db pending
```

Next actions queue:

```bash
~/.hermes/bin/captura-db next-actions
```

Confirmed bookings on a date:

```bash
~/.hermes/bin/captura-db bookings --booking-status confirmed --date 2026-05-17
```

Single booking:

```bash
~/.hermes/bin/captura-db booking BOOKING_ID
```

Search cameras:

```bash
~/.hermes/bin/captura-db cameras --search "R50"
```

Search customers:

```bash
~/.hermes/bin/captura-db customers --search "Aiman"
```

Availability check:

```bash
~/.hermes/bin/captura-db availability CAMERA_ID 2026-05-20 2026-05-22
```

Create pending booking:

```bash
~/.hermes/bin/captura-db create \
  --customer-name "Aiman" \
  --customer-phone "0171234567" \
  --customer-email "aiman@example.com" \
  --camera-name "Canon R50" \
  --start-date 2026-05-20 \
  --end-date 2026-05-22
```

Approve booking:

```bash
~/.hermes/bin/captura-db approve BOOKING_ID --notes "Verified by Hermes"
```

Mark deposit paid:

```bash
~/.hermes/bin/captura-db deposit BOOKING_ID true
```

Mark final payment paid:

```bash
~/.hermes/bin/captura-db final BOOKING_ID true
```

Mark pickup complete:

```bash
~/.hermes/bin/captura-db pickup BOOKING_ID true --condition good --notes "Collected at Caltex"
```

Mark deposit refunded and complete booking:

```bash
~/.hermes/bin/captura-db refund BOOKING_ID true --amount 100 --notes "Cash refund on return"
```

Complete full booking workflow in one command:

```bash
~/.hermes/bin/captura-db complete BOOKING_ID
```

Use `--json` on any command if Hermes needs machine-readable output.

## Local-first behavior

- `summary`, `bookings`, `latest`, `pending`, `next-actions`, `booking`, `cameras`, and `customers` read from the local SQLite cache by default.
- Use `--live` on those commands to force a live fetch from Supabase or the app API.
- `availability` reads from the local cache by default if the cache exists, and falls back to live when needed.
- If a live availability check returns Supabase `402`, the CLI falls back to the local cache automatically when possible.

Recommended first step after deploying or rotating data:

```bash
~/.hermes/bin/captura-db sync
```

## Recommended Hermes behavior

Tell Hermes:

```text
Use ~/.hermes/bin/captura-db for all Captura reads and booking actions.
Do not generate temporary Python scripts for Supabase access.
Prefer compact text output unless JSON is explicitly needed.
For state changes, use the CLI commands instead of raw Supabase PATCH calls.
Prefer high-level commands like `latest`, `pending`, `next-actions`, and `complete` before chaining lower-level commands.
Run `captura-db sync` when the cache is new, stale, or after long downtime.
```

## Why writes use app routes

Direct table updates skip booking logic already implemented in the app. Example:

- Refund flow also updates booking completion fields and writes payment records.
- Pickup flow also updates runtime status.
- Approve flow also checks availability before confirming.

The CLI keeps reads fast and lets the app own workflow rules.

## No-cost read strategy

- Sync from Supabase occasionally.
- Serve most Hermes reads from the local SQLite file.
- Keep live calls mainly for writes and manual refreshes.

This reduces Supabase egress and keeps Hermes usable during temporary quota blocks.

## Security note

`SUPABASE_SERVICE_ROLE_KEY` is highly sensitive. Keep it only in local env files or secure secrets storage. Do not paste it into prompts or chat history.
