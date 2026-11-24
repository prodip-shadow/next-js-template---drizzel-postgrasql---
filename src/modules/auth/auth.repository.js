import { and, eq, gt, isNull } from "drizzle-orm";
import { db, schema } from "@/db/drizzle";

export async function findUserByEmail(email) {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return user || null;
}

export async function findUserById(id) {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return user || null;
}

export async function createUserWithSettings(userData) {
  const [user] = await db.insert(schema.users).values(userData).returning();

  try {
    await db.insert(schema.userSettings).values({
      userId: user.id,
      theme: "system",
      language: "en",
      emailNotifications: true,
    });
  } catch (error) {
    await db.delete(schema.users).where(eq(schema.users.id, user.id));
    throw error;
  }

  return user;
}

export async function markUserEmailVerified(userId) {
  const [user] = await db
    .update(schema.users)
    .set({
      emailVerifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, userId))
    .returning();
  return user || null;
}

export async function updateUserPassword(userId, passwordHash) {
  const [user] = await db
    .update(schema.users)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, userId))
    .returning();
  return user || null;
}

export async function updateUserTwoFactor(
  userId,
  { twoFactorEnabled, twoFactorSecret, twoFactorRecoveryCodes }
) {
  const [user] = await db
    .update(schema.users)
    .set({
      twoFactorEnabled,
      twoFactorSecret,
      twoFactorRecoveryCodes,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, userId))
    .returning();
  return user || null;
}

export async function createSession({
  userId,
  tokenHash,
  ipAddress = null,
  userAgent = null,
  expiresAt,
}) {
  const [session] = await db
    .insert(schema.sessions)
    .values({
      userId,
      tokenHash,
      ipAddress,
      userAgent,
      expiresAt,
    })
    .returning();
  return session;
}

export async function findActiveSessionWithUser(tokenHash, now = new Date()) {
  const [row] = await db
    .select({
      session: schema.sessions,
      user: schema.users,
      settings: schema.userSettings,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .leftJoin(
      schema.userSettings,
      eq(schema.userSettings.userId, schema.users.id)
    )
    .where(
      and(
        eq(schema.sessions.tokenHash, tokenHash),
        gt(schema.sessions.expiresAt, now)
      )
    )
    .limit(1);

  return row || null;
}

export async function deleteSessionByTokenHash(tokenHash) {
  await db.delete(schema.sessions).where(eq(schema.sessions.tokenHash, tokenHash));
}

export async function deleteUserSessions(userId) {
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
}

export async function updateSessionLastConfirmed(sessionId, confirmedAt = new Date()) {
  const [session] = await db
    .update(schema.sessions)
    .set({ lastConfirmedAt: confirmedAt })
    .where(eq(schema.sessions.id, sessionId))
    .returning();
  return session || null;
}

export async function createEmailVerificationToken({ userId, tokenHash, expiresAt }) {
  const [record] = await db
    .insert(schema.emailVerificationTokens)
    .values({ userId, tokenHash, expiresAt })
    .returning();
  return record;
}

export async function findValidEmailVerificationToken(tokenHash) {
  const [record] = await db
    .select()
    .from(schema.emailVerificationTokens)
    .where(
      and(
        eq(schema.emailVerificationTokens.tokenHash, tokenHash),
        gt(schema.emailVerificationTokens.expiresAt, new Date())
      )
    )
    .limit(1);
  return record || null;
}

export async function deleteEmailVerificationTokensByUserId(userId) {
  await db
    .delete(schema.emailVerificationTokens)
    .where(eq(schema.emailVerificationTokens.userId, userId));
}

export async function createPasswordResetToken({ userId, tokenHash, expiresAt }) {
  const [record] = await db
    .insert(schema.passwordResetTokens)
    .values({ userId, tokenHash, expiresAt })
    .returning();
  return record;
}

export async function findValidPasswordResetToken(tokenHash) {
  const [record] = await db
    .select()
    .from(schema.passwordResetTokens)
    .where(
      and(
        eq(schema.passwordResetTokens.tokenHash, tokenHash),
        isNull(schema.passwordResetTokens.usedAt),
        gt(schema.passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1);
  return record || null;
}

export async function markPasswordResetTokenUsed(tokenId) {
  await db
    .update(schema.passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(schema.passwordResetTokens.id, tokenId));
}
