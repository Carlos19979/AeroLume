import { randomBytes, createHash } from 'crypto';

const KEY_PREFIX = 'ak_';
const KEY_BYTE_LENGTH = 20; // 40 hex chars

/** Generate a new raw API key: ak_<40 hex chars> */
export function generateApiKey(): string {
  const bytes = randomBytes(KEY_BYTE_LENGTH);
  return KEY_PREFIX + bytes.toString('hex');
}

/** SHA-256 hash of the raw key (this is what we store) */
export function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

/** Extract the prefix for display: "ak_3f8a1b2c" */
export function getKeyPrefix(rawKey: string): string {
  return rawKey.slice(0, 11); // "ak_" + 8 hex chars
}
