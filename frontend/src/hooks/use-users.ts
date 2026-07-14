"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { userService } from "@/services/user-service";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserRolePayload,
  UpdateUserStatusPayload,
  UserFilters,
} from "@/types/user";

export const userKeys = {
  all: ["users"] as const,

  list: (filters: UserFilters) =>
    ["users", "list", filters] as const,

  detail: (userId: number) =>
    ["users", "detail", userId] as const,
};

export function useUsers(
  filters: UserFilters
) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () =>
      userService.getUsers(filters),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: CreateUserPayload
    ) => userService.createUser(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      await queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number;
      payload: UpdateUserPayload;
    }) =>
      userService.updateUser(
        userId,
        payload
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number;
      payload: UpdateUserRolePayload;
    }) =>
      userService.updateRole(
        userId,
        payload
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number;
      payload: UpdateUserStatusPayload;
    }) =>
      userService.updateStatus(
        userId,
        payload
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      await queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      userId: number
    ) => userService.deleteUser(userId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      await queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}