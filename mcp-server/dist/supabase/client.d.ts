import { SupabaseClient } from '@supabase/supabase-js';
export declare function getSupabaseAdmin(): SupabaseClient;
export declare function logQueryError(context: string, error: unknown): void;
export declare class SupabaseError extends Error {
    constructor(message: string);
}
//# sourceMappingURL=client.d.ts.map