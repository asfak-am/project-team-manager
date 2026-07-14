"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { projectService } from "@/services/project-service";
import type {
  CreateProjectPayload,
  ProjectFilters,
  UpdateProjectPayload,
} from "@/types/project";

export const projectKeys = {
  all: ["projects"] as const,

  lists: () =>
    [...projectKeys.all, "list"] as const,

  list: (filters: ProjectFilters) =>
    [...projectKeys.lists(), filters] as const,

  details: () =>
    [...projectKeys.all, "detail"] as const,

  detail: (projectId: number) =>
    [...projectKeys.details(), projectId] as const,

  members: (projectId: number) =>
    [
      ...projectKeys.detail(projectId),
      "members",
    ] as const,
};

export function useProjects(
  filters: ProjectFilters
) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () =>
      projectService.getProjects(filters),
  });
}

export function useProject(
  projectId: number
) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () =>
      projectService.getProject(projectId),
    enabled:
      Number.isInteger(projectId) &&
      projectId > 0,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: CreateProjectPayload
    ) =>
      projectService.createProject(payload),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: number;
      payload: UpdateProjectPayload;
    }) =>
      projectService.updateProject(
        projectId,
        payload
      ),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: projectKeys.detail(
            variables.projectId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      projectId: number
    ) =>
      projectService.deleteProject(projectId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);
    },
  });
}

export function useProjectMembers(
  projectId: number
) {
  return useQuery({
    queryKey: projectKeys.members(projectId),
    queryFn: () =>
      projectService.getMembers(projectId),
    enabled: projectId > 0,
  });
}

export function useAddProjectMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userIds,
    }: {
      projectId: number;
      userIds: number[];
    }) =>
      projectService.addMembers(
        projectId,
        userIds
      ),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectKeys.members(
            variables.projectId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: projectKeys.detail(
            variables.projectId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: projectKeys.all,
        }),
      ]);
    },
  });
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
    }: {
      projectId: number;
      userId: number;
    }) =>
      projectService.removeMember(
        projectId,
        userId
      ),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectKeys.members(
            variables.projectId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: projectKeys.detail(
            variables.projectId
          ),
        }),
      ]);
    },
  });
}