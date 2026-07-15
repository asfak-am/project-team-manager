"use client";

import { useQuery } from "@tanstack/react-query";

import { projectService } from "@/services/project-service";
import type { User } from "@/types/user";

type MembersResponse = {
  data?:
    | User[]
    | {
        data?: User[];
        members?: User[];
      };
  members?: User[];
};

export function useProjectMembers(
  projectId: number
) {
  return useQuery({
    queryKey: [
      "projects",
      projectId,
      "members",
    ],
    queryFn: () =>
      projectService.getMembers(projectId),
    enabled: projectId > 0,
  });
}