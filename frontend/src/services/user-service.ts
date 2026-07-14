import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PaginatedResponse,
} from "@/types/api";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserRolePayload,
  UpdateUserStatusPayload,
  User,
  UserFilters,
} from "@/types/user";

function buildUserQuery(
  filters: UserFilters
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.role) {
    params.set("role", filters.role);
  }

  if (filters.status) {
    params.set("status", filters.status);
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

export const userService = {
  async getUsers(
    filters: UserFilters
  ): Promise<PaginatedResponse<User>> {
    const params = buildUserQuery(filters);

    const response =
      await apiClient.get<PaginatedResponse<User>>(
        `/api/users?${params.toString()}`
      );

    return response.data;
  },

  async getUser(
    userId: number
  ): Promise<ApiResponse<User>> {
    const response =
      await apiClient.get<ApiResponse<User>>(
        `/api/users/${userId}`
      );

    return response.data;
  },

  async createUser(
    payload: CreateUserPayload
  ): Promise<ApiResponse<User>> {
    const response =
      await apiClient.post<ApiResponse<User>>(
        "/api/users",
        payload
      );

    return response.data;
  },

  async updateUser(
    userId: number,
    payload: UpdateUserPayload
  ): Promise<ApiResponse<User>> {
    const response =
      await apiClient.put<ApiResponse<User>>(
        `/api/users/${userId}`,
        payload
      );

    return response.data;
  },

  async updateRole(
    userId: number,
    payload: UpdateUserRolePayload
  ): Promise<ApiResponse<User>> {
    const response =
      await apiClient.patch<ApiResponse<User>>(
        `/api/users/${userId}/role`,
        payload
      );

    return response.data;
  },

  async updateStatus(
    userId: number,
    payload: UpdateUserStatusPayload
  ): Promise<ApiResponse<User>> {
    const response =
      await apiClient.patch<ApiResponse<User>>(
        `/api/users/${userId}/status`,
        payload
      );

    return response.data;
  },

  async deleteUser(
    userId: number
  ): Promise<ApiResponse<null>> {
    const response =
      await apiClient.delete<ApiResponse<null>>(
        `/api/users/${userId}`
      );

    return response.data;
  },
};