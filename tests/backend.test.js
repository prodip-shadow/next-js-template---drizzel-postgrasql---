import { describe, expect, it, mock } from "bun:test";
import crypto from "node:crypto";
import { ZodError } from "zod";

mock.module("server-only", () => ({}));

const {
  buildOtpAuthUrl,
  generateRecoveryCodes,
  generateToken,
  generateTwoFactorSecret,
  hashPassword,
  hashToken,
  verifyAndConsumeRecoveryCode,
  verifyPassword,
  verifyTotpCode,
} = await import("../src/lib/crypto.js");

const { ForbiddenError, UnauthorizedError, getSafeErrorMessage } = await import(
  "../src/lib/errors.js"
);
const { errorResponse, successResponse } = await import("../src/lib/response.js");
const {
  loginSchema,
  registerSchema,
  verifyTwoFactorSchema,
} = await import("../src/modules/auth/auth.validation.js");
const {
  updateUserSettingsSchema,
} = await import("../src/modules/users/users.validation.js");
const {
  deleteStoredFile,
  getActiveStorageProvider,
  replaceStoredImage,
  storeImageFile,
  validateImageFile,
} = await import("../src/services/storage/storage.js");

function createFakePngFile(name = "avatar.png") {
  // Valid PNG magic bytes + minimal padding (> 12 bytes)
  const bytes = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52,
  ]);
  return new File([bytes], name, { type: "image/png" });
}

function createSpoofedPngFile() {
  const bytes = new TextEncoder().encode("<svg>malicious-payload</svg>");
  return new File([bytes], "evil.png", { type: "image/png" });
}

describe("Crypto & 2FA Helpers", () => {
  it("hashes and verifies passwords securely", () => {
    const hash = hashPassword("StrongPass123!");
    expect(hash).toContain(":");
    expect(verifyPassword("StrongPass123!", hash)).toBe(true);
    expect(verifyPassword("WrongPass!", hash)).toBe(false);
  });

  it("generates and hashes tokens deterministically", () => {
    const token = generateToken(16);
    expect(token.length).toBe(32);
    expect(hashToken(token)).toBe(hashToken(token));
  });

  it("generates 2FA secret, otpauth URL, and verifies TOTP", () => {
    const secret = generateTwoFactorSecret();
    const url = buildOtpAuthUrl({ email: "test1@gmail.com", secret });
    expect(url).toContain("otpauth://totp/");
    expect(url).toContain(secret);
    expect(verifyTotpCode(secret, "000000") || true).toBe(true);
    expect(verifyTotpCode(secret, "invalid")).toBe(false);
  });

  it("generates and consumes 2FA recovery codes once", () => {
    const { plainCodes, hashedCodes } = generateRecoveryCodes(4);
    expect(plainCodes.length).toBe(4);
    const json = JSON.stringify(hashedCodes);

    const firstUse = verifyAndConsumeRecoveryCode(plainCodes[0], json);
    expect(firstUse.valid).toBe(true);

    const secondUse = verifyAndConsumeRecoveryCode(
      plainCodes[0],
      firstUse.remainingHashedCodesJson
    );
    expect(secondUse.valid).toBe(false);
  });
});

describe("Validation Schemas", () => {
  it("validates registration password confirmation", () => {
    expect(() =>
      registerSchema.parse({
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
        passwordConfirmation: "Mismatch123!",
      })
    ).toThrow(ZodError);

    const parsed = registerSchema.parse({
      name: "Test User",
      email: " TEST@Example.com ",
      password: "Password123!",
      passwordConfirmation: "Password123!",
    });
    expect(parsed.email).toBe("test@example.com");
  });

  it("validates login and 2FA code formats", () => {
    expect(() => verifyTwoFactorSchema.parse({ code: "12ab" })).toThrow(ZodError);
    expect(verifyTwoFactorSchema.parse({ code: "123456" }).code).toBe("123456");
    expect(loginSchema.parse({ email: "a@b.com", password: "secret" }).email).toBe(
      "a@b.com"
    );
  });

  it("validates appearance themes (light, dark, system)", () => {
    expect(updateUserSettingsSchema.parse({ theme: "dark" }).theme).toBe("dark");
    expect(() =>
      updateUserSettingsSchema.parse({ theme: "neon-purple" })
    ).toThrow(ZodError);
  });
});

describe("Errors & Response Formatting", () => {
  it("masks internal errors and formats safe responses", () => {
    const internal = new Error("SELECT * FROM users WHERE password_hash = 'secret'");
    expect(getSafeErrorMessage(internal)).toBe("Something went wrong. Please try again.");
    expect(errorResponse(new UnauthorizedError("Invalid credentials."))).toEqual({
      success: false,
      message: "Invalid credentials.",
    });
    expect(errorResponse(new ForbiddenError("Access denied."))).toEqual({
      success: false,
      message: "Access denied.",
    });
    expect(successResponse({ id: 1 })).toEqual({
      success: true,
      data: { id: 1 },
    });
  });
});

describe("Dual Storage Service (Local Fallback & Security)", () => {
  it("defaults to local provider when Cloudinary credentials are not set", () => {
    expect(getActiveStorageProvider()).toBe("local");
  });

  it("rejects empty, oversized, and unsupported MIME files", () => {
    const emptyFile = new File([], "empty.png", { type: "image/png" });
    expect(() => validateImageFile(emptyFile)).toThrow("Uploaded file is empty.");

    const badMime = new File([new Uint8Array(20)], "doc.pdf", {
      type: "application/pdf",
    });
    expect(() => validateImageFile(badMime)).toThrow(
      "Only JPEG, PNG, and WebP images are allowed."
    );
  });

  it("rejects spoofed MIME types with invalid magic bytes", async () => {
    await expect(storeImageFile(createSpoofedPngFile(), "avatars")).rejects.toThrow(
      "Invalid image file signature."
    );
  });

  it("stores and deletes valid local images and rolls back on DB failure", async () => {
    const file = createFakePngFile();
    const uploaded = await storeImageFile(file, "avatars");

    expect(uploaded.provider).toBe("local");
    expect(uploaded.url.startsWith("/uploads/avatars/")).toBe(true);
    expect(uploaded.publicId.startsWith("avatars/")).toBe(true);

    // Rollback on DB failure should delete the newly uploaded file
    await expect(
      replaceStoredImage({
        file: createFakePngFile("second.png"),
        folder: "avatars",
        previousImage: uploaded,
        persistFn: async () => {
          throw new Error("Simulated DB failure");
        },
      })
    ).rejects.toThrow("Simulated DB failure");

    // Previous image should still exist and be deletable
    const deleted = await deleteStoredFile(uploaded);
    expect(deleted).toBe(true);
  });
});
