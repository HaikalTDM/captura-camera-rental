#!/bin/bash
# Start Captura Booking Bot v2
# Reads SUPABASE_SERVICE_ROLE_KEY from project .env.local
# Reads CAPTURA_BOT_TOKEN from bot/.env
# Auto-detects BOT_CHAT_ID from bot/.chat_id (set by /start)

cd "$(dirname "$0")/.."

# Load Supabase key
if [ -f .env.local ]; then
    export $(grep SUPABASE_SERVICE_ROLE_KEY .env.local | xargs)
fi

# Load bot token
if [ -f bot/.env ]; then
    export $(grep CAPTURA_BOT_TOKEN bot/.env | xargs)
fi

# Auto-detect chat ID for push alerts
if [ -f bot/.chat_id ]; then
    export BOT_CHAT_ID=$(cat bot/.chat_id)
    echo "🔔 Chat ID: $BOT_CHAT_ID"
fi

if [ -z "$CAPTURA_BOT_TOKEN" ]; then
    echo "Set CAPTURA_BOT_TOKEN in bot/.env"
    exit 1
fi

exec .venv-bot/bin/python bot/captura_bot.py
