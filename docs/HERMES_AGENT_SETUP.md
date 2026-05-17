# Hermes CLI for Captura

Use one reusable CLI instead of generating a new Python script every session.

## What this solves

- Reads become one short command instead of 30-50 lines of generated code.
- Booking state changes reuse the existing app routes, so Hermes does not need to know table internals.
- Output stays compact by default, which keeps token usage low.

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

Operations summary:

```bash
~/.hermes/bin/captura-db summary
```

Pending approvals:

```bash
~/.hermes/bin/captura-db bookings --booking-status pending_approval --limit 10
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

Use `--json` on any command if Hermes needs machine-readable output.

## Recommended Hermes behavior

Tell Hermes:

```text
Use ~/.hermes/bin/captura-db for all Captura reads and booking actions.
Do not generate temporary Python scripts for Supabase access.
Prefer compact text output unless JSON is explicitly needed.
For state changes, use the CLI commands instead of raw Supabase PATCH calls.
```

## Why writes use app routes

Direct table updates skip booking logic already implemented in the app. Example:

- Refund flow also updates booking completion fields and writes payment records.
- Pickup flow also updates runtime status.
- Approve flow also checks availability before confirming.

The CLI keeps reads fast and lets the app own workflow rules.

## Security note

`SUPABASE_SERVICE_ROLE_KEY` is highly sensitive. Keep it only in local env files or secure secrets storage. Do not paste it into prompts or chat history.
