"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { AUTH_CONFIG } from "@/lib/config";
import {
  clearSessionCookie,
  requireAuth,
  requireConfirmedPassword,
  setSessionCookie,
} from "@/lib/auth-guard";
import { errorResponse, successResponse } from "@/lib/response";
import {
  confirmPasswordService,
  disableTwoFactorService,
  enableTwoFactorService,
  forgotPasswordService,
  loginService,
  logoutService,
  registerService,
  resendVerificationEmailService,
  resetPasswordService,
  setupTwoFactorService,
  verifyEmailService,
} from "./auth.service";

async function getRequestMetadata() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null;
  const userAgent = headerStore.get("user-agent") || null;
  return { ipAddress, userAgent };
}

export async function registerAction(input) {
  try {
    const meta = await getRequestMetadata();
    const result = await registerService(input, meta);

    if (result.sessionToken && result.expiresAt) {
      await setSessionCookie(result.sessionToken, result.expiresAt);
    }

    revalidatePath("/", "layout");
    return successResponse({
      user: result.user,
      requiresEmailVerification: result.requiresEmailVerification,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function loginAction(input) {
  try {
    const meta = await getRequestMetadata();
    const result = await loginService(input, meta);

    if (result.requiresTwoFactor) {
      return successResponse({ requiresTwoFactor: true, user: null });
    }

    await setSessionCookie(result.sessionToken, result.expiresAt);
    revalidatePath("/", "layout");
    return successResponse({
      requiresTwoFactor: false,
      user: result.user,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(AUTH_CONFIG.sessionCookieName)?.value;
    await logoutService(rawToken);
    await clearSessionCookie();
    revalidatePath("/", "layout");
    return successResponse({ loggedOut: true });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function verifyEmailAction(input) {
  try {
    const data = await verifyEmailService(input);
    revalidatePath("/");
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function resendVerificationEmailAction(input) {
  try {
    const data = await resendVerificationEmailService(input);
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function forgotPasswordAction(input) {
  try {
    const data = await forgotPasswordService(input);
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function resetPasswordAction(input) {
  try {
    const data = await resetPasswordService(input);
    await clearSessionCookie();
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function confirmPasswordAction(input) {
  try {
    const { user, session } = await requireAuth();
    const data = await confirmPasswordService(user.id, session.id, input);
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function setupTwoFactorAction() {
  try {
    const { user } = await requireConfirmedPassword();
    const data = await setupTwoFactorService(user.id);
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function enableTwoFactorAction(input) {
  try {
    const { user } = await requireConfirmedPassword();
    const data = await enableTwoFactorService(user.id, input);
    revalidatePath("/dashboard");
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function disableTwoFactorAction(input) {
  try {
    const { user } = await requireAuth();
    const data = await disableTwoFactorService(user.id, input);
    revalidatePath("/dashboard");
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}
