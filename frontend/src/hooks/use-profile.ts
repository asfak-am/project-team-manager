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

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.all,
    queryFn: profileService.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: UpdateProfilePayload
    ) =>
      profileService.updateProfile(payload),

    onSuccess: async (response) => {
      queryClient.setQueryData(
        profileKeys.all,
        response
      );

      /*
       * Update the authenticated-user cache too.
       * Replace ["auth-user"] if your useAuth hook
       * uses a different query key.
       */
      queryClient.setQueryData(
        ["auth-user"],
        response
      );

      await queryClient.invalidateQueries({
        queryKey: ["auth-user"],
      });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (
      payload: UpdatePasswordPayload
    ) =>
      profileService.updatePassword(payload),
  });
}