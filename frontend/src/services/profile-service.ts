import { apiClient } from "@/lib/api-client";

import type { ApiResponse } from "@/types/api";
import type {
  UpdatePasswordPayload,
  UpdateProfilePayload,
} from "@/types/profile";
import type { User } from "@/types/user";

export const profileService = {
  async getProfile(): Promise<ApiResponse<User>> {
    const response =
      await apiClient.get<ApiResponse<User>>(
        "/api/profile"
      );

    return response.data;
  },

  async updateProfile(
    payload: UpdateProfilePayload
  ): Promise<ApiResponse<User>> {
    const response =
      await apiClient.put<ApiResponse<User>>(
        "/api/profile",
        payload
      );

    return response.data;
  },

  async updatePassword(
    payload: UpdatePasswordPayload
  ): Promise<ApiResponse<null>> {
    const response =
      await apiClient.put<ApiResponse<null>>(
        "/api/profile/password",
        payload
      );

    return response.data;
  },

  async updateAvatar(
    file: File
  ): Promise<ApiResponse<User>> {
    const formData = new FormData();

    formData.append("avatar", file);

    const response =
      await apiClient.post<ApiResponse<User>>(
        "/api/profile/avatar",
        formData
      );

    return response.data;
  },

  async deleteAvatar(): Promise<
    ApiResponse<User>
  > {
    const response =
      await apiClient.delete<ApiResponse<User>>(
        "/api/profile/avatar"
      );

    return response.data;
  },
};