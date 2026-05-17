#!/usr/bin/env python3
"""Compact CLI for Captura reads and booking actions.

Reads use Supabase REST directly for speed.
Writes call existing Next.js API routes so booking business logic stays intact.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


DEFAULT_BASE_URL = "http://localhost:3000"


class CliError(RuntimeError):
    """User-facing CLI error."""


def parse_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip("'").strip('"')
    return values


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    cwd = Path.cwd()
    candidates = [
        cwd / ".env.local",
        cwd / ".env",
        Path.home() / ".hermes" / ".env",
    ]
    for path in candidates:
        env.update(parse_env_file(path))
    env.update(os.environ)
    return env


ENV = load_env()


def env_get(*names: str, default: str | None = None) -> str | None:
    for name in names:
        value = ENV.get(name)
        if value:
            return value
    return default


SUPABASE_URL = env_get("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = env_get("SUPABASE_SERVICE_ROLE_KEY")
BASE_URL = (env_get("CAPTURA_BASE_URL", "NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_BASE_URL", default=DEFAULT_BASE_URL) or DEFAULT_BASE_URL).rstrip("/")


def require_config() -> None:
    missing: list[str] = []
    if not SUPABASE_URL:
        missing.append("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL")
    if not SUPABASE_SERVICE_ROLE_KEY:
        missing.append("SUPABASE_SERVICE_ROLE_KEY")
    if missing:
        raise CliError(f"Missing env: {', '.join(missing)}")


def bool_arg(value: str) -> bool:
    normalized = value.strip().lower()
    truthy = {"1", "true", "yes", "y", "paid", "picked", "refunded", "on"}
    falsy = {"0", "false", "no", "n", "unpaid", "unpicked", "not-refunded", "off"}
    if normalized in truthy:
        return True
    if normalized in falsy:
        return False
    raise argparse.ArgumentTypeError(f"Invalid boolean value: {value}")


def compact_money(value: Any) -> str:
    if value in (None, ""):
        return "-"
    try:
        return f"RM{float(value):.2f}"
    except (TypeError, ValueError):
        return str(value)


def compact_bool(value: Any) -> str:
    return "yes" if bool(value) else "no"


def http_json(
    method: str,
    url: str,
    *,
    headers: dict[str, str] | None = None,
    payload: dict[str, Any] | None = None,
) -> Any:
    data = None
    final_headers = dict(headers or {})
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        final_headers.setdefault("Content-Type", "application/json")

    request = urllib.request.Request(url, data=data, headers=final_headers, method=method)
    try:
        with urllib.request.urlopen(request) as response:
            raw = response.read().decode("utf-8")
            if not raw:
                return None
            return json.loads(raw)
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(body)
            message = parsed.get("error") or parsed.get("message") or body
        except json.JSONDecodeError:
            message = body or exc.reason
        raise CliError(f"{exc.code} {exc.reason}: {message}") from exc
    except urllib.error.URLError as exc:
        raise CliError(f"Request failed: {exc.reason}") from exc


def supabase_headers() -> dict[str, str]:
    require_config()
    return {
        "apikey": SUPABASE_SERVICE_ROLE_KEY or "",
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }


def supabase_request(
    table: str,
    *,
    params: dict[str, Any] | None = None,
    method: str = "GET",
    payload: dict[str, Any] | None = None,
) -> Any:
    query = urllib.parse.urlencode(params or {}, doseq=True, quote_via=urllib.parse.quote)
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{table}"
    if query:
        url = f"{url}?{query}"
    return http_json(method, url, headers=supabase_headers(), payload=payload)


def app_request(method: str, path: str, payload: dict[str, Any] | None = None) -> Any:
    return http_json(method, f"{BASE_URL}{path}", payload=payload)


def booking_select() -> str:
    return (
        "id,start_date,end_date,total_days,total_amount,deposit_amount,deposit_paid,"
        "final_payment_paid,deposit_refunded,status,booking_status,pickup_method,"
        "equipment_picked_up,equipment_returned,created_at,"
        "customer:customers(full_name,phone,email),"
        "camera:cameras(name,brand,model)"
    )


def print_json(data: Any) -> None:
    print(json.dumps(data, indent=2, ensure_ascii=True, default=str))


def summarize_booking(row: dict[str, Any]) -> str:
    customer = row.get("customer") or {}
    camera = row.get("camera") or {}
    customer_name = customer.get("full_name") or customer.get("name") or "-"
    camera_name = camera.get("name") or "-"
    booking_status = row.get("booking_status") or "-"
    runtime_status = row.get("status") or "-"
    start = row.get("start_date") or "-"
    end = row.get("end_date") or "-"
    total = compact_money(row.get("total_amount"))
    deposit = compact_bool(row.get("deposit_paid"))
    final = compact_bool(row.get("final_payment_paid"))
    refund = compact_bool(row.get("deposit_refunded"))
    return (
        f"{row.get('id')} | {customer_name} | {camera_name} | {start}->{end} | "
        f"booking={booking_status} runtime={runtime_status} | total={total} | "
        f"deposit={deposit} final={final} refund={refund}"
    )


def list_bookings(args: argparse.Namespace) -> None:
    params: dict[str, Any] = {
        "select": booking_select(),
        "order": "created_at.desc",
        "limit": args.limit,
    }
    if args.status:
        params["status"] = f"eq.{args.status}"
    if args.booking_status:
        params["booking_status"] = f"eq.{args.booking_status}"
    if args.camera_id:
        params["camera_id"] = f"eq.{args.camera_id}"
    if args.customer_id:
        params["customer_id"] = f"eq.{args.customer_id}"
    if args.date:
        params["start_date"] = f"lte.{args.date}"
        params["end_date"] = f"gte.{args.date}"

    rows = supabase_request("bookings", params=params)
    if args.json:
        print_json(rows)
        return
    for row in rows:
        print(summarize_booking(row))
    print(f"count={len(rows)}")


def get_booking(args: argparse.Namespace) -> None:
    rows = supabase_request(
        "bookings",
        params={
            "select": booking_select(),
            "id": f"eq.{args.booking_id}",
            "limit": 1,
        },
    )
    if not rows:
        raise CliError(f"Booking not found: {args.booking_id}")
    row = rows[0]
    if args.json:
        print_json(row)
    else:
        print(summarize_booking(row))
        print_json(row)


def list_cameras(args: argparse.Namespace) -> None:
    params: dict[str, Any] = {
        "select": "id,name,brand,model,daily_rate,deposit_amount,is_available,available_quantity,total_quantity,condition",
        "order": "display_order.asc.nullslast,name.asc",
        "limit": args.limit,
    }
    if args.search:
        params["or"] = ",".join(
            [
                f"name.ilike.*{args.search}*",
                f"brand.ilike.*{args.search}*",
                f"model.ilike.*{args.search}*",
            ]
        )
    rows = supabase_request("cameras", params=params)
    if args.json:
        print_json(rows)
        return
    for row in rows:
        print(
            f"{row.get('id')} | {row.get('brand')} {row.get('model')} | {row.get('name')} | "
            f"rate={compact_money(row.get('daily_rate'))} | deposit={compact_money(row.get('deposit_amount'))} | "
            f"available={compact_bool(row.get('is_available'))} qty={row.get('available_quantity')}/{row.get('total_quantity')}"
        )
    print(f"count={len(rows)}")


def list_customers(args: argparse.Namespace) -> None:
    params: dict[str, Any] = {
        "select": "id,full_name,email,phone,whatsapp,total_bookings,reliability_score,created_at",
        "order": "created_at.desc",
        "limit": args.limit,
    }
    if args.search:
        params["or"] = ",".join(
            [
                f"full_name.ilike.*{args.search}*",
                f"email.ilike.*{args.search}*",
                f"phone.ilike.*{args.search}*",
            ]
        )
    rows = supabase_request("customers", params=params)
    if args.json:
        print_json(rows)
        return
    for row in rows:
        print(
            f"{row.get('id')} | {row.get('full_name')} | {row.get('phone')} | "
            f"{row.get('email')} | bookings={row.get('total_bookings', 0)} | score={row.get('reliability_score', '-')}"
        )
    print(f"count={len(rows)}")


def booking_summary_section(title: str, bookings: list[dict[str, Any]]) -> None:
    print(f"[{title}] count={len(bookings)}")
    for row in bookings[:10]:
        print(summarize_booking(row))


def show_summary(args: argparse.Namespace) -> None:
    data = app_request("GET", "/api/n8n/summary")
    if args.json:
        print_json(data)
        return

    print(f"today={data.get('today')} generated_at={data.get('generated_at')}")
    cameras = data.get("cameras") or {}
    revenue = data.get("revenue") or {}
    print(
        f"cameras total={cameras.get('total', 0)} available={cameras.get('available', 0)} "
        f"| revenue completed={compact_money(revenue.get('completed'))} "
        f"pending={compact_money(revenue.get('pending'))} active={compact_money(revenue.get('active'))}"
    )
    booking_summary_section("pending_approvals", (data.get("pending_approvals") or {}).get("bookings", []))
    booking_summary_section("active_rentals", (data.get("active_rentals") or {}).get("bookings", []))
    booking_summary_section("todays_pickups", (data.get("todays_pickups") or {}).get("bookings", []))
    booking_summary_section("todays_returns", (data.get("todays_returns") or {}).get("bookings", []))
    booking_summary_section("overdue_payments", (data.get("overdue_payments") or {}).get("bookings", []))


def check_availability(args: argparse.Namespace) -> None:
    query = urllib.parse.urlencode(
        {
            "camera_id": args.camera_id,
            "start_date": args.start_date,
            "end_date": args.end_date,
        }
    )
    data = app_request("GET", f"/api/n8n/availability?{query}")
    if args.json:
        print_json(data)
        return
    print(
        f"camera_id={data.get('camera_id')} | available={compact_bool(data.get('available'))} | "
        f"range={args.start_date}->{args.end_date} | conflicts={len(data.get('conflicts', []))} | "
        f"blocks={len(data.get('blocked_dates', []))}"
    )


def create_booking(args: argparse.Namespace) -> None:
    payload = {
        "customer_name": args.customer_name,
        "customer_phone": args.customer_phone,
        "customer_email": args.customer_email,
        "camera_name": args.camera_name,
        "start_date": args.start_date,
        "end_date": args.end_date,
        "pickup_method": args.pickup_method,
        "special_requests": args.special_requests or "",
    }
    data = app_request("POST", "/api/n8n/bookings/create", payload)
    print_json(data if args.json else {
        "success": data.get("success"),
        "message": data.get("message"),
        "booking_id": data.get("booking_id"),
        "confirmation_number": data.get("confirmation_number"),
    })


def approve_booking(args: argparse.Namespace) -> None:
    data = app_request("POST", f"/api/bookings/{args.booking_id}/approve", {"admin_notes": args.notes})
    print_json(data if args.json else {
        "success": data.get("success"),
        "message": data.get("message"),
        "booking_id": ((data.get("booking") or {}).get("id")),
        "booking_status": ((data.get("booking") or {}).get("booking_status")),
        "deposit_paid": ((data.get("booking") or {}).get("deposit_paid")),
    })


def mark_deposit(args: argparse.Namespace) -> None:
    payload = {
        "deposit_paid": args.paid,
        "deposit_paid_date": args.date,
    }
    data = app_request("POST", f"/api/bookings/{args.booking_id}/deposit", payload)
    print_json(data if args.json else {
        "success": data.get("success"),
        "message": data.get("message"),
        "booking_id": ((data.get("booking") or {}).get("id")),
        "deposit_paid": ((data.get("booking") or {}).get("deposit_paid")),
        "deposit_paid_date": ((data.get("booking") or {}).get("deposit_paid_date")),
    })


def mark_final(args: argparse.Namespace) -> None:
    payload = {
        "final_payment_paid": args.paid,
        "final_payment_paid_date": args.date,
    }
    data = app_request("POST", f"/api/bookings/{args.booking_id}/final-payment", payload)
    print_json(data if args.json else {
        "success": data.get("success"),
        "message": data.get("message"),
        "booking_id": ((data.get("booking") or {}).get("id")),
        "final_payment_paid": ((data.get("booking") or {}).get("final_payment_paid")),
        "final_payment_paid_date": ((data.get("booking") or {}).get("final_payment_paid_date")),
    })


def mark_pickup(args: argparse.Namespace) -> None:
    payload = {
        "equipment_picked_up": args.picked_up,
        "equipment_pickup_notes": args.notes,
        "equipment_condition_pickup": args.condition,
    }
    data = app_request("POST", f"/api/bookings/{args.booking_id}/pickup-status", payload)
    print_json(data if args.json else {
        "success": data.get("success"),
        "booking_id": ((data.get("booking") or {}).get("id")),
        "equipment_picked_up": ((data.get("booking") or {}).get("equipment_picked_up")),
        "equipment_pickup_date": ((data.get("booking") or {}).get("equipment_pickup_date")),
        "status": ((data.get("booking") or {}).get("status")),
    })


def mark_refund(args: argparse.Namespace) -> None:
    payload = {
        "deposit_refunded": args.refunded,
        "deposit_refund_date": args.date,
        "deposit_refund_notes": args.notes,
        "deposit_refund_amount": args.amount,
    }
    data = app_request("POST", f"/api/bookings/{args.booking_id}/deposit-refund", payload)
    print_json(data if args.json else {
        "success": data.get("success"),
        "message": data.get("message"),
        "booking_id": ((data.get("booking") or {}).get("id")),
        "deposit_refunded": ((data.get("booking") or {}).get("deposit_refunded")),
        "booking_status": ((data.get("booking") or {}).get("booking_status")),
        "deposit_refund_amount": ((data.get("booking") or {}).get("deposit_refund_amount")),
    })


def health(args: argparse.Namespace) -> None:
    data = {
        "base_url": BASE_URL,
        "supabase_url": SUPABASE_URL,
        "has_service_role_key": bool(SUPABASE_SERVICE_ROLE_KEY),
        "today": dt.date.today().isoformat(),
    }
    if args.json:
        print_json(data)
        return
    print(
        f"base_url={data['base_url']} | supabase_url={data['supabase_url']} | "
        f"service_role_key={'yes' if data['has_service_role_key'] else 'no'} | today={data['today']}"
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="captura-db",
        description="Compact Captura CLI for Hermes.",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    health_parser = subparsers.add_parser("health", help="Show resolved config.")
    health_parser.add_argument("--json", action="store_true")
    health_parser.set_defaults(func=health)

    summary_parser = subparsers.add_parser("summary", help="Show operational summary.")
    summary_parser.add_argument("--json", action="store_true")
    summary_parser.set_defaults(func=show_summary)

    bookings_parser = subparsers.add_parser("bookings", help="List bookings.")
    bookings_parser.add_argument("--status")
    bookings_parser.add_argument("--booking-status")
    bookings_parser.add_argument("--camera-id")
    bookings_parser.add_argument("--customer-id")
    bookings_parser.add_argument("--date", help="Overlap date YYYY-MM-DD")
    bookings_parser.add_argument("--limit", type=int, default=20)
    bookings_parser.add_argument("--json", action="store_true")
    bookings_parser.set_defaults(func=list_bookings)

    booking_parser = subparsers.add_parser("booking", help="Get one booking.")
    booking_parser.add_argument("booking_id")
    booking_parser.add_argument("--json", action="store_true")
    booking_parser.set_defaults(func=get_booking)

    cameras_parser = subparsers.add_parser("cameras", help="List cameras.")
    cameras_parser.add_argument("--search")
    cameras_parser.add_argument("--limit", type=int, default=20)
    cameras_parser.add_argument("--json", action="store_true")
    cameras_parser.set_defaults(func=list_cameras)

    customers_parser = subparsers.add_parser("customers", help="List customers.")
    customers_parser.add_argument("--search")
    customers_parser.add_argument("--limit", type=int, default=20)
    customers_parser.add_argument("--json", action="store_true")
    customers_parser.set_defaults(func=list_customers)

    availability_parser = subparsers.add_parser("availability", help="Check camera availability.")
    availability_parser.add_argument("camera_id")
    availability_parser.add_argument("start_date")
    availability_parser.add_argument("end_date")
    availability_parser.add_argument("--json", action="store_true")
    availability_parser.set_defaults(func=check_availability)

    create_parser = subparsers.add_parser("create", help="Create pending booking by camera name.")
    create_parser.add_argument("--customer-name", required=True)
    create_parser.add_argument("--customer-phone", required=True)
    create_parser.add_argument("--customer-email", default="")
    create_parser.add_argument("--camera-name", required=True)
    create_parser.add_argument("--start-date", required=True)
    create_parser.add_argument("--end-date", required=True)
    create_parser.add_argument("--pickup-method", choices=["pickup", "delivery"], default="pickup")
    create_parser.add_argument("--special-requests")
    create_parser.add_argument("--json", action="store_true")
    create_parser.set_defaults(func=create_booking)

    approve_parser = subparsers.add_parser("approve", help="Approve pending booking.")
    approve_parser.add_argument("booking_id")
    approve_parser.add_argument("--notes")
    approve_parser.add_argument("--json", action="store_true")
    approve_parser.set_defaults(func=approve_booking)

    deposit_parser = subparsers.add_parser("deposit", help="Mark deposit paid or unpaid.")
    deposit_parser.add_argument("booking_id")
    deposit_parser.add_argument("paid", type=bool_arg)
    deposit_parser.add_argument("--date")
    deposit_parser.add_argument("--json", action="store_true")
    deposit_parser.set_defaults(func=mark_deposit)

    final_parser = subparsers.add_parser("final", help="Mark final payment paid or unpaid.")
    final_parser.add_argument("booking_id")
    final_parser.add_argument("paid", type=bool_arg)
    final_parser.add_argument("--date")
    final_parser.add_argument("--json", action="store_true")
    final_parser.set_defaults(func=mark_final)

    pickup_parser = subparsers.add_parser("pickup", help="Mark pickup state.")
    pickup_parser.add_argument("booking_id")
    pickup_parser.add_argument("picked_up", type=bool_arg)
    pickup_parser.add_argument("--condition", choices=["excellent", "good", "fair", "damaged"])
    pickup_parser.add_argument("--notes")
    pickup_parser.add_argument("--json", action="store_true")
    pickup_parser.set_defaults(func=mark_pickup)

    refund_parser = subparsers.add_parser("refund", help="Mark deposit refund state.")
    refund_parser.add_argument("booking_id")
    refund_parser.add_argument("refunded", type=bool_arg)
    refund_parser.add_argument("--amount", type=float, default=100.0)
    refund_parser.add_argument("--date")
    refund_parser.add_argument("--notes")
    refund_parser.add_argument("--json", action="store_true")
    refund_parser.set_defaults(func=mark_refund)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        args.func(args)
        return 0
    except CliError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
