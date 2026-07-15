import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      2,
      "Name must contain at least 2 characters."
    )
    .max(100),

  email: z
    .string()
    .trim()
    .email(
      "Enter a valid email address."
    ),
});

export type UpdateProfileFormValues =
  z.infer<typeof updateProfileSchema>;

export const updatePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(
        1,
        "Enter your current password."
      ),

    password: z
      .string()
      .min(
        8,
        "New password must contain at least 8 characters."
      )
      .regex(
        /[A-Za-z]/,
        "Password must contain a letter."
      )
      .regex(
        /\d/,
        "Password must contain a number."
      ),

    password_confirmation: z
      .string()
      .min(
        1,
        "Confirm your new password."
      ),
  })
  .refine(
    (values) =>
      values.password ===
      values.password_confirmation,
    {
      path: [
        "password_confirmation",
      ],
      message:
        "Password confirmation does not match.",
    }
  );

export type UpdatePasswordFormValues =
  z.infer<typeof updatePasswordSchema>;