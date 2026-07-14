"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { commentService } from "@/services/comment-service";
import { taskKeys } from "@/hooks/use-tasks";

export const commentKeys = {
  all: ["task-comments"] as const,

  list: (taskId: number) =>
    [
      ...commentKeys.all,
      taskId,
    ] as const,
};

export function useTaskComments(
  taskId: number
) {
  return useQuery({
    queryKey:
      commentKeys.list(taskId),
    queryFn: () =>
      commentService.getComments(taskId),
    enabled: taskId > 0,
  });
}

export function useCreateTaskComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      comment,
    }: {
      taskId: number;
      comment: string;
    }) =>
      commentService.createComment(
        taskId,
        comment
      ),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            commentKeys.list(
              variables.taskId
            ),
        }),
        queryClient.invalidateQueries({
          queryKey:
            taskKeys.detail(
              variables.taskId
            ),
        }),
      ]);
    },
  });
}

export function useDeleteTaskComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      commentId,
    }: {
      taskId: number;
      commentId: number;
    }) =>
      commentService.deleteComment(
        taskId,
        commentId
      ),

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey:
          commentKeys.list(
            variables.taskId
          ),
      });
    },
  });
}