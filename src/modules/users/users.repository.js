import { eq } from "drizzle-orm";
import { db, schema } from "@/db/drizzle";

export async function findUserById(userId) {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  return user || null;
}

export async function findUserByEmail(email) {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return user || null;
}

export async function findUserSettings(userId) {
  const [settings] = await db
    .select()
    .from(schema.userSettings)
    .where(eq(schema.userSettings.userId, userId))
    .limit(1);
  return settings || null;
}

export async function updateUserProfile(userId, { name, email, emailVerifiedAt }) {
  const updateData = {
    name,
    email,
    updatedAt: new Date(),
  };

  if (emailVerifiedAt !== undefined) {
    updateData.emailVerifiedAt = emailVerifiedAt;
  }

  const [user] = await db
    .update(schema.users)
    .set(updateData)
    .where(eq(schema.users.id, userId))
    .returning();
  return user || null;
}

export async function updateUserAvatar(
  userId,
  { avatarUrl, avatarPublicId, avatarProvider }
) {
  const [user] = await db
    .update(schema.users)
    .set({
      avatarUrl,
      avatarPublicId,
      avatarProvider,
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

export async function upsertUserSettings(userId, settingsPatch) {
  const existing = await findUserSettings(userId);

  if (!existing) {
    const [created] = await db
      .insert(schema.userSettings)
      .values({
        userId,
        theme: settingsPatch.theme || "system",
        language: settingsPatch.language || "en",
        emailNotifications: settingsPatch.emailNotifications ?? true,
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  const [updated] = await db
    .update(schema.userSettings)
    .set({
      ...settingsPatch,
      updatedAt: new Date(),
    })
    .where(eq(schema.userSettings.userId, userId))
    .returning();
  return updated;
}

export async function deleteUserById(userId) {
  const [deleted] = await db
    .delete(schema.users)
    .where(eq(schema.users.id, userId))
    .returning();
  return deleted || null;
}
