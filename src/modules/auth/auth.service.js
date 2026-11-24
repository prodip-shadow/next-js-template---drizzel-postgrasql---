import { APP_CONFIG, AUTH_CONFIG } from "@/lib/config";
import {
  buildOtpAuthUrl,
  generateRecoveryCodes,
  generateToken,
  generateTwoFactorSecret,
  hashPassword,
  hashToken,
  verifyAndConsumeRecoveryCode,
  verifyPassword,
  verifyTotpCode,
} from "@/lib/crypto";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
  assertNotRateLimited,
  clearRateLimit,
  recordFailedAttempt,
} from "@/lib/rate-limit";
import { toSafeUser } from "@/lib/auth-guard";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/services/email/email";
import * as repository from "./auth.repository";
import {
  confirmPasswordSchema,
  disableTwoFactorSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  verifyTwoFactorSchema,
} from "./auth.validation";




async function issueSession(userId, { ipAddress = null, userAgent = null } = {}) {
  const sessionToken = generateToken(32);
  const tokenHash = hashToken(sessionToken);
  const expiresAt = new Date(Date.now() + AUTH_CONFIG.sessionDurationMs);

  await repository.createSession({
    userId,
    tokenHash,
    ipAddress,
    userAgent,
    expiresAt,
  });

  return { sessionToken, expiresAt };
}

async function issueAndSendVerificationEmail(user) {
  await repository.deleteEmailVerificationTokensByUserId(user.id);

  const rawToken = generateToken(32);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + AUTH_CONFIG.emailVerificationTokenDurationMs);

  await repository.createEmailVerificationToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const verificationUrl = `${APP_CONFIG.url}/verify-email?token=${rawToken}`;
  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verificationUrl,
  });
}

export async function registerService(input, requestMeta = {}) {
  const data = registerSchema.parse(input);
  const existing = await repository.findUserByEmail(data.email);

  if (existing) {
    throw new ValidationError("An account with this email already exists.");
  }

  const requiresVerification = Boolean(AUTH_CONFIG.requireEmailVerification);
  const user = await repository.createUserWithSettings({
    name: data.name,
    email: data.email,
    passwordHash: hashPassword(data.password),
    status: "active",
    emailVerifiedAt: requiresVerification ? null : new Date(),
  });

  if (requiresVerification) {
    await issueAndSendVerificationEmail(user);
    logger.info("User registered (verification required)", { userId: user.id });
    return {
      user: toSafeUser(user),
      requiresEmailVerification: true,
      sessionToken: null,
      expiresAt: null,
    };
  }

  const { sessionToken, expiresAt } = await issueSession(user.id, requestMeta);
  logger.info("User registered", { userId: user.id });

  return {
    user: toSafeUser(user),
    requiresEmailVerification: false,
    sessionToken,
    expiresAt,
  };
}

export async function loginService(input, requestMeta = {}) {
  const data = loginSchema.parse(input);
  const rateKey = `login:${data.email}`;

  await assertNotRateLimited(rateKey);

  const user = await repository.findUserByEmail(data.email);
  if (!user || !verifyPassword(data.password, user.passwordHash)) {
    await recordFailedAttempt(rateKey);
    throw new UnauthorizedError("Invalid email or password.");
  }

  if (user.status !== "active") {
    throw new ForbiddenError("Your account is not active.");
  }

  if (AUTH_CONFIG.requireEmailVerification && !user.emailVerifiedAt) {
    throw new ForbiddenError("Please verify your email address before logging in.");
  }

  if (user.twoFactorEnabled) {
    const hasTotp = Boolean(data.totpCode);
    const hasRecovery = Boolean(data.recoveryCode);

    if (!hasTotp && !hasRecovery) {
      return {
        requiresTwoFactor: true,
        user: null,
        sessionToken: null,
        expiresAt: null,
      };
    }

    let verified = false;
    if (hasTotp) {
      verified = verifyTotpCode(user.twoFactorSecret, data.totpCode);
    } else if (hasRecovery) {
      const recovery = verifyAndConsumeRecoveryCode(
        data.recoveryCode,
        user.twoFactorRecoveryCodes
      );
      if (recovery.valid) {
        verified = true;
        await repository.updateUserTwoFactor(user.id, {
          twoFactorEnabled: true,
          twoFactorSecret: user.twoFactorSecret,
          twoFactorRecoveryCodes: recovery.remainingHashedCodesJson,
        });
      }
    }

    if (!verified) {
      await recordFailedAttempt(rateKey);
      throw new UnauthorizedError("Invalid two-factor authentication code.");
    }
  }

  await clearRateLimit(rateKey);
  const { sessionToken, expiresAt } = await issueSession(user.id, requestMeta);
  logger.info("User logged in", { userId: user.id });

  return {
    requiresTwoFactor: false,
    user: toSafeUser(user),
    sessionToken,
    expiresAt,
  };
}

export async function logoutService(rawSessionToken) {
  if (!rawSessionToken) return;
  await repository.deleteSessionByTokenHash(hashToken(rawSessionToken));
}

export async function verifyEmailService(input) {
  if (!AUTH_CONFIG.requireEmailVerification) {
    return { verified: true };
  }

  const data = verifyEmailSchema.parse(input);
  const record = await repository.findValidEmailVerificationToken(
    hashToken(data.token)
  );

  if (!record) {
    throw new ValidationError("Invalid or expired verification link.");
  }

  await repository.markUserEmailVerified(record.userId);
  await repository.deleteEmailVerificationTokensByUserId(record.userId);
  logger.info("User email verified", { userId: record.userId });

  return { verified: true };
}

export async function resendVerificationEmailService(input) {
  if (!AUTH_CONFIG.requireEmailVerification) {
    return { sent: false };
  }

  const { email } = forgotPasswordSchema.parse(input);
  const user = await repository.findUserByEmail(email);

  if (user && user.status === "active" && !user.emailVerifiedAt) {
    await issueAndSendVerificationEmail(user);
  }

  return { sent: true };
}

export async function forgotPasswordService(input) {
  const data = forgotPasswordSchema.parse(input);
  const user = await repository.findUserByEmail(data.email);

  if (user && user.status === "active") {
    const rawToken = generateToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + AUTH_CONFIG.passwordResetTokenDurationMs);

    await repository.createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const resetUrl = `${APP_CONFIG.url}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });
    logger.info("Password reset email issued", { userId: user.id });
  }

  return { sent: true };
}

export async function resetPasswordService(input) {
  const data = resetPasswordSchema.parse(input);
  const tokenRecord = await repository.findValidPasswordResetToken(
    hashToken(data.token)
  );

  if (!tokenRecord) {
    throw new ValidationError("Invalid or expired password reset token.");
  }

  await repository.updateUserPassword(
    tokenRecord.userId,
    hashPassword(data.password)
  );
  await repository.markPasswordResetTokenUsed(tokenRecord.id);
  await repository.deleteUserSessions(tokenRecord.userId);
  logger.info("Password reset completed", { userId: tokenRecord.userId });

  return { reset: true };
}

export async function confirmPasswordService(userId, sessionId, input) {
  const data = confirmPasswordSchema.parse(input);
  const user = await repository.findUserById(userId);
  if (!user) throw new NotFoundError("User not found.");

  if (!verifyPassword(data.password, user.passwordHash)) {
    throw new UnauthorizedError("Incorrect password.");
  }

  await repository.updateSessionLastConfirmed(sessionId, new Date());
  return { confirmed: true };
}

export async function setupTwoFactorService(userId) {
  const user = await repository.findUserById(userId);
  if (!user) throw new NotFoundError("User not found.");

  const secret = generateTwoFactorSecret();
  await repository.updateUserTwoFactor(userId, {
    twoFactorEnabled: false,
    twoFactorSecret: secret,
    twoFactorRecoveryCodes: null,
  });

  const otpAuthUrl = buildOtpAuthUrl({ email: user.email, secret });
  return { secret, otpAuthUrl };
}

export async function enableTwoFactorService(userId, input) {
  const data = verifyTwoFactorSchema.parse(input);
  const user = await repository.findUserById(userId);
  if (!user || !user.twoFactorSecret) {
    throw new ValidationError("Two-factor setup has not been initialized.");
  }

  if (!verifyTotpCode(user.twoFactorSecret, data.code)) {
    throw new ValidationError("Invalid two-factor authentication code.");
  }

  const { plainCodes, hashedCodes } = generateRecoveryCodes(8);
  await repository.updateUserTwoFactor(userId, {
    twoFactorEnabled: true,
    twoFactorSecret: user.twoFactorSecret,
    twoFactorRecoveryCodes: JSON.stringify(hashedCodes),
  });

  logger.info("Two-factor authentication enabled", { userId });
  return { recoveryCodes: plainCodes };
}

export async function disableTwoFactorService(userId, input) {
  const data = disableTwoFactorSchema.parse(input);
  const user = await repository.findUserById(userId);
  if (!user) throw new NotFoundError("User not found.");

  if (!verifyPassword(data.password, user.passwordHash)) {
    throw new UnauthorizedError("Incorrect password.");
  }

  await repository.updateUserTwoFactor(userId, {
    twoFactorEnabled: false,
    twoFactorSecret: null,
    twoFactorRecoveryCodes: null,
  });

  logger.info("Two-factor authentication disabled", { userId });
  return { disabled: true };
}
