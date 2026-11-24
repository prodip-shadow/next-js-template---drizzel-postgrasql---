import { and, desc, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/db/drizzle";

export async function createNotification(data) {
  const [notification] = await db
    .insert(schema.notifications)
    .values(data)
    .returning();
  return notification;
}

export async function listNotificationsByUserId(userId, limit = 25) {
  return db
    .select()
    .from(schema.notifications)
    .where(eq(schema.notifications.userId, userId))
    .orderBy(desc(schema.notifications.createdAt))
    .limit(limit);
}

export async function markNotificationAsRead(notificationId, userId) {
  const [updated] = await db
    .update(schema.notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(schema.notifications.id, notificationId),
        eq(schema.notifications.userId, userId)
      )
    )
    .returning();
  return updated || null;
}

export async function markAllNotificationsAsRead(userId) {
  await db
    .update(schema.notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(schema.notifications.userId, userId),
        isNull(schema.notifications.readAt)
      )
    );
}
