import { z } from "zod";

const emailField = z.string().trim().toLowerCase().email("Please enter a valid email address.");

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password must not exceed 128 characters.");

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120),
    email: emailField,
    password: passwordField,
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required."),
  totpCode: z.string().trim().optional(),
  recoveryCode: z.string().trim().optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, "Reset token is required."),
    password: passwordField,
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(1, "Verification token is required."),
});

export const confirmPasswordSchema = z.object({
  password: z.string().min(1, "Password is required."),
});

export const verifyTwoFactorSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Please enter a valid 6-digit authentication code."),
});

export const disableTwoFactorSchema = z.object({
  password: z.string().min(1, "Current password is required."),
});
