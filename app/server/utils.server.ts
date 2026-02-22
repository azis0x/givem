// a/s/utils.server.ts
import crypto from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(crypto.scrypt);

const KEY_LEN = 64;
const SALT_LEN = 16;

/**
 * Generate random salt (hex)
 */
export function generateSalt(): string {
  return crypto.randomBytes(SALT_LEN).toString("hex");
}

/**
 * Hash password using scrypt
 *
 * Format: salt:hash
 */
export async function hashPassword(raw: string, salt: string): Promise<string> {
  const derived = (await scryptAsync(raw, salt, KEY_LEN)) as Buffer;

  return `${salt}:${derived.toString("hex")}`;
}

/**
 * Verify password against stored hash
 */
export async function verifyPassword(
  raw: string,
  stored: string,
): Promise<boolean> {
  const [salt, hash] = stored.split(":");

  if (!salt || !hash) {
    return false;
  }

  const derived = (await scryptAsync(raw, salt, KEY_LEN)) as Buffer;

  const hashBuffer = Buffer.from(hash, "hex");

  return crypto.timingSafeEqual(derived, hashBuffer);
}
