#!/usr/bin/env python3
"""
📸 Captura Booking Bot v2.8
MCP-wired + owner-only + inline keyboards + push alerts + WhatsApp.
"""

import os, sys, asyncio, json, re, subprocess
from datetime import datetime, timezone
from textwrap import dedent
import httpx
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (Application, MessageHandler, CommandHandler, CallbackQueryHandler, filters, ContextTypes)
from telegram.error import Forbidden

# ── Debug logging ───────────────────────────────────────
import logging
logging.basicConfig(
    filename="/tmp/captura-bot-debug.log",
    level=logging.INFO,
    format="%(asctime)s %(message)s"
)
log = logging.getLogger("bot")
log.info("Bot starting")
TOKEN = os.environ.get("CAPTURA_BOT_TOKEN", "")
SB_URL = os.environ.get("SUPABASE_URL", "https://mqpzbzkdtfebzcfoqgta.supabase.co")
SB_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
WA_URL = os.environ.get("WHATSAPP_BRIDGE_URL", "http://localhost:3000")
OWNER = int(os.environ.get("BOT_CHAT_ID", "0"))
ALERT = int(os.environ.get("ALERT_INTERVAL", "60"))

if not TOKEN: print("Set CAPTURA_BOT_TOKEN"); sys.exit(1)
if not SB_KEY: print("Set SUPABASE_SERVICE_ROLE_KEY"); sys.exit(1)

H = {"apikey":SB_KEY,"Authorization":"Bearer "+SB_KEY,"Content-Type":"application/json","Prefer":"return=representation"}
PM = "Markdown"  # v1 — no dot escaping needed
BANNER = os.environ.get("BOT_BANNER","")
MCP_JS = os.path.join(os.path.dirname(__file__),"..","mcp-server","dist","index.js")
CHAT_FILE = os.path.join(os.path.dirname(__file__),".chat_id")

# ── MCP Client ──────────────────────────────────────────
class MCP:
    def __init__(self): self.p=None; self._id=0; self._lk=asyncio.Lock()
    async def _up(self):
        if self.p and self.p.returncode is None: return
        e=os.environ.copy(); e["SUPABASE_SERVICE_ROLE_KEY"]=SB_KEY; e["SUPABASE_URL"]=SB_URL
        self.p=await asyncio.create_subprocess_exec("node",MCP_JS,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,env=e)
        self._id=0
        await self._w("initialize",{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"bot","version":"2.8"}})
        await self._r()
        self.p.stdin.write(b'{"jsonrpc":"2.0","method":"notifications/initialized"}\n'); await self.p.stdin.drain()
    async def _w(self,m,p): self._id+=1; self.p.stdin.write(json.dumps({"jsonrpc":"2.0","id":self._id,"method":m,"params":p}).encode()+b"\n"); await self.p.stdin.drain()
    async def _r(self):
        while True:
            l=await asyncio.wait_for(self.p.stdout.readline(),20)
            if not l: raise ConnectionError("MCP died")
            try: d=json.loads(l)
            except json.JSONDecodeError: continue  # skip log lines
            if "id" not in d: continue
            if "error" in d: raise Exception(d["error"].get("message",str(d["error"])))
            return d.get("result",d)
    async def call(self,name,args=None):
        async with self._lk:
            await self._up()
            await self._w("tools/call",{"name":name,"arguments":args or {}})
            r=await self._r()
            if isinstance(r,dict) and "content" in r:
                for i in r["content"]:
                    if i.get("type")=="text": return json.loads(i["text"])
            return r
    def stop(self):
        if self.p and self.p.returncode is None: self.p.kill()

mcp=MCP()

# ── Camera cache (from MCP) ─────────────────────────────
_cams=[]; _ct=0
async def cams():
    global _cams,_ct
    t=asyncio.get_event_loop().time()
    if _cams and t-_ct<300: return _cams
    r=await mcp.call("captura_cameras_list",{"filter":"all"})
    _cams=r.get("cameras",r) if isinstance(r,dict) else r
    if isinstance(_cams,dict): _cams=_cams.get("cameras",[])
    if not isinstance(_cams,list): _cams=[]
    _ct=t; return _cams

async def find_cam(q):
    for c in await cams():
        n=(c.get("name")or"").lower()
        if q==n or q==(c.get("id")or"")[:8].lower(): return c
    for c in await cams():
        if q in (c.get("name")or"").lower(): return c
    return None

# ── Helpers ─────────────────────────────────────────────
def now(): return datetime.now(timezone.utc).isoformat()
def today(): return datetime.now().strftime("%Y-%m-%d")
def own(up):
    cid=None
    if up.message: cid=up.message.chat_id
    elif up.callback_query and up.callback_query.message: cid=up.callback_query.message.chat_id
    ok = not OWNER or str(cid)==str(OWNER)
    if not ok: print(f"[OWN] blocked cid={cid} OWNER={OWNER}")
    return ok
async def reply(up,txt,**kw):
    m=up.message or (up.callback_query and up.callback_query.message)
    if m: await m.reply_text(txt,parse_mode=PM,**kw)
async def edit(q,txt,**kw):
    await q.message.edit_text(txt,parse_mode=PM,**kw)
async def direct(app,cid,txt,**kw):
    try: await app.bot.send_message(cid,txt,parse_mode=PM,**kw)
    except: pass

# ── Data helpers ────────────────────────────────────────
def nm(b):
    c=b.get("customer")or{}; return c.get("full_name")or c.get("name")or"???"
def cn(b):
    for c in _cams:
        if c.get("id")==b.get("camera_id"): return c.get("name","???")
    return b.get("camera_id","???")[:8]
def se(s):
    return {"pending_approval":"⏳","confirmed":"✅","active":"📦","completed":"🏁","cancelled":"🚫","rejected":"❌"}.get(s,"📋")
def fb(b): return f"{se(b.get('booking_status',''))} *{nm(b)}* — {cn(b)} | {b['start_date']} | RM{b['total_amount']}"

# ── MCP data wrappers (handle metrics nesting) ──────────
async def dash_metrics(period="today"):
    """Return flat metrics dict from dashboard_summary."""
    try:
        r = await mcp.call("captura_admin_dashboard_summary", {"period": period})
        if isinstance(r, dict) and "metrics" in r:
            return r["metrics"]
        print(f"[MCP] dash_metrics({period}) unexpected shape: {list(r.keys()) if isinstance(r,dict) else type(r)}", flush=True)
        return r
    except Exception as e:
        print(f"[MCP] dash_metrics({period}) FAILED: {e}", flush=True)
        return {}

async def next_counts():
    """Return (pickups, returns) counts from next_actions."""
    try:
        na = await mcp.call("captura_bookings_next_actions", {})
        return len(na.get("todays_pickups", [])), len(na.get("todays_returns", []))
    except Exception as e:
        print(f"[MCP] next_counts FAILED: {e}", flush=True)
        return 0, 0

# ── Supabase helpers ────────────────────────────────────
async def db_get(path,params=None):
    async with httpx.AsyncClient(timeout=15) as c:
        r=await c.get(f"{SB_URL}/rest/v1/{path}",headers=H,params=params); r.raise_for_status(); return r.json()
async def db_patch(tbl,body,eq):
    async with httpx.AsyncClient(timeout=10) as c:
        qs="&".join(f"{k}=eq.{v}" for k,v in eq.items())
        r=await c.patch(f"{SB_URL}/rest/v1/{tbl}?{qs}",headers=H,json=body); r.raise_for_status()
async def get_booking(bid):
    d=await db_get(f"bookings?id=eq.{bid}&select=*,customer:customers(id,name,full_name,email,phone,whatsapp)")
    return d[0] if d else None
async def get_pending():
    return await db_get("bookings",{"select":"*,customer:customers(id,name,full_name,email,phone,whatsapp)","booking_status":"eq.pending_approval","order":"created_at.desc","limit":"20"})
async def get_recent(n=5):
    return await db_get("bookings",{"select":"*,customer:customers(id,name,full_name,email,phone,whatsapp)","order":"created_at.desc","limit":str(n)})

# ── WhatsApp ────────────────────────────────────────────
async def send_wa(phone,msg):
    try:
        async with httpx.AsyncClient(timeout=15) as c:
            r=await c.post(f"{WA_URL}/send",json={"phone":re.sub(r'[^\d]','',phone),"message":msg})
            return r.status_code<400
    except: return False
def wa_link(p):
    c=re.sub(r'[^\d]','',p)
    if c.startswith("60"): c="6"+c
    return f"https://wa.me/{c}"

# ── Actions ─────────────────────────────────────────────
async def approve(bid):
    n=now()
    await db_patch("bookings",{"booking_status":"confirmed","status":"confirmed","approved_at":n,"updated_at":n},{"id":bid})
async def reject(bid):
    n=now()
    await db_patch("bookings",{"booking_status":"rejected","status":"cancelled","rejection_reason":"Rejected via bot","updated_at":n},{"id":bid})

# ── Keyboards ───────────────────────────────────────────
def pk(bks):
    bt=[]
    for b in bks:
        bt.append([InlineKeyboardButton("✅ Approve",callback_data=f"ap:{b['id']}"),InlineKeyboardButton("❌ Reject",callback_data=f"rj:{b['id']}")])
        bt.append([InlineKeyboardButton(f"📷 {nm(b)} — {cn(b)} · RM{b['total_amount']} ({b['start_date']})",callback_data=f"dt:{b['id']}")])
    bt.append([InlineKeyboardButton("⚡ APPROVE ALL",callback_data="apall"),InlineKeyboardButton("🔄 Refresh",callback_data="pending")])
    return InlineKeyboardMarkup(bt)

def mm():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("📋 Pending",callback_data="pending")],
        [InlineKeyboardButton("📦 Pickups Today",callback_data="pickups"),InlineKeyboardButton("🔙 Returns Today",callback_data="returns")],
        [InlineKeyboardButton("💰 Pricing",callback_data="pricing"),InlineKeyboardButton("📊 Dashboard",callback_data="dashboard")],
        [InlineKeyboardButton("🕐 Recent",callback_data="recent"),InlineKeyboardButton("📈 Analytics",callback_data="analytics")],
    ])

def ck():
    bt=[]
    for c in sorted(_cams,key=lambda x:x.get("name","")):
        bt.append([InlineKeyboardButton(f"{c['name']} — RM{c['daily_rate']}/day",callback_data=f"check:{c['id']}")])
    bt.append([InlineKeyboardButton("📋 Back",callback_data="menu")])
    return InlineKeyboardMarkup(bt)

def dk(bid,st,phone):
    bt=[]
    if st=="pending_approval":
        bt.append([InlineKeyboardButton("✅ Approve",callback_data=f"ap:{bid}"),InlineKeyboardButton("❌ Reject",callback_data=f"rj:{bid}")])
    elif st=="confirmed":
        bt.append([InlineKeyboardButton("📦 Mark Picked Up",callback_data=f"pu:{bid}")])
    elif st=="active":
        bt.append([InlineKeyboardButton("🔙 Mark Returned",callback_data=f"rt:{bid}")])
    if phone: bt.append([InlineKeyboardButton("💬 WhatsApp",url=wa_link(phone))])
    bt.append([InlineKeyboardButton("🔄 Refresh",callback_data=f"dt:{bid}")])
    bt.append([InlineKeyboardButton("📋 Menu",callback_data="menu")])
    return InlineKeyboardMarkup(bt)

# ── Start keyboard ──────────────────────────────────────
async def start_kb():
    """Build keyboard with live pending count."""
    try:
        pe = await get_pending()
        pc = len(pe)
    except:
        pc = 0
    pn = f" ({pc})" if pc else ""
    return InlineKeyboardMarkup([
        [InlineKeyboardButton(f"📋 Pending{pn}", callback_data="pending"),
         InlineKeyboardButton("📊 Dashboard", callback_data="dashboard")],
        [InlineKeyboardButton("📦 Pickups Today", callback_data="pickups"),
         InlineKeyboardButton("🔙 Returns Today", callback_data="returns")],
        [InlineKeyboardButton("💰 Pricing", callback_data="pricing"),
         InlineKeyboardButton("🔍 Check Camera", callback_data="check_menu")],
        [InlineKeyboardButton("🕐 Recent 5", callback_data="recent"),
         InlineKeyboardButton("📈 Analytics", callback_data="analytics")],
    ])

# ── Callback handler ────────────────────────────────────
async def on_button(up,ctx):
    print(f"[RAW CB] {up.callback_query.data if up.callback_query else 'NO_CB'}", flush=True)
    q=up.callback_query; await q.answer()
    d=q.data
    try:
        if d.startswith("ap:") or d.startswith("rj:"):
            a,bid=d.split(":",1); b=await get_booking(bid)
            if not b: await edit(q,"❌ Not found."); return
            if a=="ap":
                await approve(bid)
                c=b.get("customer")or{}; ph=c.get("whatsapp")or c.get("phone","")
                if ph: await send_wa(ph,f"🎥 *CAPTURA* — {cn(b)} confirmed ✅\n📅 {b['start_date']}→{b['end_date']}\n💰 RM{b['total_amount']}")
                await edit(q,f"✅ *Approved!* {nm(b)} · {cn(b)}\n📅 {b['start_date']} · RM{b['total_amount']}"+("" if ph else "\n⚠️ No phone"),reply_markup=None)
            else:
                await reject(bid); await edit(q,f"❌ Rejected: {nm(b)} · {b['start_date']}",reply_markup=None)
        elif d=="apall":
            bks=await get_pending()
            if not bks: await edit(q,"✨ Nothing!"); return
            for b in bks: await approve(b["id"])
            await edit(q,f"⚡ *{len(bks)} approved!*\n"+"\n".join(f"✅ {nm(b)}" for b in bks),reply_markup=None)
        elif d=="pending":
            bks=await get_pending()
            if not bks: await edit(q,"✨ *Queue empty, boss.* 🏄",reply_markup=mm())
            else: await edit(q,f"📋 *{len(bks)} waiting* — tap:",reply_markup=pk(bks))
        elif d.startswith("dt:"):
            bid=d.split(":",1)[1]; b=await get_booking(bid)
            if not b: await edit(q,"❌ Not found."); return
            c=b.get("customer")or{}; st=b.get("booking_status","?"); ph=c.get("whatsapp")or c.get("phone","")
            txt=f"📷 *{nm(b)}*\n📸 {cn(b)}\n📅 {b['start_date']}→{b['end_date']} · {b['total_days']}d\n💰 RM{b['total_amount']} | Dep RM{b['deposit_amount']}\n📌 {se(st)} {st.replace('_',' ').title()}\n📍 {b.get('pickup_method','?')}\n📧 {c.get('email','?')}\n📱 {c.get('phone','?')}"
            await edit(q,txt,reply_markup=dk(bid,st,ph))
        elif d.startswith("pu:"):
            bid=d.split(":",1)[1]; n=now()
            await db_patch("bookings",{"equipment_picked_up":True,"equipment_pickup_date":n,"status":"active","updated_at":n},{"id":bid})
            await edit(q,f"📦 Picked up: {nm(await get_booking(bid))}",reply_markup=None)
        elif d.startswith("rt:"):
            bid=d.split(":",1)[1]; n=now()
            await db_patch("bookings",{"equipment_returned":True,"equipment_return_date":n,"booking_status":"completed","status":"completed","updated_at":n},{"id":bid})
            await edit(q,f"🔙 Returned: {nm(await get_booking(bid))}",reply_markup=None)
        elif d=="recent":
            bks=await get_recent(5)
            await edit(q,"🕐 *Recent*\n"+"\n".join(fb(b) for b in bks),reply_markup=mm())
        elif d=="pickups":
            td=today()
            bks=await db_get("bookings",{"select":"*,customer:customers(id,name,full_name,email,phone,whatsapp)","booking_status":"eq.confirmed","equipment_picked_up":"eq.false","pickup_date":f"eq.{td}","order":"created_at.desc","limit":"10"})
            if not bks: await edit(q,"📦 No pickups today.",reply_markup=mm())
            else: await edit(q,"📦 *Today's Pickups*\n"+"\n".join(f"• {nm(b)} — {cn(b)} | {b.get('pickup_method','?')}" for b in bks),reply_markup=mm())
        elif d=="returns":
            td=today()
            bks=await db_get("bookings",{"select":"*,customer:customers(id,name,full_name,email,phone,whatsapp)","booking_status":"eq.confirmed","equipment_returned":"eq.false","end_date":f"eq.{td}","order":"created_at.desc","limit":"10"})
            if not bks: await edit(q,"🔙 No returns today.",reply_markup=mm())
            else: await edit(q,"🔙 *Today's Returns*\n"+"\n".join(f"• {nm(b)} — {cn(b)} | RM{b['total_amount']}" for b in bks),reply_markup=mm())
        elif d=="pricing":
            cs=await cams(); ls=["💰 *Pricing (MCP)*\n"]
            for c in cs: ls.append(f"{'✅' if c.get('is_available') else '❌'} *{c['name']}* — RM{c['daily_rate']}/day | Dep RM{c.get('deposit_amount',100)} | {c.get('discount_threshold',3)}d+")
            await edit(q,"\n".join(ls),reply_markup=mm())
        elif d=="dashboard":
            try:
                m = await dash_metrics("today")
                pu_n, re_n = await next_counts()
                await edit(q,(
                    f"📊 *Dashboard*\n\n"
                    f"⏳ Pending: *{m.get('pending_approvals',0)}*\n"
                    f"📦 Pickups: *{pu_n}*\n"
                    f"🔙 Returns: *{re_n}*\n"
                    f"📸 Active: *{m.get('active_bookings',0)}*\n"
                    f"💰 Revenue: *RM {m.get('total_revenue_rm',0):,.0f}*"
                ), reply_markup=mm())
            except:
                pe=await get_pending(); td=today()
                pu=await db_get("bookings",{"select":"id","booking_status":"eq.confirmed","equipment_picked_up":"eq.false","pickup_date":f"eq.{td}"})
                re=await db_get("bookings",{"select":"id","booking_status":"eq.confirmed","equipment_returned":"eq.false","end_date":f"eq.{td}"})
                ac=await db_get("bookings",{"select":"id,total_amount","booking_status":"eq.active"})
                await edit(q,f"📊 *Dashboard*\n⏳ Pending: {len(pe)}\n📦 Pickups: {len(pu)}\n🔙 Returns: {len(re)}\n📸 Active: {len(ac)}\n💰 Value: RM{sum(b.get('total_amount',0) for b in ac)}",reply_markup=mm())
        elif d.startswith("check:"):
            cid=d.split(":",1)[1]
            try:
                r=await mcp.call("captura_cameras_check_availability",{"camera_id":cid,"start_date":today(),"end_date":today()})
                cam=r.get("camera",{})
                if r.get("available"): await edit(q,f"🔍 *{cam.get('name','?')}* — RM{cam.get('daily_rate','?')}/day\n\n✅ Available!",reply_markup=ck())
                else:
                    cf=r.get("conflicts",[]); ds=[f"{c['start_date']}→{c['end_date']}" for c in cf]
                    await edit(q,f"🔍 *{cam.get('name','?')}* — RM{cam.get('daily_rate','?')}/day\n\n❌ Booked:\n"+"\n".join(f"• {d}" for d in ds),reply_markup=ck())
            except Exception as e: await edit(q,f"⚠️ {e}",reply_markup=ck())
        elif d=="check_menu": await edit(q,"🔍 *Check availability*",reply_markup=ck())
        elif d=="analytics":
            at_rev = at_comp = 0
            try:
                c_all = await db_get("bookings", {"select": "id", "booking_status": "eq.completed", "limit": "200"})
                at_comp = len(c_all) if isinstance(c_all, list) else 0
                b_all = await db_get("bookings", {"select": "total_amount", "or": "(booking_status.eq.completed,booking_status.eq.active)", "limit": "200"})
                at_rev = sum(b.get("total_amount", 0) for b in b_all) if isinstance(b_all, list) else 0
            except:
                pass
            mo_bk = mo_rev = 0
            try:
                mm_m = await dash_metrics("month")
                mo_rev = mm_m.get("total_revenue_rm", 0)
                mo_bk = mm_m.get("new_bookings", 0)
            except:
                pass
            try:
                mt = await dash_metrics("today")
            except:
                mt = {}
            await edit(q, (
                "📈 *Analytics*\n"
                "━━━━━━━━━━━━━━━━━━━━\n\n"
                "*Today*\n"
                f"  💰 Revenue:  *RM {mt.get('total_revenue_rm', 0):,.0f}*\n"
                f"  🆕 New:      *{mt.get('new_bookings', 0)}* bookings\n\n"
                "*This Month*\n"
                f"  💰 Revenue:  *RM {mo_rev:,.0f}*\n"
                f"  🆕 New:      *{mo_bk}* bookings\n\n"
                "*All-Time*\n"
                f"  💰 Revenue:  *RM {at_rev:,.0f}*\n"
                f"  🏁 Completed: *{at_comp}* bookings\n"
                f"  📸 Active:    *{mt.get('active_bookings', 0)}*\n\n"
                "━━━━━━━━━━━━━━━━━━━━━━\n"
                "_v2.8 · MCP · Owner_"
            ), reply_markup=mm())
        elif d=="menu": await edit(q,"📸 *Command Center*",reply_markup=mm())
        elif d=="help":
            await edit(q,(
                "📸 *Captura Bot v2.8*\n\n"
                "📋 `pending` — review & approve bookings\n"
                "💰 `pricing` — camera rates & deposits\n"
                "📊 `dashboard` — live KPIs & revenue\n"
                "🔍 `check r50` — camera availability\n"
                "🕐 `recent` — last 5 bookings\n"
                "📈 `analytics` — all-time & monthly stats\n"
                "✅ `approve haz` — quick approve\n"
                "❌ `reject haz` — quick reject\n"
                "📦 `pickup haz` / `return haz`\n\n"
                "_MCP-connected · Owner-only_"
            ), reply_markup=mm())
    except Exception as e:
        try: await edit(q,f"💥 {e}",reply_markup=mm())
        except: pass

# ── Text commands ───────────────────────────────────────
async def handle_msg(up,ctx):
    if not own(up): return
    if not up.message or not up.message.text: return
    t=up.message.text.strip().lower(); a=t.split(); c=a[0]
    try:
        if c=="pending":
            bks=await get_pending()
            if not bks: await reply(up,"✨ *Queue empty, boss.* ☕",reply_markup=mm())
            else: await reply(up,f"📋 *{len(bks)} waiting*",reply_markup=pk(bks))
        elif c=="menu": await reply(up,"📸 *Command Center*",reply_markup=mm())
        elif c=="recent":
            bks=await get_recent(5); await reply(up,"🕐 *Recent*\n"+"\n".join(fb(b) for b in bks))
        elif c in("pricing","price"):
            cs=await cams(); ls=["💰 *Pricing (MCP)*\n"]
            for c in cs: ls.append(f"{'✅' if c.get('is_available') else '❌'} *{c['name']}* — RM{c['daily_rate']}/day | Dep RM{c.get('deposit_amount',100)} | {c.get('discount_threshold',3)}d+")
            await reply(up,"\n".join(ls))
        elif c in("dashboard","stats"):
            try:
                m = await dash_metrics("today")
                pu_n, re_n = await next_counts()
                await reply(up,(
                    f"📊 *Dashboard*\n\n"
                    f"⏳ Pending: *{m.get('pending_approvals',0)}*\n"
                    f"📦 Pickups: *{pu_n}*\n"
                    f"🔙 Returns: *{re_n}*\n"
                    f"📸 Active: *{m.get('active_bookings',0)}*\n"
                    f"💰 Revenue: *RM {m.get('total_revenue_rm',0):,.0f}*"
                ))
            except:
                pe=await get_pending(); td=today()
                pu=await db_get("bookings",{"select":"id","booking_status":"eq.confirmed","equipment_picked_up":"eq.false","pickup_date":f"eq.{td}"})
                re=await db_get("bookings",{"select":"id","booking_status":"eq.confirmed","equipment_returned":"eq.false","end_date":f"eq.{td}"})
                ac=await db_get("bookings",{"select":"id,total_amount","booking_status":"eq.active"})
                await reply(up,f"📊 *Dashboard*\n⏳ Pending: {len(pe)}\n📦 Pickups: {len(pu)}\n🔙 Returns: {len(re)}\n📸 Active: {len(ac)}\n💰 Value: RM{sum(b.get('total_amount',0) for b in ac)}")
        elif c=="check" and len(a)>=2:
            q=" ".join(a[1:]); cam=await find_cam(q)
            if not cam: await reply(up,f"❌ '{q}' not found. Try: r50, action, fuji"); return
            r=await mcp.call("captura_cameras_check_availability",{"camera_id":cam["id"],"start_date":today(),"end_date":today()})
            if r.get("available"): await reply(up,f"🔍 *{cam['name']}* — RM{cam['daily_rate']}/day\n\n✅ Available!")
            else:
                cf=r.get("conflicts",[]); ds=[f"{c['start_date']}→{c['end_date']}" for c in cf]
                await reply(up,f"🔍 *{cam['name']}* — RM{cam['daily_rate']}/day\n\n❌ Booked:\n"+"\n".join(f"• {d}" for d in ds))
        elif c in("approve","reject","pickup","return","cancel"):
            if len(a)<2: await reply(up,f"`{c} <name or ID>`"); return
            q=" ".join(a[1:]); bks=[]
            try: bks=await db_get(f"bookings?id=eq.{q}&select=*,customer:customers(id,name,full_name,email,phone,whatsapp)")
            except: pass
            if not bks:
                try: bks=await db_get("bookings",{"select":"*,customer:customers!inner(id,name,full_name,email,phone,whatsapp)","or":f"(full_name.ilike.*{q}*,name.ilike.*{q}*)","order":"created_at.desc","limit":"5"})
                except: pass
            if not bks: await reply(up,f"❌ Nothing for '{q}'"); return
            if len(bks)>1:
                await reply(up,"Few matches:\n"+"\n".join(f"`{b['id'][:8]}` {nm(b)} — {b['start_date']}" for b in bks[:5])); return
            b=bks[0]; n=now()
            if c=="approve":
                await approve(b["id"]); cc=b.get("customer")or{}; ph=cc.get("whatsapp")or cc.get("phone","")
                if ph: await send_wa(ph,f"🎥 *CAPTURA* — {cn(b)} confirmed ✅\n📅 {b['start_date']}→{b['end_date']}\n💰 RM{b['total_amount']}")
                await reply(up,f"✅ Approved: {nm(b)} — {cn(b)} · RM{b['total_amount']}")
            elif c=="reject": await reject(b["id"]); await reply(up,f"❌ Rejected: {nm(b)}")
            elif c=="pickup": await db_patch("bookings",{"equipment_picked_up":True,"equipment_pickup_date":n,"status":"active","updated_at":n},{"id":b["id"]}); await reply(up,f"📦 Picked up: {nm(b)}")
            elif c=="return": await db_patch("bookings",{"equipment_returned":True,"equipment_return_date":n,"booking_status":"completed","status":"completed","updated_at":n},{"id":b["id"]}); await reply(up,f"🔙 Returned: {nm(b)}")
            elif c=="cancel": await db_patch("bookings",{"booking_status":"cancelled","status":"cancelled","updated_at":n},{"id":b["id"]}); await reply(up,f"🚫 Cancelled: {nm(b)}")
    except Exception as e: await reply(up,f"💥 {e}")

# ── Command handlers ────────────────────────────────────
async def cmd_start(up, ctx):
    print(f"[START] from={up.message.chat_id if up.message else '?'}", flush=True)
    if not own(up): return
    if up.message:
        try:
            with open(CHAT_FILE, "w") as f:
                f.write(str(up.message.chat_id))
        except:
            pass

    # Fetch live stats
    pe_n = pu_n = re_n = ac_n = rev = rev_m = comp_n = 0
    try:
        m = await dash_metrics("today")
        pe_n = m.get("pending_approvals", 0)
        ac_n = m.get("active_bookings", 0)
        rev = m.get("total_revenue_rm", 0)
    except:
        pass
    try:
        mm_m = await dash_metrics("month")
        rev_m = mm_m.get("total_revenue_rm", 0)
    except:
        pass
    try:
        pu_n, re_n = await next_counts()
    except:
        pass
    try:
        comp = await db_get("bookings", {"select": "id", "booking_status": "eq.completed", "limit": "200"})
        comp_n = len(comp) if isinstance(comp, list) else 0
    except:
        pass

    caption = (
        "*📸 C A P T U R A*\n"
        "━━━━━━━━━━━━━━━━━━━\n"
        "  *Camera Rental*\n\n"
        f"⏳ `{pe_n:>3}` Pending   📦 `{pu_n:>3}` Pickups\n"
        f"🔙 `{re_n:>3}` Return    📸 `{ac_n:>3}` Active\n\n"
        f"💰  *RM {rev:,.0f}* today\n"
        f"📅  *RM {rev_m:,.0f}* this month\n"
        f"🏁  *{comp_n}* completed\n\n"
        "━━━━━━━━━━━━━━━━━━━━━\n"
        "_v2.8 · MCP · Owner_"
    )

    kb = await start_kb()
    if BANNER:
        try:
            await up.message.reply_photo(
                photo=BANNER, caption=caption, parse_mode=PM, reply_markup=kb
            )
            return
        except:
            pass
    await reply(up, caption, reply_markup=kb)

async def cmd_help(up,ctx):
    if not own(up): return
    await reply(up,(
        "📸 *Captura Bot v2.8*\n\n"
        "📋 `pending` — review & approve bookings\n"
        "💰 `pricing` — camera rates & deposits\n"
        "📊 `dashboard` — live KPIs & revenue\n"
        "🔍 `check r50` — camera availability\n"
        "🕐 `recent` — last 5 bookings\n"
        "📈 `analytics` — all-time & monthly stats\n"
        "✅ `approve haz` — quick approve\n"
        "❌ `reject haz` — quick reject\n"
        "📦 `pickup haz` / `return haz`\n\n"
        "_MCP-connected · Owner-only_"
    ), reply_markup=mm())

async def cmd_pending(up,ctx):
    if not own(up): return
    bks=await get_pending()
    if not bks: await reply(up,"✨ *Queue empty.* ☕",reply_markup=mm())
    else: await reply(up,f"📋 *{len(bks)} waiting*",reply_markup=pk(bks))

async def cmd_menu(up,ctx):
    if not own(up): return
    await reply(up,"📸 *Command Center*",reply_markup=mm())

async def cmd_pricing(up,ctx):
    if not own(up): return
    cs=await cams(); ls=["💰 *Pricing (MCP)*\n"]
    for c in cs: ls.append(f"{'✅' if c.get('is_available') else '❌'} *{c['name']}* — RM{c['daily_rate']}/day | Dep RM{c.get('deposit_amount',100)}")
    await reply(up,"\n".join(ls))

async def cmd_dash(up,ctx):
    if not own(up): return
    try:
        m = await dash_metrics("today")
        pu_n, re_n = await next_counts()
        await reply(up,(
            f"📊 *Dashboard*\n\n"
            f"⏳ Pending: *{m.get('pending_approvals',0)}*\n"
            f"📦 Pickups: *{pu_n}*\n"
            f"🔙 Returns: *{re_n}*\n"
            f"📸 Active: *{m.get('active_bookings',0)}*\n"
            f"💰 Revenue: *RM {m.get('total_revenue_rm',0):,.0f}*"
        ))
    except: await reply(up,"⚠️ MCP unavailable")

async def cmd_recent(up,ctx):
    if not own(up): return
    bks=await get_recent(5); await reply(up,"🕐 *Recent*\n"+"\n".join(fb(b) for b in bks))

# ── Push alerts ─────────────────────────────────────────
class AT:
    def __init__(self): self.s=set(); self.d=False
    def new(self,bks):
        r=[]
        for b in bks:
            if b["id"] not in self.s: r.append(b); self.s.add(b["id"])
        return r
    def ok(self):
        n=datetime.now()
        if n.hour==9 and not self.d: return True
        if n.hour>9: self.d=False
        return False
    def mark(self): self.d=True
tr=AT()

async def poll(app,cid):
    while True:
        try:
            await asyncio.sleep(ALERT)
            pe=await get_pending(); nw=tr.new(pe)
            if nw:
                for b in nw:
                    c=b.get("customer")or{}
                    await direct(app,cid,f"🔔 *New Booking!*\n\n📷 {nm(b)}\n📸 {cn(b)}\n📅 {b['start_date']}→{b['end_date']} · {b['total_days']}d\n💰 RM{b['total_amount']}\n📱 {c.get('phone','?')}",
                        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("📋 Review",callback_data=f"dt:{b['id']}"),InlineKeyboardButton("✅ Approve",callback_data=f"ap:{b['id']}")]]))
            if tr.ok():
                td=today()
                pu=await db_get("bookings",{"select":"id","booking_status":"eq.confirmed","equipment_picked_up":"eq.false","pickup_date":f"eq.{td}"})
                re=await db_get("bookings",{"select":"id","booking_status":"eq.confirmed","equipment_returned":"eq.false","end_date":f"eq.{td}"})
                ac=await db_get("bookings",{"select":"id,total_amount","booking_status":"eq.active"})
                await direct(app,cid,f"🌅 *Good morning!*\n\n📋 {td}\n📦 Pickups: *{len(pu)}*\n🔙 Returns: *{len(re)}*\n📸 Active: *{len(ac)}*\n💰 Value: *RM{sum(b.get('total_amount',0) for b in ac)}*\n⏳ Pending: *{len(pe)}*\n\nType `pending` to review.")
                tr.mark()
        except Exception as e: print(f"Poll: {e}"); await asyncio.sleep(10)

# ── Main ────────────────────────────────────────────────
def main():
    app=Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start",cmd_start))
    app.add_handler(CommandHandler("help",cmd_help))
    app.add_handler(CommandHandler("pending",cmd_pending))
    app.add_handler(CommandHandler("menu",cmd_menu))
    app.add_handler(CommandHandler("pricing",cmd_pricing))
    app.add_handler(CommandHandler("dashboard",cmd_dash))
    app.add_handler(CommandHandler("recent",cmd_recent))
    app.add_handler(CallbackQueryHandler(on_button))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND,handle_msg))
    if OWNER:
        asyncio.get_event_loop().create_task(poll(app,OWNER))
        print(f"🔔 Push ON (every {ALERT}s → {OWNER})")
    else: print("⚠️  No owner set — push disabled")
    print("📸 Captura Bot v2.8 (MCP + owner-only)")
    try: app.run_polling(drop_pending_updates=True)
    except Exception as e:
        print(f"FATAL: {e}")
        raise
    finally: mcp.stop()

if __name__=="__main__": main()
