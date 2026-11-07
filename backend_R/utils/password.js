import crypto from 'node:crypto';

/**
 * Creates a cryptographically secure random 16-byte salt,
 * derives a 64-byte key using memory-hard scrypt,
 * and returns the format: `${salt}:${hash}`
 */
export function hashPassword(password) {
  if (!password) {
    throw new Error('Password is required for hashing');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plaintext password against a stored salted hash.
 * Uses timingSafeEqual to protect against timing attacks.
 * Includes backward compatibility for existing unhashed accounts.
 */
export function verifyPassword(password, storedPassword) {
  if (!password || !storedPassword) {
    return false;
  }

  // Salted format: "salt:hash"
  if (storedPassword.includes(':')) {
    try {
      const [salt, key] = storedPassword.split(':');
      if (!salt || !key) return false;

      const keyBuffer = Buffer.from(key, 'hex');
      const derivedKey = crypto.scryptSync(password, salt, 64);

      if (keyBuffer.length !== derivedKey.length) {
        return false;
      }

      return crypto.timingSafeEqual(keyBuffer, derivedKey);
    } catch (err) {
      console.error('Password verification error:', err);
      return false;
    }
  }

  // Legacy fallback: direct match for initial plaintext seeds
  return password === storedPassword;
}

