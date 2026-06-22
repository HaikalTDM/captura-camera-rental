#!/usr/bin/env python3
"""
CAPTURA Camera Rental — Telegram Management Bot v3.1
MCP-wired · owner-gated · dynamic inline keyboards · confirmation flows
"""

import os, sys, asyncio, json, re, logging, subprocess
from datetime import datetime, timezone, timedelta
from typing import Optional, Any
from urllib.parse import quote
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
DAILY_MSG_FILE = os.path.join(BASE_DIR, ".daily_messages.json")

# ── Daily chat cleanup ──────────────────────────────────
def _load_daily_msgs() -> dict:
    try:
        with open(DAILY_MSG_FILE) as f:
            return json.load(f)
    except Exception:
        return {}

def _save_daily_msgs(data: dict):
    try:
        with open(DAILY_MSG_FILE, "w") as f:
            json.dump(data, f)
    except Exception:
        pass

async def _track_msg(chat_id: int, msg_id: int):
    today = date_today()
    data = _load_daily_msgs()
    key = str(chat_id)
    data.setdefault(key, {}).setdefault(today, []).append(msg_id)
    _save_daily_msgs(data)

async def cleanup_old_messages(app, chat_id: int):
    """Delete all bot-sent messages from previous days so chat starts clean."""
    today = date_today()
    data = _load_daily_msgs()
    key = str(chat_id)
    old_dates = [d for d in data.get(key, {}) if d < today]
    if not old_dates:
        return
    deleted = 0
    for d in old_dates:
        for mid in data[key].get(d, []):
            try:
                await app.bot.delete_message(chat_id, mid)
                deleted += 1
            except Exception:
                pass
    for d in old_dates:
        data.get(key, {}).pop(d, None)
    _save_daily_msgs(data)
    if deleted:
        log.info(f"Chat cleanup: deleted {deleted} messages from {old_dates}")

# Branding: Captura logo (1024x1024). Square asset works for both the bot's
# profile photo and photo-card banners on entry screens.
LOGO_PATH      = os.path.join(BASE_DIR, "..", "public", "images", "captura_logo_big.png")
LOGO_FALLBACK  = os.path.join(BASE_DIR, "..", "public", "icons", "icon-512x512.png")
# Cached Telegram file_id for the banner so we upload the bytes only once, then
# reuse the id for every subsequent photo card (faster, less bandwidth).
_logo_file_id: Optional[str] = None
_profile_photo_set = False

def banner_source() -> Optional[str]:
    """Resolve the banner image to display on entry cards.
    Priority: BOT_BANNER env (local path or http URL) -> bundled Captura logo.
    Returns a path/URL Telegram can accept, or None if nothing is available."""
    if BANNER:
        # Remote URL: Telegram fetches it directly.
        if BANNER.startswith("http://") or BANNER.startswith("https://"):
            return BANNER
        # Local path: absolute, or relative to the bot dir.
        if os.path.isabs(BANNER) and os.path.exists(BANNER):
            return BANNER
        rel = os.path.join(BASE_DIR, BANNER)
        if os.path.exists(rel):
            return rel
        log.warning(f"BOT_BANNER set but not found: {BANNER}; falling back to logo")
    for p in (LOGO_PATH, LOGO_FALLBACK):
        if os.path.exists(p):
            return p
    return None

# Backwards-compatible alias (profile photo uses the same source).
def logo_file() -> Optional[str]:
    return banner_source()

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
        env["NEXT_PUBLIC_SUPABASE_URL"] = SB_URL
        env["PATH"] = "/Users/admin/.local/bin:/usr/local/bin:" + env.get("PATH", "/usr/bin")
        log.info("Starting MCP subprocess: node %s", MCP_JS)
        self.process = await asyncio.create_subprocess_exec(
            "node", MCP_JS,
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            env=env,
            cwd=os.path.dirname(MCP_JS),
            limit=8 * 1024 * 1024,
        )
        self._req_id = 0
        await self._request("initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "captura_bot", "version": "3.1"},
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
            try:
                await self._request("tools/call", {"name": name, "arguments": args or {}})
                result = await self._read()
            except (asyncio.TimeoutError, ConnectionError, RuntimeError, BrokenPipeError, ValueError) as e:
                # Desynced/dead subprocess or oversized line (ValueError from StreamReader) — kill so next call restarts cleanly
                log.warning(f"MCP call '{name}' failed ({e}); resetting subprocess")
                self._kill_process()
                raise
            if isinstance(result, dict) and "content" in result:
                for item in result["content"]:
                    if item.get("type") == "text":
                        return json.loads(item["text"])
            return result

    def _kill_process(self):
        if self.process and self.process.returncode is None:
            try:
                self.process.kill()
            except Exception:
                pass
        self.process = None

    def shutdown(self):
        self._kill_process()


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

_home_data_cache: dict[int, dict] = {}  # chat_id -> fetched booking data
_home_data_cache_ts: dict[int, float] = {}

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
    cid = booking.get("camera_id") or ""
    return f"📷 {cid[-4:]}" if cid else "???"

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
# Shared HTTP client with connection pooling (created lazily on first use)
_http_client: Optional[httpx.AsyncClient] = None

def get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(
            timeout=15,
            limits=httpx.Limits(max_keepalive_connections=10, max_connections=20),
        )
    return _http_client

async def supabase_get(path: str, params: Optional[dict] = None) -> list:
    client = get_http_client()
    resp = await client.get(f"{SB_URL}/rest/v1/{path}", headers=HEADERS, params=params)
    resp.raise_for_status()
    return resp.json()

async def supabase_patch(table: str, body: dict, conditions: dict) -> None:
    client = get_http_client()
    qs = "&".join(f"{k}=eq.{v}" for k, v in conditions.items())
    resp = await client.patch(f"{SB_URL}/rest/v1/{table}?{qs}", headers=HEADERS, json=body)
    resp.raise_for_status()

async def supabase_insert(table: str, body: dict) -> None:
    client = get_http_client()
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
    rows = await supabase_get(
        f"bookings?select=*,customer:customers(id,name,full_name,email,phone,whatsapp)"
        f"&booking_status=eq.confirmed"
        f"&equipment_picked_up=eq.false"
        f"&pickup_date=gte.{td}&pickup_date=lte.{d_end}"
        f"&order=pickup_date.asc&limit=30"
    )
    if not rows:
        # Fallback: pickup_date may be null — use start_date instead
        rows = await supabase_get(
            f"bookings?select=*,customer:customers(id,name,full_name,email,phone,whatsapp)"
            f"&booking_status=eq.confirmed"
            f"&equipment_picked_up=eq.false"
            f"&start_date=gte.{td}&start_date=lte.{d_end}"
            f"&order=start_date.asc&limit=30"
        )
    return rows

async def get_returns_window(days: int = 3) -> list:
    td = date_today()
    d_end = date_days_out(days)
    return await supabase_get(
        f"bookings?select=*,customer:customers(id,name,full_name,email,phone,whatsapp)"
        f"&booking_status=eq.confirmed"
        f"&equipment_picked_up=eq.true"
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
async def gather_stats() -> dict:
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

def whatsapp_link(phone: str, text: str = "") -> str:
    num = clean_phone(phone)
    url = f"https://wa.me/{num}"
    if text:
        url += f"?text={quote(text)}"
    return url


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

    # A photo/media message has no editable text body — editing it into a text
    # message fails. Detect that and send a fresh message instead so navigation
    # from the branded welcome/brief cards stays smooth. Strip the buttons off
    # the old photo card first so we don't leave a second, stale menu behind.
    if is_edit and (getattr(target, "photo", None) or getattr(target, "caption", None) is not None):
        try:
            await target.edit_reply_markup(reply_markup=None)
        except Exception:
            pass
        try:
            msg = await target.reply_text(text, parse_mode=PARSE_MODE, **kwargs)
            await _track_msg(target.chat_id, msg.message_id)
        except Exception:
            try:
                msg = await target.reply_text(text, **kwargs)
                await _track_msg(target.chat_id, msg.message_id)
            except Exception:
                pass
        return

    try:
        if is_edit:
            await target.edit_text(text, parse_mode=PARSE_MODE, **kwargs)
        else:
            msg = await target.reply_text(text, parse_mode=PARSE_MODE, **kwargs)
            await _track_msg(target.chat_id, msg.message_id)
    except Exception:
        try:
            if is_edit:
                await target.edit_text(text, **kwargs)
            else:
                msg = await target.reply_text(text, **kwargs)
                await _track_msg(target.chat_id, msg.message_id)
        except Exception:
            pass

async def send_direct(app, chat_id: int, text: str, **kwargs):
    try:
        msg = await app.bot.send_message(chat_id, text, parse_mode=PARSE_MODE, **kwargs)
        await _track_msg(chat_id, msg.message_id)
    except Exception:
        try:
            msg = await app.bot.send_message(chat_id, text, **kwargs)
            await _track_msg(chat_id, msg.message_id)
        except Exception:
            pass


# ── Branding Helpers ───────────────────────────────────
async def set_bot_profile_photo(bot) -> None:
    """One-time: set the bot's profile photo to the Captura logo so it appears
    beside every message. Idempotent within a process run."""
    global _profile_photo_set
    if _profile_photo_set:
        return
    path = logo_file()
    if not path:
        log.warning("Logo not found; skipping profile photo")
        return
    if not hasattr(bot, "set_my_profile_photo"):
        log.info("PTB build lacks set_my_profile_photo; skipping")
        _profile_photo_set = True
        return
    try:
        with open(path, "rb") as f:
            await bot.set_my_profile_photo(photo=f.read())
        _profile_photo_set = True
        log.info("Bot profile photo set to Captura logo")
    except Exception as e:
        # Non-fatal: branding is cosmetic, never block startup
        log.warning(f"Could not set profile photo: {e}")
        _profile_photo_set = True  # don't retry every loop


async def send_logo_card(target, caption: str, reply_markup=None) -> bool:
    """Send the Captura logo as a photo with a caption. Reuses a cached
    file_id after the first upload. Returns True on success.

    `target` is anything exposing reply_photo (a Message) — used for fresh
    entry screens (welcome, morning brief), NOT for in-place navigation."""
    global _logo_file_id
    if len(caption) > 1024:  # Telegram caption hard limit
        caption = caption[:1010] + "..."
    photo = _logo_file_id or logo_file()
    if not photo:
        return False
    try:
        if hasattr(target, "reply_photo"):
            msg = await target.reply_photo(photo=photo, caption=caption,
                                           parse_mode=PARSE_MODE, reply_markup=reply_markup)
        else:  # a Bot instance + chat_id pattern handled by caller wrapper
            return False
        # Cache the uploaded file_id for reuse
        if msg and msg.photo:
            _logo_file_id = msg.photo[-1].file_id
        return True
    except Exception as e:
        log.warning(f"send_logo_card failed: {e}")
        return False


async def send_logo_card_direct(bot, chat_id: int, caption: str, reply_markup=None) -> bool:
    """Like send_logo_card but for push messages (no incoming Message)."""
    global _logo_file_id
    if len(caption) > 1024:
        caption = caption[:1010] + "..."
    photo = _logo_file_id or logo_file()
    if not photo:
        return False
    try:
        msg = await bot.send_photo(chat_id, photo=photo, caption=caption,
                                   parse_mode=PARSE_MODE, reply_markup=reply_markup)
        if msg and msg.photo:
            _logo_file_id = msg.photo[-1].file_id
        return True
    except Exception as e:
        log.warning(f"send_logo_card_direct failed: {e}")
        return False


# ── Action Helpers ─────────────────────────────────────
async def approve_booking(booking_id: str) -> Optional[dict]:
    """Approve via MCP tool. Sends WhatsApp notification. Returns booking or None."""
    existing = await get_booking(booking_id)
    if existing:
        current = existing.get("booking_status", existing.get("status", ""))
        if not validate_transition(current, "confirmed"):
            log.warning(f"APPROVE rejected: {booking_id} is {current}")
            return None
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
            "deposit_paid": True, "deposit_paid_date": n,
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


# ── Payment / Invoice / Inventory Helpers ──────────────
def booking_balance(booking: dict) -> float:
    """Compute outstanding balance: total minus what's already paid.
    No explicit balance column exists, so derive from paid flags."""
    total = float(booking.get("total_amount", 0) or 0)
    deposit = float(booking.get("deposit_amount", 0) or 0)
    paid = 0.0
    if booking.get("deposit_paid"):
        paid += deposit
    if booking.get("final_payment_paid"):
        # Final payment covers the remainder (total excludes refundable deposit)
        paid += max(total - deposit, 0) if deposit and deposit < total else total
    return round(max(total - paid, 0), 2)


async def record_payment(booking_id: str, payment_type: str, amount: float,
                         method: str = "cash") -> Optional[dict]:
    """Record a payment via MCP. Returns result dict or None."""
    try:
        result = await mcp.call_tool("captura.payments.admin.record", {
            "booking_id": booking_id,
            "payment_type": payment_type,
            "amount": amount,
            "payment_method": method,
            "notes": "Recorded via Telegram bot",
        })
        log.info(f"PAYMENT {payment_type} RM{amount} for {booking_id}: {result}")
        invalidate_cache("all")
        return result
    except Exception as e:
        log.error(f"record_payment failed for {booking_id}: {e}")
        return None


async def refund_deposit(booking_id: str, amount: Optional[float] = None) -> Optional[dict]:
    try:
        args = {"booking_id": booking_id, "refund_notes": "Refunded via Telegram bot"}
        if amount is not None:
            args["refund_amount"] = amount
        result = await mcp.call_tool("captura.payments.admin.mark_deposit_refunded", args)
        log.info(f"REFUND deposit for {booking_id}: {result}")
        invalidate_cache("all")
        return result
    except Exception as e:
        log.error(f"refund_deposit failed for {booking_id}: {e}")
        return None


async def generate_invoice(booking_id: str) -> Optional[dict]:
    try:
        result = await mcp.call_tool("captura.invoices.admin.generate", {"booking_id": booking_id})
        log.info(f"INVOICE for {booking_id}: {result}")
        return result
    except Exception as e:
        log.error(f"generate_invoice failed for {booking_id}: {e}")
        return None


async def set_camera_availability(camera_id: str, is_available: bool) -> Optional[dict]:
    try:
        result = await mcp.call_tool("captura.cameras.admin.set_availability", {
            "camera_id": camera_id,
            "is_available": is_available,
            "notes": "Toggled via Telegram bot",
        })
        invalidate_cache("all")
        log.info(f"CAMERA {camera_id} availability={is_available}")
        return result
    except Exception as e:
        log.error(f"set_camera_availability failed for {camera_id}: {e}")
        return None


async def update_camera_rate(camera_id: str, daily_rate: float) -> Optional[dict]:
    try:
        result = await mcp.call_tool("captura.cameras.admin.update", {
            "camera_id": camera_id,
            "daily_rate": daily_rate,
        })
        invalidate_cache("all")
        log.info(f"CAMERA {camera_id} daily_rate={daily_rate}")
        return result
    except Exception as e:
        log.error(f"update_camera_rate failed for {camera_id}: {e}")
        return None


def reminder_message(booking: dict, kind: str) -> str:
    """Build a WhatsApp reminder message for a booking."""
    cam = camera_display(booking)
    name = customer_display(booking)
    start = booking.get("start_date", "?")
    end = booking.get("end_date", "?")
    bal = booking_balance(booking)
    if kind == "pickup":
        return (f"🎥 *CAPTURA* — Pickup Reminder 📦\n"
                f"Hi {name}, your rental is ready!\n"
                f"📸 {cam}\n📅 Pickup: {start}\n"
                f"See you soon 🙌")
    if kind == "return":
        return (f"🎥 *CAPTURA* — Return Reminder 🔙\n"
                f"Hi {name}, a friendly reminder to return:\n"
                f"📸 {cam}\n📅 Due: {end}\n"
                f"Thanks for renting with us!")
    if kind == "overdue":
        return (f"🎥 *CAPTURA* — Overdue Notice ⚠️\n"
                f"Hi {name}, your rental was due {end}.\n"
                f"📸 {cam}\n"
                f"Please arrange return as soon as possible 🙏")
    if kind == "payment":
        return (f"🎥 *CAPTURA* — Payment Reminder 💰\n"
                f"Hi {name}, a friendly reminder of your balance.\n"
                f"📸 {cam}\n💳 Outstanding: RM{bal}\n"
                f"Thank you!")
    return f"Hi {name}, this is a reminder about your booking ({cam})."


# Pending text-input state: chat_id -> {"action": str, "booking_id"/"camera_id": str, ...}
_pending_input: dict[int, dict] = {}


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
        [InlineKeyboardButton("🗓️ Schedule", callback_data="schedule"),
         InlineKeyboardButton("📨 Reminders", callback_data="reminders")],
        [InlineKeyboardButton("🔍 Search Customer", callback_data="search_prompt"),
         InlineKeyboardButton("📷 Cameras", callback_data="cameras")],
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
        buttons.append([InlineKeyboardButton("⚠️ Report Issue", callback_data=f"confirm_rp:{bid}")])
    elif status == "completed":
        buttons.append([InlineKeyboardButton("⭐ Request Review", callback_data=f"confirm_rev:{bid}")])

    # Payment + invoice actions (not for pending/rejected/cancelled)
    if status in ("confirmed", "active", "completed"):
        buttons.append([
            InlineKeyboardButton("💰 Record Payment", callback_data=f"pay:{bid}"),
            InlineKeyboardButton("🧾 Invoice", callback_data=f"inv:{bid}"),
        ])
        buttons.append([InlineKeyboardButton("📨 Send Reminder", callback_data=f"remind:{bid}")])

    if cust_id:
        buttons.append([InlineKeyboardButton("📋 Customer History", callback_data=f"ch:{cust_id}")])
    if phone:
        if status == "confirmed":
            buttons.append([InlineKeyboardButton("📦 Send Pickup Info", url=whatsapp_link(phone, reminder_message(booking, "pickup")))])
        elif status == "active":
            buttons.append([InlineKeyboardButton("🔙 Send Return Reminder", url=whatsapp_link(phone, reminder_message(booking, "return")))])
        else:
            buttons.append([InlineKeyboardButton("💬 WhatsApp", url=whatsapp_link(phone))])

    buttons.append([InlineKeyboardButton("🔄 Refresh", callback_data=f"dt:{bid}")])
    buttons.append(make_back_row(back_cb))
    return InlineKeyboardMarkup(buttons)

def make_confirm_keyboard(action: str, target_id: str, label: str = "", back_cb: str = "menu") -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton(f"⚠️ Yes, {label}", callback_data=f"do_{action}:{target_id}")],
        [InlineKeyboardButton("❌ Cancel", callback_data=back_cb)],
    ])

def make_payment_type_keyboard(bid: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("💵 Deposit", callback_data=f"payt:{bid}:deposit"),
         InlineKeyboardButton("💰 Final", callback_data=f"payt:{bid}:final")],
        [InlineKeyboardButton("↩️ Refund", callback_data=f"payt:{bid}:refund")],
        [InlineKeyboardButton("◀ Back", callback_data=f"dt:{bid}"),
         InlineKeyboardButton("🏠 Home", callback_data="home")],
    ])

def make_payment_method_keyboard(bid: str, ptype: str) -> InlineKeyboardMarkup:
    # Short method codes keep callback_data well under Telegram's 64-byte limit
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("💵 Cash", callback_data=f"paym:{bid}:{ptype}:c"),
         InlineKeyboardButton("🏦 Transfer", callback_data=f"paym:{bid}:{ptype}:b")],
        [InlineKeyboardButton("🌐 Online", callback_data=f"paym:{bid}:{ptype}:o")],
        [InlineKeyboardButton("◀ Back", callback_data=f"pay:{bid}"),
         InlineKeyboardButton("🏠 Home", callback_data="home")],
    ])

PAYMENT_METHODS = {"c": "cash", "b": "bank_transfer", "o": "online"}

def make_reminder_keyboard(bid: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("📦 Pickup", callback_data=f"remk:{bid}:pickup"),
         InlineKeyboardButton("🔙 Return", callback_data=f"remk:{bid}:return")],
        [InlineKeyboardButton("⚠️ Overdue", callback_data=f"remk:{bid}:overdue"),
         InlineKeyboardButton("💰 Payment", callback_data=f"remk:{bid}:payment")],
        [InlineKeyboardButton("◀ Back", callback_data=f"dt:{bid}"),
         InlineKeyboardButton("🏠 Home", callback_data="home")],
    ])

def make_camera_list_keyboard(cameras: list) -> InlineKeyboardMarkup:
    buttons = []
    for cam in cameras:
        dot = "🟢" if cam.get("is_available") else "🔴"
        label = f"{dot} {cam.get('name', '?')} · RM{cam.get('daily_rate', '?')}"
        buttons.append([InlineKeyboardButton(label[:60], callback_data=f"cam:{cam['id']}")])
    buttons.append(make_back_row("menu"))
    return InlineKeyboardMarkup(buttons)

def make_camera_detail_keyboard(cam: dict) -> InlineKeyboardMarkup:
    cid = cam["id"]
    avail = cam.get("is_available")
    toggle_label = "🔴 Set Unavailable" if avail else "🟢 Set Available"
    new_state = "0" if avail else "1"
    return InlineKeyboardMarkup([
        [InlineKeyboardButton(toggle_label, callback_data=f"camtoggle:{cid}:{new_state}")],
        [InlineKeyboardButton("✏️ Edit Daily Rate", callback_data=f"camrate:{cid}")],
        [InlineKeyboardButton("◀ Back", callback_data="cameras"),
         InlineKeyboardButton("🏠 Home", callback_data="home")],
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
async def _fetch_home_data(force: bool = False) -> dict:
    """Fetch all booking data for the glance card. Cached 30s per polling loop."""
    now_ts = asyncio.get_event_loop().time()
    if not force and _home_data_cache and (now_ts - _home_data_cache_ts.get(0, 0)) < 30:
        return _home_data_cache.get(0, {})
    await fetch_cameras()
    pending, overdue, pickups, returns, active = await asyncio.gather(
        get_pending_bookings(use_cache=False),
        get_overdue_bookings(use_cache=False),
        get_pickups_window(3),
        get_returns_window(3),
        get_active_bookings(),
    )
    data = {
        "pending": pending, "overdue": overdue,
        "pickups": pickups, "returns": returns, "active": active,
    }
    _home_data_cache[0] = data
    _home_data_cache_ts[0] = now_ts
    return data


_rev_cache: dict = {}
_rev_cache_ts: float = 0


async def _fetch_rev_snapshot(force: bool = False) -> dict:
    """Fetch revenue snapshot + completed count. Cached 60s. Falls back to Supabase."""
    global _rev_cache, _rev_cache_ts
    now_ts = asyncio.get_event_loop().time()
    if not force and _rev_cache and (now_ts - _rev_cache_ts) < 60:
        return _rev_cache
    rev = {"month": 0, "all_time": 0, "completed": 0}

    # Try MCP first (with 5s timeout)
    try:
        m = await asyncio.wait_for(
            mcp.call_tool("captura.admin.dashboard_summary", {"period": "month"}),
            timeout=5,
        )
        if isinstance(m, dict):
            rev["month"] = m.get("metrics", {}).get("total_revenue_rm", 0)
            rev["completed"] = m.get("metrics", {}).get("total_completed", 0)
    except Exception:
        pass
    try:
        a = await asyncio.wait_for(
            mcp.call_tool("captura.admin.dashboard_summary", {"period": "all"}),
            timeout=5,
        )
        if isinstance(a, dict):
            rev["all_time"] = a.get("metrics", {}).get("total_revenue_rm", 0)
    except Exception:
        pass

    # Supabase fallback: count completed bookings directly
    if not rev["completed"]:
        try:
            comp = await supabase_get("bookings", {
                "select": "id,booking_status,status",
                "or": "(booking_status.eq.completed,status.eq.completed)",
                "limit": "500",
            })
            rev["completed"] = len(comp) if comp else 0
        except Exception:
            pass

    # Supabase fallback: sum all completed booking amounts for all-time
    if not rev["all_time"]:
        try:
            rows = await supabase_get("bookings", {
                "select": "total_amount,booking_status,status",
                "or": "(booking_status.eq.completed,status.eq.completed)",
                "limit": "500",
            })
            rev["all_time"] = sum(float(r.get("total_amount", 0) or 0) for r in (rows or []))
        except Exception:
            pass

    # Supabase fallback: month revenue from completed bookings this month
    if not rev["month"]:
        try:
            start_of_month = datetime.now().strftime("%Y-%m-01")
            rows = await supabase_get("bookings", {
                "select": "total_amount,start_date,booking_status,status",
                "order": "start_date.desc",
                "limit": "500",
            })
            rev["month"] = sum(
                float(r.get("total_amount", 0) or 0) for r in (rows or [])
                if (r.get("start_date", "") or "").startswith(start_of_month[:7])
            )
        except Exception:
            pass

    _rev_cache = rev
    _rev_cache_ts = now_ts
    return rev


def _build_detail_suggestion(booking: dict) -> str:
    """Build a suggested next step line based on booking status."""
    status = booking.get("booking_status", "")
    bal = booking_balance(booking)
    name = customer_display(booking)
    cam = camera_display(booking)

    if status == "pending_approval":
        return f"Check availability and approve {name}'s booking."
    if status == "confirmed":
        if bal > 0:
            return f"Prepare {cam} and collect {format_currency(bal)} before handover."
        return f"Prepare {cam} for pickup."
    if status == "active":
        end = booking.get("end_date", "?")
        overdue = end < date_today()
        if overdue:
            return f"⚠️ Overdue! Contact {name} now to confirm return."
        if bal > 0:
            return f"Inspect {cam} on return. Outstanding: {format_currency(bal)}."
        return f"Inspect {cam} on return, then mark complete."
    if status in ("completed",):
        return "Generate invoice or request a customer review."
    return ""


# ── Dashboard Helpers ──────────────────────────────────

def _normalize_dash_data(data: dict) -> dict:
    """Map raw MCP/fetch data to a safe normalized shape."""
    pending  = data.get("pending", []) or []
    overdue  = data.get("overdue", []) or []
    pickups  = data.get("pickups", []) or []
    returns  = data.get("returns", []) or []
    active   = data.get("active", []) or []
    today    = date_today()

    today_pu = [b for b in pickups if (b.get("pickup_date") or "") == today]
    today_re = [b for b in returns if (b.get("end_date") or "") == today]

    # Outstanding balance across active + pending
    outstanding = sum(booking_balance(b) for b in active)
    outstanding += sum(booking_balance(b) for b in pending)

    # Today's collected: sum of total_amount for active bookings (proxy)
    collected = sum(float(b.get("total_amount", 0) or 0) for b in active)

    next_pu  = today_pu[0] if today_pu else None
    next_re  = today_re[0] if today_re else None
    top_od   = overdue[0] if overdue else None

    return {
        "collected_today": collected,
        "pending_payment": outstanding,
        "active_rentals": len(active),
        "pickups_today": len(today_pu),
        "returns_today": len(today_re),
        "pickups_3d": len(pickups),
        "returns_3d": len(returns),
        "overdue_rentals": len(overdue),
        "unpaid_bookings": sum(1 for b in list(active) + list(pending) if booking_balance(b) > 0),
        "pending_approval": len(pending),
        "next_pickup": next_pu,
        "next_return": next_re,
        "top_overdue": top_od,
    }


def _get_dash_status(norm: dict) -> str:
    if norm["overdue_rentals"] > 0:
        return "🔴 Needs attention"
    if norm["pending_payment"] > 0 or norm["pickups_today"] > 0 or norm["returns_today"] > 0:
        return "🟡 Action needed"
    if norm["active_rentals"] > 0:
        return "🔵 Rentals active"
    return "🟢 Quiet today"


def _build_dash_alerts(norm: dict) -> list:
    lines = []
    if norm["overdue_rentals"] > 0:
        name = ""
        top = norm.get("top_overdue")
        if top:
            name = f" ({customer_display(top)} — {camera_display(top)})"
        lines.append(f"⚠️ {norm['overdue_rentals']} overdue{name}")
    if norm["pending_payment"] > 0:
        lines.append(f"💰 {format_currency(norm['pending_payment'])} pending payment")
    if norm["returns_today"] > 0:
        lines.append(f"📦 {norm['returns_today']} return(s) due today")
    if norm["pickups_today"] > 0:
        lines.append(f"📸 {norm['pickups_today']} pickup(s) scheduled today")
    if not lines:
        lines.append("✨ No urgent alerts")
    return lines


def _get_dash_next_action(norm: dict) -> str:
    top = norm.get("top_overdue")
    if norm["overdue_rentals"] > 0 and top:
        return f"Review overdue: {customer_display(top)} — {camera_display(top)}"
    if norm["overdue_rentals"] > 0:
        return "Review overdue rentals now."

    nre = norm.get("next_return")
    if norm["returns_today"] > 0 and nre:
        return f"Prepare return: {customer_display(nre)} — {camera_display(nre)}"
    if norm["returns_today"] > 0:
        return "Prepare for today's return(s)."

    npu = norm.get("next_pickup")
    if norm["pickups_today"] > 0 and npu:
        return f"Prepare pickup: {customer_display(npu)} — {camera_display(npu)}"
    if norm["pickups_today"] > 0:
        return "Prepare camera pickup(s)."

    if norm["pending_payment"] > 0:
        return f"Follow up {format_currency(norm['pending_payment'])} pending payment."

    return "No urgent action right now."


# ── Action Queue ─────────────────────────────────────

ACTION_SIGNALS = {
    "overdue":  "⚠️ contact",
    "pickup":   "",
    "return":   "",
    "payment":  "💰 unpaid",
    "approval": "",
}

ACTION_LABELS = {
    "overdue":  "overdue",
    "return":   "return",
    "pickup":   "pickup",
    "payment":  "payment",
    "approval": "approve",
}

ACTION_PRIORITY = {
    "overdue":  1,
    "return":   2,
    "pickup":   3,
    "payment":  4,
    "approval": 5,
}

_action_item_cache: list = []
_action_item_cache_ts: float = 0


def _build_action_items(data: dict) -> list:
    """Convert raw bookings into a priority-sorted list of ActionItems."""
    global _action_item_cache, _action_item_cache_ts
    now_ts = asyncio.get_event_loop().time()
    if _action_item_cache and (now_ts - _action_item_cache_ts) < 30:
        return _action_item_cache

    today = date_today()
    tomorrow = date_tomorrow()
    horizon = date_days_out(3)
    items = []

    pending  = data.get("pending", []) or []
    overdue  = data.get("overdue", []) or []
    pickups  = data.get("pickups", []) or []
    returns  = data.get("returns", []) or []
    active   = data.get("active", []) or []

    def _sort_key(b):
        return (b.get("start_date") or "", b.get("end_date") or "")

    # 1. Overdue (always shown, even outside horizon)
    for b in sorted(overdue, key=_sort_key):
        end_d = b.get("end_date", "?")
        items.append({"booking": b, "type": "overdue",
                       "date_label": end_d, "priority": ACTION_PRIORITY["overdue"]})

    # 2. Returns today & within horizon (only for bookings where equipment has been picked up)
    for b in sorted(returns, key=_sort_key):
        if not b.get("equipment_picked_up"):
            continue
        end_d = b.get("end_date", "") or ""
        if end_d < today:
            continue
        if end_d == today:
            label = "Today"
            prio = ACTION_PRIORITY["return"]
        elif end_d == tomorrow:
            label = "Tomorrow"
            prio = ACTION_PRIORITY["return"] + 1
        elif end_d <= horizon:
            label = datetime.strptime(end_d, "%Y-%m-%d").strftime("%a, %d %b")
            prio = ACTION_PRIORITY["return"] + 3
        else:
            continue
        items.append({"booking": b, "type": "return",
                       "date_label": label, "priority": prio})

    # 3. Pickups today & within horizon
    for b in sorted(pickups, key=_sort_key):
        pu_d = b.get("pickup_date", "") or b.get("start_date", "") or ""
        if pu_d == today:
            label = "Today"
            prio = ACTION_PRIORITY["pickup"]
        elif pu_d == tomorrow:
            label = "Tomorrow"
            prio = ACTION_PRIORITY["pickup"] + 1
        elif pu_d <= horizon:
            label = datetime.strptime(pu_d, "%Y-%m-%d").strftime("%a, %d %b")
            prio = ACTION_PRIORITY["pickup"] + 3
        else:
            continue
        items.append({"booking": b, "type": "pickup",
                       "date_label": label, "priority": prio})

    # 4. Payment tasks (active bookings with unpaid balance in horizon)
    for b in sorted(active, key=_sort_key):
        bal = booking_balance(b)
        if bal <= 0:
            continue
        end_d = b.get("end_date", "") or ""
        if end_d == today:
            label = "Today"
            prio = ACTION_PRIORITY["payment"]
        elif end_d == tomorrow:
            label = "Tomorrow"
            prio = ACTION_PRIORITY["payment"] + 1
        elif end_d <= horizon:
            label = datetime.strptime(end_d, "%Y-%m-%d").strftime("%a, %d %b")
            prio = ACTION_PRIORITY["payment"] + 3
        else:
            continue
        items.append({"booking": b, "type": "payment",
                       "date_label": label, "priority": prio,
                       "amount": bal})

    # 5. Pending approvals
    for b in sorted(pending, key=_sort_key):
        start_d = b.get("start_date", "") or ""
        if start_d == today:
            label = "Today"
            prio = ACTION_PRIORITY["approval"]
        elif start_d == tomorrow:
            label = "Tomorrow"
            prio = ACTION_PRIORITY["approval"] + 1
        elif start_d <= horizon:
            label = datetime.strptime(start_d, "%Y-%m-%d").strftime("%a, %d %b")
            prio = ACTION_PRIORITY["approval"] + 3
        else:
            continue
        items.append({"booking": b, "type": "approval",
                       "date_label": label, "priority": prio})

    items.sort(key=lambda x: (x["priority"], x["date_label"]))
    _action_item_cache = items[:6]  # max 6 visible
    _action_item_cache_ts = now_ts
    return _action_item_cache


def _render_action_line(item: dict, idx: int) -> str:
    """Render one compact action line: [N] Customer — action | camera | date | signal."""
    b = item["booking"]
    typ = item["type"]
    name = customer_display(b)
    cam = camera_display(b)
    signal = ACTION_SIGNALS.get(typ, "")
    label = ACTION_LABELS.get(typ, typ)

    if typ == "overdue":
        return f"[{idx}] {name} — {label} | {cam} | {item['date_label']} | {signal}"
    if typ in ("pickup", "return"):
        pu = b.get("pickup_method") or ""
        extra = f"🚚 {pu}" if pu == "delivery" else "" if pu == "pickup" else ""
        if typ == "return":
            extra = extra or ""
        line = f"[{idx}] {name} — {label} | {cam} | {item['date_label']}"
        if extra:
            line += f" | {extra}"
        if signal:
            line += f" | {signal}"
        return line
    if typ == "payment":
        amt = item.get("amount", booking_balance(b))
        return f"[{idx}] {name} — {label} | {cam} | RM{amt:.0f} due"
    if typ == "approval":
        start = b.get("start_date", "?")
        end = b.get("end_date", "?")
        return f"[{idx}] {name} — {label} | {cam} | {start}"
    return f"[{idx}] {name} — {cam}"


def _build_queue_section(items: list) -> list:
    """Build the '3-Day Work Queue' caption lines grouped by date label."""
    if not items:
        return ["👀 *3-Day Work Queue*", "No actions in the next 3 days."]
    lines = ["👀 *3-Day Work Queue*", ""]
    seen_label = None
    for i, item in enumerate(items):
        label = item["date_label"]
        if label != seen_label:
            lines.append(f"📅 *{label}*")
            seen_label = label
        lines.append(_render_action_line(item, i + 1))
    return lines


def _make_queue_keyboard(items: list) -> InlineKeyboardMarkup:
    """Build a numbered keyboard from action items, or quiet mode layout."""
    if items:
        row = []
        buttons = []
        for i, item in enumerate(items):
            bid = item["booking"]["id"]
            row.append(InlineKeyboardButton(str(i + 1), callback_data=f"task:{bid}"))
            if len(row) == 4:
                buttons.append(row)
                row = []
        if row:
            buttons.append(row)
        # Bottom row: secondary
        buttons.append([
            InlineKeyboardButton("📈 Analytics", callback_data="analytics"),
            InlineKeyboardButton("⋯ More", callback_data="more_menu"),
        ])
        return InlineKeyboardMarkup(buttons)

    # Quiet mode: no actions
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("📷 Cameras", callback_data="cameras"),
         InlineKeyboardButton("📈 Analytics", callback_data="analytics")],
        [InlineKeyboardButton("🔍 Search", callback_data="search_prompt"),
         InlineKeyboardButton("⋯ More", callback_data="more_menu")],
    ])


def _build_dashboard_caption(data: dict, rev: dict = None) -> str:
    """Build the full owner dashboard text with action queue."""
    norm = _normalize_dash_data(data)
    items = _build_action_items(data)
    now = datetime.now()

    # Status line with action count
    total = len(items)
    if total:
        if norm["overdue_rentals"] > 0:
            status = f"🔴 {total} action(s) · next 3 days"
        elif norm["returns_today"] > 0 or norm["pickups_today"] > 0:
            status = f"🟡 {total} action(s) · next 3 days"
        else:
            status = f"🔵 {total} action(s) · next 3 days"
    else:
        if norm["active_rentals"] > 0:
            status = "🔵 Rentals active · quiet queue"
        else:
            status = "🟢 Quiet today"

    lines = [
        "*📸 C A P T U R A*",
        "_Camera Rental · Studio_",
        "",
        "━━━━━━━━━━━━━━━━━━━━",
        f"📅 {now.strftime('%a, %d %b %Y')}",
        status,
        "",
    ]

    # 3-Day Work Queue
    lines.extend(_build_queue_section(items))
    lines.append("")

    # Money snapshot (compact, with month and all-time)
    rev = rev or {}
    lines.append("💰 *Money*")
    parts = [f"Today: {format_currency(norm['collected_today'])}"]
    parts.append(f"Month: {format_currency(rev['month'])}")
    parts.append(f"All: {format_currency(rev['all_time'])}")
    parts.append(f"Pending: {format_currency(norm['pending_payment'])}")
    lines.append("  ·  ".join(parts))

    # Summary counts
    lines.append("")
    lines.append("📦 *Summary*")
    lines.append(f"Active: {norm['active_rentals']}  ·  Pickups: {norm['pickups_3d']}  ·  Returns: {norm['returns_3d']}")
    lines.append(f"Overdue: {norm['overdue_rentals']}  ·  Pending: {norm['pending_approval']}")
    lines.append(f"Completed: {rev.get('completed', 0)}")

    lines.extend([
        "",
        "━━━━━━━━━━━━━━━━━━━━",
        "_v3.2 · MCP · Owner_",
    ])
    return "\n".join(lines)


# ── Dashboard Keyboard ─────────────────────────────────

def _make_dashboard_keyboard(data: dict) -> InlineKeyboardMarkup:
    """Dashboard keyboard — numbered task buttons when actions exist, quiet mode otherwise."""
    items = _build_action_items(data)
    return _make_queue_keyboard(items)


def _make_more_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🔍 Search Customer", callback_data="search_prompt"),
         InlineKeyboardButton("📷 Cameras", callback_data="cameras")],
        [InlineKeyboardButton("🔔 Reminders", callback_data="reminders"),
         InlineKeyboardButton("📅 Schedule", callback_data="schedule")],
        [InlineKeyboardButton("📈 Analytics", callback_data="analytics"),
         InlineKeyboardButton("📊 Dashboard(old)", callback_data="dashboard")],
        [InlineKeyboardButton("⬅️ Back to Dashboard", callback_data="home")],
    ])


# ── Show Home ──────────────────────────────────────────

async def show_home(update: Update, app=None, as_card: bool = False) -> None:
    """Owner dashboard — text-first, action-focused.

    When as_card is True (/start), the Captura logo photo is sent once as a
    branded welcome. Normal dashboard refresh is text-only, editing the existing
    message in-place so the chat stays clean."""
    data = await _fetch_home_data()
    rev = await _fetch_rev_snapshot()
    caption = _build_dashboard_caption(data, rev)
    kb = _make_dashboard_keyboard(data)

    if as_card and update.message:
        if await send_logo_card(update.message, caption, reply_markup=kb):
            return
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

    # Determine task type for contextual header
    task_header = ""
    if status == "pending_approval":
        task_header = "🟣 *Pending Approval*"
    elif status == "confirmed":
        task_header = "📸 *Pickup Preparation*"
    elif status == "active":
        end_d = booking.get("end_date", "")
        if end_d and end_d < date_today():
            task_header = "⚠️ *Overdue Rental*"
        else:
            task_header = "📦 *Active Rental*"
    elif status == "completed":
        task_header = "🏁 *Completed*"

    text = (
        f"{task_header}\n"
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

    # Suggested next step
    suggestion = _build_detail_suggestion(booking)
    if suggestion:
        text += f"\n\n✅ *Suggested Next Step*\n{suggestion}"

    # Prep checklist for confirmed bookings
    if status == "confirmed":
        text += ("\n\n🧰 *Prepare*\n"
                 "• Camera body + lens · Battery + charger\n"
                 "• Memory card · Camera bag\n"
                 "• Check condition before handover")

    # Return checklist for active bookings
    if status == "active":
        text += ("\n\n🧰 *Check on Return*\n"
                 "• Camera body + lens caps\n"
                 "• Battery + charger · Accessories\n"
                 "• Physical condition")

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

        # Revenue report (F6) — from MCP, best-effort
        rev_line = ""
        try:
            rep = await mcp.call_tool("captura.admin.revenue_report", {"period": "month"})
            report = rep.get("report", rep) if isinstance(rep, dict) else {}
            gross = report.get("gross_revenue", report.get("total_revenue"))
            deposits = report.get("deposits_held", report.get("outstanding"))
            if gross is not None:
                rev_line = f"\n*Revenue Report (Month)*\n  💵 Gross: *{format_currency(gross)}*\n"
                if deposits is not None:
                    rev_line += f"  🔒 Deposits/Outstanding: *{format_currency(deposits)}*\n"
        except Exception as e:
            log.warning(f"revenue_report failed: {e}")

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
            f"  📸 Active:    *{stats['active']}*\n"
            f"{rev_line}\n"
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


# ── Schedule (next actions) ────────────────────────────
async def show_schedule(update: Update) -> None:
    """Prioritized 'what needs doing' screen built from next_actions."""
    if not _camera_cache:
        await fetch_cameras()
    try:
        na = await mcp.call_tool("captura.bookings.next_actions", {})
    except Exception as e:
        await reply_text(update, f"⚠️ Could not load schedule: {e}", reply_markup=make_main_menu())
        return

    overdue = await get_overdue_bookings(use_cache=False)
    pickups = await get_pickups_window(3)
    returns = await get_returns_window(3)
    pending = await get_pending_bookings(use_cache=False)

    lines = ["🗓️ *Schedule — What Needs Doing*", "━━━━━━━━━━━━━━━━━━━"]
    lines.append(f"⚠️ Overdue: *{len(overdue)}*")
    lines.append(f"📦 Pickups (3d): *{len(pickups)}*")
    lines.append(f"🔙 Returns (3d): *{len(returns)}*")
    lines.append(f"⏳ Pending approval: *{len(pending)}*")

    buttons = []
    if overdue:
        buttons.append([InlineKeyboardButton(f"⚠️ Overdue ({len(overdue)})", callback_data="overdue")])
    if pickups:
        buttons.append([InlineKeyboardButton(f"📦 Pickups ({len(pickups)})", callback_data="pickups")])
    if returns:
        buttons.append([InlineKeyboardButton(f"🔙 Returns ({len(returns)})", callback_data="returns")])
    if pending:
        buttons.append([InlineKeyboardButton(f"⏳ Pending ({len(pending)})", callback_data="pending")])
    buttons.append(make_back_row("menu"))
    await reply_text(update, "\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons))


# ── Reminders ──────────────────────────────────────────
async def show_reminders(update: Update) -> None:
    """List bookings needing a nudge; tap one to choose a reminder type."""
    if not _camera_cache:
        await fetch_cameras()
    overdue = await get_overdue_bookings(use_cache=False)
    pickups = await get_pickups_window(3)
    returns = await get_returns_window(3)

    # Dedupe by booking id, preserving priority overdue > returns > pickups
    seen = {}
    for b in overdue + returns + pickups:
        seen.setdefault(b["id"], b)
    bookings = list(seen.values())

    chat_id = (update.callback_query.message.chat_id if update.callback_query
               else update.message.chat_id if update.message else 0)
    _search_sessions[f"reminders:{chat_id}"] = bookings

    if not bookings:
        await reply_text(update, "✨ *No reminders needed right now.* ☕", reply_markup=make_main_menu())
        return

    lines = [f"📨 *Reminders ({len(bookings)})* — tap a booking to nudge:", ""]
    buttons = []
    row = []
    for i, b in enumerate(bookings):
        lines.append(f"{i + 1}. {customer_display(b)} · {camera_display(b)} · due {b.get('end_date', '?')}")
        row.append(InlineKeyboardButton(str(i + 1), callback_data=f"remind:{b['id']}"))
        if len(row) == 5:
            buttons.append(row)
            row = []
    if row:
        buttons.append(row)
    buttons.append(make_back_row("menu"))
    await reply_text(update, "\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons))


# ── Cameras (inventory) ────────────────────────────────
async def show_cameras(update: Update) -> None:
    cameras = await fetch_cameras(force=True)
    if not cameras:
        await reply_text(update, "⚠️ No cameras found.", reply_markup=make_main_menu())
        return
    avail = sum(1 for c in cameras if c.get("is_available"))
    text = (f"📷 *Camera Inventory ({len(cameras)})*\n"
            f"🟢 {avail} available · 🔴 {len(cameras) - avail} unavailable\n\n"
            f"_Tap a camera to manage._")
    await reply_text(update, text, reply_markup=make_camera_list_keyboard(cameras))


async def show_camera_detail(update: Update, camera_id: str) -> None:
    cameras = await fetch_cameras()
    cam = next((c for c in cameras if c["id"] == camera_id), None)
    if not cam:
        await reply_text(update, "❌ Camera not found.", reply_markup=make_main_menu())
        return
    dot = "🟢 Available" if cam.get("is_available") else "🔴 Unavailable"
    text = (
        f"📷 *{cam.get('name', '?')}*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"🏷️ Brand: {cam.get('brand', '—')}\n"
        f"💵 Daily: RM{cam.get('daily_rate', '?')}\n"
        f"📅 Weekly: RM{cam.get('weekly_rate', '—')}\n"
        f"📌 {dot}"
    )
    await reply_text(update, text, reply_markup=make_camera_detail_keyboard(cam))


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

        # ── Page navigation (backward-compat: old keyboards may still have these) ──
        elif data in ("page_next", "page_prev", "noop"):
            await show_home(update)

        # ── Task from action queue ──
        elif data.startswith("task:"):
            booking_id = data.split(":", 1)[1]
            await show_booking_detail(update, booking_id, back_cb="home")

        # ── More menu ──
        elif data == "more_menu":
            caption = "⋯ *More Tools*\n\n_Tap a tool below._"
            await reply_text(update, caption, reply_markup=_make_more_menu())

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
                await reply_text(update, "⚠️ Could not approve — booking not found or already processed.", reply_markup=make_main_menu())

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

        # ── Report issue ──
        elif data.startswith("confirm_rp:"):
            booking_id = data.split(":", 1)[1]
            kb = make_confirm_keyboard("rp", booking_id, "Report Issue", f"dt:{booking_id}")
            await reply_text(update, "⚠️ *Report an issue with this rental?*\nThis will log a maintenance flag.", reply_markup=kb)

        elif data.startswith("do_rp:"):
            booking_id = data.split(":", 1)[1]
            n = utc_now()
            await supabase_patch("bookings", {
                "equipment_condition_return": "needs_repair",
                "admin_notes": "Issue reported via bot",
                "updated_at": n,
            }, {"id": booking_id})
            await reply_text(update, "⚠️ *Issue reported.* Equipment flagged for inspection.", reply_markup=make_main_menu())

        # ── Request review ──
        elif data.startswith("confirm_rev:"):
            booking_id = data.split(":", 1)[1]
            booking = await get_booking(booking_id)
            phone = ""
            if booking:
                cust = booking.get("customer") or {}
                phone = cust.get("whatsapp") or cust.get("phone", "")
            if phone:
                name = customer_display(booking) if booking else "there"
                rev_text = f"Hi {name}, thanks for renting with CAPTURA! We'd love your feedback. Leave us a review ⭐"
                kb = InlineKeyboardMarkup([[
                    InlineKeyboardButton("📲 Send Review Request", url=whatsapp_link(phone, rev_text)),
                ], [
                    InlineKeyboardButton("⬅️ Back", callback_data=f"dt:{booking_id}"),
                ]])
                await reply_text(update, f"⭐ *Request a review from {name}?*", reply_markup=kb)
            else:
                await reply_text(update, "⚠️ No WhatsApp number for this customer.", reply_markup=make_main_menu())

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
            booking = await get_booking(booking_id)
            if not booking:
                await reply_text(update, "⚠️ Cannot complete — booking not found.", reply_markup=make_main_menu())
                return
            bal = booking_balance(booking)
            warnings = []
            if not booking.get("deposit_paid"):
                warnings.append(f"Deposit RM{booking.get('deposit_amount', 0):.0f} not recorded")
            if not booking.get("final_payment_paid"):
                warnings.append(f"Final payment not recorded")
            if warnings:
                text = f"⚠️ *Mark completed?* \n\nThis will close the booking.\n\n" + "\n".join(f"• ❌ {w}" for w in warnings) + f"\n\nOutstanding: *{format_currency(bal)}*"
            else:
                text = f"⚡ *Mark completed?*\n\nAll payments recorded.\n{customer_display(booking)} — {camera_display(booking)}"
            kb = InlineKeyboardMarkup([
                [InlineKeyboardButton(f"⚠️ Yes, complete ({format_currency(bal)} outstanding)" if bal else "✅ Yes, complete", callback_data=f"do_complete:{booking_id}")],
                [InlineKeyboardButton("❌ Cancel", callback_data=f"dt:{booking_id}")],
            ])
            await reply_text(update, text, reply_markup=kb)

        elif data.startswith("do_complete:"):
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

        # ── Payments (F1) ──
        elif data.startswith("pay:"):
            booking_id = data.split(":", 1)[1]
            booking = await get_booking(booking_id)
            bal = booking_balance(booking) if booking else 0
            await reply_text(
                update,
                f"💰 *Record Payment*\nOutstanding balance: *RM{bal}*\n\nChoose payment type:",
                reply_markup=make_payment_type_keyboard(booking_id),
            )

        elif data.startswith("payt:"):
            _, booking_id, ptype = data.split(":", 2)
            await reply_text(
                update,
                f"💳 *{ptype.title()}* — choose method:",
                reply_markup=make_payment_method_keyboard(booking_id, ptype),
            )

        elif data.startswith("paym:"):
            _, booking_id, ptype, method_code = data.split(":", 3)
            method = PAYMENT_METHODS.get(method_code, "cash")
            booking = await get_booking(booking_id)
            default_amt = booking_balance(booking) if booking else 0
            if ptype == "deposit" and booking:
                default_amt = float(booking.get("deposit_amount", 0) or 0)
            chat_id = query.message.chat_id if query.message else 0
            _pending_input[chat_id] = {
                "action": "payment_amount",
                "booking_id": booking_id,
                "ptype": ptype,
                "method": method,
            }
            await reply_text(
                update,
                f"💰 Enter the *{ptype}* amount in RM (e.g. `{default_amt or 100}`).\n"
                f"Send `ok` to use the suggested RM{default_amt}.\nSend `cancel` to abort.",
            )

        elif data.startswith("do_recordpay:"):
            booking_id = data.split(":", 1)[1]
            chat_id = query.message.chat_id if query.message else 0
            details = _pending_input.pop(chat_id, None)
            if not details or details.get("action") != "confirm_payment" or details.get("booking_id") != booking_id:
                await reply_text(update, "⚠️ Payment session expired. Start again from the booking.", reply_markup=make_main_menu())
            else:
                ptype = details["ptype"]
                method = details["method"]
                amount = details["amount"]
                if ptype == "refund":
                    result = await refund_deposit(booking_id, amount)
                else:
                    result = await record_payment(booking_id, ptype, amount, method)
                if result:
                    amount_s = str(amount)
                    kb = InlineKeyboardMarkup([
                        [InlineKeyboardButton("📤 Send Receipt", callback_data=f"receipt:{booking_id}:{ptype}:{amount_s}")],
                        [InlineKeyboardButton("📄 Booking", callback_data=f"dt:{booking_id}")],
                        make_back_row("menu"),
                    ])
                    await reply_text(update, f"✅ Recorded *{ptype}* RM{amount} ({method}).", reply_markup=kb)
                else:
                    await reply_text(update, "⚠️ Could not record payment. Check logs.", reply_markup=make_main_menu())

        elif data.startswith("receipt:"):
            _, booking_id, ptype, amount_s = data.split(":", 3)
            booking = await get_booking(booking_id)
            if not booking:
                await reply_text(update, "❌ Booking not found.", reply_markup=make_main_menu())
            else:
                cust = booking.get("customer") or {}
                phone = cust.get("whatsapp") or cust.get("phone", "")
                msg = (f"🎥 *CAPTURA* — Payment Receipt 🧾\n"
                       f"Hi {customer_display(booking)},\n"
                       f"We received your {ptype} of RM{amount_s}.\n"
                       f"📸 {camera_display(booking)}\nThank you!")
                if phone and await send_whatsapp(phone, msg):
                    await reply_text(update, "📤 Receipt sent via WhatsApp.", reply_markup=make_main_menu())
                else:
                    await reply_text(update, "⚠️ No phone on file or send failed.", reply_markup=make_main_menu())

        # ── Invoice (F3) ──
        elif data.startswith("inv:"):
            booking_id = data.split(":", 1)[1]
            kb = make_confirm_keyboard("inv", booking_id, "Generate Invoice", f"dt:{booking_id}")
            await reply_text(update, "🧾 *Generate an invoice for this booking?*", reply_markup=kb)

        elif data.startswith("do_inv:"):
            booking_id = data.split(":", 1)[1]
            result = await generate_invoice(booking_id)
            invoice = (result or {}).get("invoice") if isinstance(result, dict) else None
            if invoice:
                num = invoice.get("invoice_number", "?")
                url = invoice.get("pdf_url") or invoice.get("url") or ""
                text = f"🧾 *Invoice {num} generated.*"
                buttons = []
                if url:
                    buttons.append([InlineKeyboardButton("🔗 Open Invoice", url=url)])
                buttons.append([InlineKeyboardButton("📄 Booking", callback_data=f"dt:{booking_id}")])
                buttons.append(make_back_row("menu"))
                await reply_text(update, text, reply_markup=InlineKeyboardMarkup(buttons))
            else:
                await reply_text(update, "⚠️ Could not generate invoice. Check logs.", reply_markup=make_main_menu())

        # ── Reminders (F2) ──
        elif data == "reminders":
            await show_reminders(update)

        elif data.startswith("remind:"):
            booking_id = data.split(":", 1)[1]
            await reply_text(update, "📨 *Choose a reminder type:*", reply_markup=make_reminder_keyboard(booking_id))

        elif data.startswith("remk:"):
            _, booking_id, kind = data.split(":", 2)
            booking = await get_booking(booking_id)
            if not booking:
                await reply_text(update, "❌ Booking not found.", reply_markup=make_main_menu())
            else:
                preview = reminder_message(booking, kind)
                kb = make_confirm_keyboard("sendrem", f"{booking_id}|{kind}", "Send Reminder", f"dt:{booking_id}")
                await reply_text(update, f"📨 *Preview:*\n\n{preview}", reply_markup=kb)

        elif data.startswith("do_sendrem:"):
            payload = data.split(":", 1)[1]
            booking_id, kind = payload.split("|", 1)
            booking = await get_booking(booking_id)
            cust = (booking or {}).get("customer") or {}
            phone = cust.get("whatsapp") or cust.get("phone", "")
            if booking and phone and await send_whatsapp(phone, reminder_message(booking, kind)):
                await reply_text(update, f"📨 Reminder sent to {customer_display(booking)}.", reply_markup=make_main_menu())
            else:
                await reply_text(update, "⚠️ No phone on file or send failed.", reply_markup=make_main_menu())

        # ── Cameras (F4) ──
        elif data == "cameras":
            await show_cameras(update)

        elif data.startswith("cam:"):
            camera_id = data.split(":", 1)[1]
            await show_camera_detail(update, camera_id)

        elif data.startswith("camtoggle:"):
            _, camera_id, state = data.split(":", 2)
            is_available = state == "1"
            result = await set_camera_availability(camera_id, is_available)
            if result:
                await show_camera_detail(update, camera_id)
            else:
                await reply_text(update, "⚠️ Could not update camera. Check logs.", reply_markup=make_main_menu())

        elif data.startswith("camrate:"):
            camera_id = data.split(":", 1)[1]
            chat_id = query.message.chat_id if query.message else 0
            _pending_input[chat_id] = {"action": "camera_rate", "camera_id": camera_id}
            await reply_text(update, "✏️ Send the new *daily rate* in RM (e.g. `120`).\nSend `cancel` to abort.")

        # ── Views ──
        elif data == "overdue":
            await show_overdue(update)
        elif data == "active":
            await show_active(update)
        elif data == "recent":
            await show_recent(update)
        elif data == "schedule":
            await show_schedule(update)
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
        "*Workflow*\n"
        "🗓️ `/schedule` — what needs doing now\n"
        "📨 `/reminders` — send WhatsApp nudges\n"
        "📷 `/cameras` — inventory & rates\n\n"
        "*Actions*\n"
        "🔍 `/search <name>` — find customers\n"
        "✅ `/approve <name>` / ❌ `/reject <name>`\n"
        "📦 `/pickup <name>` / 🔙 `/return <name>`\n"
        "🚫 `/cancel <name>`\n\n"
        "_From a booking: 💰 record payment · 🧾 invoice · 📨 reminder_\n"
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
    await cleanup_old_messages(context.application, OWNER or update.message.chat_id)
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
    await show_home(update, context.application, as_card=True)

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


async def cmd_schedule(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_owner(update):
        return
    await show_schedule(update)

async def cmd_reminders(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_owner(update):
        return
    await show_reminders(update)

async def cmd_cameras(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_owner(update):
        return
    await show_cameras(update)


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

    chat_id = update.message.chat_id
    raw = update.message.text.strip()

    # ── Pending text-input flows (payment amount, camera rate) ──
    pending = _pending_input.get(chat_id)
    if pending:
        low = raw.lower()
        if low == "cancel":
            _pending_input.pop(chat_id, None)
            await reply_text(update, "❌ Cancelled.", reply_markup=make_main_menu())
            return

        if pending["action"] == "payment_amount":
            booking = await get_booking(pending["booking_id"])
            default_amt = booking_balance(booking) if booking else 0
            if pending["ptype"] == "deposit" and booking:
                default_amt = float(booking.get("deposit_amount", 0) or 0)
            if low == "ok":
                amount = default_amt
            else:
                try:
                    amount = round(float(raw.replace("rm", "").replace("RM", "").strip()), 2)
                except ValueError:
                    await reply_text(update, "⚠️ Not a valid number. Try again or send `cancel`.")
                    return
            if amount <= 0:
                await reply_text(update, "⚠️ Amount must be greater than 0. Try again or send `cancel`.")
                return
            # Stash full details in state; keep callback_data short (Telegram 64-byte limit)
            _pending_input[chat_id] = {
                "action": "confirm_payment",
                "booking_id": pending["booking_id"],
                "ptype": pending["ptype"],
                "method": pending["method"],
                "amount": amount,
            }
            kb = make_confirm_keyboard("recordpay", pending["booking_id"], f"Record RM{amount}", f"dt:{pending['booking_id']}")
            await reply_text(
                update,
                f"💰 *Confirm payment*\nType: {pending['ptype']}\nMethod: {pending['method']}\nAmount: *RM{amount}*",
                reply_markup=kb,
            )
            return

        if pending["action"] == "camera_rate":
            try:
                rate = round(float(raw.replace("rm", "").replace("RM", "").strip()), 2)
            except ValueError:
                await reply_text(update, "⚠️ Not a valid number. Try again or send `cancel`.")
                return
            if rate <= 0:
                await reply_text(update, "⚠️ Rate must be greater than 0. Try again or send `cancel`.")
                return
            camera_id = pending["camera_id"]
            _pending_input.pop(chat_id, None)
            result = await update_camera_rate(camera_id, rate)
            if result:
                await reply_text(update, f"✅ Daily rate updated to RM{rate}.")
                await show_camera_detail(update, camera_id)
            else:
                await reply_text(update, "⚠️ Could not update rate. Check logs.", reply_markup=make_main_menu())
            return

    text = raw.lower()
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
            await cleanup_old_messages(context.application, OWNER or update.message.chat_id)
            await send_morning_brief(context.application, OWNER or update.message.chat_id)

        elif command == "analytics":
            await show_analytics(update)

        elif command == "schedule":
            await show_schedule(update)

        elif command == "reminders":
            await show_reminders(update)

        elif command in ("cameras", "inventory"):
            await show_cameras(update)

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
    brief_text = "\n".join(lines)
    kb = InlineKeyboardMarkup(kb_buttons)
    # Brand with the logo card when the brief fits Telegram's caption limit;
    # otherwise fall back to text (the profile photo still shows the logo).
    if len(brief_text) <= 1024 and await send_logo_card_direct(app.bot, chat_id, brief_text, reply_markup=kb):
        return
    await send_direct(app, chat_id, brief_text, reply_markup=kb)


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
                await cleanup_old_messages(application, owner_chat_id)
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


async def mcp_health_loop(interval: int = 120):
    """Periodically ping the MCP subprocess so a dead/hung process is detected
    and restarted proactively, before a user request hits it."""
    consecutive_failures = 0
    while True:
        await asyncio.sleep(interval)
        try:
            await asyncio.wait_for(mcp.call_tool("captura.cameras.list", {"filter": "all"}), timeout=25)
            if consecutive_failures:
                log.info("MCP health check recovered")
            consecutive_failures = 0
        except Exception as e:
            consecutive_failures += 1
            log.warning(f"MCP health check failed ({consecutive_failures}): {e}")
            # call_tool already kills the subprocess on failure; force reset after repeats
            if consecutive_failures >= 2:
                mcp._kill_process()
                log.warning("MCP subprocess reset by health loop")


# ── Main ───────────────────────────────────────────────
async def _on_post_init(app) -> None:
    """Runs once after the bot is initialized: apply Captura branding."""
    await set_bot_profile_photo(app.bot)


def main():
    app = Application.builder().token(TOKEN).post_init(_on_post_init).build()

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
    app.add_handler(CommandHandler("schedule", cmd_schedule))
    app.add_handler(CommandHandler("reminders", cmd_reminders))
    app.add_handler(CommandHandler("cameras", cmd_cameras))
    # Callback + message handlers
    app.add_handler(CallbackQueryHandler(on_callback))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    # Schema verification on startup
    asyncio.get_event_loop().create_task(verify_schema())

    # MCP health-check loop (proactive restart of dead/hung subprocess)
    asyncio.get_event_loop().create_task(mcp_health_loop())

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
        if _http_client and not _http_client.is_closed:
            try:
                asyncio.get_event_loop().run_until_complete(_http_client.aclose())
            except Exception:
                pass


if __name__ == "__main__":
    main()
