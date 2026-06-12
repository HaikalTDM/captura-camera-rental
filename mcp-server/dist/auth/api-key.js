import { createHash } from 'node:crypto';
import { config } from '../config.js';
const API_KEY_HASH = config.mcpApiKey
    ? createHash('sha256').update(config.mcpApiKey).digest('hex')
    : null;
export function validateApiKey(key) {
    if (!API_KEY_HASH || !key || key.length < 8) {
        return false;
    }
    return createHash('sha256').update(key).digest('hex') === API_KEY_HASH;
}
export function isAuthRequired() {
    return Boolean(config.mcpApiKey);
}
export function getAuthTokenFromArgs(args) {
    return typeof args._apiKey === 'string' ? args._apiKey : undefined;
}
//# sourceMappingURL=api-key.js.map