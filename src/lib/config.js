export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Next JS Template",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

export const AUTH_CONFIG = {
  /**
   * Single central switch for Email Verification.
   * `false`: Disable verification completely (users are verified on registration).
   * `true`: Enable verification tokens, emails, verification links, and login restriction.
   */
  requireEmailVerification: false,

  sessionCookieName: "scout_session",
  sessionDurationMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  passwordConfirmationDurationMs: 15 * 60 * 1000, // 15 minutes
  emailVerificationTokenDurationMs: 24 * 60 * 60 * 1000, // 24 hours
  passwordResetTokenDurationMs: 60 * 60 * 1000, // 1 hour
  twoFactorIssuer: process.env.NEXT_PUBLIC_APP_NAME || "Next JS Template",
};

export const RATE_LIMIT_CONFIG = {
  loginMaxAttempts: 5,
  loginWindowMs: 15 * 60 * 1000, // 15 minutes
  loginLockoutMs: 15 * 60 * 1000, // 15 minutes
};

export const STORAGE_CONFIG = {
  uploadDir: "public/uploads",
  publicPrefix: "/uploads",
  defaultFolder: "avatars",
  cloudinaryFolderPrefix: process.env.CLOUDINARY_FOLDER || "template",
  maxImageSizeBytes: 2 * 1024 * 1024, // 2 MB
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp"],
};

export const APPEARANCE_THEMES = ["light", "dark", "system"];
