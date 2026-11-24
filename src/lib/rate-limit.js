import { eq } from "drizzle-orm";
import { db, schema } from "@/db/drizzle";
import { RATE_LIMIT_CONFIG } from "./config";
import { AppError } from "./errors";

export async function assertNotRateLimited(key) {
  const [record] = await db
    .select()
    .from(schema.rateLimits)
    .where(eq(schema.rateLimits.key, key))
    .limit(1);

  if (!record) return;

  const now = new Date();
  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil.getTime() - now.getTime()) / 1000);
    throw new AppError(
      `Too many attempts. Please try again in ${remainingSeconds} seconds.`,
      429,
      "RATE_LIMITED"
    );
  }
}

export async function recordFailedAttempt(
  key,
  {
    maxAttempts = RATE_LIMIT_CONFIG.loginMaxAttempts,
    windowMs = RATE_LIMIT_CONFIG.loginWindowMs,
    lockoutMs = RATE_LIMIT_CONFIG.loginLockoutMs,
  } = {}
) {
  const now = new Date();
  const [existing] = await db
    .select()
    .from(schema.rateLimits)
    .where(eq(schema.rateLimits.key, key))
    .limit(1);

  if (!existing || existing.resetAt <= now) {
    const nextReset = new Date(now.getTime() + windowMs);
    if (!existing) {
      await db.insert(schema.rateLimits).values({
        key,
        attempts: 1,
        resetAt: nextReset,
        lockedUntil: maxAttempts <= 1 ? new Date(now.getTime() + lockoutMs) : null,
      });
    } else {
      await db
        .update(schema.rateLimits)
        .set({
          attempts: 1,
          resetAt: nextReset,
          lockedUntil: maxAttempts <= 1 ? new Date(now.getTime() + lockoutMs) : null,
        })
        .where(eq(schema.rateLimits.id, existing.id));
    }
    return;
  }

  const nextAttempts = existing.attempts + 1;
  const lockedUntil =
    nextAttempts >= maxAttempts ? new Date(now.getTime() + lockoutMs) : null;

  await db
    .update(schema.rateLimits)
    .set({
      attempts: nextAttempts,
      lockedUntil,
    })
    .where(eq(schema.rateLimits.id, existing.id));
}

export async function clearRateLimit(key) {
  await db.delete(schema.rateLimits).where(eq(schema.rateLimits.key, key));
}
