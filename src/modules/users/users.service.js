import { toSafeUser } from "@/lib/auth-guard";
import { APP_CONFIG, AUTH_CONFIG } from "@/lib/config";
import { generateToken, hashPassword, hashToken, verifyPassword } from "@/lib/crypto";
import { NotFoundError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
  createEmailVerificationToken,
  deleteEmailVerificationTokensByUserId,
} from "@/modules/auth/auth.repository";
import { sendVerificationEmail } from "@/services/email/email";
import { deleteStoredFile, replaceStoredImage } from "@/services/storage/storage";
import * as repository from "./users.repository";
import {
  changePasswordSchema,
  deleteAccountSchema,
  updateProfileSchema,
  updateUserSettingsSchema,
} from "./users.validation";

export async function getProfileService(userId) {
  const user = await repository.findUserById(userId);
  if (!user) throw new NotFoundError("User not found.");

  const settings = await repository.findUserSettings(userId);
  return {
    user: toSafeUser(user),
    settings: settings || {
      theme: "system",
      language: "en",
      emailNotifications: true,
    },
  };
}

export async function updateProfileService(userId, input) {
  const data = updateProfileSchema.parse(input);
  const user = await repository.findUserById(userId);
  if (!user) throw new NotFoundError("User not found.");

  const emailChanged = data.email !== user.email;
  if (emailChanged) {
    const existing = await repository.findUserByEmail(data.email);
    if (existing && existing.id !== userId) {
      throw new ValidationError("This email address is already in use.");
    }
  }

  const emailVerifiedAt =
    emailChanged && AUTH_CONFIG.requireEmailVerification ? null : undefined;

  const updated = await repository.updateUserProfile(userId, {
    name: data.name,
    email: data.email,
    emailVerifiedAt,
  });

  if (emailChanged && AUTH_CONFIG.requireEmailVerification) {
    await deleteEmailVerificationTokensByUserId(userId);
    const rawToken = generateToken(32);
    await createEmailVerificationToken({
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + AUTH_CONFIG.emailVerificationTokenDurationMs),
    });
    await sendVerificationEmail({
      to: updated.email,
      name: updated.name,
      verificationUrl: `${APP_CONFIG.url}/verify-email?token=${rawToken}`,
    });
  }

  logger.info("User profile updated", { userId, emailChanged });
  return toSafeUser(updated);
}

export async function changePasswordService(userId, input) {
  const data = changePasswordSchema.parse(input);
  const user = await repository.findUserById(userId);
  if (!user) throw new NotFoundError("User not found.");

  if (!verifyPassword(data.currentPassword, user.passwordHash)) {
    throw new UnauthorizedError("Current password is incorrect.");
  }

  await repository.updateUserPassword(userId, hashPassword(data.password));
  logger.info("User password changed", { userId });
  return { changed: true };
}

export async function updateProfilePictureService(userId, file) {
  const user = await repository.findUserById(userId);
  if (!user) throw new NotFoundError("User not found.");

  const { result: updatedUser } = await replaceStoredImage({
    file,
    folder: "avatars",
    previousImage: {
      url: user.avatarUrl,
      publicId: user.avatarPublicId,
      provider: user.avatarProvider,
    },
    persistFn: (uploaded) =>
      repository.updateUserAvatar(userId, {
        avatarUrl: uploaded.url,
        avatarPublicId: uploaded.publicId,
        avatarProvider: uploaded.provider,
      }),
  });

  logger.info("User profile picture updated", {
    userId,
    provider: updatedUser.avatarProvider,
  });
  return toSafeUser(updatedUser);
}

export async function removeProfilePictureService(userId) {
  const user = await repository.findUserById(userId);
  if (!user) throw new NotFoundError("User not found.");

  const previousImage = {
    url: user.avatarUrl,
    publicId: user.avatarPublicId,
    provider: user.avatarProvider,
  };

  const updated = await repository.updateUserAvatar(userId, {
    avatarUrl: null,
    avatarPublicId: null,
    avatarProvider: null,
  });

  if (previousImage.publicId || previousImage.url) {
    await deleteStoredFile(previousImage).catch((err) => {
      logger.warn("Failed to delete removed avatar file", {
        userId,
        message: err?.message,
      });
    });
  }

  return toSafeUser(updated);
}

export async function updateUserSettingsService(userId, input) {
  const data = updateUserSettingsSchema.parse(input);
  const settings = await repository.upsertUserSettings(userId, data);
  logger.info("User settings updated", { userId });
  return settings;
}

export async function deleteAccountService(userId, input) {
  const data = deleteAccountSchema.parse(input);
  const user = await repository.findUserById(userId);
  if (!user) throw new NotFoundError("User not found.");

  if (!verifyPassword(data.password, user.passwordHash)) {
    throw new UnauthorizedError("Incorrect password.");
  }

  const previousImage = {
    url: user.avatarUrl,
    publicId: user.avatarPublicId,
    provider: user.avatarProvider,
  };

  await repository.deleteUserById(userId);

  if (previousImage.publicId || previousImage.url) {
    await deleteStoredFile(previousImage).catch((err) => {
      logger.warn("Failed to cleanup avatar after account deletion", {
        userId,
        message: err?.message,
      });
    });
  }

  logger.info("User account deleted", { userId });
  return { deleted: true };
}
