export type DashboardStatistics = {
  total_users?: number;
  active_users?: number;
  active_projects?: number;
  total_tasks?: number;
  completed_tasks?: number;
  overdue_tasks?: number;

  managed_projects?: number;
  open_tasks?: number;

  assigned_tasks?: number;
  in_progress_tasks?: number;
};

export type ActivityUser = {
  id: number;
  name: string;
  email: string;
};

export type ActivityLog = {
  id: number;
  action: string;
  description: string;
  properties: Record<string, unknown> | null;
  user?: ActivityUser | null;
  created_at: string;
};

export type DashboardData = {
  statistics: DashboardStatistics;
  recent_activity?: ActivityLog[];
  upcoming_tasks?: unknown[];
};