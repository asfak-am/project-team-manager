import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type {
  AuthUser,
  LoginCredentials,
} from "@/types/auth";

export const authService = {
  async csrf(): Promise<void> {
    await apiClient.get("/sanctum/csrf-cookie");
  },

  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthUser>> {
    await this.csrf();

    const response = await apiClient.post<ApiResponse<AuthUser>>(
      "/api/login",
      credentials
    );

    return response.data;
  },

  async currentUser(): Promise<ApiResponse<AuthUser>> {
    const response =
      await apiClient.get<ApiResponse<AuthUser>>("/api/user");

    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/api/logout");
  },
};