import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { DashboardData } from "@/types/dashboard";

export const dashboardService = {
  async getDashboard(): Promise<
    ApiResponse<DashboardData>
  > {
    const response =
      await apiClient.get<ApiResponse<DashboardData>>(
        "/api/dashboard"
      );

    return response.data;
  },
};