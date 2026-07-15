"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { profileService } from "@/services/profile-service";
import type {
  UpdatePasswordPayload,
  UpdateProfilePayload,
} from "@/types/profile";

export const profileKeys = {
  all: ["profile"] as const,
};

const AUTH_QUERY_KEY = [
  "auth-user",
] as const;

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.all,
    queryFn: profileService.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      payload: UpdateProfilePayload
    ) =>
      profileService.updateProfile(
        payload
      ),

    onSuccess: async (response) => {
      queryClient.setQueryData(
        profileKeys.all,
        response
      );

      queryClient.setQueryData(
        AUTH_QUERY_KEY,
        response
      );

      await queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEY,
      });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (
      payload: UpdatePasswordPayload
    ) =>
      profileService.updatePassword(
        payload
      ),
  });
}

export function useUpdateAvatar() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async (
      file: File
    ) => {
      return profileService.updateAvatar(
        file
      );
    },

    onSuccess: async (response) => {
      queryClient.setQueryData(
        profileKeys.all,
        response
      );

      queryClient.setQueryData(
        AUTH_QUERY_KEY,
        response
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: profileKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: AUTH_QUERY_KEY,
        }),
      ]);
    },
  });
}

export function useDeleteAvatar() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: () =>
      profileService.deleteAvatar(),

    onSuccess: async (response) => {
      queryClient.setQueryData(
        profileKeys.all,
        response
      );

      queryClient.setQueryData(
        AUTH_QUERY_KEY,
        response
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: profileKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: AUTH_QUERY_KEY,
        }),
      ]);
    },
  });
}