import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db, schema } from "@/db/drizzle";
import { AUTH_CONFIG } from "./config";
import { hashToken } from "./crypto";
import { ForbiddenError, UnauthorizedError } from "./errors";

export function toSafeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt,
    twoFactorEnabled: user.twoFactorEnabled,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function setSessionCookie(rawToken, expiresAt) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_CONFIG.sessionCookieName, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_CONFIG.sessionCookieName);
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(AUTH_CONFIG.sessionCookieName)?.value;
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const now = new Date();

  const [row] = await db
    .select({
      session: schema.sessions,
      user: schema.users,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(
      and(
        eq(schema.sessions.tokenHash, tokenHash),
        gt(schema.sessions.expiresAt, now)
      )
    )
    .limit(1);

  if (!row || row.user.status !== "active") {
    return null;
  }

  return {
    session: row.session,
    user: toSafeUser(row.user),
  };
}

export async function getCurrentUser() {
  const current = await getCurrentSession();
  return current ? current.user : null;
}

export async function requireAuth() {
  const current = await getCurrentSession();
  if (!current) {
    throw new UnauthorizedError("Authentication required.");
  }

  if (AUTH_CONFIG.requireEmailVerification && !current.user.emailVerifiedAt) {
    throw new ForbiddenError("Please verify your email address to continue.");
  }

  return current;
}

export async function requireConfirmedPassword() {
  const current = await requireAuth();
  const confirmedAt = current.session.lastConfirmedAt;

  if (!confirmedAt) {
    throw new ForbiddenError("Password confirmation required.");
  }

  const elapsed = Date.now() - confirmedAt.getTime();
  if (elapsed > AUTH_CONFIG.passwordConfirmationDurationMs) {
    throw new ForbiddenError("Password confirmation expired. Please confirm again.");
  }

  return current;
}
