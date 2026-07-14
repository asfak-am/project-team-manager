import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PaginatedResponse,
} from "@/types/api";
import type {
  TaskComment,
} from "@/types/task";

export const commentService = {
  async getComments(
    taskId: number
  ): Promise<
    PaginatedResponse<TaskComment> |
    { data: TaskComment[] }
  > {
    const response =
      await apiClient.get(
        `/api/tasks/${taskId}/comments`
      );

    return response.data;
  },

  async createComment(
    taskId: number,
    comment: string
  ): Promise<ApiResponse<TaskComment>> {
    const response =
      await apiClient.post<
        ApiResponse<TaskComment>
      >(
        `/api/tasks/${taskId}/comments`,
        {
          comment,
        }
      );

    return response.data;
  },

  async deleteComment(
    taskId: number,
    commentId: number
  ): Promise<ApiResponse<null>> {
    const response =
      await apiClient.delete<
        ApiResponse<null>
      >(
        `/api/tasks/${taskId}/comments/${commentId}`
      );

    return response.data;
  },
};