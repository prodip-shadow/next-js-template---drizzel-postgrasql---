"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { errorResponse, successResponse } from "@/lib/response";
import {
  getUserNotificationsService,
  markAllNotificationsReadService,
  markNotificationReadService,
} from "./notifications.service";

export async function getNotificationsAction() {
  try {
    const { user } = await requireAuth();
    const data = await getUserNotificationsService(user.id);
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function markNotificationReadAction(notificationId) {
  try {
    const { user } = await requireAuth();
    const data = await markNotificationReadService(user.id, notificationId);
    revalidatePath("/dashboard");
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function markAllNotificationsReadAction() {
  try {
    const { user } = await requireAuth();
    const data = await markAllNotificationsReadService(user.id);
    revalidatePath("/dashboard");
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}
