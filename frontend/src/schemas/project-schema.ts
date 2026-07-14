import { z } from "zod";

const optionalDate = z
  .string()
  .optional()
  .or(z.literal(""));

export const projectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Project name must contain at least 2 characters.")
      .max(150, "Project name is too long."),

    project_key: z
      .string()
      .trim()
      .min(2, "Project key must contain at least 2 characters.")
      .max(10, "Project key cannot exceed 10 characters.")
      .regex(
        /^[a-zA-Z0-9]+$/,
        "Project key must only contain letters and numbers."
      ),

    description: z
      .string()
      .max(5000, "Description is too long.")
      .optional(),

    manager_id: z
      .string()
      .min(1, "Select a project manager."),

    status: z.enum([
      "planning",
      "active",
      "on_hold",
      "completed",
      "archived",
    ]),

    priority: z.enum([
      "low",
      "medium",
      "high",
      "critical",
    ]),

    start_date: optionalDate,
    due_date: optionalDate,
  })
  .refine(
    (values) =>
      !values.start_date ||
      !values.due_date ||
      new Date(values.due_date) >=
        new Date(values.start_date),
    {
      path: ["due_date"],
      message:
        "Due date must be on or after the start date.",
    }
  );

export type ProjectFormValues =
  z.infer<typeof projectSchema>;