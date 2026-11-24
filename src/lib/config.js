export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Scout Website",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

export const AUTH_CONFIG = {
  /**
   * Single central switch for Email Verification.
   * Change this single boolean (`true` <-> `false`) to enable or disable the entire
   * email verification feature (registration flow, verification tokens, emails, and login restriction).
   */
  requireEmailVerification: false,

  sessionCookieName: "scout_session",
  sessionDurationMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  emailVerificationTokenDurationMs: 24 * 60 * 60 * 1000, // 24 hours
  passwordResetTokenDurationMs: 60 * 60 * 1000, // 1 hour
  defaultUserRole: "user",
  superAdminRole: "admin",
};
