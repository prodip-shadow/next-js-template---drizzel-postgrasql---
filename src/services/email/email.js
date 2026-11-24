import "server-only";
import { APP_CONFIG } from "@/lib/config";
import { logger } from "@/lib/logger";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function wrapEmailLayout(title, bodyHtml) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111827;">
      <h2 style="margin-bottom: 16px;">${escapeHtml(title)}</h2>
      ${bodyHtml}
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="font-size: 12px; color: #6b7280;">${escapeHtml(APP_CONFIG.name)}</p>
    </div>
  `.trim();
}

export async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || `${APP_CONFIG.name} <noreply@example.com>`;

  if (!apiKey) {
    logger.info("Email skipped (RESEND_API_KEY not configured)", {
      to,
      subject,
      preview: text || subject,
    });
    return { delivered: false, provider: "console" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error("Email delivery failed", { to, subject, status: response.status, errorText });
    throw new Error("Unable to send email.");
  }

  const data = await response.json();
  return { delivered: true, provider: "resend", id: data.id };
}

export async function sendVerificationEmail({ to, name, verificationUrl }) {
  const safeName = escapeHtml(name || "User");
  const safeUrl = escapeHtml(verificationUrl);
  const subject = `Verify your email - ${APP_CONFIG.name}`;
  const html = wrapEmailLayout(
    "Verify Your Email Address",
    `
      <p>Hi ${safeName},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${safeUrl}" style="display: inline-block; padding: 10px 18px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px;">Verify Email</a></p>
      <p style="font-size: 13px; color: #4b5563;">If you did not create an account, you can ignore this email.</p>
    `
  );
  const text = `Hi ${name || "User"}, verify your email here: ${verificationUrl}`;
  return sendEmail({ to, subject, html, text });
}

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const safeName = escapeHtml(name || "User");
  const safeUrl = escapeHtml(resetUrl);
  const subject = `Reset your password - ${APP_CONFIG.name}`;
  const html = wrapEmailLayout(
    "Reset Your Password",
    `
      <p>Hi ${safeName},</p>
      <p>We received a request to reset your password. Click the button below to continue:</p>
      <p><a href="${safeUrl}" style="display: inline-block; padding: 10px 18px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
      <p style="font-size: 13px; color: #4b5563;">If you did not request a password reset, no action is required.</p>
    `
  );
  const text = `Hi ${name || "User"}, reset your password here: ${resetUrl}`;
  return sendEmail({ to, subject, html, text });
}

export async function sendNotificationEmail({ to, name, title, message }) {
  const safeName = escapeHtml(name || "User");
  const safeMessage = escapeHtml(message);
  const subject = `${title} - ${APP_CONFIG.name}`;
  const html = wrapEmailLayout(
    title,
    `
      <p>Hi ${safeName},</p>
      <p>${safeMessage}</p>
    `
  );
  const text = `Hi ${name || "User"}, ${message}`;
  return sendEmail({ to, subject, html, text });
}
