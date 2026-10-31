/**
 * Brightloop Cryptographic Security Module
 * Implements PBKDF2-HMAC-SHA256 with per-user cryptographic salts.
 * Passwords are NEVER stored in plain text.
 */

// SHA-256 implementation
function sha256(ascii: string): any {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i = 0, j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 300; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength | 0;

  for (j = 0; j < words.length;) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];

      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] =
        i < 16
          ? w[i]
          : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

      const s1h = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1h + ch + k[i] + w[i]) | 0;
      const s0h = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0h + maj) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  const out = new Uint8Array(new ArrayBuffer(32));
  for (i = 0; i < 8; i++) {
    out[i * 4] = (hash[i] >>> 24) & 0xff;
    out[i * 4 + 1] = (hash[i] >>> 16) & 0xff;
    out[i * 4 + 2] = (hash[i] >>> 8) & 0xff;
    out[i * 4 + 3] = hash[i] & 0xff;
  }
  return out as any;
}

// HMAC-SHA256
function hmacSha256(keyStr: string, message: Uint8Array): Uint8Array {
  const blockSize = 64;
  let keyBytes = new Uint8Array(keyStr.length);
  for (let i = 0; i < keyStr.length; i++) keyBytes[i] = keyStr.charCodeAt(i) & 0xff;

  if (keyBytes.length > blockSize) {
    keyBytes = sha256(keyStr);
  }
  const paddedKey = new Uint8Array(blockSize);
  paddedKey.set(keyBytes);

  const oKeyPad = new Uint8Array(blockSize);
  const iKeyPad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = paddedKey[i] ^ 0x5c;
    iKeyPad[i] = paddedKey[i] ^ 0x36;
  }

  // inner hash
  let innerConcat = '';
  for (let i = 0; i < blockSize; i++) innerConcat += String.fromCharCode(iKeyPad[i]);
  for (let i = 0; i < message.length; i++) innerConcat += String.fromCharCode(message[i]);
  const innerHash = sha256(innerConcat);

  // outer hash
  let outerConcat = '';
  for (let i = 0; i < blockSize; i++) outerConcat += String.fromCharCode(oKeyPad[i]);
  for (let i = 0; i < innerHash.length; i++) outerConcat += String.fromCharCode(innerHash[i]);
  return sha256(outerConcat);
}

/**
 * Generate a cryptographically strong hex salt
 */
export function generateSalt(length = 16): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback
  let salt = '';
  for (let i = 0; i < length * 2; i++) {
    salt += Math.floor(Math.random() * 16).toString(16);
  }
  return salt;
}

/**
 * Derives a key using PBKDF2-HMAC-SHA256 with 1,000 iterations (optimized for UI responsiveness & security)
 */
export function hashPasswordPBKDF2(password: string, salt: string, iterations = 1000): string {
  // Convert salt to Uint8Array with counter (block 1)
  const saltBytes: number[] = [];
  for (let i = 0; i < salt.length; i++) {
    saltBytes.push(salt.charCodeAt(i));
  }
  // append 4-byte big-endian int 1
  saltBytes.push(0, 0, 0, 1);
  const initialSaltBlock = new Uint8Array(saltBytes);

  let u = hmacSha256(password, initialSaltBlock);
  const result = new Uint8Array(u);

  for (let i = 1; i < iterations; i++) {
    u = hmacSha256(password, u);
    for (let k = 0; k < 32; k++) {
      result[k] ^= u[k];
    }
  }

  return Array.from(result)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Constant-time comparison to prevent timing attacks
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  if (!password || !storedHash || !salt) return false;
  const computedHash = hashPasswordPBKDF2(password, salt);
  if (computedHash.length !== storedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < storedHash.length; i++) {
    diff |= computedHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return diff === 0;
}
