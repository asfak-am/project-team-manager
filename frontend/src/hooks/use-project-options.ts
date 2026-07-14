"use client";

import { useQueries } from "@tanstack/react-query";

import { userService } from "@/services/user-service";

export function useProjectUserOptions() {
  const results = useQueries({
    queries: [
      {
        queryKey: [
          "users",
          "options",
          "project-managers",
        ],
        queryFn: () =>
          userService.getUsers({
            role: "project-manager",
            status: "active",
            page: 1,
            per_page: 50,
          }),
      },
      {
        queryKey: [
          "users",
          "options",
          "administrators",
        ],
        queryFn: () =>
          userService.getUsers({
            role: "administrator",
            status: "active",
            page: 1,
            per_page: 50,
          }),
      },
      {
        queryKey: [
          "users",
          "options",
          "active-users",
        ],
        queryFn: () =>
          userService.getUsers({
            status: "active",
            page: 1,
            per_page: 50,
          }),
      },
    ],
  });

  const managers = [
    ...(results[0].data?.data ?? []),
    ...(results[1].data?.data ?? []),
  ].filter(
    (user, index, values) =>
      values.findIndex(
        (candidate) =>
          candidate.id === user.id
      ) === index
  );

  return {
    managers,
    activeUsers:
      results[2].data?.data ?? [],

    isLoading: results.some(
      (result) => result.isLoading
    ),

    isError: results.some(
      (result) => result.isError
    ),
  };
}