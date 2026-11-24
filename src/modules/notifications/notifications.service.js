import { NotFoundError } from "@/lib/errors";
import { findUserById, findUserSettings } from "@/modules/users/users.repository";
import { sendNotificationEmail } from "@/services/email/email";
import * as repository from "./notifications.repository";
import {
  createNotificationSchema,
  notificationIdSchema,
} from "./notifications.validation";

export async function sendUserNotificationService(input, { sendEmail = false } = {}) {
  const data = createNotificationSchema.parse(input);
  const notification = await repository.createNotification(data);

  if (sendEmail) {
    const [user, settings] = await Promise.all([
      findUserById(data.userId),
      findUserSettings(data.userId),
    ]);

    if (user && (settings ? settings.emailNotifications : true)) {
      await sendNotificationEmail({
        to: user.email,
        name: user.name,
        title: data.title,
        message: data.message,
      });
    }
  }

  return notification;
}

export async function getUserNotificationsService(userId) {
  return repository.listNotificationsByUserId(userId);
}

export async function markNotificationReadService(userId, notificationId) {
  const validId = notificationIdSchema.parse(notificationId);
  const updated = await repository.markNotificationAsRead(validId, userId);

  if (!updated) {
    throw new NotFoundError("Notification not found.");
  }

  return updated;
}

export async function markAllNotificationsReadService(userId) {
  await repository.markAllNotificationsAsRead(userId);
  return { updated: true };
}
