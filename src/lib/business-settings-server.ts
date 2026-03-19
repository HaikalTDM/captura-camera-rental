import { supabaseAdmin } from '@/lib/supabase';
import {
  defaultAdminSettings,
  mapBusinessSettingsRowsToState,
  type AdminSettingsState,
  type BusinessSettingsRow,
} from '@/lib/business-settings';

export async function getAdminSettings(): Promise<AdminSettingsState> {
  const { data, error } = await supabaseAdmin.from('business_settings').select('*');

  if (error) {
    console.error('Error loading business settings:', error);
    return defaultAdminSettings;
  }

  return mapBusinessSettingsRowsToState((data as BusinessSettingsRow[]) || []);
}
