"use server";

import { revalidatePath } from "next/cache";
import {
  clearSessionCookie,
  requireAuth,
  requireConfirmedPassword,
} from "@/lib/auth-guard";
import { errorResponse, successResponse } from "@/lib/response";
import {
  changePasswordService,
  deleteAccountService,
  getProfileService,
  removeProfilePictureService,
  updateProfilePictureService,
  updateProfileService,
  updateUserSettingsService,
} from "./users.service";

export async function getProfileAction() {
  try {
    const { user } = await requireAuth();
    const data = await getProfileService(user.id);
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function updateProfileAction(input) {
  try {
    const { user } = await requireAuth();
    const data = await updateProfileService(user.id, input);
    revalidatePath("/dashboard");
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function changePasswordAction(input) {
  try {
    const { user } = await requireAuth();
    const data = await changePasswordService(user.id, input);
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function updateProfilePictureAction(formData) {
  try {
    const { user } = await requireAuth();
    const file =
      formData instanceof FormData
        ? formData.get("file") || formData.get("avatar")
        : null;
    const data = await updateProfilePictureService(user.id, file);
    revalidatePath("/dashboard");
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function removeProfilePictureAction() {
  try {
    const { user } = await requireAuth();
    const data = await removeProfilePictureService(user.id);
    revalidatePath("/dashboard");
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function updateUserSettingsAction(input) {
  try {
    const { user } = await requireAuth();
    const data = await updateUserSettingsService(user.id, input);
    revalidatePath("/dashboard");
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function deleteAccountAction(input) {
  try {
    const { user } = await requireConfirmedPassword();
    const data = await deleteAccountService(user.id, input);
    await clearSessionCookie();
    revalidatePath("/");
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}
