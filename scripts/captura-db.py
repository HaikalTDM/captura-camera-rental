#!/usr/bin/env python3
"""Compact CLI for Captura reads and booking actions.

Reads use Supabase REST directly for speed.
Writes call existing Next.js API routes so booking business logic stays intact.
"""

from __future__ import annotations

import argparse
import datetime as dt
import http.server
import json
import os
import sqlite3
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


DEFAULT_BASE_URL = "http://localhost:3000"


class CliError(RuntimeError):
    """User-facing CLI error."""

    def __init__(self, message: str, *, status_code: int | None = None):
        super().__init__(message)
        self.status_code = status_code


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
LOCAL_DB_PATH = Path(env_get("CAPTURA_LOCAL_DB_PATH", default=str(Path.home() / ".hermes" / "data" / "captura.db")) or "")

READ_RETRY_ATTEMPTS = 3
READ_RETRY_DELAY_SECONDS = 1.0


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
    retries: int = 1,
    retry_delay: float = 0.0,
    timeout: float = 20.0,
) -> Any:
    data = None
    final_headers = dict(headers or {})
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        final_headers.setdefault("Content-Type", "application/json")

    attempt = 0
    while True:
        request = urllib.request.Request(url, data=data, headers=final_headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
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
            if exc.code >= 500 and attempt + 1 < retries:
                attempt += 1
                time.sleep(retry_delay)
                continue
            raise CliError(f"{exc.code} {exc.reason}: {message}", status_code=exc.code) from exc
        except urllib.error.URLError as exc:
            if attempt + 1 < retries:
                attempt += 1
                time.sleep(retry_delay)
                continue
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
    return http_json(
        method,
        url,
        headers=supabase_headers(),
        payload=payload,
        retries=READ_RETRY_ATTEMPTS,
        retry_delay=READ_RETRY_DELAY_SECONDS,
    )


def app_request(method: str, path: str, payload: dict[str, Any] | None = None) -> Any:
    return http_json(
        method,
        f"{BASE_URL}{path}",
        payload=payload,
        retries=READ_RETRY_ATTEMPTS,
        retry_delay=READ_RETRY_DELAY_SECONDS,
    )


def ensure_local_db_parent() -> None:
    global LOCAL_DB_PATH
    try:
        LOCAL_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    except OSError:
        fallback = Path.cwd() / ".captura-cache" / "captura.db"
        fallback.parent.mkdir(parents=True, exist_ok=True)
        LOCAL_DB_PATH = fallback


def connect_local_db() -> sqlite3.Connection:
    ensure_local_db_parent()
    connection = sqlite3.connect(LOCAL_DB_PATH)
    connection.row_factory = sqlite3.Row
    initialize_local_db(connection)
    return connection


def initialize_local_db(connection: sqlite3.Connection) -> None:
    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS metadata (
            key TEXT PRIMARY KEY,
            value TEXT
        );

        CREATE TABLE IF NOT EXISTS customers (
            id TEXT PRIMARY KEY,
            full_name TEXT,
            email TEXT,
            phone TEXT,
            whatsapp TEXT,
            total_bookings INTEGER,
            reliability_score REAL,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS cameras (
            id TEXT PRIMARY KEY,
            name TEXT,
            brand TEXT,
            model TEXT,
            daily_rate REAL,
            deposit_amount REAL,
            is_available INTEGER,
            available_quantity INTEGER,
            total_quantity INTEGER,
            condition TEXT,
            display_order INTEGER,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS bookings (
            id TEXT PRIMARY KEY,
            customer_id TEXT,
            camera_id TEXT,
            start_date TEXT,
            end_date TEXT,
            total_days INTEGER,
            total_amount REAL,
            deposit_amount REAL,
            deposit_paid INTEGER,
            final_payment_paid INTEGER,
            deposit_refunded INTEGER,
            status TEXT,
            booking_status TEXT,
            pickup_method TEXT,
            equipment_picked_up INTEGER,
            equipment_returned INTEGER,
            created_at TEXT,
            updated_at TEXT,
            pickup_date TEXT,
            equipment_pickup_date TEXT,
            equipment_return_date TEXT,
            deposit_refund_amount REAL,
            final_payment_paid_date TEXT,
            deposit_refund_date TEXT
        );

        CREATE TABLE IF NOT EXISTS calendar_blocks (
            id TEXT PRIMARY KEY,
            camera_id TEXT,
            booking_id TEXT,
            start_date TEXT,
            end_date TEXT,
            block_type TEXT,
            reason TEXT,
            updated_at TEXT
        );
        """
    )
    connection.commit()


def local_table_count(connection: sqlite3.Connection, table: str) -> int:
    row = connection.execute(f"SELECT COUNT(*) AS count FROM {table}").fetchone()
    return int(row["count"]) if row else 0


def local_cache_ready(connection: sqlite3.Connection, table: str | None = "bookings") -> bool:
    if table is None:
        return (
            get_metadata(connection, "last_synced_at") is not None
            or get_metadata(connection, "last_mirror_event_at") is not None
            or local_table_count(connection, "bookings") > 0
        )
    return local_table_count(connection, table) > 0


def get_metadata(connection: sqlite3.Connection, key: str) -> str | None:
    row = connection.execute("SELECT value FROM metadata WHERE key = ?", (key,)).fetchone()
    return str(row["value"]) if row and row["value"] is not None else None


def set_metadata(connection: sqlite3.Connection, key: str, value: str) -> None:
    connection.execute(
        """
        INSERT INTO metadata (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
        """,
        (key, value),
    )
    connection.commit()


def bool_to_int(value: Any) -> int:
    return 1 if bool(value) else 0


def sqlite_rows(cursor: sqlite3.Cursor) -> list[dict[str, Any]]:
    return [dict(row) for row in cursor.fetchall()]


def upsert_customers(connection: sqlite3.Connection, rows: list[dict[str, Any]]) -> None:
    if not rows:
        return
    connection.executemany(
        """
        INSERT INTO customers (
            id, full_name, email, phone, whatsapp, total_bookings, reliability_score, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            full_name = excluded.full_name,
            email = excluded.email,
            phone = excluded.phone,
            whatsapp = excluded.whatsapp,
            total_bookings = excluded.total_bookings,
            reliability_score = excluded.reliability_score,
            created_at = excluded.created_at,
            updated_at = excluded.updated_at
        """,
        [
            (
                row.get("id"),
                row.get("full_name"),
                row.get("email"),
                row.get("phone"),
                row.get("whatsapp"),
                row.get("total_bookings"),
                row.get("reliability_score"),
                row.get("created_at"),
                row.get("updated_at"),
            )
            for row in rows
        ],
    )
    connection.commit()


def upsert_cameras(connection: sqlite3.Connection, rows: list[dict[str, Any]]) -> None:
    if not rows:
        return
    connection.executemany(
        """
        INSERT INTO cameras (
            id, name, brand, model, daily_rate, deposit_amount, is_available, available_quantity,
            total_quantity, condition, display_order, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            brand = excluded.brand,
            model = excluded.model,
            daily_rate = excluded.daily_rate,
            deposit_amount = excluded.deposit_amount,
            is_available = excluded.is_available,
            available_quantity = excluded.available_quantity,
            total_quantity = excluded.total_quantity,
            condition = excluded.condition,
            display_order = excluded.display_order,
            updated_at = excluded.updated_at
        """,
        [
            (
                row.get("id"),
                row.get("name"),
                row.get("brand"),
                row.get("model"),
                row.get("daily_rate"),
                row.get("deposit_amount"),
                bool_to_int(row.get("is_available")),
                row.get("available_quantity"),
                row.get("total_quantity"),
                row.get("condition"),
                row.get("display_order"),
                row.get("updated_at"),
            )
            for row in rows
        ],
    )
    connection.commit()


def upsert_bookings(connection: sqlite3.Connection, rows: list[dict[str, Any]]) -> None:
    if not rows:
        return
    connection.executemany(
        """
        INSERT INTO bookings (
            id, customer_id, camera_id, start_date, end_date, total_days, total_amount, deposit_amount,
            deposit_paid, final_payment_paid, deposit_refunded, status, booking_status, pickup_method,
            equipment_picked_up, equipment_returned, created_at, updated_at, pickup_date,
            equipment_pickup_date, equipment_return_date, deposit_refund_amount,
            final_payment_paid_date, deposit_refund_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            customer_id = excluded.customer_id,
            camera_id = excluded.camera_id,
            start_date = excluded.start_date,
            end_date = excluded.end_date,
            total_days = excluded.total_days,
            total_amount = excluded.total_amount,
            deposit_amount = excluded.deposit_amount,
            deposit_paid = excluded.deposit_paid,
            final_payment_paid = excluded.final_payment_paid,
            deposit_refunded = excluded.deposit_refunded,
            status = excluded.status,
            booking_status = excluded.booking_status,
            pickup_method = excluded.pickup_method,
            equipment_picked_up = excluded.equipment_picked_up,
            equipment_returned = excluded.equipment_returned,
            created_at = excluded.created_at,
            updated_at = excluded.updated_at,
            pickup_date = excluded.pickup_date,
            equipment_pickup_date = excluded.equipment_pickup_date,
            equipment_return_date = excluded.equipment_return_date,
            deposit_refund_amount = excluded.deposit_refund_amount,
            final_payment_paid_date = excluded.final_payment_paid_date,
            deposit_refund_date = excluded.deposit_refund_date
        """,
        [
            (
                row.get("id"),
                row.get("customer_id"),
                row.get("camera_id"),
                row.get("start_date"),
                row.get("end_date"),
                row.get("total_days"),
                row.get("total_amount"),
                row.get("deposit_amount"),
                bool_to_int(row.get("deposit_paid")),
                bool_to_int(row.get("final_payment_paid")),
                bool_to_int(row.get("deposit_refunded")),
                row.get("status"),
                row.get("booking_status"),
                row.get("pickup_method"),
                bool_to_int(row.get("equipment_picked_up")),
                bool_to_int(row.get("equipment_returned")),
                row.get("created_at"),
                row.get("updated_at"),
                row.get("pickup_date"),
                row.get("equipment_pickup_date"),
                row.get("equipment_return_date"),
                row.get("deposit_refund_amount"),
                row.get("final_payment_paid_date"),
                row.get("deposit_refund_date"),
            )
            for row in rows
        ],
    )
    connection.commit()


def replace_calendar_blocks(connection: sqlite3.Connection, rows: list[dict[str, Any]]) -> None:
    connection.execute("DELETE FROM calendar_blocks")
    if rows:
        connection.executemany(
            """
            INSERT INTO calendar_blocks (
                id, camera_id, booking_id, start_date, end_date, block_type, reason, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    row.get("id"),
                    row.get("camera_id"),
                    row.get("booking_id"),
                    row.get("start_date"),
                    row.get("end_date"),
                    row.get("block_type"),
                    row.get("reason"),
                    row.get("updated_at"),
                )
                for row in rows
            ],
        )
    connection.commit()


def fetch_all_pages(table: str, *, params: dict[str, Any], page_size: int = 500) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    offset = 0
    while True:
        page = supabase_request(
            table,
            params={
                **params,
                "limit": page_size,
                "offset": offset,
            },
        )
        if not page:
            break
        rows.extend(page)
        if len(page) < page_size:
            break
        offset += page_size
    return rows


def sync_local_cache(connection: sqlite3.Connection) -> dict[str, int]:
    require_config()
    customers = fetch_all_pages(
        "customers",
        params={
            "select": "id,full_name,email,phone,whatsapp,total_bookings,reliability_score,created_at,updated_at",
            "order": "updated_at.desc.nullslast,created_at.desc.nullslast",
        },
    )
    cameras = fetch_all_pages(
        "cameras",
        params={
            "select": "id,name,brand,model,daily_rate,deposit_amount,is_available,available_quantity,total_quantity,condition,display_order,updated_at",
            "order": "display_order.asc.nullslast,name.asc",
        },
    )
    bookings = fetch_all_pages(
        "bookings",
        params={
            "select": "id,customer_id,camera_id,start_date,end_date,total_days,total_amount,deposit_amount,deposit_paid,final_payment_paid,deposit_refunded,status,booking_status,pickup_method,equipment_picked_up,equipment_returned,created_at,updated_at,pickup_date,equipment_pickup_date,equipment_return_date,deposit_refund_amount,final_payment_paid_date,deposit_refund_date",
            "order": "updated_at.desc.nullslast,created_at.desc.nullslast",
        },
    )
    calendar_blocks = fetch_all_pages(
        "calendar_blocks",
        params={
            "select": "id,camera_id,booking_id,start_date,end_date,block_type,reason,updated_at",
            "order": "start_date.asc",
        },
    )

    upsert_customers(connection, customers)
    upsert_cameras(connection, cameras)
    upsert_bookings(connection, bookings)
    replace_calendar_blocks(connection, calendar_blocks)
    set_metadata(connection, "last_synced_at", dt.datetime.utcnow().isoformat(timespec="seconds") + "Z")

    return {
        "customers": len(customers),
        "cameras": len(cameras),
        "bookings": len(bookings),
        "calendar_blocks": len(calendar_blocks),
    }


def refresh_local_booking_cache(booking_id: str) -> None:
    try:
        connection = connect_local_db()
        booking_rows = supabase_request(
            "bookings",
            params={
                "select": "id,customer_id,camera_id,start_date,end_date,total_days,total_amount,deposit_amount,deposit_paid,final_payment_paid,deposit_refunded,status,booking_status,pickup_method,equipment_picked_up,equipment_returned,created_at,updated_at,pickup_date,equipment_pickup_date,equipment_return_date,deposit_refund_amount,final_payment_paid_date,deposit_refund_date",
                "id": f"eq.{booking_id}",
                "limit": 1,
            },
        )
        if not booking_rows:
            return
        upsert_bookings(connection, booking_rows)
        booking = booking_rows[0]
        if booking.get("customer_id"):
            customer_rows = supabase_request(
                "customers",
                params={
                    "select": "id,full_name,email,phone,whatsapp,total_bookings,reliability_score,created_at,updated_at",
                    "id": f"eq.{booking['customer_id']}",
                    "limit": 1,
                },
            )
            upsert_customers(connection, customer_rows)
        if booking.get("camera_id"):
            camera_rows = supabase_request(
                "cameras",
                params={
                    "select": "id,name,brand,model,daily_rate,deposit_amount,is_available,available_quantity,total_quantity,condition,display_order,updated_at",
                    "id": f"eq.{booking['camera_id']}",
                    "limit": 1,
                },
            )
            upsert_cameras(connection, camera_rows)
        block_rows = supabase_request(
            "calendar_blocks",
            params={
                "select": "id,camera_id,booking_id,start_date,end_date,block_type,reason,updated_at",
                "booking_id": f"eq.{booking_id}",
            },
        )
        if block_rows is not None:
            connection.execute("DELETE FROM calendar_blocks WHERE booking_id = ?", (booking_id,))
            connection.commit()
            if block_rows:
                connection.executemany(
                    """
                    INSERT OR REPLACE INTO calendar_blocks (
                        id, camera_id, booking_id, start_date, end_date, block_type, reason, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    [
                        (
                            row.get("id"),
                            row.get("camera_id"),
                            row.get("booking_id"),
                            row.get("start_date"),
                            row.get("end_date"),
                            row.get("block_type"),
                            row.get("reason"),
                            row.get("updated_at"),
                        )
                        for row in block_rows
                    ],
                )
                connection.commit()
    except CliError:
        return


def cache_health(connection: sqlite3.Connection) -> dict[str, Any]:
    return {
        "path": str(LOCAL_DB_PATH),
        "last_synced_at": get_metadata(connection, "last_synced_at"),
        "customers": local_table_count(connection, "customers"),
        "cameras": local_table_count(connection, "cameras"),
        "bookings": local_table_count(connection, "bookings"),
        "calendar_blocks": local_table_count(connection, "calendar_blocks"),
    }


def replace_booking_calendar_blocks(connection: sqlite3.Connection, booking_id: str, rows: list[dict[str, Any]]) -> None:
    connection.execute("DELETE FROM calendar_blocks WHERE booking_id = ?", (booking_id,))
    if rows:
        connection.executemany(
            """
            INSERT OR REPLACE INTO calendar_blocks (
                id, camera_id, booking_id, start_date, end_date, block_type, reason, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    row.get("id"),
                    row.get("camera_id"),
                    row.get("booking_id"),
                    row.get("start_date"),
                    row.get("end_date"),
                    row.get("block_type"),
                    row.get("reason"),
                    row.get("updated_at"),
                )
                for row in rows
            ],
        )
    connection.commit()


def apply_mirror_upsert_payload(connection: sqlite3.Connection, payload: dict[str, Any]) -> None:
    booking = payload.get("booking")
    if not isinstance(booking, dict) or not payload.get("booking_id"):
        raise CliError("Invalid mirror upsert payload")

    customer = payload.get("customer")
    camera = payload.get("camera")
    calendar_blocks = payload.get("calendar_blocks") or []

    if isinstance(customer, dict) and customer.get("id"):
        upsert_customers(connection, [customer])
    if isinstance(camera, dict) and camera.get("id"):
        upsert_cameras(connection, [camera])
    upsert_bookings(connection, [booking])
    replace_booking_calendar_blocks(connection, str(payload["booking_id"]), calendar_blocks if isinstance(calendar_blocks, list) else [])
    set_metadata(connection, "last_mirror_event_at", payload.get("sent_at") or dt.datetime.utcnow().isoformat(timespec="seconds") + "Z")


def apply_mirror_delete_payload(connection: sqlite3.Connection, payload: dict[str, Any]) -> None:
    booking_id = payload.get("booking_id")
    if not booking_id:
        raise CliError("Invalid mirror delete payload")

    connection.execute("DELETE FROM calendar_blocks WHERE booking_id = ?", (booking_id,))
    connection.execute("DELETE FROM bookings WHERE id = ?", (booking_id,))
    connection.commit()
    set_metadata(connection, "last_mirror_event_at", payload.get("sent_at") or dt.datetime.utcnow().isoformat(timespec="seconds") + "Z")


def normalize_local_booking(row: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(row)
    normalized["deposit_paid"] = bool(normalized.get("deposit_paid"))
    normalized["final_payment_paid"] = bool(normalized.get("final_payment_paid"))
    normalized["deposit_refunded"] = bool(normalized.get("deposit_refunded"))
    normalized["equipment_picked_up"] = bool(normalized.get("equipment_picked_up"))
    normalized["equipment_returned"] = bool(normalized.get("equipment_returned"))
    normalized["customer"] = {
        "full_name": normalized.pop("customer_full_name", None),
        "phone": normalized.pop("customer_phone", None),
        "email": normalized.pop("customer_email", None),
    }
    normalized["camera"] = {
        "name": normalized.pop("camera_name", None),
        "brand": normalized.pop("camera_brand", None),
        "model": normalized.pop("camera_model", None),
    }
    return normalized


def fetch_local_bookings(
    connection: sqlite3.Connection,
    *,
    status: str | None = None,
    booking_status: str | None = None,
    camera_id: str | None = None,
    customer_id: str | None = None,
    overlap_date: str | None = None,
    order_field: str = "created_at",
    order_direction: str = "desc",
    limit: int = 20,
) -> list[dict[str, Any]]:
    allowed_order_fields = {"created_at", "start_date", "end_date"}
    if order_field not in allowed_order_fields:
        raise CliError(f"Invalid order field: {order_field}")

    direction = "DESC" if order_direction.lower() == "desc" else "ASC"
    where_clauses = []
    params: list[Any] = []

    if status:
        where_clauses.append("b.status = ?")
        params.append(status)
    if booking_status:
        where_clauses.append("b.booking_status = ?")
        params.append(booking_status)
    if camera_id:
        where_clauses.append("b.camera_id = ?")
        params.append(camera_id)
    if customer_id:
        where_clauses.append("b.customer_id = ?")
        params.append(customer_id)
    if overlap_date:
        where_clauses.append("b.start_date <= ? AND b.end_date >= ?")
        params.extend([overlap_date, overlap_date])

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
    sql = f"""
        SELECT
            b.*,
            c.full_name AS customer_full_name,
            c.phone AS customer_phone,
            c.email AS customer_email,
            cam.name AS camera_name,
            cam.brand AS camera_brand,
            cam.model AS camera_model
        FROM bookings b
        LEFT JOIN customers c ON c.id = b.customer_id
        LEFT JOIN cameras cam ON cam.id = b.camera_id
        {where_sql}
        ORDER BY b.{order_field} {direction}
        LIMIT ?
    """
    params.append(limit)
    rows = sqlite_rows(connection.execute(sql, params))
    return [normalize_local_booking(row) for row in rows]


def fetch_local_cameras(connection: sqlite3.Connection, *, search: str | None = None, limit: int = 20) -> list[dict[str, Any]]:
    params: list[Any] = []
    where_sql = ""
    if search:
        where_sql = "WHERE name LIKE ? OR brand LIKE ? OR model LIKE ?"
        pattern = f"%{search}%"
        params.extend([pattern, pattern, pattern])
    params.append(limit)
    rows = sqlite_rows(
        connection.execute(
            f"""
            SELECT id, name, brand, model, daily_rate, deposit_amount, is_available, available_quantity, total_quantity, condition
            FROM cameras
            {where_sql}
            ORDER BY COALESCE(display_order, 999999), name ASC
            LIMIT ?
            """,
            params,
        )
    )
    for row in rows:
        row["is_available"] = bool(row.get("is_available"))
    return rows


def fetch_local_customers(connection: sqlite3.Connection, *, search: str | None = None, limit: int = 20) -> list[dict[str, Any]]:
    params: list[Any] = []
    where_sql = ""
    if search:
        where_sql = "WHERE full_name LIKE ? OR email LIKE ? OR phone LIKE ?"
        pattern = f"%{search}%"
        params.extend([pattern, pattern, pattern])
    params.append(limit)
    return sqlite_rows(
        connection.execute(
            f"""
            SELECT id, full_name, email, phone, whatsapp, total_bookings, reliability_score, created_at
            FROM customers
            {where_sql}
            ORDER BY created_at DESC
            LIMIT ?
            """,
            params,
        )
    )


def fetch_local_summary(connection: sqlite3.Connection, today: str) -> dict[str, Any]:
    pending = fetch_local_bookings(connection, booking_status="pending_approval", order_field="created_at", order_direction="desc", limit=50)
    active_rentals = sqlite_rows(
        connection.execute(
            """
            SELECT
                b.*,
                c.full_name AS customer_full_name,
                c.phone AS customer_phone,
                c.email AS customer_email,
                cam.name AS camera_name,
                cam.brand AS camera_brand,
                cam.model AS camera_model
            FROM bookings b
            LEFT JOIN customers c ON c.id = b.customer_id
            LEFT JOIN cameras cam ON cam.id = b.camera_id
            WHERE b.booking_status = 'confirmed' AND b.equipment_picked_up = 1 AND b.equipment_returned = 0
            ORDER BY b.created_at DESC
            LIMIT 50
            """
        )
    )
    pickups = sqlite_rows(
        connection.execute(
            """
            SELECT
                b.*,
                c.full_name AS customer_full_name,
                c.phone AS customer_phone,
                c.email AS customer_email,
                cam.name AS camera_name,
                cam.brand AS camera_brand,
                cam.model AS camera_model
            FROM bookings b
            LEFT JOIN customers c ON c.id = b.customer_id
            LEFT JOIN cameras cam ON cam.id = b.camera_id
            WHERE b.booking_status = 'confirmed' AND b.equipment_picked_up = 0 AND b.pickup_date = ?
            ORDER BY b.created_at DESC
            LIMIT 50
            """,
            (today,),
        )
    )
    returns = sqlite_rows(
        connection.execute(
            """
            SELECT
                b.*,
                c.full_name AS customer_full_name,
                c.phone AS customer_phone,
                c.email AS customer_email,
                cam.name AS camera_name,
                cam.brand AS camera_brand,
                cam.model AS camera_model
            FROM bookings b
            LEFT JOIN customers c ON c.id = b.customer_id
            LEFT JOIN cameras cam ON cam.id = b.camera_id
            WHERE b.equipment_picked_up = 1 AND b.equipment_returned = 0 AND b.end_date = ?
            ORDER BY b.created_at DESC
            LIMIT 50
            """,
            (today,),
        )
    )
    overdue = sqlite_rows(
        connection.execute(
            """
            SELECT
                b.*,
                c.full_name AS customer_full_name,
                c.phone AS customer_phone,
                c.email AS customer_email,
                cam.name AS camera_name,
                cam.brand AS camera_brand,
                cam.model AS camera_model
            FROM bookings b
            LEFT JOIN customers c ON c.id = b.customer_id
            LEFT JOIN cameras cam ON cam.id = b.camera_id
            WHERE b.final_payment_paid = 0 AND b.booking_status = 'completed' AND b.end_date < ?
            ORDER BY b.end_date DESC
            LIMIT 50
            """,
            (today,),
        )
    )
    cameras = sqlite_rows(connection.execute("SELECT id, name, brand, daily_rate, is_available, available_quantity, total_quantity FROM cameras"))

    normalize_many = lambda rows: [normalize_local_booking(row) for row in rows]
    active_rentals_norm = normalize_many(active_rentals)
    pickups_norm = normalize_many(pickups)
    returns_norm = normalize_many(returns)
    overdue_norm = normalize_many(overdue)

    completed_revenue = connection.execute("SELECT COALESCE(SUM(total_amount), 0) AS total FROM bookings WHERE booking_status = 'completed'").fetchone()["total"]
    pending_revenue = connection.execute("SELECT COALESCE(SUM(total_amount), 0) AS total FROM bookings WHERE booking_status = 'pending_approval'").fetchone()["total"]
    active_revenue = connection.execute("SELECT COALESCE(SUM(total_amount), 0) AS total FROM bookings WHERE booking_status IN ('confirmed', 'active')").fetchone()["total"]

    return {
        "generated_at": dt.datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "today": today,
        "cameras": {
            "total": len(cameras),
            "available": len([camera for camera in cameras if camera.get("is_available")]),
            "list": [
                {
                    **camera,
                    "is_available": bool(camera.get("is_available")),
                }
                for camera in cameras
            ],
        },
        "pending_approvals": {"count": len(pending), "bookings": pending},
        "active_rentals": {"count": len(active_rentals_norm), "bookings": active_rentals_norm},
        "todays_pickups": {"count": len(pickups_norm), "bookings": pickups_norm},
        "todays_returns": {"count": len(returns_norm), "bookings": returns_norm},
        "overdue_payments": {"count": len(overdue_norm), "bookings": overdue_norm},
        "revenue": {
            "completed": completed_revenue or 0,
            "pending": pending_revenue or 0,
            "active": active_revenue or 0,
        },
    }


def cached_availability(connection: sqlite3.Connection, camera_id: str, start_date: str, end_date: str) -> dict[str, Any]:
    conflicts = sqlite_rows(
        connection.execute(
            """
            SELECT id, start_date, end_date, booking_status, customer_id
            FROM bookings
            WHERE camera_id = ?
              AND booking_status NOT IN ('cancelled', 'rejected')
              AND start_date <= ?
              AND end_date >= ?
            ORDER BY start_date ASC
            """,
            (camera_id, end_date, start_date),
        )
    )
    blocks = sqlite_rows(
        connection.execute(
            """
            SELECT id, start_date, end_date, block_type, reason
            FROM calendar_blocks
            WHERE camera_id = ?
              AND start_date <= ?
              AND end_date >= ?
            ORDER BY start_date ASC
            """,
            (camera_id, end_date, start_date),
        )
    )
    return {
        "available": len(conflicts) == 0 and len(blocks) == 0,
        "camera_id": camera_id,
        "requested_range": {"start_date": start_date, "end_date": end_date},
        "conflicts": conflicts,
        "blocked_dates": blocks,
        "source": "cache",
    }


def add_source(value: Any, source: str) -> Any:
    if isinstance(value, dict):
        enriched = dict(value)
        enriched["source"] = source
        return enriched
    return value


def mirror_secret() -> str | None:
    return env_get("CAPTURA_MIRROR_WEBHOOK_SECRET", "HERMES_MIRROR_WEBHOOK_SECRET")


class MirrorRequestHandler(http.server.BaseHTTPRequestHandler):
    server_version = "CapturaMirror/1.0"

    def log_message(self, fmt: str, *args: Any) -> None:
        return

    def send_json(self, status_code: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=True).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self) -> None:
        if self.path != "/mirror":
            self.send_json(404, {"success": False, "error": "Not found"})
            return

        secret = mirror_secret()
        if not secret:
            self.send_json(500, {"success": False, "error": "Mirror secret not configured"})
            return

        if self.headers.get("X-Captura-Mirror-Secret") != secret:
            self.send_json(401, {"success": False, "error": "Unauthorized"})
            return

        content_length = self.headers.get("Content-Length")
        if not content_length:
            self.send_json(400, {"success": False, "error": "Missing Content-Length"})
            return

        try:
            raw = self.rfile.read(int(content_length)).decode("utf-8")
            payload = json.loads(raw)
        except (ValueError, json.JSONDecodeError):
            self.send_json(400, {"success": False, "error": "Invalid JSON"})
            return

        event = payload.get("event")
        connection = connect_local_db()
        try:
            if event == "booking.upsert":
                apply_mirror_upsert_payload(connection, payload)
            elif event == "booking.delete":
                apply_mirror_delete_payload(connection, payload)
            else:
                self.send_json(400, {"success": False, "error": f"Unsupported event: {event}"})
                return
        except CliError as exc:
            self.send_json(400, {"success": False, "error": str(exc)})
            return
        except sqlite3.Error as exc:
            self.send_json(500, {"success": False, "error": f"SQLite error: {exc}"})
            return

        self.send_json(200, {"success": True, "event": event, "booking_id": payload.get("booking_id")})
def booking_select() -> str:
    return (
        "id,start_date,end_date,total_days,total_amount,deposit_amount,deposit_paid,"
        "final_payment_paid,deposit_refunded,status,booking_status,pickup_method,"
        "equipment_picked_up,equipment_returned,created_at,customer_id,camera_id"
    )


def build_lookup(table: str, ids: list[str], fields: str) -> dict[str, dict[str, Any]]:
    if not ids:
        return {}

    unique_ids = list(dict.fromkeys(ids))
    lookup: dict[str, dict[str, Any]] = {}
    batch_size = 50

    for index in range(0, len(unique_ids), batch_size):
        batch = unique_ids[index:index + batch_size]
        quoted_ids = ",".join(f'"{item_id}"' for item_id in batch)
        rows = supabase_request(
            table,
            params={
                "select": fields,
                "id": f"in.({quoted_ids})",
            },
        )
        for row in rows or []:
            row_id = row.get("id")
            if row_id:
                lookup[str(row_id)] = row

    return lookup


def print_json(data: Any) -> None:
    print(json.dumps(data, indent=2, ensure_ascii=True, default=str))


def enrich_booking(row: dict[str, Any], customer_lookup: dict[str, dict[str, Any]], camera_lookup: dict[str, dict[str, Any]]) -> None:
    customer_id = str(row.get("customer_id", "")) if row.get("customer_id") else ""
    camera_id = str(row.get("camera_id", "")) if row.get("camera_id") else ""
    row["customer"] = customer_lookup.get(customer_id, {})
    row["camera"] = camera_lookup.get(camera_id, {})


def enrich_bookings(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not rows:
        return rows

    customer_ids = [str(row["customer_id"]) for row in rows if row.get("customer_id")]
    camera_ids = [str(row["camera_id"]) for row in rows if row.get("camera_id")]
    customer_lookup = build_lookup("customers", customer_ids, "id,full_name,phone,email")
    camera_lookup = build_lookup("cameras", camera_ids, "id,name,brand,model")

    for row in rows:
        enrich_booking(row, customer_lookup, camera_lookup)

    return rows


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
    order_field = args.sort
    order_direction = "desc" if args.desc else "asc"
    connection = connect_local_db()
    use_local = not args.live and local_cache_ready(connection, "bookings")
    if use_local:
        rows = fetch_local_bookings(
            connection,
            status=args.status,
            booking_status=args.booking_status,
            camera_id=args.camera_id,
            customer_id=args.customer_id,
            overlap_date=args.date,
            order_field=order_field,
            order_direction=order_direction,
            limit=args.limit,
        )
    else:
        params: dict[str, Any] = {
            "select": booking_select(),
            "order": f"{order_field}.{order_direction}",
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
        rows = enrich_bookings(supabase_request("bookings", params=params))
    if args.json:
        print_json(add_source(rows, "cache" if use_local else "live"))
        return
    for row in rows:
        print(summarize_booking(row))
    print(f"count={len(rows)}")


def latest_booking(args: argparse.Namespace) -> None:
    connection = connect_local_db()
    use_local = not args.live and local_cache_ready(connection, "bookings")
    if use_local:
        rows = fetch_local_bookings(
            connection,
            status=args.status,
            booking_status=args.booking_status,
            order_field=args.by,
            order_direction="desc",
            limit=1,
        )
    else:
        params: dict[str, Any] = {
            "select": booking_select(),
            "order": f"{args.by}.desc",
            "limit": 1,
        }
        if args.status:
            params["status"] = f"eq.{args.status}"
        if args.booking_status:
            params["booking_status"] = f"eq.{args.booking_status}"
        rows = enrich_bookings(supabase_request("bookings", params=params))
    if not rows:
        print("count=0")
        return

    row = rows[0]
    if args.json:
        print_json(add_source(row, "cache" if use_local else "live"))
        return

    print(summarize_booking(row))
    print(f"by={args.by}")


def pending_bookings(args: argparse.Namespace) -> None:
    connection = connect_local_db()
    use_local = not args.live and local_cache_ready(connection, "bookings")
    if use_local:
        rows = fetch_local_bookings(
            connection,
            booking_status="pending_approval",
            order_field="created_at",
            order_direction="desc",
            limit=args.limit,
        )
    else:
        rows = enrich_bookings(
            supabase_request(
                "bookings",
                params={
                    "select": booking_select(),
                    "booking_status": "eq.pending_approval",
                    "order": "created_at.desc",
                    "limit": args.limit,
                },
            )
        )
    if args.json:
        print_json(add_source(rows, "cache" if use_local else "live"))
        return
    for row in rows:
        print(summarize_booking(row))
    print(f"count={len(rows)}")


def get_booking(args: argparse.Namespace) -> None:
    connection = connect_local_db()
    use_local = not args.live and local_cache_ready(connection, "bookings")
    if use_local:
        rows = fetch_local_bookings(connection, limit=10_000, order_field="created_at", order_direction="desc")
        rows = [row for row in rows if row.get("id") == args.booking_id][:1]
    else:
        rows = enrich_bookings(
            supabase_request(
                "bookings",
                params={
                    "select": booking_select(),
                    "id": f"eq.{args.booking_id}",
                    "limit": 1,
                },
            )
        )
    if not rows:
        raise CliError(f"Booking not found: {args.booking_id}")
    row = rows[0]
    if args.json:
        print_json(add_source(row, "cache" if use_local else "live"))
    else:
        print(summarize_booking(row))
        print_json(row)


def list_cameras(args: argparse.Namespace) -> None:
    connection = connect_local_db()
    use_local = not args.live and local_cache_ready(connection, "cameras")
    if use_local:
        rows = fetch_local_cameras(connection, search=args.search, limit=args.limit)
    else:
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
        print_json(add_source(rows, "cache" if use_local else "live"))
        return
    for row in rows:
        print(
            f"{row.get('id')} | {row.get('brand')} {row.get('model')} | {row.get('name')} | "
            f"rate={compact_money(row.get('daily_rate'))} | deposit={compact_money(row.get('deposit_amount'))} | "
            f"available={compact_bool(row.get('is_available'))} qty={row.get('available_quantity')}/{row.get('total_quantity')}"
        )
    print(f"count={len(rows)}")


def list_customers(args: argparse.Namespace) -> None:
    connection = connect_local_db()
    use_local = not args.live and local_cache_ready(connection, "customers")
    if use_local:
        rows = fetch_local_customers(connection, search=args.search, limit=args.limit)
    else:
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
        print_json(add_source(rows, "cache" if use_local else "live"))
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
    connection = connect_local_db()
    use_local = not args.live and local_cache_ready(connection, None)
    data = fetch_local_summary(connection, dt.date.today().isoformat()) if use_local else app_request("GET", "/api/n8n/summary")
    if args.json:
        print_json(add_source(data, "cache" if use_local else "live"))
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


def next_actions(args: argparse.Namespace) -> None:
    connection = connect_local_db()
    use_local = not args.live and local_cache_ready(connection, None)
    data = fetch_local_summary(connection, dt.date.today().isoformat()) if use_local else app_request("GET", "/api/n8n/summary")
    if args.json:
        compact = {
            "today": data.get("today"),
            "pending_approvals": (data.get("pending_approvals") or {}).get("bookings", [])[:args.limit],
            "todays_pickups": (data.get("todays_pickups") or {}).get("bookings", [])[:args.limit],
            "todays_returns": (data.get("todays_returns") or {}).get("bookings", [])[:args.limit],
            "overdue_payments": (data.get("overdue_payments") or {}).get("bookings", [])[:args.limit],
        }
        print_json(add_source(compact, "cache" if use_local else "live"))
        return

    print(f"today={data.get('today')}")
    sections = [
        ("pending_approvals", (data.get("pending_approvals") or {}).get("bookings", [])),
        ("todays_pickups", (data.get("todays_pickups") or {}).get("bookings", [])),
        ("todays_returns", (data.get("todays_returns") or {}).get("bookings", [])),
        ("overdue_payments", (data.get("overdue_payments") or {}).get("bookings", [])),
    ]
    for title, rows in sections:
        print(f"[{title}] count={len(rows)}")
        for row in rows[:args.limit]:
            customer = row.get("customers") or row.get("customer") or {}
            camera = row.get("cameras") or row.get("camera") or {}
            customer_name = customer.get("full_name") or customer.get("name") or "-"
            camera_name = camera.get("name") or "-"
            start = row.get("start_date") or row.get("pickup_date") or "-"
            end = row.get("end_date") or "-"
            booking_status = row.get("booking_status") or "-"
            final_paid = row.get("final_payment_paid")
            status_suffix = f" | final={compact_bool(final_paid)}" if final_paid is not None else ""
            print(f"{row.get('id')} | {customer_name} | {camera_name} | {start}->{end} | booking={booking_status}{status_suffix}")


def check_availability(args: argparse.Namespace) -> None:
    connection = connect_local_db()
    if not args.live and local_cache_ready(connection, None):
        data = cached_availability(connection, args.camera_id, args.start_date, args.end_date)
    else:
        query = urllib.parse.urlencode(
            {
                "camera_id": args.camera_id,
                "start_date": args.start_date,
                "end_date": args.end_date,
            }
        )
        try:
            data = app_request("GET", f"/api/n8n/availability?{query}")
            data = add_source(data, "live")
        except CliError as exc:
            if exc.status_code == 402 and local_cache_ready(connection, None):
                data = cached_availability(connection, args.camera_id, args.start_date, args.end_date)
            else:
                raise
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
    booking_id = data.get("booking_id")
    if booking_id:
        refresh_local_booking_cache(str(booking_id))
    print_json(data if args.json else {
        "success": data.get("success"),
        "message": data.get("message"),
        "booking_id": data.get("booking_id"),
        "confirmation_number": data.get("confirmation_number"),
    })


def approve_booking(args: argparse.Namespace) -> None:
    data = app_request("POST", f"/api/bookings/{args.booking_id}/approve", {"admin_notes": args.notes})
    refresh_local_booking_cache(args.booking_id)
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
    refresh_local_booking_cache(args.booking_id)
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
    refresh_local_booking_cache(args.booking_id)
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
    refresh_local_booking_cache(args.booking_id)
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
    refresh_local_booking_cache(args.booking_id)
    print_json(data if args.json else {
        "success": data.get("success"),
        "message": data.get("message"),
        "booking_id": ((data.get("booking") or {}).get("id")),
        "deposit_refunded": ((data.get("booking") or {}).get("deposit_refunded")),
        "booking_status": ((data.get("booking") or {}).get("booking_status")),
        "deposit_refund_amount": ((data.get("booking") or {}).get("deposit_refund_amount")),
    })


def complete_booking(args: argparse.Namespace) -> None:
    rows = enrich_bookings(
        supabase_request(
            "bookings",
            params={
                "select": booking_select() + ",deposit_amount,equipment_picked_up,equipment_returned,final_payment_paid",
                "id": f"eq.{args.booking_id}",
                "limit": 1,
            },
        )
    )
    if not rows:
        raise CliError(f"Booking not found: {args.booking_id}")

    booking = rows[0]
    actions: list[str] = []

    if not booking.get("final_payment_paid"):
        app_request(
            "POST",
            f"/api/bookings/{args.booking_id}/final-payment",
            {"final_payment_paid": True, "final_payment_paid_date": args.date},
        )
        actions.append("final_payment_paid")

    if not booking.get("equipment_picked_up"):
        app_request(
            "POST",
            f"/api/bookings/{args.booking_id}/pickup-status",
            {
                "equipment_picked_up": True,
                "equipment_pickup_notes": args.pickup_notes,
                "equipment_condition_pickup": args.pickup_condition,
            },
        )
        actions.append("pickup_marked")

    if not booking.get("equipment_returned"):
        app_request(
            "POST",
            f"/api/bookings/{args.booking_id}/return-status",
            {
                "equipment_returned": True,
                "equipment_return_notes": args.return_notes,
                "equipment_condition_return": args.return_condition,
                "booking_status": "completed",
            },
        )
        actions.append("return_marked")

    if not booking.get("deposit_refunded"):
        app_request(
            "POST",
            f"/api/bookings/{args.booking_id}/deposit-refund",
            {
                "deposit_refunded": True,
                "deposit_refund_date": args.date,
                "deposit_refund_notes": args.refund_notes,
                "deposit_refund_amount": args.amount if args.amount is not None else booking.get("deposit_amount") or 100,
            },
        )
        actions.append("deposit_refunded")

    refreshed = enrich_bookings(
        supabase_request(
            "bookings",
            params={
                "select": booking_select() + ",deposit_refund_amount,equipment_pickup_date,equipment_return_date,final_payment_paid_date,deposit_refund_date",
                "id": f"eq.{args.booking_id}",
                "limit": 1,
            },
        )
    )[0]
    refresh_local_booking_cache(args.booking_id)

    if args.json:
        print_json(
            {
                "success": True,
                "actions": actions,
                "booking": add_source(refreshed, "live"),
            }
        )
        return

    print_json(
        {
            "success": True,
            "booking_id": refreshed.get("id"),
            "booking_status": refreshed.get("booking_status"),
            "status": refreshed.get("status"),
            "final_payment_paid": refreshed.get("final_payment_paid"),
            "equipment_picked_up": refreshed.get("equipment_picked_up"),
            "equipment_returned": refreshed.get("equipment_returned"),
            "deposit_refunded": refreshed.get("deposit_refunded"),
            "actions": actions,
        }
    )


def health(args: argparse.Namespace) -> None:
    connection = connect_local_db()
    cache = cache_health(connection)
    data = {
        "base_url": BASE_URL,
        "supabase_url": SUPABASE_URL,
        "has_service_role_key": bool(SUPABASE_SERVICE_ROLE_KEY),
        "today": dt.date.today().isoformat(),
        "local_db_path": cache["path"],
        "local_last_synced_at": cache["last_synced_at"],
        "local_last_mirror_event_at": get_metadata(connection, "last_mirror_event_at"),
        "local_bookings": cache["bookings"],
    }
    if args.json:
        print_json(data)
        return
    print(
        f"base_url={data['base_url']} | supabase_url={data['supabase_url']} | "
        f"service_role_key={'yes' if data['has_service_role_key'] else 'no'} | "
        f"local_db={data['local_db_path']} | synced={data['local_last_synced_at'] or '-'} | "
        f"mirror_event={data['local_last_mirror_event_at'] or '-'} | "
        f"local_bookings={data['local_bookings']} | today={data['today']}"
    )


def sync_command(args: argparse.Namespace) -> None:
    connection = connect_local_db()
    counts = sync_local_cache(connection)
    if args.json:
        print_json(
            {
                "success": True,
                "path": str(LOCAL_DB_PATH),
                "last_synced_at": get_metadata(connection, "last_synced_at"),
                "counts": counts,
            }
        )
        return
    print(
        f"sync=ok | path={LOCAL_DB_PATH} | last_synced_at={get_metadata(connection, 'last_synced_at')} | "
        f"customers={counts['customers']} cameras={counts['cameras']} bookings={counts['bookings']} blocks={counts['calendar_blocks']}"
    )


def serve_mirror(args: argparse.Namespace) -> None:
    if not mirror_secret():
        raise CliError("Missing env: CAPTURA_MIRROR_WEBHOOK_SECRET or HERMES_MIRROR_WEBHOOK_SECRET")

    httpd = http.server.ThreadingHTTPServer((args.host, args.port), MirrorRequestHandler)
    print(f"mirror=serving | url=http://{args.host}:{args.port}/mirror | db={LOCAL_DB_PATH}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("mirror=stopped")
    finally:
        httpd.server_close()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="captura-db",
        description="Compact Captura CLI for Hermes.",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    health_parser = subparsers.add_parser("health", help="Show resolved config.")
    health_parser.add_argument("--json", action="store_true")
    health_parser.set_defaults(func=health)

    sync_parser = subparsers.add_parser("sync", help="Sync local SQLite mirror from Supabase.")
    sync_parser.add_argument("--json", action="store_true")
    sync_parser.set_defaults(func=sync_command)

    serve_parser = subparsers.add_parser("serve-mirror", help="Run local webhook receiver for near-real-time mirror updates.")
    serve_parser.add_argument("--host", default="127.0.0.1")
    serve_parser.add_argument("--port", type=int, default=8765)
    serve_parser.set_defaults(func=serve_mirror)

    summary_parser = subparsers.add_parser("summary", help="Show operational summary.")
    summary_parser.add_argument("--live", action="store_true")
    summary_parser.add_argument("--json", action="store_true")
    summary_parser.set_defaults(func=show_summary)

    bookings_parser = subparsers.add_parser("bookings", help="List bookings.")
    bookings_parser.add_argument("--live", action="store_true")
    bookings_parser.add_argument("--status")
    bookings_parser.add_argument("--booking-status")
    bookings_parser.add_argument("--camera-id")
    bookings_parser.add_argument("--customer-id")
    bookings_parser.add_argument("--date", help="Overlap date YYYY-MM-DD")
    bookings_parser.add_argument("--sort", choices=["created_at", "start_date", "end_date"], default="created_at")
    bookings_parser.add_argument("--desc", action="store_true", default=True)
    bookings_parser.add_argument("--asc", dest="desc", action="store_false")
    bookings_parser.add_argument("--limit", type=int, default=20)
    bookings_parser.add_argument("--json", action="store_true")
    bookings_parser.set_defaults(func=list_bookings)

    latest_parser = subparsers.add_parser("latest", help="Get latest booking.")
    latest_parser.add_argument("--live", action="store_true")
    latest_parser.add_argument("--by", choices=["created_at", "start_date", "end_date"], default="created_at")
    latest_parser.add_argument("--status")
    latest_parser.add_argument("--booking-status")
    latest_parser.add_argument("--json", action="store_true")
    latest_parser.set_defaults(func=latest_booking)

    pending_parser = subparsers.add_parser("pending", help="List pending approval bookings.")
    pending_parser.add_argument("--live", action="store_true")
    pending_parser.add_argument("--limit", type=int, default=10)
    pending_parser.add_argument("--json", action="store_true")
    pending_parser.set_defaults(func=pending_bookings)

    next_actions_parser = subparsers.add_parser("next-actions", help="Show today's operational queue.")
    next_actions_parser.add_argument("--live", action="store_true")
    next_actions_parser.add_argument("--limit", type=int, default=5)
    next_actions_parser.add_argument("--json", action="store_true")
    next_actions_parser.set_defaults(func=next_actions)

    booking_parser = subparsers.add_parser("booking", help="Get one booking.")
    booking_parser.add_argument("booking_id")
    booking_parser.add_argument("--live", action="store_true")
    booking_parser.add_argument("--json", action="store_true")
    booking_parser.set_defaults(func=get_booking)

    cameras_parser = subparsers.add_parser("cameras", help="List cameras.")
    cameras_parser.add_argument("--live", action="store_true")
    cameras_parser.add_argument("--search")
    cameras_parser.add_argument("--limit", type=int, default=20)
    cameras_parser.add_argument("--json", action="store_true")
    cameras_parser.set_defaults(func=list_cameras)

    customers_parser = subparsers.add_parser("customers", help="List customers.")
    customers_parser.add_argument("--live", action="store_true")
    customers_parser.add_argument("--search")
    customers_parser.add_argument("--limit", type=int, default=20)
    customers_parser.add_argument("--json", action="store_true")
    customers_parser.set_defaults(func=list_customers)

    availability_parser = subparsers.add_parser("availability", help="Check camera availability.")
    availability_parser.add_argument("camera_id")
    availability_parser.add_argument("start_date")
    availability_parser.add_argument("end_date")
    availability_parser.add_argument("--live", action="store_true")
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

    complete_parser = subparsers.add_parser("complete", help="Complete booking workflow in one command.")
    complete_parser.add_argument("booking_id")
    complete_parser.add_argument("--amount", type=float)
    complete_parser.add_argument("--date")
    complete_parser.add_argument("--pickup-condition", choices=["excellent", "good", "fair", "damaged"], default="good")
    complete_parser.add_argument("--return-condition", choices=["excellent", "good", "fair", "damaged"], default="good")
    complete_parser.add_argument("--pickup-notes", default="Completed via captura-db")
    complete_parser.add_argument("--return-notes", default="Returned via captura-db")
    complete_parser.add_argument("--refund-notes", default="Deposit refunded via captura-db complete")
    complete_parser.add_argument("--json", action="store_true")
    complete_parser.set_defaults(func=complete_booking)

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
