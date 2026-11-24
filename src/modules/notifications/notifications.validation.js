import { z } from "zod";

export const notificationIdSchema = z.number().int().positive("Invalid notification ID.");

export const createNotificationSchema = z.object({
  userId: z.number().int().positive(),
  type: z.string().trim().min(1).max(64).default("system"),
  title: z.string().trim().min(1).max(160),
  message: z.string().trim().min(1),
});
