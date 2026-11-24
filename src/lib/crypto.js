import crypto from "node:crypto";
import { AUTH_CONFIG } from "./config";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, keyHex] = storedHash.split(":");
  if (!salt || !keyHex) return false;

  const expectedBuffer = Buffer.from(keyHex, "hex");
  const actualBuffer = crypto.scryptSync(password, salt, 64);

  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function encodeBase32(buffer) {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function decodeBase32(input) {
  const cleaned = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes = [];

  for (const char of cleaned) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

function generateTotpAtCounter(secretBase32, counter) {
  const key = decodeBase32(secretBase32);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binary % 1_000_000).padStart(6, "0");
}

export function generateTwoFactorSecret() {
  return encodeBase32(crypto.randomBytes(20));
}

export function buildOtpAuthUrl({ email, secret, issuer = AUTH_CONFIG.twoFactorIssuer }) {
  const label = encodeURIComponent(`${issuer}:${email}`);
  const encodedIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

export function verifyTotpCode(secretBase32, code, window = 1) {
  if (!secretBase32 || !code) return false;
  const normalized = String(code).trim();
  if (!/^\d{6}$/.test(normalized)) return false;

  const currentCounter = Math.floor(Date.now() / 1000 / 30);
  const targetBuf = Buffer.from(normalized, "utf8");

  for (let offset = -window; offset <= window; offset += 1) {
    const candidate = generateTotpAtCounter(secretBase32, currentCounter + offset);
    const candidateBuf = Buffer.from(candidate, "utf8");
    if (crypto.timingSafeEqual(candidateBuf, targetBuf)) {
      return true;
    }
  }

  return false;
}

export function generateRecoveryCodes(count = 8) {
  const plainCodes = [];
  const hashedCodes = [];

  for (let i = 0; i < count; i += 1) {
    const code = `${crypto.randomBytes(2).toString("hex")}-${crypto.randomBytes(2).toString("hex")}`.toUpperCase();
    plainCodes.push(code);
    hashedCodes.push(hashToken(code));
  }

  return { plainCodes, hashedCodes };
}

export function verifyAndConsumeRecoveryCode(code, hashedCodesJson) {
  if (!code || !hashedCodesJson) {
    return { valid: false, remainingHashedCodesJson: hashedCodesJson };
  }

  let hashedList = [];
  try {
    hashedList = JSON.parse(hashedCodesJson);
  } catch {
    return { valid: false, remainingHashedCodesJson: hashedCodesJson };
  }

  if (!Array.isArray(hashedList)) {
    return { valid: false, remainingHashedCodesJson: hashedCodesJson };
  }

  const candidateHash = hashToken(String(code).trim().toUpperCase());
  const matchIndex = hashedList.findIndex((h) => h === candidateHash);

  if (matchIndex === -1) {
    return { valid: false, remainingHashedCodesJson: hashedCodesJson };
  }

  const remaining = hashedList.filter((_, idx) => idx !== matchIndex);
  return {
    valid: true,
    remainingHashedCodesJson: JSON.stringify(remaining),
  };
}
