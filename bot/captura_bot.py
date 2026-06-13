#!/usr/bin/env python3
"""
CAPTURA Camera Rental — Telegram Management Bot v3.1
MCP-wired · owner-gated · dynamic inline keyboards · confirmation flows
"""

import os, sys, asyncio, json, re, logging, subprocess
from datetime import datetime, timezone, timedelta
from typing import Optional, Any
import httpx
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application, MessageHandler, CommandHandler,
    CallbackQueryHandler, filters, ContextTypes,
)
from telegram.error import Forbidden

# ── Logging ────────────────────────────────────────────
logging.basicConfig(
    filename="/tmp/captura-bot-debug.log",
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
log = logging.getLogger("captura_bot")
log.info("Bot v3.1 starting")

# ── Config ─────────────────────────────────────────────
TOKEN   = os.environ.get("CAPTURA_BOT_TOKEN", "")
SB_URL  = os.environ.get("SUPABASE_URL", "https://mqpzbzkdtfebzcfoqgta.supabase.co")
SB_KEY  = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
WA_URL  = os.environ.get("WHATSAPP_BRIDGE_URL", "http://localhost:3000")
OWNER   = int(os.environ.get("BOT_CHAT_ID", "0"))
ALERT   = int(os.environ.get("ALERT_INTERVAL", "60"))
BANNER  = os.environ.get("BOT_BANNER", "")

if not TOKEN: print("Set CAPTURA_BOT_TOKEN"); sys.exit(1)
if not SB_KEY: print("Set SUPABASE_SERVICE_ROLE_KEY"); sys.exit(1)

HEADERS = {
    "apikey": SB_KEY,
    "Authorization": f"Bearer {SB_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}
PARSE_MODE = "Markdown"

# Paths
BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
MCP_JS    = os.path.join(BASE_DIR, "..", "mcp-server", "dist", "index.js")
CHAT_FILE = os.path.join(BASE_DIR, ".chat_id")

# ── MCP Client ─────────────────────────────────────────
class MCPClient:
    """Manages a persistent JSON-RPC subprocess to the MCP server."""

    def __init__(self):
        self.process = None
        self._req_id = 0
        self._lock = asyncio.Lock()

    async def _ensure(self):
        if self.process and self.process.returncode is None:
            return
        env = os.environ.copy()
        env["SUPABASE_SERVICE_ROLE_KEY"] = SB_KEY
        env["SUPABASE_URL"] = SB_URL
        self.process = await asyncio.create_subprocess_exec(
            "node", MCP_JS,
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            env=env,
        )
        self._req_id = 0
        await self._request("initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "captura_bot", "version": "3.0"},
        })
        await self._read()
        self.process.stdin.write(b'{"jsonrpc":"2.0","method":"notifications/initialized"}\n')
        await self.process.stdin.drain()

    async def _request(self, method: str, params: dict):
        self._req_id += 1
        payload = json.dumps({"jsonrpc": "2.0", "id": self._req_id, "method": method, "params": params})
        self.process.stdin.write(payload.encode() + b"\n")
        await self.process.stdin.drain()

    async def _read(self) -> dict:
        while True:
            line = await asyncio.wait_for(self.process.stdout.readline(), 20)
            if not line:
                raise ConnectionError("MCP process died")
            try:
                msg = json.loads(line)
            except json.JSONDecodeError:
                continue
            if "id" not in msg:
                continue
            if "error" in msg:
                raise RuntimeError(msg["error"].get("message", str(msg["error"])))
            return msg.get("result", msg)

    async def call_tool(self, name: str, args: Optional[dict] = None) -> Any:
        async with self._lock:
            await self._ensure()
            await self._request("tools/call", {"name": name, "arguments": args or {}})
            result = await self._read()
            if isinstance(result, dict) and "content" in result:
                for item in result["content"]:
                    if item.get("type") == "text":
                        return json.loads(item["text"])
            return result

    def shutdown(self):
        if self.process and self.process.returncode is None:
            self.process.kill()


mcp = MCPClient()

# ── Cache Management ──────────────────────────────────
def invalidate_cache(key: str = "all"):
    """Clear caches after state mutations so views show fresh data."""
    global _pending_cache, _pending_cache_ts, _overdue_cache, _overdue_cache_ts
    if key in ("pending", "all"):
        _pending_cache = []
        _pending_cache_ts = 0
    if key in ("overdue", "all"):
        _overdue_cache = []
        _overdue_cache_ts = 0
    if key in ("cameras", "all"):
        global _camera_cache, _camera_cache_ts
        _camera_cache = []
        _camera_cache_ts = 0

# ── In-memory caches ───────────────────────────────────
_camera_cache: list = []
_camera_cache_ts: float = 0

_pending_cache: list = []
_pending_cache_ts: float = 0

_overdue_cache: list = []
_overdue_cache_ts: float = 0

# Session state for numbered customer search results
_search_sessions: dict[int, list] = {}  # chat_id -> [customer dicts]

CACHE_TTL_SHORT = 30   # seconds for pending/overdue
CACHE_TTL_LONG  = 300  # seconds for camera list


# ── Date Helpers ───────────────────────────────────────
def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()

def date_today() -> str:
    return datetime.now().strftime("%Y-%m-%d")

def date_tomorrow() -> str:
    return (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

def date_days_out(n: int) -> str:
    return (datetime.now() + timedelta(days=n)).strftime("%Y-%m-%d")


# ── Formatting Helpers ─────────────────────────────────
STATUS_EMOJI = {
    "pending_approval": "⏳",
    "confirmed": "✅",
    "active": "📦",
    "completed": "🏁",
    "cancelled": "🚫",
    "rejected": "❌",
}

def status_icon(status: str) -> str:
    return STATUS_EMOJI.get(status, "📋")

def status_label(status: str) -> str:
    return status.replace("_", " ").title()

def customer_display(booking: dict) -> str:
    cust = booking.get("customer") or {}
    return cust.get("full_name") or cust.get("name") or "Unknown"

def camera_display(booking: dict) -> str:
    for cam in _camera_cache:
        if cam.get("id") == booking.get("camera_id"):
            return cam.get("name", "???")
    return (booking.get("camera_id") or "???")[:8]

def format_booking_line(booking: dict) -> str:
    icon = status_icon(booking.get("booking_status", ""))
    label = status_label(booking.get("booking_status", ""))
    return f"{icon} *{customer_display(booking)}* — {camera_display(booking)} | {booking['start_date']} | RM{float(booking.get('total_amount', 0)):.0f}  _{label}_"

def format_currency(amount: float) -> str:
    return f"RM {amount:,.0f}"

def clean_phone(phone: str) -> str:
    return re.sub(r"[^\d]", "", phone)


# ── Camera Helpers ─────────────────────────────────────
async def fetch_cameras(force: bool = False) -> list:
    global _camera_cache, _camera_cache_ts
    now_ts = asyncio.get_event_loop().time()
    if not force and _camera_cache and (now_ts - _camera_cache_ts) < CACHE_TTL_LONG:
        return _camera_cache
    try:
        result = await mcp.call_tool("captura.cameras.list", {"filter": "all"})
        cameras = result.get("cameras", result) if isinstance(result, dict) else result
        if isinstance(cameras, dict):
            cameras = cameras.get("cameras", [])
        if not isinstance(cameras, list):
            cameras = []
        _camera_cache = cameras
        _camera_cache_ts = now_ts
    except Exception as e:
        log.warning(f"fetch_cameras failed: {e}")
        cameras = _camera_cache or []
    return cameras

async def find_camera(query: str) -> Optional[dict]:
    cameras = await fetch_cameras()
    q = query.lower().strip()
    for cam in cameras:
        name = (cam.get("name") or "").lower()
        if q == name or q == (cam.get("id") or "")[:8].lower():
            return cam
    for cam in cameras:
        if q in (cam.get("name") or "").lower():
            return cam
    return None


# ── Supabase Layer ─────────────────────────────────────
async def supabase_get(path: str, params: Optional[dict] = None) -> list:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{SB_URL}/rest/v1/{path}", headers=HEADERS, params=params)
        resp.raise_for_status()
        return resp.json()

async def supabase_patch(table: str, body: dict, conditions: dict) -> None:
    async with httpx.AsyncClient(timeout=10) as client:
        qs = "&".join(f"{k}=eq.{v}" for k, v in conditions.items())
        resp = await client.patch(f"{SB_URL}/rest/v1/{table}?{qs}", headers=HEADERS, json=body)
        resp.raise_for_status()

async def supabase_insert(table: str, body: dict) -> None:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(f"{SB_URL}/rest/v1/{table}", headers=HEADERS, json=body)
        resp.raise_for_status()


# ── Booking Queries ────────────────────────────────────
async def get_booking(booking_id: str) -> Optional[dict]:
    rows = await supabase_get(
        f"bookings?id=eq.{booking_id}&select=*,customer:customers(id,name,full_name,email,phone,whatsapp)"
    )
    return rows[0] if rows else None

async def get_pending_bookings(use_cache: bool = True) -> list:
    global _pending_cache, _pending_cache_ts
    now_ts = asyncio.get_event_loop().time()
    if use_cache and (now_ts - _pending_cache_ts) < CACHE_TTL_SHORT:
        return _pending_cache
    rows = []
    try:
        rows = await supabase_get("bookings", {
            "select": "*,customer:customers(id,name,full_name,email,phone,whatsapp)",
            "booking_status": "eq.pending_approval",
            "order": "created_at.desc",
            "limit": "30",
        })
    except Exception as e:
        log.warning(f"get_pending_bookings (booking_status) failed: {e}")
    if not rows:
        try:
            rows = await supabase_get("bookings", {
                "select": "*,customer:customers(id,name,full_name,email,phone,whatsapp)",
                "status": "eq.pending",
                "order": "created_at.desc",
                "limit": "30",
            })
            log.info(f"get_pending_bookings (status fallback): {len(rows)} rows")
        except Exception as e:
            log.error(f"get_pending_bookings (status) also failed: {e}")
    _pending_cache = rows
    _pending_cache_ts = now_ts
    return rows

async def get_active_bookings() -> list:
    """Fetch active rentals. Tries booking_status first, falls back to status column."""
    try:
        rows = await supabase_get("bookings", {
            "select": "*,customer:customers(id,name,full_name,email,phone,whatsapp)",
            "booking_status": "eq.active",
            "order": "end_date.asc",
            "limit": "30",
        })
        if rows:
            return rows
    except Exception as e:
        log.warning(f"get_active_bookings (booking_status) failed: {e}")
    # Fallback: try 'status' column
    try:
        rows = await supabase_get("bookings", {
            "select": "*,customer:customers(id,name,full_name,email,phone,whatsapp)",
            "status": "eq.active",
            "order": "end_date.asc",
            "limit": "30",
        })
        log.info(f"get_active_bookings (status fallback): {len(rows)} rows")
        return rows
    except Exception as e:
        log.error(f"get_active_bookings (status) also failed: {e}")
        return []

async def get_overdue_bookings(use_cache: bool = True) -> list:
    global _overdue_cache, _overdue_cache_ts
    now_ts = asyncio.get_event_loop().time()
    if use_cache and (now_ts - _overdue_cache_ts) < CACHE_TTL_SHORT:
        return _overdue_cache
    today_str = date_today()
    rows = []
    # Try booking_status column first
    try:
        rows = await supabase_get("bookings", {
            "select": "*,customer:customers(id,name,full_name,email,phone,whatsapp)",
            "or": "(booking_status.eq.confirmed,booking_status.eq.active)",
            "end_date": f"lt.{today_str}",
            "order": "end_date.asc",
            "limit": "30",
        })
    except Exception as e:
        log.warning(f"get_overdue_bookings (booking_status) failed: {e}")
    # Fallback: try status column
    if not rows:
        try:
            rows = await supabase_get(f"bookings?select=*,customer:customers(id,name,full_name,email,phone,whatsapp)&or=(status.eq.confirmed,status.eq.active)&booking_status=not.in.(completed,cancelled)&end_date=lt.{today_str}&order=end_date.asc&limit=30")
            log.info(f"get_overdue_bookings (status fallback): {len(rows)} rows")
        except Exception as e:
            log.error(f"get_overdue_bookings (status) also failed: {e}")
    _overdue_cache = rows
    _overdue_cache_ts = now_ts
    return rows

async def get_recent_bookings(count: int = 5) -> list:
    return await supabase_get("bookings", {
        "select": "*,customer:customers(id,name,full_name,email,phone,whatsapp)",
        "order": "created_at.desc",
        "limit": str(count),
    })

async def get_pickups_window(days: int = 3) -> list:
    td = date_today()
    d_end = date_days_out(days)
    return await supabase_get(
        f"bookings?select=*,customer:customers(id,name,full_name,email,phone,whatsapp)"
        f"&booking_status=eq.confirmed"
        f"&equipment_picked_up=eq.false"
        f"&pickup_date=gte.{td}&pickup_date=lte.{d_end}"
        f"&order=pickup_date.asc&limit=30"
    )

async def get_returns_window(days: int = 3) -> list:
    td = date_today()
    d_end = date_days_out(days)
    return await supabase_get(
        f"bookings?select=*,customer:customers(id,name,full_name,email,phone,whatsapp)"
        f"&booking_status=eq.confirmed"
        f"&equipment_returned=eq.false"
        f"&end_date=gte.{td}&end_date=lte.{d_end}"
        f"&order=end_date.asc&limit=30"
    )

async def search_bookings(query: str, limit: int = 10) -> list:
    q = query.strip()
    # Try ILIKE on customer name
    try:
        rows = await supabase_get(
            f"bookings?customer.full_name=ilike.*{q}*"
            f"&select=*,customer:customers(id,name,full_name,email,phone,whatsapp)"
            f"&order=created_at.desc&limit={limit}"
        )
        if rows:
            return rows
    except Exception:
        pass
    # Fallback: search across name, email, phone
    try:
        rows = await supabase_get("bookings", {
            "select": "*,customer:customers!inner(id,name,full_name,email,phone,whatsapp)",
            "or": f"(full_name.ilike.*{q}*,email.ilike.*{q}*,phone.ilike.*{q}*)",
            "order": "created_at.desc",
            "limit": str(limit),
        })
        return rows
    except Exception:
        return []

async def search_customers(query: str, limit: int = 10) -> list:
    q = query.strip()
    try:
        return await supabase_get("customers", {
            "select": "id,full_name,email,phone,id_number",
            "or": f"(full_name.ilike.*{q}*,email.ilike.*{q}*,phone.ilike.*{q}*)",
            "order": "created_at.desc",
            "limit": str(limit),
        })
    except Exception:
        return []

async def get_customer_bookings(customer_id: str, limit: int = 15) -> list:
    return await supabase_get("bookings", {
        "select": "*,customer:customers(id,name,full_name,email,phone,whatsapp)",
        "customer_id": f"eq.{customer_id}",
        "order": "created_at.desc",
        "limit": str(limit),
    })


# ── Unified Stats ──────────────────────────────────────
async def gather_stats(force_refresh: bool = False) -> dict:
    """Fetch dashboard stats. Uses direct DB as primary source (MCP has date-filter bugs)."""
    today_str = date_today()
    start_of_month = datetime.now().strftime("%Y-%m-01")

    # ── Direct DB counts (always accurate) ──
    try:
        pending = await supabase_get("bookings", {"select": "id,booking_status,status", "or": "(booking_status.eq.pending_approval,status.eq.pending)", "limit": "200"})
    except Exception:
        pending = []
    try:
        active = await supabase_get("bookings", {"select": "id,total_amount,booking_status,status", "or": "(booking_status.eq.active,status.eq.active)", "limit": "200"})
    except Exception:
        active = []
    try:
        completed = await supabase_get("bookings", {"select": "id,booking_status,status", "or": "(booking_status.eq.completed,status.eq.completed)", "limit": "200"})
    except Exception:
        completed = []

    # Revenue: use start_date range (today and month), not created_at
    # Also sum active booking values for today snapshot
    rev_today = sum(float(b.get("total_amount", 0)) for b in active)
    try:
        month_rows = await supabase_get("bookings", {
            "select": "total_amount,start_date,booking_status,status",
            "order": "start_date.desc",
            "limit": "300",
        })
        rev_month = sum(
            float(r.get("total_amount", 0)) for r in month_rows
            if (r.get("start_date", "") or "").startswith(start_of_month[:7])
        )
        # Count new bookings this month
        new_month = sum(
            1 for r in month_rows
            if (r.get("start_date", "") or "").startswith(start_of_month[:7])
        )
    except Exception:
        rev_month = 0
        new_month = 0

    # Pickup/return counts from MCP (supplemental)
    try:
        na = await mcp.call_tool("captura.bookings.next_actions", {})
        pickup_count = len(na.get("todays_pickups", na.get("pickups", [])))
        return_count = len(na.get("todays_returns", na.get("returns", [])))
    except Exception:
        pickup_count = 0
        return_count = 0

    # Try MCP for month revenue as a supplement
    try:
        m_month = await mcp.call_tool("captura.admin.dashboard_summary", {"period": "month"})
        mc_rev = m_month.get("metrics", {}).get("total_revenue_rm", 0) if isinstance(m_month, dict) else 0
        if mc_rev > rev_month:
            rev_month = mc_rev  # MCP might have broader data
    except Exception:
        pass

    return {
        "pending": len(pending),
        "active": len(active),
        "pickups": pickup_count,
        "returns": return_count,
        "completed": len(completed),
        "revenue_today": rev_today,
        "revenue_month": rev_month,
        "new_today": 0,
        "new_month": new_month,
    }


# ── WhatsApp ───────────────────────────────────────────
async def send_whatsapp(phone: str, message: str) -> bool:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{WA_URL}/send",
                json={"phone": clean_phone(phone), "message": message},
            )
            return resp.status_code < 400
    except Exception:
        return False

def whatsapp_link(phone: str) -> str:
    num = clean_phone(phone)
    return f"https://wa.me/{num}"


# ── Message Helpers ────────────────────────────────────
async def reply_text(update: Update, text: str, **kwargs):
    """Send or edit a message. Auto-falls back from Markdown to plain text."""
    if len(text) > 4000:
        text = text[:3990] + "..."

    target = update.message
    is_edit = False
    if update.callback_query and update.callback_query.message:
        target = update.callback_query.message
        is_edit = True

    if not target:
        return

    try:
        if is_edit:
            await target.edit_text(text, parse_mode=PARSE_MODE, **kwargs)
        else:
            await target.reply_text(text, parse_mode=PARSE_MODE, **kwargs)
    except Exception:
        try:
            if is_edit:
                await target.edit_text(text, **kwargs)
            else:
                await target.reply_text(text, **kwargs)
        except Exception:
            pass

async def send_direct(app, chat_id: int, text: str, **kwargs):
    try:
        await app.bot.send_message(chat_id, text, parse_mode=PARSE_MODE, **kwargs)
    except Exception:
        try:
            await app.bot.send_message(chat_id, text, **kwargs)
        except Exception:
            pass


# ── Action Helpers ─────────────────────────────────────
async def approve_booking(booking_id: str) -> Optional[dict]:
    """Approve via MCP tool. Sends WhatsApp notification. Returns booking or None."""
    n = utc_now()
    try:
        result = await mcp.call_tool("captura.bookings.admin.approve", {"booking_id": booking_id})
        log.info(f"APPROVE {booking_id} via MCP: {result}")
        invalidate_cache("pending")
    except Exception as e:
        log.warning(f"MCP approve failed for {booking_id}: {e} — using direct DB")
        await supabase_patch("bookings", {
            "booking_status": "confirmed",
            "status": "confirmed",
            "approved_at": n,
            "updated_at": n,
        }, {"id": booking_id})

    booking = await get_booking(booking_id)
    if booking:
        customer = booking.get("customer") or {}
        phone = customer.get("whatsapp") or customer.get("phone", "")
        if phone:
            camera = camera_display(booking)
            await send_whatsapp(phone, (
                f"🎥 *CAPTURA* — Booking Confirmed ✅\n"
                f"📸 {camera}\n"
                f"📅 {booking['start_date']} → {booking['end_date']}\n"
                f"💰 Total: RM{booking['total_amount']}"
            ))
    return booking

async def reject_booking(booking_id: str) -> Optional[dict]:
    n = utc_now()
    try:
        await mcp.call_tool("captura.bookings.admin.reject", {"booking_id": booking_id})
    except Exception:
        await supabase_patch("bookings", {
            "booking_status": "rejected",
            "status": "cancelled",
            "rejection_reason": "Rejected via bot",
            "updated_at": n,
        }, {"id": booking_id})
    log.info(f"REJECT {booking_id}")
    invalidate_cache("pending")
    return await get_booking(booking_id)


async def mark_picked_up(booking_id: str) -> Optional[dict]:
    booking = await get_booking(booking_id)
    if booking:
        current = booking.get("booking_status", booking.get("status", ""))
        if current not in ("confirmed", "pending_approval"):
            log.warning(f"PICKUP rejected: {booking_id} is {current}, not confirmed")
            return None
    n = utc_now()
    try:
        await mcp.call_tool("captura.bookings.admin.mark_pickup", {"booking_id": booking_id})
    except Exception:
        await supabase_patch("bookings", {
            "equipment_picked_up": True,
            "equipment_pickup_date": n,
            "status": "active",
            "updated_at": n,
        }, {"id": booking_id})
    log.info(f"PICKUP {booking_id}")
    invalidate_cache("all")

    # Send WhatsApp pickup confirmation
    if booking:
        cust = booking.get("customer") or {}
        phone = cust.get("whatsapp") or cust.get("phone", "")
        if phone:
            await send_whatsapp(phone,
                f"📦 *CAPTURA* — Equipment Picked Up\n\n"
                f"📸 {camera_display(booking)}\n"
                f"📅 {booking['start_date']} → {booking['end_date']}\n"
                f"📍 Pickup: {booking.get('pickup_method', 'pickup')}\n\n"
                f"_Please return by {booking['end_date']}._"
            )
    return await get_booking(booking_id)


async def mark_returned(booking_id: str) -> Optional[dict]:
    booking = await get_booking(booking_id)
    if booking:
        current = booking.get("booking_status", booking.get("status", ""))
        if current not in ("confirmed", "active"):
            log.warning(f"RETURN rejected: {booking_id} is {current}, not confirmed/active")
            return None
    n = utc_now()
    try:
        await mcp.call_tool("captura.bookings.admin.mark_return", {"booking_id": booking_id})
    except Exception:
        await supabase_patch("bookings", {
            "equipment_returned": True,
            "equipment_return_date": n,
            "booking_status": "completed",
            "status": "completed",
            "updated_at": n,
        }, {"id": booking_id})
    log.info(f"RETURN {booking_id}")
    invalidate_cache("all")

    # Send WhatsApp return confirmation
    if booking:
        cust = booking.get("customer") or {}
        phone = cust.get("whatsapp") or cust.get("phone", "")
        if phone:
            await send_whatsapp(phone,
                f"🔙 *CAPTURA* — Equipment Returned\n\n"
                f"📸 {camera_display(booking)}\n"
                f"📅 {booking['start_date']} → {booking['end_date']}\n"
                f"💰 Total: RM{booking['total_amount']}\n\n"
                f"_Thank you for renting with CAPTURA!_"
            )
    return await get_booking(booking_id)


async def mark_completed(booking_id: str) -> Optional[dict]:
    """One-tap complete: pickup + return + deposit refund in one call."""
    booking = await get_booking(booking_id)
    if not booking:
        return None
    status = booking.get("booking_status", booking.get("status", ""))
    n = utc_now()
    # If still confirmed, mark picked up first
    if status == "confirmed":
        try:
            await mcp.call_tool("captura.bookings.admin.mark_pickup", {"booking_id": booking_id})
        except Exception:
            await supabase_patch("bookings", {
                "equipment_picked_up": True, "equipment_pickup_date": n,
                "status": "active", "updated_at": n,
            }, {"id": booking_id})
    # Now mark returned
    try:
        await mcp.call_tool("captura.bookings.admin.complete", {"booking_id": booking_id})
    except Exception:
        await supabase_patch("bookings", {
            "equipment_returned": True, "equipment_return_date": n,
            "booking_status": "completed", "status": "completed",
            "deposit_paid": False, "deposit_paid_date": n,
            "updated_at": n,
        }, {"id": booking_id})
    log.info(f"COMPLETE {booking_id}")
    invalidate_cache("all")
    return await get_booking(booking_id)


async def cancel_booking(booking_id: str) -> Optional[dict]:
    n = utc_now()
    try:
        await mcp.call_tool("captura.bookings.admin.cancel", {"booking_id": booking_id})
    except Exception:
        await supabase_patch("bookings", {
            "booking_status": "cancelled",
            "status": "cancelled",
            "updated_at": n,
        }, {"id": booking_id})
    log.info(f"CANCEL {booking_id}")
    invalidate_cache("all")
    return await get_booking(booking_id)


# ── Inline Keyboard Builders ───────────────────────────
def make_main_menu(stats: Optional[dict] = None) -> InlineKeyboardMarkup:
    pending_label = "📋 Pending"
    overdue_label = "⚠️ Overdue"
    if stats:
        if stats.get("pending"):
            pending_label += f" ({stats['pending']})"
        if stats.get("overdue"):
            overdue_label += f" ({stats['overdue']})"

    return InlineKeyboardMarkup([
        [InlineKeyboardButton(pending_label, callback_data="pending"),
         InlineKeyboardButton(overdue_label, callback_data="overdue")],
        [InlineKeyboardButton("📦 Pickups (3d)", callback_data="pickups"),
         InlineKeyboardButton("🔙 Returns (3d)", callback_data="returns")],
        [InlineKeyboardButton("📸 Active Rentals", callback_data="active"),
         InlineKeyboardButton("🕐 Recent 5", callback_data="recent")],
        [InlineKeyboardButton("🔍 Search Customer", callback_data="search_prompt")],
        [InlineKeyboardButton("📊 Dashboard", callback_data="dashboard"),
         InlineKeyboardButton("📈 Analytics", callback_data="analytics")],
        [InlineKeyboardButton("🔄 Refresh", callback_data="home")],
    ])

def make_back_row(back_cb: str = "menu") -> list:
    return [InlineKeyboardButton("◀ Back", callback_data=back_cb),
            InlineKeyboardButton("🏠 Home", callback_data="home")]

def make_booking_actions(booking: dict, back_cb: str = "menu") -> InlineKeyboardMarkup:
    bid = booking["id"]
    status = booking.get("booking_status", "")
    customer = booking.get("customer") or {}
    phone = customer.get("whatsapp") or customer.get("phone", "")
    cust_id = customer.get("id", "")
    buttons = []

    if status == "pending_approval":
        buttons.append([
            InlineKeyboardButton("✅ Approve", callback_data=f"ap:{bid}"),
            InlineKeyboardButton("❌ Reject", callback_data=f"confirm_rj:{bid}"),
        ])
    elif status == "confirmed":
        buttons.append([InlineKeyboardButton("📦 Mark Picked Up", callback_data=f"pu:{bid}")])
        buttons.append([InlineKeyboardButton("⚡ Mark Completed", callback_data=f"complete:{bid}")])
    elif status == "active":
        buttons.append([InlineKeyboardButton("🔙 Mark Returned", callback_data=f"rt:{bid}")])
        buttons.append([InlineKeyboardButton("⚡ Mark Completed", callback_data=f"complete:{bid}")])

    if cust_id:
        buttons.append([InlineKeyboardButton("📋 Customer History", callback_data=f"ch:{cust_id}")])
    if phone:
        buttons.append([InlineKeyboardButton("💬 WhatsApp", url=whatsapp_link(phone))])

    buttons.append([InlineKeyboardButton("🔄 Refresh", callback_data=f"dt:{bid}")])
    buttons.append(make_back_row(back_cb))
    return InlineKeyboardMarkup(buttons)

def make_confirm_keyboard(action: str, target_id: str, label: str = "", back_cb: str = "menu") -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton(f"⚠️ Yes, {label}", callback_data=f"do_{action}:{target_id}")],
        [InlineKeyboardButton("❌ Cancel", callback_data=back_cb)],
    ])

def make_numbered_customer_keyboard(customers: list, chat_id: int) -> InlineKeyboardMarkup:
    _search_sessions[chat_id] = customers
    buttons = []
    row = []
    for i, cust in enumerate(customers):
        label = f"{i + 1}"
        row.append(InlineKeyboardButton(label, callback_data=f"cust_pick:{i}"))
        if len(row) == 5:
            buttons.append(row)
            row = []
    if row:
        buttons.append(row)
    buttons.append([InlineKeyboardButton("❌ Cancel", callback_data="menu")])
    return InlineKeyboardMarkup(buttons)

def make_numbered_booking_keyboard(bookings: list, extra_rows: list = None, back_cb: str = "menu") -> InlineKeyboardMarkup:
    buttons = []
    row = []
    for i, booking in enumerate(bookings):
        row.append(InlineKeyboardButton(str(i + 1), callback_data=f"dt:{booking['id']}"))
        if len(row) == 5:
            buttons.append(row)
            row = []
    if row:
        buttons.append(row)
    if extra_rows:
        for extra_row in extra_rows:
            buttons.append(extra_row)
    buttons.append(make_back_row(back_cb))
    return InlineKeyboardMarkup(buttons)


async def render_numbered_booking_list(
    update: Update, bookings: list, title: str, view_key: str,
    extra_rows: list = None, back_cb: str = "menu",
) -> None:
    """Render a numbered booking list with corresponding numbered keyboard buttons."""
    # Ensure camera cache is populated so names display correctly
    if not _camera_cache:
        await fetch_cameras()

    chat_id = (
        update.callback_query.message.chat_id if update.callback_query
        else update.message.chat_id if update.message
        else 0
    )
    _search_sessions[f"{view_key}:{chat_id}"] = bookings

    if not bookings:
        empty_msgs = {
            "pending": "✨ *Queue empty, boss.* ☕",
            "active": "✨ *No active rentals.* 📸",
            "overdue": "✨ *Nothing overdue!* 🎉",
            "pickups": "📦 No pickups in next 3 days.",
            "returns": "🔙 No returns in next 3 days.",
        }
        await reply_text(update, empty_msgs.get(view_key, "✨ Nothing here."),
                         reply_markup=make_main_menu())
        return

    lines = [title, ""]
    for i, b in enumerate(bookings):
        icon = status_icon(b.get("booking_status", b.get("status", "")))
        extra = ""
        if view_key == "pickups":
            extra = f" | Pickup {b.get('pickup_date', '?')}"
        elif view_key == "returns":
            extra = f" | End {b.get('end_date', '?')}"
        elif view_key == "overdue":
            extra = f" | End {b['end_date']}"
        lines.append(f"{i + 1}. {icon} {customer_display(b)} — {camera_display(b)}{extra}")

    total_amount = sum(float(b.get("total_amount", 0)) for b in bookings)
    lines.append("")
    lines.append(f"💰 *{format_currency(total_amount)}* total across {len(bookings)} booking(s)")
    text = "\n".join(lines)

    kb = make_numbered_booking_keyboard(bookings, extra_rows, back_cb)
    await reply_text(update, text, reply_markup=kb)


# ── Home / Start ───────────────────────────────────────
async def show_home(update: Update, app=None) -> None:
    """Render the polished home screen with live KPIs in a card layout."""
    try:
        stats = await gather_stats()
    except Exception:
        stats = {}

    try:
        overdue = await get_overdue_bookings(use_cache=False)
        stats["overdue"] = len(overdue)
    except Exception:
        stats["overdue"] = 0

    caption = (
        "*📸 C A P T U R A*\n"
        "  _Camera Rental · Studio_\n"
        "━━━━━━━━━━━━━━━━━━━━━━━\n\n"
        "📊 *Today at a Glance*\n\n"
        f"⏳ `{stats.get('pending', 0):>3}` Pending   ⚠️ `{stats.get('overdue', 0):>3}` Overdue\n"
        f"📦 `{stats.get('pickups', 0):>3}` Pickups   🔙 `{stats.get('returns', 0):>3}` Returns\n"
        f"📸 `{stats.get('active', 0):>3}` Active    🏁 `{stats.get('completed', 0):>3}` Done\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"💰 Today:  *{format_currency(stats.get('revenue_today', 0))}*\n"
        f"📅 Month:  *{format_currency(stats.get('revenue_month', 0))}*\n\n"
        "_v3.1 · MCP · Owner_"
    )
    kb = make_main_menu(stats)
    await reply_text(update, caption, reply_markup=kb)


# ── View Renderers ─────────────────────────────────────
async def show_pending(update: Update) -> None:
    bookings = await get_pending_bookings(use_cache=False)
    extra = [[InlineKeyboardButton("⚡ Approve All", callback_data="confirm_apall")]]
    await render_numbered_booking_list(
        update, bookings,
        f"📋 *{len(bookings)} Pending* — tap number for detail:",
        "pending", extra_rows=extra, back_cb="menu",
    )

async def show_booking_detail(update: Update, booking_id: str, back_cb: str = "menu") -> None:
    booking = await get_booking(booking_id)
    if not booking:
        await reply_text(update, "❌ Booking not found.", reply_markup=make_main_menu())
        return
    cust = booking.get("customer") or {}
    status = booking.get("booking_status", "?")
    text = (
        f"📷 *Booking Detail*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"👤 *{customer_display(booking)}*\n"
        f"📸 {camera_display(booking)}\n"
        f"📅 {booking['start_date']} → {booking['end_date']} · {booking.get('total_days', '?')}d\n"
        f"💰 Total: RM{booking['total_amount']} | Deposit: RM{booking.get('deposit_amount', 0)}\n"
        f"💳 Paid: {'✅' if booking.get('deposit_paid') else '❌'} "
        f"Deposit | {'✅' if booking.get('final_payment_paid') else '❌'} Final\n"
        f"📌 {status_icon(status)} {status_label(status)}\n"
        f"📍 {booking.get('pickup_method', '?')}"
        f"{' · ' + booking.get('pickup_address', '') if booking.get('pickup_address') else ''}\n"
        f"📧 {cust.get('email', '?')} | 📱 {cust.get('phone', '?')}"
    )
    kb = make_booking_actions(booking, back_cb)
    await reply_text(update, text, reply_markup=kb)

async def show_overdue(update: Update) -> None:
    bookings = await get_overdue_bookings(use_cache=False)
    await render_numbered_booking_list(
        update, bookings,
        f"⚠️ *{len(bookings)} Overdue* — tap number for detail:",
        "overdue", back_cb="menu",
    )

async def show_active(update: Update) -> None:
    bookings = await get_active_bookings()
    await render_numbered_booking_list(
        update, bookings,
        f"📸 *{len(bookings)} Active* — tap number for detail:",
        "active", back_cb="menu",
    )

async def show_recent(update: Update) -> None:
    if not _camera_cache:
        await fetch_cameras()
    bookings = await get_recent_bookings(5)
    lines = ["🕐 *Recent 5*", ""]
    for b in bookings:
        lines.append(format_booking_line(b))
    await reply_text(update, "\n".join(lines), reply_markup=make_main_menu())

async def show_pickups(update: Update) -> None:
    bookings = await get_pickups_window(3)
    extra = [[InlineKeyboardButton("⚡ Mark All Picked Up", callback_data="confirm_pvall")]]
    await render_numbered_booking_list(
        update, bookings,
        f"📦 *Pickups ({len(bookings)})* — next 3 days:",
        "pickups", extra_rows=extra, back_cb="menu",
    )

async def show_returns(update: Update) -> None:
    bookings = await get_returns_window(3)
    extra = [[InlineKeyboardButton("⚡ Mark All Returned", callback_data="confirm_rvall")]]
    await render_numbered_booking_list(
        update, bookings,
        f"🔙 *Returns ({len(bookings)})* — next 3 days:",
        "returns", extra_rows=extra, back_cb="menu",
    )

async def show_dashboard(update: Update) -> None:
    try:
        stats = await gather_stats()
        overdue = await get_overdue_bookings()
        text = (
            "📊 *Dashboard*\n"
            "━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            f"⏳ Pending: *{stats['pending']}*\n"
            f"⚠️ Overdue: *{len(overdue)}*\n"
            f"📦 Pickups: *{stats['pickups']}*\n"
            f"🔙 Returns: *{stats['returns']}*\n"
            f"📸 Active: *{stats['active']}*\n"
            f"🏁 Completed: *{stats['completed']}*\n\n"
            "━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"💰 Today: *{format_currency(stats['revenue_today'])}*\n"
            f"📅 Month: *{format_currency(stats['revenue_month'])}*"
        )
    except Exception as e:
        text = f"⚠️ Failed to load dashboard: {e}"
    await reply_text(update, text, reply_markup=make_main_menu())

async def show_analytics(update: Update) -> None:
    try:
        stats = await gather_stats()
        # All-time from direct DB
        try:
            comp = await supabase_get("bookings", {"select": "id", "booking_status": "eq.completed", "limit": "500"})
            all_completed = len(comp)
            rev_all = await supabase_get("bookings", {
                "select": "total_amount",
                "or": "(booking_status.eq.completed,booking_status.eq.active)",
                "limit": "500",
            })
            all_revenue = sum(b.get("total_amount", 0) for b in rev_all)
        except Exception:
            all_completed = 0
            all_revenue = 0

        text = (
            "📈 *Analytics*\n"
            "━━━━━━━━━━━━━━━━━━━━\n\n"
            "*Today*\n"
            f"  💰 Revenue:  *{format_currency(stats['revenue_today'])}*\n"
            f"  🆕 New:      *{stats['new_today']}* bookings\n\n"
            "*This Month*\n"
            f"  💰 Revenue:  *{format_currency(stats['revenue_month'])}*\n"
            f"  🆕 New:      *{stats['new_month']}* bookings\n\n"
            "*All-Time*\n"
            f"  💰 Revenue:  *{format_currency(all_revenue)}*\n"
            f"  🏁 Completed: *{all_completed}* bookings\n"
            f"  📸 Active:    *{stats['active']}*\n\n"
            "━━━━━━━━━━━━━━━━━━━━━━\n"
            "_v3.1 · MCP · Owner_"
        )
    except Exception as e:
        text = f"⚠️ Failed to load analytics: {e}"
    await reply_text(update, text, reply_markup=make_main_menu())

async def show_search_prompt(update: Update) -> None:
    text = (
        "🔍 *Search Customers*\n\n"
        "Type a name, email, or phone number to find customers.\n\n"
        "_Examples:_\n"
        "`search ali`\n"
        "`search @gmail`\n"
        "`search 0123`"
    )
    await reply_text(update, text, reply_markup=InlineKeyboardMarkup([make_back_row()]))

async def show_customer_search_results(update: Update, query: str) -> None:
    customers = await search_customers(query, limit=10)
    if not customers:
        await reply_text(update, f"🔍 No customers found for *'{query}'*.",
                         reply_markup=make_main_menu())
        return

    lines = [f"🔍 *Found {len(customers)} customer(s)* for '{query}':", ""]
    for i, cust in enumerate(customers):
        phone = cust.get("phone", "") or "—"
        email = cust.get("email", "") or "—"
        lines.append(f"{i + 1}. *{cust.get('full_name', 'Unknown')}* — {phone} | {email}")

    text = "\n".join(lines)
    chat_id = update.callback_query.message.chat_id if update.callback_query else update.message.chat_id
    kb = make_numbered_customer_keyboard(customers, chat_id)
    await reply_text(update, text, reply_markup=kb)

async def show_customer_detail(update: Update, customer: dict) -> None:
    cust_id = customer["id"]
    cust_name = customer.get("full_name", "Unknown")
    phone = customer.get("phone", "—")
    email = customer.get("email", "—")

    bookings = await get_customer_bookings(cust_id, limit=15)
    lines = [
        f"👤 *{cust_name}*",
        f"📧 {email} | 📱 {phone}",
        "",
    ]
    if not bookings:
        lines.append("_No bookings found._")
    else:
        lines.append(f"*Bookings ({len(bookings)}):*")
        for i, b in enumerate(bookings):
            icon = status_icon(b.get("booking_status", ""))
            lines.append(f"{i + 1}. {icon} {b['start_date']} · RM{b['total_amount']} [{status_label(b.get('booking_status',''))}]")

    text = "\n".join(lines)
    kb = make_numbered_booking_keyboard(bookings)
    await reply_text(update, text, reply_markup=kb)


# ── Callback Handler ───────────────────────────────────
async def on_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    if not query:
        return
    await query.answer()
    data = query.data or ""
    log.info(f"CALLBACK: {data}")

    try:
        # ── Home ──
        if data == "home":
            await show_home(update)

        # ── Pending ──
        elif data == "pending":
            await show_pending(update)

        # ── Single approve ──
        elif data.startswith("ap:"):
            booking_id = data.split(":", 1)[1]
            booking = await approve_booking(booking_id)
            if booking:
                text = f"✅ *Approved!* {customer_display(booking)} · {camera_display(booking)}\n📅 {booking['start_date']} · RM{booking['total_amount']}"
                kb = InlineKeyboardMarkup([
                    [InlineKeyboardButton("📦 Mark Picked Up", callback_data=f"pu:{booking_id}")],
                    make_back_row("pending"),
                ])
                await reply_text(update, text, reply_markup=kb)
            else:
                await reply_text(update, "❌ Booking not found.", reply_markup=make_main_menu())

        # ── Confirm reject ──
        elif data.startswith("confirm_rj:"):
            booking_id = data.split(":", 1)[1]
            kb = make_confirm_keyboard("rj", booking_id, "Reject", "pending")
            await reply_text(update, f"⚠️ *Reject this booking?*\nThis cannot be easily undone.", reply_markup=kb)

        # ── Confirm approve all ──
        elif data == "confirm_apall":
            pending = await get_pending_bookings(use_cache=False)
            if not pending:
                await reply_text(update, "✨ Nothing to approve.", reply_markup=make_main_menu())
                return
            kb = make_confirm_keyboard("apall", str(len(pending)), f"Approve All ({len(pending)})", "pending")
            await reply_text(update, f"⚠️ *Approve ALL {len(pending)} pending bookings?*", reply_markup=kb)

        # ── Confirm pickup all ──
        elif data == "confirm_pvall":
            pickups = await get_pickups_window(3)
            if not pickups:
                await reply_text(update, "✨ No pickups to mark.", reply_markup=make_main_menu())
                return
            kb = make_confirm_keyboard("pvall", str(len(pickups)), f"Mark All Picked Up ({len(pickups)})", "pickups")
            await reply_text(update, f"⚠️ *Mark ALL {len(pickups)} as picked up?*", reply_markup=kb)

        # ── Confirm return all ──
        elif data == "confirm_rvall":
            returns = await get_returns_window(3)
            if not returns:
                await reply_text(update, "✨ No returns to mark.", reply_markup=make_main_menu())
                return
            kb = make_confirm_keyboard("rvall", str(len(returns)), f"Mark All Returned ({len(returns)})", "returns")
            await reply_text(update, f"⚠️ *Mark ALL {len(returns)} as returned?*", reply_markup=kb)

        # ── Execute confirmed actions ──
        elif data.startswith("do_rj:"):
            booking_id = data.split(":", 1)[1]
            booking = await reject_booking(booking_id)
            name = customer_display(booking) if booking else booking_id
            await reply_text(update, f"❌ Rejected: {name}", reply_markup=make_main_menu())

        elif data.startswith("do_apall:"):
            pending = await get_pending_bookings(use_cache=False)
            count = 0
            for b in pending:
                try:
                    await approve_booking(b["id"])
                    count += 1
                except Exception as e:
                    log.error(f"apall failed for {b['id']}: {e}")
            await reply_text(update, f"⚡ *{count}/{len(pending)} approved!*", reply_markup=make_main_menu())

        elif data.startswith("do_pvall:"):
            bookings = await get_pickups_window(3)
            count = 0
            for b in bookings:
                try:
                    await mark_picked_up(b["id"])
                    count += 1
                except Exception as e:
                    log.error(f"pvall failed for {b['id']}: {e}")
            await reply_text(update, f"⚡ *{count}/{len(bookings)} picked up!*", reply_markup=make_main_menu())

        elif data.startswith("do_rvall:"):
            bookings = await get_returns_window(3)
            count = 0
            for b in bookings:
                try:
                    await mark_returned(b["id"])
                    count += 1
                except Exception as e:
                    log.error(f"rvall failed for {b['id']}: {e}")
            await reply_text(update, f"⚡ *{count}/{len(bookings)} returned!*", reply_markup=make_main_menu())

        # ── Booking detail ──
        elif data.startswith("dt:"):
            booking_id = data.split(":", 1)[1]
            await show_booking_detail(update, booking_id)

        # ── Overdue detail ──
        elif data.startswith("od:"):
            booking_id = data.split(":", 1)[1]
            await show_booking_detail(update, booking_id, back_cb="overdue")

        # ── Mark picked up ──
        elif data.startswith("pu:"):
            booking_id = data.split(":", 1)[1]
            booking = await mark_picked_up(booking_id)
            if booking:
                name = customer_display(booking)
                kb = InlineKeyboardMarkup([
                    [InlineKeyboardButton("🔙 Mark Returned", callback_data=f"rt:{booking_id}")],
                    make_back_row("active"),
                ])
                await reply_text(update, f"📦 Picked up: {name}", reply_markup=kb)
            else:
                await reply_text(update, "⚠️ Cannot pick up — invalid state.", reply_markup=make_main_menu())

        # ── Mark completed (one-tap pickup+return+refund) ──
        elif data.startswith("complete:"):
            booking_id = data.split(":", 1)[1]
            booking = await mark_completed(booking_id)
            if booking:
                await reply_text(update, f"⚡ Completed: {customer_display(booking)} — {camera_display(booking)}", reply_markup=make_main_menu())
            else:
                await reply_text(update, "⚠️ Cannot complete — booking not found.", reply_markup=make_main_menu())

        # ── Mark returned ──
        elif data.startswith("rt:"):
            booking_id = data.split(":", 1)[1]
            booking = await mark_returned(booking_id)
            if booking:
                await reply_text(update, f"🔙 Returned: {customer_display(booking)}", reply_markup=make_main_menu())
            else:
                await reply_text(update, "⚠️ Cannot mark returned — invalid state.", reply_markup=make_main_menu())

        # ── Complete overdue ──
        elif data.startswith("cmp:"):
            booking_id = data.split(":", 1)[1]
            booking = await mark_returned(booking_id)
            kb = InlineKeyboardMarkup([make_back_row("overdue")])
            if booking:
                await reply_text(update, f"⚡ Completed: {customer_display(booking)}", reply_markup=kb)
            else:
                await reply_text(update, "⚠️ Cannot complete — invalid state.", reply_markup=kb)

        # ── Customer history ──
        elif data.startswith("ch:"):
            cust_id = data.split(":", 1)[1]
            try:
                rows = await supabase_get(f"customers?id=eq.{cust_id}&select=id,full_name,email,phone")
                customer = rows[0] if rows else {"id": cust_id, "full_name": "Unknown"}
            except Exception:
                customer = {"id": cust_id, "full_name": "Unknown"}
            await show_customer_detail(update, customer)

        # ── Numbered customer selection ──
        elif data.startswith("cust_pick:"):
            index = int(data.split(":", 1)[1])
            chat_id = query.message.chat_id if query.message else 0
            customers = _search_sessions.get(chat_id, [])
            if 0 <= index < len(customers):
                await show_customer_detail(update, customers[index])
            else:
                await reply_text(update, "❌ Invalid selection.", reply_markup=make_main_menu())

        # ── Search prompt ──
        elif data == "search_prompt":
            await show_search_prompt(update)

        # ── Views ──
        elif data == "overdue":
            await show_overdue(update)
        elif data == "active":
            await show_active(update)
        elif data == "recent":
            await show_recent(update)
        elif data == "pickups":
            await show_pickups(update)
        elif data == "returns":
            await show_returns(update)
        elif data == "dashboard":
            await show_dashboard(update)
        elif data == "analytics":
            await show_analytics(update)
        elif data == "menu":
            await reply_text(update, "📸 *Command Center*", reply_markup=make_main_menu())
        elif data == "help":
            await show_help(update)

    except Exception as e:
        log.exception(f"Callback error: {data}")
        try:
            await reply_text(update, f"💥 Error: {e}", reply_markup=make_main_menu())
        except Exception:
            pass


# ── Command Handlers ───────────────────────────────────
async def show_help(update: Update) -> None:
    text = (
        "📸 *CAPTURA Bot v3.1*\n"
        "━━━━━━━━━━━━━━━━━━━━━━━\n\n"
        "*Quick Commands*\n"
        "📋 `/pending` — review & approve bookings\n"
        "⚠️ `/overdue` — bookings past end date\n"
        "📸 `/active` — currently rented out\n"
        "📦 `/pickups` — upcoming pickups (3d)\n"
        "🔙 `/returns` — upcoming returns (3d)\n"
        "🕐 `/recent` — last 5 bookings\n\n"
        "*Analytics*\n"
        "📊 `/dashboard` — live KPIs\n"
        "📈 `/analytics` — all-time & monthly stats\n"
        "🌅 `/brief` — morning brief on demand\n\n"
        "*Actions*\n"
        "🔍 `/search <name>` — find customers\n"
        "✅ `/approve <name>` / ❌ `/reject <name>`\n"
        "📦 `/pickup <name>` / 🔙 `/return <name>`\n"
        "🚫 `/cancel <name>`\n\n"
        "_MCP-connected · Owner-only_"
    )
    await reply_text(update, text, reply_markup=make_main_menu())

async def cmd_active(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_owner(update):
        return
    await show_active(update)

async def cmd_overdue(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_owner(update):
        return
    await show_overdue(update)

async def cmd_pickups(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_owner(update):
        return
    await show_pickups(update)

async def cmd_returns(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_owner(update):
        return
    await show_returns(update)

async def cmd_analytics(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_owner(update):
        return
    await show_analytics(update)

async def cmd_brief(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """On-demand morning brief."""
    if not is_owner(update):
        return
    await reply_text(update, "🌅 *Generating brief...*")
    await send_morning_brief(context.application, OWNER or update.message.chat_id)

async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    log.info(f"START from chat_id={update.message.chat_id if update.message else '?'}")
    if not is_owner(update):
        return
    if update.message:
        try:
            with open(CHAT_FILE, "w") as f:
                f.write(str(update.message.chat_id))
        except Exception:
            pass
    await show_home(update, context.application)

async def cmd_help(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_owner(update):
        return
    await show_help(update)

async def cmd_pending(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_owner(update):
        return
    await show_pending(update)

async def cmd_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_owner(update):
        return
    await reply_text(update, "📸 *Command Center*", reply_markup=make_main_menu())

async def cmd_dashboard(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_owner(update):
        return
    await show_dashboard(update)

async def cmd_recent(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_owner(update):
        return
    await show_recent(update)


# ── Text Message Handler ───────────────────────────────
def is_owner(update: Update) -> bool:
    if not OWNER:
        return True
    chat_id = None
    if update.message:
        chat_id = update.message.chat_id
    elif update.callback_query and update.callback_query.message:
        chat_id = update.callback_query.message.chat_id
    ok = str(chat_id) == str(OWNER)
    if not ok:
        log.warning(f"BLOCKED non-owner chat_id={chat_id}")
    return ok

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_owner(update):
        return
    if not update.message or not update.message.text:
        return

    text = update.message.text.strip().lower()
    parts = text.split()
    command = parts[0] if parts else ""

    try:
        if command == "pending":
            await show_pending(update)

        elif command == "menu":
            await reply_text(update, "📸 *Command Center*", reply_markup=make_main_menu())

        elif command == "search" and len(parts) >= 2:
            query = " ".join(parts[1:])
            await show_customer_search_results(update, query)

        elif command == "recent":
            await show_recent(update)

        elif command in ("dashboard", "stats"):
            await show_dashboard(update)

        elif command == "check" and len(parts) >= 2:
            query = " ".join(parts[1:])
            camera = await find_camera(query)
            if not camera:
                await reply_text(update, f"❌ Camera '{query}' not found. Try: r50, action, fuji")
                return
            try:
                result = await mcp.call_tool("captura.cameras.check_availability", {
                    "camera_id": camera["id"],
                    "start_date": date_today(),
                    "end_date": date_today(),
                })
                if result.get("available"):
                    await reply_text(update, f"🔍 *{camera['name']}* — RM{camera['daily_rate']}/day\n\n✅ Available!")
                else:
                    conflicts = result.get("conflicts", [])
                    ds = [f"{c['start_date']}→{c['end_date']}" for c in conflicts]
                    await reply_text(update, f"🔍 *{camera['name']}* — RM{camera['daily_rate']}/day\n\n❌ Booked:\n" + "\n".join(f"• {x}" for x in ds))
            except Exception as e:
                await reply_text(update, f"⚠️ {e}")

        elif command in ("approve", "reject", "pickup", "return", "cancel"):
            if len(parts) < 2:
                await reply_text(update, f"Usage: `{command} <customer name>`")
                return
            query = " ".join(parts[1:])
            bookings = await search_bookings(query, limit=5)
            if not bookings:
                await reply_text(update, f"❌ No bookings found for '{query}'")
                return
            if len(bookings) > 1:
                lines = ["Multiple matches:", ""]
                for b in bookings:
                    lines.append(f"• {customer_display(b)} — {b['start_date']} [{b['id'][:8]}]")
                await reply_text(update, "\n".join(lines) + "\n\n_Please be more specific._")
                return

            booking = bookings[0]
            if command == "approve":
                await approve_booking(booking["id"])
                await reply_text(update, f"✅ Approved: {customer_display(booking)} — RM{booking['total_amount']}")
            elif command == "reject":
                await reject_booking(booking["id"])
                await reply_text(update, f"❌ Rejected: {customer_display(booking)}")
            elif command == "pickup":
                await mark_picked_up(booking["id"])
                await reply_text(update, f"📦 Picked up: {customer_display(booking)}")
            elif command == "return":
                await mark_returned(booking["id"])
                await reply_text(update, f"🔙 Returned: {customer_display(booking)}")
            elif command == "cancel":
                await cancel_booking(booking["id"])
                await reply_text(update, f"🚫 Cancelled: {customer_display(booking)}")

        elif command == "overdue":
            await show_overdue(update)

        elif command == "active":
            await show_active(update)

        elif command == "pickups":
            await show_pickups(update)

        elif command == "returns":
            await show_returns(update)

        elif command == "brief":
            await reply_text(update, "🌅 *Generating brief...*")
            await send_morning_brief(context.application, OWNER or update.message.chat_id)

        elif command == "analytics":
            await show_analytics(update)

        else:
            await reply_text(update, "Type `menu` for options.", reply_markup=make_main_menu())

    except Exception as e:
        log.exception(f"Message handler error: {text}")
        await reply_text(update, f"💥 {e}")


# ── Push Alerts (Morning Brief) ────────────────────────
class AlertTracker:
    def __init__(self):
        self.seen_ids: set = set()
        self.brief_sent_today = False
        self._seeded = False

    async def seed_existing(self):
        """Seed seen_ids with currently pending booking IDs so restart doesn't re-alert."""
        if self._seeded:
            return
        try:
            pending = await get_pending_bookings(use_cache=False)
            for b in pending:
                self.seen_ids.add(b["id"])
            log.info(f"AlertTracker seeded with {len(pending)} existing pending bookings")
        except Exception as e:
            log.warning(f"AlertTracker seed failed: {e}")
        self._seeded = True

    def filter_new(self, bookings: list) -> list:
        new = []
        for b in bookings:
            if b["id"] not in self.seen_ids:
                new.append(b)
                self.seen_ids.add(b["id"])
        return new

    def should_send_morning_brief(self) -> bool:
        now = datetime.now()
        if 8 <= now.hour <= 10 and not self.brief_sent_today:
            return True
        if now.hour > 10:
            self.brief_sent_today = False
        return False

    def mark_brief_sent(self):
        self.brief_sent_today = True


alert_tracker = AlertTracker()


async def send_morning_brief(app, chat_id: int):
    """Generate and send the morning brief to a specific chat."""
    today_str = date_today()
    tomorrow_str = date_tomorrow()

    pickups, returns, active, overdue, pending_list = await asyncio.gather(
        get_pickups_window(3),
        get_returns_window(3),
        get_active_bookings(),
        get_overdue_bookings(use_cache=False),
        get_pending_bookings(use_cache=False),
    )

    try:
        dash = await mcp.call_tool("captura.admin.dashboard_summary", {"period": "month"})
        rev_month = dash.get("metrics", {}).get("total_revenue_rm", 0) if isinstance(dash, dict) else 0
    except Exception:
        rev_month = 0

    lines = ["🌅 *Good Morning, Boss!*", "", f"📅 *{today_str}*", ""]

    today_pu = [b for b in pickups if b.get("pickup_date") == today_str]
    tomorrow_pu = [b for b in pickups if b.get("pickup_date") == tomorrow_str]
    if today_pu or tomorrow_pu:
        if today_pu:
            lines.append(f"📦 *Pickups Today ({len(today_pu)})*")
            for b in today_pu:
                lines.append(f"  • {customer_display(b)} — {camera_display(b)} | {b.get('pickup_method', '?')}")
        if tomorrow_pu:
            lines.append(f"📦 *Pickups Tomorrow ({len(tomorrow_pu)})*")
            for b in tomorrow_pu:
                lines.append(f"  • {customer_display(b)} — {camera_display(b)} | {b.get('pickup_method', '?')}")
    else:
        lines.append("📦 *Pickups:* None")

    today_re = [b for b in returns if b.get("end_date") == today_str]
    tomorrow_re = [b for b in returns if b.get("end_date") == tomorrow_str]
    if today_re or tomorrow_re:
        if today_re:
            lines.append("")
            lines.append(f"🔙 *Returns Today ({len(today_re)})*")
            for b in today_re:
                lines.append(f"  • {customer_display(b)} — {camera_display(b)} | RM{b['total_amount']}")
        if tomorrow_re:
            lines.append("")
            lines.append(f"🔙 *Returns Tomorrow ({len(tomorrow_re)})*")
            for b in tomorrow_re:
                lines.append(f"  • {customer_display(b)} — {camera_display(b)} | RM{b['total_amount']}")
    else:
        lines.append("🔙 *Returns:* None")

    lines.extend([
        "",
        "━━━━━━━━━━━━━━━━━━━━━",
        f"📸 Active: *{len(active)}* | Pending: *{len(pending_list)}*",
        f"⚠️ Overdue: *{len(overdue)}* | 💰 Month: *{format_currency(rev_month)}*",
    ])

    # Build inline keyboard with quick actions
    kb_buttons = [
        [InlineKeyboardButton("📸 Active Rentals", callback_data="active"),
         InlineKeyboardButton("🔙 Returns", callback_data="returns")],
        [InlineKeyboardButton("📋 Pending", callback_data="pending"),
         InlineKeyboardButton("⚠️ Overdue", callback_data="overdue")],
        [InlineKeyboardButton("📊 Dashboard", callback_data="dashboard"),
         InlineKeyboardButton("🏠 Home", callback_data="home")],
    ]
    await send_direct(app, chat_id, "\n".join(lines),
                      reply_markup=InlineKeyboardMarkup(kb_buttons))


# ── Booking Lifecycle State Validation ────────────────
VALID_TRANSITIONS = {
    "pending_approval": ["confirmed", "rejected", "cancelled"],
    "confirmed": ["active", "completed", "cancelled"],
    "active": ["completed", "cancelled"],
}

def validate_transition(current_status: str, new_status: str) -> bool:
    """Check if a booking state transition is allowed."""
    if current_status not in VALID_TRANSITIONS:
        return True  # Allow unknown states through
    return new_status in VALID_TRANSITIONS.get(current_status, [])


async def poll_loop(application, owner_chat_id: int):
    # Seed with existing pending IDs to avoid false "new booking" alerts on restart
    await alert_tracker.seed_existing()
    while True:
        try:
            await asyncio.sleep(ALERT)
            pending = await get_pending_bookings(use_cache=False)
            new_bookings = alert_tracker.filter_new(pending)

            # Instant alert for each new booking
            for booking in new_bookings:
                cust = booking.get("customer") or {}
                await send_direct(application, owner_chat_id,
                    f"🔔 *New Booking!*\n\n"
                    f"👤 {customer_display(booking)}\n"
                    f"📸 {camera_display(booking)}\n"
                    f"📅 {booking['start_date']}→{booking['end_date']} · {booking.get('total_days', '?')}d\n"
                    f"💰 RM{booking['total_amount']}\n"
                    f"📱 {cust.get('phone', '?')}",
                    reply_markup=InlineKeyboardMarkup([[
                        InlineKeyboardButton("📋 Review", callback_data=f"dt:{booking['id']}"),
                        InlineKeyboardButton("✅ Approve", callback_data=f"ap:{booking['id']}"),
                    ]]),
                )

            # Morning brief at 8-10 AM
            if alert_tracker.should_send_morning_brief():
                await send_morning_brief(application, owner_chat_id)
                alert_tracker.mark_brief_sent()

        except Exception as e:
            log.exception(f"Poll error: {e}")
            await asyncio.sleep(10)


async def verify_schema() -> bool:
    """Check that expected columns exist on the bookings table."""
    try:
        row = await supabase_get("bookings?select=booking_status,status,pickup_date&limit=1")
        log.info("Schema OK: key columns verified")
        return True
    except Exception as e:
        log.error(f"Schema check: partial failure - {e}")
        return False


# ── Main ───────────────────────────────────────────────
def main():
    app = Application.builder().token(TOKEN).build()

    # Command handlers
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("help", cmd_help))
    app.add_handler(CommandHandler("pending", cmd_pending))
    app.add_handler(CommandHandler("menu", cmd_menu))
    app.add_handler(CommandHandler("dashboard", cmd_dashboard))
    app.add_handler(CommandHandler("recent", cmd_recent))
    app.add_handler(CommandHandler("active", cmd_active))
    app.add_handler(CommandHandler("overdue", cmd_overdue))
    app.add_handler(CommandHandler("pickups", cmd_pickups))
    app.add_handler(CommandHandler("returns", cmd_returns))
    app.add_handler(CommandHandler("analytics", cmd_analytics))
    app.add_handler(CommandHandler("brief", cmd_brief))

    # Callback + message handlers
    app.add_handler(CallbackQueryHandler(on_callback))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    # Schema verification on startup
    asyncio.get_event_loop().create_task(verify_schema())

    # Push alerts
    if OWNER:
        asyncio.get_event_loop().create_task(poll_loop(app, OWNER))
        log.info(f"Push alerts ON (every {ALERT}s → chat {OWNER})")
    else:
        log.warning("No OWNER set — push alerts disabled")

    log.info("CAPTURA Bot v3.1 (MCP + owner-gated + confirmation flows)")
    try:
        app.run_polling(drop_pending_updates=True)
    except Exception as e:
        log.exception(f"FATAL: {e}")
        raise
    finally:
        mcp.shutdown()


if __name__ == "__main__":
    main()
