import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  Project,
  ProjectRequest,
  ProjectStatus,
} from '@/types';

const PROJECTS_BASE = '/projects';

export const projectsApi = {
  // List projects with pagination and optional status filter
  list: async (
    page = 0,
    size = 20,
    status?: ProjectStatus
  ): Promise<PageResponse<Project>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (status) params.append('status', status);

    const response = await apiClient.get<ApiResponse<PageResponse<Project>>>(
      `${PROJECTS_BASE}?${params}`
    );
    return response.data.data!;
  },

  // Get single project with summary stats
  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get<ApiResponse<Project>>(
      `${PROJECTS_BASE}/${id}`
    );
    return response.data.data!;
  },

  // Create project
  create: async (data: ProjectRequest): Promise<Project> => {
    const response = await apiClient.post<ApiResponse<Project>>(
      PROJECTS_BASE,
      data
    );
    return response.data.data!;
  },

  // Update project
  update: async (id: string, data: ProjectRequest): Promise<Project> => {
    const response = await apiClient.put<ApiResponse<Project>>(
      `${PROJECTS_BASE}/${id}`,
      data
    );
    return response.data.data!;
  },

  // Delete project
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${PROJECTS_BASE}/${id}`);
  },
};
