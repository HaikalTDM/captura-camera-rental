"""
Test suite for CAPTURA Telegram Bot (captura_bot.py).

Tests pure logic functions, formatters, keyboard builders, state validation,
caching, and the AlertTracker. External I/O (Supabase, MCP, Telegram, WhatsApp)
is mocked.

Run from bot/ dir:  python3 -m pytest test_captura_bot.py -v
"""

import os
import sys
import importlib
from types import SimpleNamespace

import pytest

# ── Set required env vars BEFORE importing the bot module ──
os.environ.setdefault("CAPTURA_BOT_TOKEN", "test-token")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-key")
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("BOT_CHAT_ID", "12345")

import captura_bot as bot  # noqa: E402


@pytest.fixture(autouse=True)
def reset_state():
    """Reset module-level caches and sessions before each test."""
    bot._camera_cache = []
    bot._camera_cache_ts = 0
    bot._pending_cache = []
    bot._pending_cache_ts = 0
    bot._overdue_cache = []
    bot._overdue_cache_ts = 0
    bot._search_sessions = {}
    yield


# ─────────────────────────────────────────────────────────
# Formatting helpers
# ─────────────────────────────────────────────────────────
class TestStatusHelpers:
    def test_status_icon_known(self):
        assert bot.status_icon("confirmed") == "✅"
        assert bot.status_icon("active") == "📦"
        assert bot.status_icon("completed") == "🏁"
        assert bot.status_icon("cancelled") == "🚫"
        assert bot.status_icon("rejected") == "❌"
        assert bot.status_icon("pending_approval") == "⏳"

    def test_status_icon_unknown_fallback(self):
        assert bot.status_icon("weird_status") == "📋"
        assert bot.status_icon("") == "📋"

    def test_status_label(self):
        assert bot.status_label("pending_approval") == "Pending Approval"
        assert bot.status_label("active") == "Active"
        assert bot.status_label("completed") == "Completed"


class TestCustomerDisplay:
    def test_full_name_preferred(self):
        b = {"customer": {"full_name": "Amirul", "name": "Ami"}}
        assert bot.customer_display(b) == "Amirul"

    def test_name_fallback(self):
        b = {"customer": {"name": "Ami"}}
        assert bot.customer_display(b) == "Ami"

    def test_unknown_when_no_customer(self):
        assert bot.customer_display({}) == "Unknown"
        assert bot.customer_display({"customer": None}) == "Unknown"
        assert bot.customer_display({"customer": {}}) == "Unknown"


class TestCameraDisplay:
    def test_resolves_name_from_cache(self):
        bot._camera_cache = [{"id": "cam-123", "name": "DJI Osmo Pocket 3"}]
        b = {"camera_id": "cam-123"}
        assert bot.camera_display(b) == "DJI Osmo Pocket 3"

    def test_falls_back_to_truncated_id(self):
        bot._camera_cache = []
        b = {"camera_id": "508eb0ae-1234-5678"}
        assert bot.camera_display(b) == "508eb0ae"

    def test_handles_missing_camera_id(self):
        bot._camera_cache = []
        assert bot.camera_display({}) == "???"


class TestFormatCurrency:
    def test_basic(self):
        assert bot.format_currency(60) == "RM 60"
        assert bot.format_currency(0) == "RM 0"

    def test_thousands_separator(self):
        assert bot.format_currency(10945) == "RM 10,945"
        assert bot.format_currency(1234567) == "RM 1,234,567"

    def test_rounds_floats(self):
        assert bot.format_currency(60.7) == "RM 61"
        assert bot.format_currency(120.4) == "RM 120"


class TestCleanPhone:
    def test_strips_non_digits(self):
        assert bot.clean_phone("+60 17-746 4121") == "60177464121"
        assert bot.clean_phone("012-345-6789") == "0123456789"

    def test_empty(self):
        assert bot.clean_phone("") == ""
        assert bot.clean_phone("abc") == ""


class TestWhatsappLink:
    def test_builds_link(self):
        assert bot.whatsapp_link("+60 17-746 4121") == "https://wa.me/60177464121"

    def test_strips_formatting(self):
        assert bot.whatsapp_link("017-746 4121") == "https://wa.me/0177464121"


class TestFormatBookingLine:
    def test_includes_key_fields(self):
        bot._camera_cache = [{"id": "c1", "name": "Canon R50"}]
        b = {
            "customer": {"full_name": "Haziq"},
            "camera_id": "c1",
            "booking_status": "completed",
            "start_date": "2026-06-12",
            "total_amount": 120.0,
        }
        line = bot.format_booking_line(b)
        assert "Haziq" in line
        assert "Canon R50" in line
        assert "2026-06-12" in line
        assert "RM120" in line
        assert "Completed" in line


# ─────────────────────────────────────────────────────────
# State machine validation
# ─────────────────────────────────────────────────────────
class TestValidateTransition:
    def test_pending_can_confirm_reject_cancel(self):
        assert bot.validate_transition("pending_approval", "confirmed")
        assert bot.validate_transition("pending_approval", "rejected")
        assert bot.validate_transition("pending_approval", "cancelled")

    def test_pending_cannot_skip_to_completed(self):
        assert not bot.validate_transition("pending_approval", "completed")
        assert not bot.validate_transition("pending_approval", "active")

    def test_confirmed_transitions(self):
        assert bot.validate_transition("confirmed", "active")
        assert bot.validate_transition("confirmed", "completed")
        assert bot.validate_transition("confirmed", "cancelled")
        assert not bot.validate_transition("confirmed", "pending_approval")

    def test_active_transitions(self):
        assert bot.validate_transition("active", "completed")
        assert bot.validate_transition("active", "cancelled")
        assert not bot.validate_transition("active", "confirmed")

    def test_unknown_status_allowed_through(self):
        # Terminal/unknown states are not in VALID_TRANSITIONS -> allowed
        assert bot.validate_transition("completed", "anything")
        assert bot.validate_transition("", "confirmed")


# ─────────────────────────────────────────────────────────
# Cache invalidation
# ──��──────────────────────────────────────────────────────
class TestInvalidateCache:
    def test_invalidate_pending_only(self):
        bot._pending_cache = [{"id": "1"}]
        bot._pending_cache_ts = 999
        bot._overdue_cache = [{"id": "2"}]
        bot._overdue_cache_ts = 999
        bot.invalidate_cache("pending")
        assert bot._pending_cache == []
        assert bot._pending_cache_ts == 0
        assert bot._overdue_cache == [{"id": "2"}]  # untouched

    def test_invalidate_overdue_only(self):
        bot._overdue_cache = [{"id": "2"}]
        bot._overdue_cache_ts = 999
        bot.invalidate_cache("overdue")
        assert bot._overdue_cache == []
        assert bot._overdue_cache_ts == 0

    def test_invalidate_all(self):
        bot._pending_cache = [{"id": "1"}]
        bot._overdue_cache = [{"id": "2"}]
        bot._camera_cache = [{"id": "3"}]
        bot.invalidate_cache("all")
        assert bot._pending_cache == []
        assert bot._overdue_cache == []
        assert bot._camera_cache == []


# ─────────────────────────────────────────────────────────
# Keyboard builders
# ─────────────────────────────────────────────────────────
class TestNumberedCustomerKeyboard:
    def test_stores_session_and_numbers(self):
        customers = [{"id": "a"}, {"id": "b"}, {"id": "c"}]
        kb = bot.make_numbered_customer_keyboard(customers, chat_id=999)
        # session stored
        assert bot._search_sessions[999] == customers
        # flatten buttons
        flat = [btn for row in kb.inline_keyboard for btn in row]
        labels = [btn.text for btn in flat]
        assert "1" in labels and "2" in labels and "3" in labels
        assert any("Cancel" in b.text for b in flat)

    def test_callback_data_indices(self):
        customers = [{"id": "a"}, {"id": "b"}]
        kb = bot.make_numbered_customer_keyboard(customers, chat_id=1)
        flat = [btn for row in kb.inline_keyboard for btn in row]
        cbs = [b.callback_data for b in flat if b.callback_data and b.callback_data.startswith("cust_pick:")]
        assert "cust_pick:0" in cbs
        assert "cust_pick:1" in cbs

    def test_rows_capped_at_five(self):
        customers = [{"id": str(i)} for i in range(7)]
        kb = bot.make_numbered_customer_keyboard(customers, chat_id=2)
        # First row should have exactly 5 number buttons
        assert len(kb.inline_keyboard[0]) == 5


class TestNumberedBookingKeyboard:
    def test_maps_numbers_to_detail(self):
        bookings = [{"id": "bk1"}, {"id": "bk2"}]
        kb = bot.make_numbered_booking_keyboard(bookings)
        flat = [btn for row in kb.inline_keyboard for btn in row]
        cbs = [b.callback_data for b in flat]
        assert "dt:bk1" in cbs
        assert "dt:bk2" in cbs

    def test_extra_rows_included(self):
        bookings = [{"id": "bk1"}]
        extra = [[bot.InlineKeyboardButton("⚡ All", callback_data="confirm_apall")]]
        kb = bot.make_numbered_booking_keyboard(bookings, extra_rows=extra)
        flat = [btn for row in kb.inline_keyboard for btn in row]
        assert any(b.callback_data == "confirm_apall" for b in flat)

    def test_has_back_and_home(self):
        kb = bot.make_numbered_booking_keyboard([{"id": "x"}], back_cb="menu")
        flat = [btn for row in kb.inline_keyboard for btn in row]
        cbs = [b.callback_data for b in flat]
        assert "menu" in cbs   # back
        assert "home" in cbs   # home


class TestMainMenuHasHome:
    def test_back_row_always_has_home(self):
        row = bot.make_back_row("pending")
        cbs = [b.callback_data for b in row]
        assert "pending" in cbs
        assert "home" in cbs


# ─────────────────────────────────────────────────────────
# AlertTracker
# ─────────────────────────────────────────────────────────
class TestAlertTracker:
    def test_filter_new_only_returns_unseen(self):
        tr = bot.AlertTracker()
        first = tr.filter_new([{"id": "1"}, {"id": "2"}])
        assert {b["id"] for b in first} == {"1", "2"}
        # Second pass with overlap -> only new one returned
        second = tr.filter_new([{"id": "2"}, {"id": "3"}])
        assert {b["id"] for b in second} == {"3"}

    def test_filter_new_empty_after_all_seen(self):
        tr = bot.AlertTracker()
        tr.filter_new([{"id": "1"}])
        assert tr.filter_new([{"id": "1"}]) == []

    def test_mark_brief_sent(self):
        tr = bot.AlertTracker()
        tr.mark_brief_sent()
        assert tr.brief_sent_today is True

    def test_seed_marks_seeded(self):
        import asyncio as _asyncio
        tr = bot.AlertTracker()

        async def fake_pending(*a, **k):
            return [{"id": "x"}, {"id": "y"}]

        orig = bot.get_pending_bookings
        bot.get_pending_bookings = fake_pending
        try:
            _asyncio.get_event_loop().run_until_complete(tr.seed_existing())
        finally:
            bot.get_pending_bookings = orig
        assert tr._seeded is True
        # Seeded IDs should now be filtered out as "not new"
        assert tr.filter_new([{"id": "x"}]) == []


# ─────────────────────────────────────────────────────────
# is_owner gate
# ─────────────────────────────────────────────────────────
class TestIsOwner:
    def _make_update(self, chat_id):
        msg = SimpleNamespace(chat_id=chat_id)
        return SimpleNamespace(message=msg, callback_query=None)

    def test_owner_allowed(self):
        upd = self._make_update(int(bot.OWNER))
        assert bot.is_owner(upd) is True

    def test_non_owner_blocked(self):
        upd = self._make_update(999999)
        assert bot.is_owner(upd) is False

    def test_callback_query_path(self):
        cq_msg = SimpleNamespace(chat_id=int(bot.OWNER))
        cq = SimpleNamespace(message=cq_msg)
        upd = SimpleNamespace(message=None, callback_query=cq)
        assert bot.is_owner(upd) is True


# ─────────────────────────────────────────────────────────
# Async data layer (mocked Supabase + MCP)
# ─────────────────────────────────────────────────────────
class _MCPDown:
    async def call_tool(self, *a, **k):
        raise RuntimeError("MCP unavailable")


@pytest.mark.asyncio
class TestActiveBookingsFallback:
    async def test_uses_status_when_booking_status_empty(self, monkeypatch):
        calls = []

        async def fake_get(path, params=None):
            calls.append(params or {})
            # first call (booking_status) returns empty, fallback (status) returns rows
            if params and params.get("booking_status") == "eq.active":
                return []
            if params and params.get("status") == "eq.active":
                return [{"id": "a1", "booking_status": None, "status": "active"}]
            return []

        monkeypatch.setattr(bot, "supabase_get", fake_get)
        rows = await bot.get_active_bookings()
        assert len(rows) == 1
        assert rows[0]["id"] == "a1"
        # confirm both query variants were attempted
        assert any("booking_status" in c for c in calls)
        assert any("status" in c for c in calls)


@pytest.mark.asyncio
class TestMarkStateGuards:
    async def test_pickup_rejected_when_completed(self, monkeypatch):
        async def fake_get_booking(bid):
            return {"id": bid, "booking_status": "completed"}
        monkeypatch.setattr(bot, "get_booking", fake_get_booking)
        result = await bot.mark_picked_up("bk1")
        assert result is None  # invalid state -> rejected

    async def test_return_rejected_when_pending(self, monkeypatch):
        async def fake_get_booking(bid):
            return {"id": bid, "booking_status": "pending_approval"}
        monkeypatch.setattr(bot, "get_booking", fake_get_booking)
        result = await bot.mark_returned("bk1")
        assert result is None

    async def test_return_allowed_when_active(self, monkeypatch):
        store = {"id": "bk1", "booking_status": "active", "start_date": "2026-06-01",
                 "end_date": "2026-06-05", "total_amount": 100, "camera_id": "c1",
                 "customer": {"phone": ""}}

        async def fake_get_booking(bid):
            return store

        wa_called = {"n": 0}
        async def fake_wa(phone, msg):
            wa_called["n"] += 1
            return True

        monkeypatch.setattr(bot, "get_booking", fake_get_booking)
        monkeypatch.setattr(bot, "send_whatsapp", fake_wa)
        monkeypatch.setattr(bot, "mcp", _MCPDown())
        async def fake_patch(*a, **k):
            return None
        monkeypatch.setattr(bot, "supabase_patch", fake_patch)

        result = await bot.mark_returned("bk1")
        assert result is not None
        # no phone -> whatsapp not sent
        assert wa_called["n"] == 0


@pytest.mark.asyncio
class TestGatherStats:
    async def test_computes_counts_and_revenue_from_db(self, monkeypatch):
        async def fake_get(path, params=None):
            p = params or {}
            orx = p.get("or", "")
            if "pending_approval" in orx:
                return [{"id": "p1"}]
            if "booking_status.eq.active" in orx:
                return [{"id": "a1", "total_amount": 120}, {"id": "a2", "total_amount": 60}]
            if "completed" in orx:
                return [{"id": f"c{i}"} for i in range(77)]
            # month rows query (select total_amount,start_date,...)
            if p.get("order", "").startswith("start_date"):
                month = bot.datetime.now().strftime("%Y-%m")
                return [
                    {"total_amount": 120, "start_date": f"{month}-12"},
                    {"total_amount": 60, "start_date": f"{month}-13"},
                    {"total_amount": 999, "start_date": "2020-01-01"},  # out of month
                ]
            return []

        monkeypatch.setattr(bot, "supabase_get", fake_get)
        monkeypatch.setattr(bot, "mcp", _MCPDown())

        stats = await bot.gather_stats()
        assert stats["pending"] == 1
        assert stats["active"] == 2
        assert stats["completed"] == 77
        # active total = 120 + 60
        assert stats["revenue_today"] == 180
        # month revenue excludes the 2020 row
        assert stats["revenue_month"] == 180


# ─────────────────────────────────────────────────────────
# Shared HTTP client (connection pooling)
# ─────────────────────────────────────────────────────────
class TestHttpClient:
    def test_lazy_singleton(self):
        bot._http_client = None
        c1 = bot.get_http_client()
        c2 = bot.get_http_client()
        assert c1 is c2  # same instance reused

    def test_recreated_after_close(self):
        import asyncio as _asyncio
        c1 = bot.get_http_client()
        _asyncio.new_event_loop().run_until_complete(c1.aclose())
        c2 = bot.get_http_client()
        assert c2 is not c1
        assert not c2.is_closed

    def test_has_connection_pool_limits(self):
        bot._http_client = None
        c = bot.get_http_client()
        assert c.is_closed is False


# ─────────────────────────────────────────────────────────
# Payment balance computation (F1)
# ─────────────────────────────────────────────────────────
class TestBookingBalance:
    def test_nothing_paid_returns_total(self):
        b = {"total_amount": 300, "deposit_amount": 100,
             "deposit_paid": False, "final_payment_paid": False}
        assert bot.booking_balance(b) == 300

    def test_deposit_paid_subtracts_deposit(self):
        b = {"total_amount": 300, "deposit_amount": 100,
             "deposit_paid": True, "final_payment_paid": False}
        assert bot.booking_balance(b) == 200

    def test_fully_paid_returns_zero(self):
        b = {"total_amount": 300, "deposit_amount": 100,
             "deposit_paid": True, "final_payment_paid": True}
        assert bot.booking_balance(b) == 0

    def test_never_negative(self):
        b = {"total_amount": 100, "deposit_amount": 200,
             "deposit_paid": True, "final_payment_paid": True}
        assert bot.booking_balance(b) >= 0

    def test_handles_missing_fields(self):
        assert bot.booking_balance({}) == 0


# ─────────────────────────────────────────────────────────
# Reminder templates (F2)
# ─────────────────────────────────────────────────────────
class TestReminderMessage:
    def _booking(self):
        bot._camera_cache = [{"id": "c1", "name": "Canon R50"}]
        return {"customer": {"full_name": "Haziq"}, "camera_id": "c1",
                "start_date": "2026-06-12", "end_date": "2026-06-15",
                "total_amount": 200, "deposit_amount": 50}

    def test_pickup_includes_name_and_camera(self):
        msg = bot.reminder_message(self._booking(), "pickup")
        assert "Haziq" in msg and "Canon R50" in msg and "2026-06-12" in msg

    def test_return_includes_due_date(self):
        msg = bot.reminder_message(self._booking(), "return")
        assert "2026-06-15" in msg

    def test_overdue_template(self):
        msg = bot.reminder_message(self._booking(), "overdue")
        assert "Overdue" in msg

    def test_payment_includes_balance(self):
        msg = bot.reminder_message(self._booking(), "payment")
        assert "RM" in msg

    def test_unknown_kind_fallback(self):
        msg = bot.reminder_message(self._booking(), "weird")
        assert "Haziq" in msg


# ─────────────────────────────────────────────────────────
# New keyboard builders (F1/F2/F4)
# ─────────────────────────────────────────────────────────
class TestPaymentKeyboards:
    def test_payment_type_keyboard_has_all_types(self):
        kb = bot.make_payment_type_keyboard("bk1")
        flat = [b.callback_data for row in kb.inline_keyboard for b in row]
        assert "payt:bk1:deposit" in flat
        assert "payt:bk1:final" in flat
        assert "payt:bk1:refund" in flat

    def test_payment_method_keyboard(self):
        kb = bot.make_payment_method_keyboard("bk1", "deposit")
        flat = [b.callback_data for row in kb.inline_keyboard for b in row]
        # Short method codes (c/b/o) keep callback_data under Telegram's 64-byte limit
        assert "paym:bk1:deposit:c" in flat
        assert "paym:bk1:deposit:b" in flat
        assert "paym:bk1:deposit:o" in flat
        assert bot.PAYMENT_METHODS["c"] == "cash"
        assert bot.PAYMENT_METHODS["b"] == "bank_transfer"
        assert bot.PAYMENT_METHODS["o"] == "online"

    def test_reminder_keyboard_has_kinds(self):
        kb = bot.make_reminder_keyboard("bk1")
        flat = [b.callback_data for row in kb.inline_keyboard for b in row]
        assert "remk:bk1:pickup" in flat
        assert "remk:bk1:return" in flat
        assert "remk:bk1:overdue" in flat
        assert "remk:bk1:payment" in flat


class TestCameraKeyboards:
    def test_camera_list_keyboard(self):
        cams = [{"id": "c1", "name": "R50", "daily_rate": 60, "is_available": True},
                {"id": "c2", "name": "Osmo", "daily_rate": 80, "is_available": False}]
        kb = bot.make_camera_list_keyboard(cams)
        flat = [b.callback_data for row in kb.inline_keyboard for b in row]
        assert "cam:c1" in flat and "cam:c2" in flat

    def test_camera_detail_toggle_flips_state(self):
        avail = {"id": "c1", "name": "R50", "daily_rate": 60, "is_available": True}
        kb = bot.make_camera_detail_keyboard(avail)
        flat = [b.callback_data for row in kb.inline_keyboard for b in row]
        assert "camtoggle:c1:0" in flat   # currently available -> offer set unavailable
        assert "camrate:c1" in flat

        unavail = {"id": "c2", "name": "Osmo", "daily_rate": 80, "is_available": False}
        kb2 = bot.make_camera_detail_keyboard(unavail)
        flat2 = [b.callback_data for row in kb2.inline_keyboard for b in row]
        assert "camtoggle:c2:1" in flat2  # currently unavailable -> offer set available


# ─────────────────────────────────────────────────────────
# Telegram callback_data 64-byte limit guard
# ─────────────────────────────────────────────────────────
class TestCallbackDataLimits:
    def _all_callback_data(self, kb):
        return [b.callback_data for row in kb.inline_keyboard
                for b in row if b.callback_data]

    def test_payment_and_reminder_callbacks_under_64_bytes(self):
        uuid = "508eb0ae-1234-5678-9abc-def012345678"  # realistic 36-char id
        kbs = [
            bot.make_payment_type_keyboard(uuid),
            bot.make_payment_method_keyboard(uuid, "bank_transfer"),
            bot.make_reminder_keyboard(uuid),
            bot.make_camera_detail_keyboard({"id": uuid, "name": "X", "daily_rate": 1, "is_available": True}),
            bot.make_confirm_keyboard("recordpay", uuid, "Record RM1234.56", f"dt:{uuid}"),
        ]
        for kb in kbs:
            for cb in self._all_callback_data(kb):
                assert len(cb.encode("utf-8")) <= 64, f"callback too long: {cb} ({len(cb)})"


# ─────────────────────────────────────────────────────────
# Payment / inventory MCP wrappers (mocked)
# ─────────────────────────────────────────────────────────
class _MCPRecorder:
    def __init__(self):
        self.calls = []

    async def call_tool(self, name, args=None):
        self.calls.append((name, args or {}))
        return {"success": True}


@pytest.mark.asyncio
class TestPaymentWrappers:
    async def test_record_payment_calls_correct_tool(self, monkeypatch):
        rec = _MCPRecorder()
        monkeypatch.setattr(bot, "mcp", rec)
        monkeypatch.setattr(bot, "invalidate_cache", lambda *a, **k: None)
        result = await bot.record_payment("bk1", "deposit", 100.0, "cash")
        assert result == {"success": True}
        name, args = rec.calls[0]
        assert name == "captura.payments.admin.record"
        assert args["booking_id"] == "bk1"
        assert args["payment_type"] == "deposit"
        assert args["amount"] == 100.0
        assert args["payment_method"] == "cash"

    async def test_record_payment_returns_none_on_failure(self, monkeypatch):
        monkeypatch.setattr(bot, "mcp", _MCPDown())
        monkeypatch.setattr(bot, "invalidate_cache", lambda *a, **k: None)
        assert await bot.record_payment("bk1", "final", 50.0) is None

    async def test_refund_deposit_passes_amount(self, monkeypatch):
        rec = _MCPRecorder()
        monkeypatch.setattr(bot, "mcp", rec)
        monkeypatch.setattr(bot, "invalidate_cache", lambda *a, **k: None)
        await bot.refund_deposit("bk1", 75.0)
        name, args = rec.calls[0]
        assert name == "captura.payments.admin.mark_deposit_refunded"
        assert args["refund_amount"] == 75.0

    async def test_generate_invoice_calls_tool(self, monkeypatch):
        rec = _MCPRecorder()
        monkeypatch.setattr(bot, "mcp", rec)
        await bot.generate_invoice("bk1")
        assert rec.calls[0][0] == "captura.invoices.admin.generate"


@pytest.mark.asyncio
class TestCameraWrappers:
    async def test_set_availability_calls_tool(self, monkeypatch):
        rec = _MCPRecorder()
        monkeypatch.setattr(bot, "mcp", rec)
        monkeypatch.setattr(bot, "invalidate_cache", lambda *a, **k: None)
        await bot.set_camera_availability("c1", False)
        name, args = rec.calls[0]
        assert name == "captura.cameras.admin.set_availability"
        assert args["is_available"] is False

    async def test_update_rate_calls_tool(self, monkeypatch):
        rec = _MCPRecorder()
        monkeypatch.setattr(bot, "mcp", rec)
        monkeypatch.setattr(bot, "invalidate_cache", lambda *a, **k: None)
        await bot.update_camera_rate("c1", 120.0)
        name, args = rec.calls[0]
        assert name == "captura.cameras.admin.update"
        assert args["daily_rate"] == 120.0
