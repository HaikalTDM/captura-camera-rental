import { createHash } from 'node:crypto';
import { config } from '../config.js';

const API_KEY_HASH = config.mcpApiKey
  ? createHash('sha256').update(config.mcpApiKey).digest('hex')
  : null;

export function validateApiKey(key: string): boolean {
  if (!API_KEY_HASH || !key || key.length < 8) {
    return false;
  }
  return createHash('sha256').update(key).digest('hex') === API_KEY_HASH;
}

export function isAuthRequired(): boolean {
  return Boolean(config.mcpApiKey);
}

export function getAuthTokenFromArgs(args: Record<string, unknown>): string | undefined {
  return typeof args._apiKey === 'string' ? args._apiKey : undefined;
}
