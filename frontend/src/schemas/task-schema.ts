import { z } from "zod";

export const taskSchema = z.object({
  project_id: z
    .string()
    .min(1, "Select a project."),

  title: z
    .string()
    .trim()
    .min(2, "Task title must contain at least 2 characters.")
    .max(200, "Task title is too long."),

  description: z
    .string()
    .max(5000, "Description is too long.")
    .optional(),

  status: z.enum([
    "todo",
    "in_progress",
    "review",
    "completed",
    "cancelled",
  ]),

  priority: z.enum([
    "low",
    "medium",
    "high",
    "critical",
  ]),

  assigned_to: z.string().optional(),

  due_date: z
    .string()
    .optional()
    .or(z.literal("")),

  estimated_hours: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type TaskFormValues = z.infer<
  typeof taskSchema
>;