import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
// Load from parent .env.local first, then override with local .env
dotenv.config({ path: resolve(__dirname, '..', '..', '.env.local') });
dotenv.config({ path: resolve(__dirname, '..', '.env') });
function requireEnv(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
export const config = {
    mcpApiKey: process.env.MCP_API_KEY || '',
    supabaseUrl: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    supabaseServiceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    serverName: 'captura',
    serverVersion: '1.0.0',
    requireAuth: Boolean(process.env.MCP_API_KEY),
};
//# sourceMappingURL=config.js.map