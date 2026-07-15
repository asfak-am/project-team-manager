import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PaginatedResponse,
} from "@/types/api";
import type {
  CreateProjectPayload,
  Project,
  ProjectFilters,
  UpdateProjectPayload,
} from "@/types/project";
import type { User } from "@/types/user";

function buildProjectQuery(
  filters: ProjectFilters
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.priority) {
    params.set("priority", filters.priority);
  }

  params.set("page", String(filters.page ?? 1));
  params.set(
    "per_page",
    String(filters.per_page ?? 10)
  );

  return params;
}

type ProjectMembersResponse = {
  data: User[];
};

export const projectService = {
  async getProjects(
    filters: ProjectFilters
  ): Promise<PaginatedResponse<Project>> {
    const params = buildProjectQuery(filters);

    const response =
      await apiClient.get<PaginatedResponse<Project>>(
        `/api/projects?${params.toString()}`
      );

    return response.data;
  },

  async getProject(
    projectId: number
  ): Promise<ApiResponse<Project>> {
    const response =
      await apiClient.get<ApiResponse<Project>>(
        `/api/projects/${projectId}`
      );

    return response.data;
  },

  async createProject(
    payload: CreateProjectPayload
  ): Promise<ApiResponse<Project>> {
    const response =
      await apiClient.post<ApiResponse<Project>>(
        "/api/projects",
        payload
      );

    return response.data;
  },

  async updateProject(
    projectId: number,
    payload: UpdateProjectPayload
  ): Promise<ApiResponse<Project>> {
    const response =
      await apiClient.put<ApiResponse<Project>>(
        `/api/projects/${projectId}`,
        payload
      );

    return response.data;
  },

  async deleteProject(
    projectId: number,
    permanent: boolean
  ): Promise<ApiResponse<null>> {
    const response =
      await apiClient.delete<ApiResponse<null>>(
        `/api/projects/${projectId}`,
        {
          data: {
            permanent,
          },
        }
      );

    return response.data;
  },

  async getTrashedProjects(
    filters: {
      search?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams();

    if (filters.search) {
      params.set("search", filters.search);
    }

    params.set("page", String(filters.page ?? 1));
    params.set(
      "per_page",
      String(filters.per_page ?? 10)
    );

    const response =
      await apiClient.get<
        PaginatedResponse<Project>
      >(
        `/api/trashed-projects?${params.toString()}`
      );

    return response.data;
  },

  async restoreProject(
    projectId: number
  ): Promise<ApiResponse<Project>> {
    const response =
      await apiClient.patch<ApiResponse<Project>>(
        `/api/trashed-projects/${projectId}/restore`
      );

    return response.data;
  },

  async forceDeleteProject(
    projectId: number
  ): Promise<ApiResponse<null>> {
    const response =
      await apiClient.delete<ApiResponse<null>>(
        `/api/trashed-projects/${projectId}/force`
      );

    return response.data;
  },



async getMembers(
  projectId: number
): Promise<User[]> {
  const response =
    await apiClient.get<ProjectMembersResponse>(
      `/api/projects/${projectId}/members`
    );

  return response.data.data;
},

async addMembers(
  projectId: number,
  userIds: number[]
): Promise<ApiResponse<User[]>> {
  const response =
    await apiClient.post<ApiResponse<User[]>>(
      `/api/projects/${projectId}/members`,
      {
        user_ids: userIds,
      }
    );

  return response.data;
},

async removeMember(
  projectId: number,
  userId: number
): Promise<ApiResponse<null>> {
  const response =
    await apiClient.delete<ApiResponse<null>>(
      `/api/projects/${projectId}/members/${userId}`
    );

  return response.data;
},
};