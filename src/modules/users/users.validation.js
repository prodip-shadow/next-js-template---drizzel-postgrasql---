import { z } from "zod";
import { APPEARANCE_THEMES } from "@/lib/config";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    password: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .max(128, "Password must not exceed 128 characters."),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

export const updateUserSettingsSchema = z.object({
  theme: z.enum(APPEARANCE_THEMES).optional(),
  language: z.string().trim().min(2).max(16).optional(),
  emailNotifications: z.boolean().optional(),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete your account."),
});
