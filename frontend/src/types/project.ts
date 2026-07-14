import type { User } from "@/types/user";

export type ProjectStatus =
  | "planning"
  | "active"
  | "on_hold"
  | "completed"
  | "archived";

export type ProjectPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type Project = {
  id: number;
  name: string;
  project_key: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;

  manager?: User | null;
  creator?: User | null;
  members?: User[];

  tasks_count?: number;
  completed_tasks_count?: number;
  progress?: number;

  created_at: string | null;
  updated_at: string | null;
};

export type CreateProjectPayload = {
  name: string;
  project_key: string;
  description?: string | null;
  manager_id: number;
  status?: ProjectStatus;
  priority: ProjectPriority;
  start_date?: string | null;
  due_date?: string | null;
  member_ids?: number[];
};

export type UpdateProjectPayload = {
  name?: string;
  project_key?: string;
  description?: string | null;
  manager_id?: number;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  start_date?: string | null;
  due_date?: string | null;
};

export type ProjectFilters = {
  search?: string;
  status?: ProjectStatus | "";
  priority?: ProjectPriority | "";
  page?: number;
  per_page?: number;
};