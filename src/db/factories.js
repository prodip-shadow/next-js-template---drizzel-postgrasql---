import crypto from "node:crypto";
import { db, schema } from "./drizzle.js";

function hashFactoryPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function buildUserInput(overrides = {}) {
  const uniqueSuffix = crypto.randomBytes(4).toString("hex");
  const password = overrides.password || "Password123!";

  return {
    name: overrides.name || `User ${uniqueSuffix}`,
    email: overrides.email || `user_${uniqueSuffix}@example.com`,
    passwordHash: overrides.passwordHash || hashFactoryPassword(password),
    avatarUrl: overrides.avatarUrl ?? null,
    status: overrides.status || "active",
    emailVerifiedAt:
      overrides.emailVerifiedAt !== undefined
        ? overrides.emailVerifiedAt
        : new Date(),
    twoFactorEnabled: overrides.twoFactorEnabled ?? false,
    twoFactorSecret: overrides.twoFactorSecret ?? null,
    twoFactorRecoveryCodes: overrides.twoFactorRecoveryCodes ?? null,
  };
}

export async function createUserFactory(overrides = {}) {
  const userData = buildUserInput(overrides);
  const settingsData = overrides.settings || {};

  const [user] = await db.insert(schema.users).values(userData).returning();

  const [settings] = await db
    .insert(schema.userSettings)
    .values({
      userId: user.id,
      theme: settingsData.theme || "system",
      language: settingsData.language || "en",
      emailNotifications: settingsData.emailNotifications ?? true,
    })
    .returning();

  return { user, settings };
}

export async function createNotificationFactory(userId, overrides = {}) {
  const [notification] = await db
    .insert(schema.notifications)
    .values({
      userId,
      type: overrides.type || "system",
      title: overrides.title || "Welcome Notification",
      message: overrides.message || "Your account is ready.",
      readAt: overrides.readAt ?? null,
    })
    .returning();

  return notification;
}
