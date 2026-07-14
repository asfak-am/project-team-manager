"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { taskService } from "@/services/task-service";
import type {
  CreateTaskPayload,
  TaskFilters,
  UpdateTaskAssigneePayload,
  UpdateTaskPayload,
  UpdateTaskStatusPayload,
} from "@/types/task";

export const taskKeys = {
  all: ["tasks"] as const,

  lists: () =>
    [...taskKeys.all, "list"] as const,

  list: (filters: TaskFilters) =>
    [...taskKeys.lists(), filters] as const,

  myTasks: (filters: TaskFilters) =>
    [
      ...taskKeys.all,
      "my-tasks",
      filters,
    ] as const,

  details: () =>
    [...taskKeys.all, "detail"] as const,

  detail: (taskId: number) =>
    [...taskKeys.details(), taskId] as const,
};

export function useTasks(
  filters: TaskFilters
) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () =>
      taskService.getTasks(filters),
  });
}

export function useMyTasks(
  filters: TaskFilters
) {
  return useQuery({
    queryKey: taskKeys.myTasks(filters),
    queryFn: () =>
      taskService.getMyTasks(filters),
  });
}

export function useTask(
  taskId: number
) {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () =>
      taskService.getTask(taskId),
    enabled:
      Number.isInteger(taskId) &&
      taskId > 0,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: number;
      payload: CreateTaskPayload;
    }) =>
      taskService.createTask(
        projectId,
        payload
      ),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: taskKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ["projects"],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            "projects",
            "detail",
            variables.projectId,
          ],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);
    },
  });
}

export function useProjectTasks(
  projectId: number
) {
  return useQuery({
    queryKey: [
      ...taskKeys.all,
      "project",
      projectId,
    ],
    queryFn: () =>
      taskService.getProjectTasks(projectId),
    enabled:
      Number.isInteger(projectId) &&
      projectId > 0,
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: number;
      payload: UpdateTaskPayload;
    }) =>
      taskService.updateTask(
        taskId,
        payload
      ),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: taskKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: taskKeys.detail(
            variables.taskId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: ["projects"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: number;
      payload: UpdateTaskStatusPayload;
    }) =>
      taskService.updateStatus(
        taskId,
        payload
      ),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: taskKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: taskKeys.detail(
            variables.taskId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: ["projects"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);
    },
  });
}

export function useUpdateTaskAssignee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: number;
      payload: UpdateTaskAssigneePayload;
    }) =>
      taskService.updateAssignee(
        taskId,
        payload
      ),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: taskKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: taskKeys.detail(
            variables.taskId
          ),
        }),
      ]);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) =>
      taskService.deleteTask(taskId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: taskKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ["projects"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);
    },
  });
}