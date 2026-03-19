import { NextRequest, NextResponse } from 'next/server';
import {
  serializeAdminSettings,
  type AdminSettingsState,
  type SerializedBusinessSetting,
} from '@/lib/business-settings';
import { getAdminSettings } from '@/lib/business-settings-server';
import { supabaseAdmin } from '@/lib/supabase';

async function saveSettingsPayload(entries: SerializedBusinessSetting[]) {
  const schemaAttempts = [
    {
      payload: entries.map((entry) => ({
        setting_key: entry.key,
        setting_value: entry.value,
      })),
      onConflict: 'setting_key',
    },
    {
      payload: entries.map((entry) => ({
        key: entry.key,
        value: entry.value,
      })),
      onConflict: 'key',
    },
  ] as const;

  let lastError: { code?: string | null } | null = null;

  for (const attempt of schemaAttempts) {
    const { error } = await supabaseAdmin.from('business_settings').upsert(attempt.payload, {
      onConflict: attempt.onConflict,
    });

    if (!error) {
      return null;
    }

    lastError = error;

    if (error.code !== '42703') {
      return error;
    }
  }

  return lastError;
}

export async function GET() {
  try {
    const settings = await getAdminSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { settings?: AdminSettingsState };

    if (!body.settings) {
      return NextResponse.json({ success: false, error: 'Missing settings payload' }, { status: 400 });
    }

    const payload = serializeAdminSettings(body.settings);
    const error = await saveSettingsPayload(payload);

    if (error) {
      console.error('Error saving admin settings:', error);
      return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
    }

    const settings = await getAdminSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}
