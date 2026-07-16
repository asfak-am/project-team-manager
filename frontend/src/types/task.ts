import type { Project } from "@/types/project";
import type { User } from "@/types/user";

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "review"
  | "completed"
  | "cancelled";

export type TaskPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type TaskTargetRole =
  | "project-manager"
  | "team-member";

export type TaskComment = {
  id: number;
  task_id: number;
  user_id: number;
  comment: string;

  user?: User | null;

  created_at: string | null;
  updated_at: string | null;
};

export type Task = {
  id: number;
  project_id: number;
  task_number: number;

  target_role: TaskTargetRole;

  title: string;
  description: string | null;

  status: TaskStatus;
  priority: TaskPriority;

  assigned_to: number | null;
  created_by: number;

  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  estimated_hours: number | null;

  project?: Project;
  assignee?: User | null;
  creator?: User | null;

  comments?: TaskComment[];
  comments_count?: number;

  created_at: string | null;
  updated_at: string | null;
};

export type CreateTaskPayload = {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;

  assigned_to: number;

  due_date?: string | null;
  estimated_hours?: number | null;
};

export type UpdateTaskPayload = {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;

  assigned_to?: number | null;

  due_date?: string | null;
  estimated_hours?: number | null;
};

export type UpdateTaskStatusPayload = {
  status: TaskStatus;
};

export type UpdateTaskAssigneePayload = {
  assigned_to: number | null;
};

export type TaskFilters = {
  search?: string;
  project_id?: number | "";
  assigned_to?: number | "";
  status?: TaskStatus | "";
  priority?: TaskPriority | "";
  overdue?: boolean;
  page?: number;
  per_page?: number;
};