import { z } from "zod";

export const createUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters.")
      .max(100),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address."),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters."),

    password_confirmation: z
      .string()
      .min(1, "Confirm the password."),

    role: z.enum([
      "administrator",
      "project-manager",
      "team-member",
    ]),

    status: z.enum([
      "active",
      "inactive",
    ]),
  })
  .refine(
    (values) =>
      values.password ===
      values.password_confirmation,
    {
      path: ["password_confirmation"],
      message: "Passwords do not match.",
    }
  );

export type CreateUserFormValues =
  z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(100),

    email: z
      .string()
      .trim()
      .email(),

    password: z
      .string()
      .optional()
      .or(z.literal("")),

    password_confirmation: z
      .string()
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (values) =>
      !values.password ||
      values.password ===
        values.password_confirmation,
    {
      path: ["password_confirmation"],
      message: "Passwords do not match.",
    }
  );

export type UpdateUserFormValues =
  z.infer<typeof updateUserSchema>;