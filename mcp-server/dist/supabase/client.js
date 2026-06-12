import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
let adminClient = null;
export function getSupabaseAdmin() {
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
export function logQueryError(context, error) {
    if (error && typeof error === 'object') {
        const pgError = error;
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
    constructor(message) {
        super(message);
        this.name = 'SupabaseError';
    }
}
//# sourceMappingURL=client.js.map