import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config.js';

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) {
    return adminClient;
  }

  adminClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}

export function logQueryError(context: string, error: unknown): void {
  if (error && typeof error === 'object') {
    const pgError = error as { message?: string; details?: string; hint?: string; code?: string };
    console.error(`[${context}]`, {
      message: pgError.message,
      details: pgError.details,
      hint: pgError.hint,
      code: pgError.code,
    });
    return;
  }
  console.error(`[${context}]`, error);
}

export class SupabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseError';
  }
}
