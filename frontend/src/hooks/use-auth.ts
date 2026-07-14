"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { authService } from "@/services/auth-service";
import type {
  AuthUser,
  LoginCredentials,
  Role,
} from "@/types/auth";

const AUTH_QUERY_KEY = ["auth-user"] as const;

export function useAuth() {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authService.currentUser,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),

    onSuccess: (response) => {
      queryClient.setQueryData(
        AUTH_QUERY_KEY,
        response
      );
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: AUTH_QUERY_KEY,
      });
    },
  });

  const user = userQuery.data?.data ?? null;

  function hasRole(role: Role): boolean {
    return user?.roles.includes(role) ?? false;
  }

  function hasPermission(permission: string): boolean {
    return user?.permissions.includes(permission) ?? false;
  }

  function hasAnyPermission(permissions: string[]): boolean {
  return permissions.some((permission) =>
    user?.permissions?.includes(permission)
  );
}

  return {
    user,
    isAuthenticated: Boolean(user),

    isLoadingUser: userQuery.isLoading,
    isFetchingUser: userQuery.isFetching,
    userError: userQuery.error,
    userStatus: userQuery.status,

    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,

    hasRole,
    hasPermission,
    hasAnyPermission,
  };
}

export type UseAuthUser = AuthUser;