import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PaginatedResponse,
} from "@/types/api";
import type {
  CreateTaskPayload,
  Task,
  TaskFilters,
  UpdateTaskAssigneePayload,
  UpdateTaskPayload,
  UpdateTaskStatusPayload,
} from "@/types/task";

function buildTaskQuery(
  filters: TaskFilters
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.project_id) {
    params.set(
      "project_id",
      String(filters.project_id)
    );
  }

  if (filters.assigned_to) {
    params.set(
      "assigned_to",
      String(filters.assigned_to)
    );
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.priority) {
    params.set("priority", filters.priority);
  }

  if (filters.overdue) {
    params.set("overdue", "true");
  }

  params.set(
    "page",
    String(filters.page ?? 1)
  );

  params.set(
    "per_page",
    String(filters.per_page ?? 10)
  );

  return params;
}

export const taskService = {
  async getTasks(
    filters: TaskFilters
  ): Promise<PaginatedResponse<Task>> {
    const params = buildTaskQuery(filters);

    const response =
      await apiClient.get<PaginatedResponse<Task>>(
        `/api/tasks?${params.toString()}`
      );

    return response.data;
  },

  async getMyTasks(
    filters: TaskFilters
  ): Promise<PaginatedResponse<Task>> {
    const params = buildTaskQuery(filters);

    const response =
      await apiClient.get<PaginatedResponse<Task>>(
        `/api/my-tasks?${params.toString()}`
      );

    return response.data;
  },

  async getTask(
    taskId: number
  ): Promise<ApiResponse<Task>> {
    const response =
      await apiClient.get<ApiResponse<Task>>(
        `/api/tasks/${taskId}`
      );

    return response.data;
  },

  async createTask(
    projectId: number,
    payload: CreateTaskPayload
  ): Promise<ApiResponse<Task>> {
    const response =
      await apiClient.post<ApiResponse<Task>>(
        `/api/projects/${projectId}/tasks`,
        payload
      );

    return response.data;
  },

  async updateTask(
    taskId: number,
    payload: UpdateTaskPayload
  ): Promise<ApiResponse<Task>> {
    const response =
      await apiClient.put<ApiResponse<Task>>(
        `/api/tasks/${taskId}`,
        payload
      );

    return response.data;
  },

  async updateStatus(
    taskId: number,
    payload: UpdateTaskStatusPayload
  ): Promise<ApiResponse<Task>> {
    const response =
      await apiClient.patch<ApiResponse<Task>>(
        `/api/tasks/${taskId}/status`,
        payload
      );

    return response.data;
  },

  async updateAssignee(
    taskId: number,
    payload: UpdateTaskAssigneePayload
  ): Promise<ApiResponse<Task>> {
    const response =
      await apiClient.patch<ApiResponse<Task>>(
        `/api/tasks/${taskId}/assignee`,
        payload
      );

    return response.data;
  },

  async deleteTask(
    taskId: number
  ): Promise<ApiResponse<null>> {
    const response =
      await apiClient.delete<ApiResponse<null>>(
        `/api/tasks/${taskId}`
      );

    return response.data;
  },
  async getProjectTasks(
  projectId: number
): Promise<PaginatedResponse<Task>> {
  const response =
    await apiClient.get<PaginatedResponse<Task>>(
      `/api/tasks?project_id=${projectId}&per_page=50`
    );

  return response.data;
},
};