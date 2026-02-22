import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  ProjectExpense,
  ProjectExpenseRequest,
} from '@/types';

const BASE = '/projects';

export const projectExpensesApi = {
  // List expenses for a project with pagination
  list: async (
    projectId: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<ProjectExpense>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const response = await apiClient.get<ApiResponse<PageResponse<ProjectExpense>>>(
      `${BASE}/${projectId}/expenses?${params}`
    );
    return response.data.data!;
  },

  // Get single expense
  getById: async (projectId: string, id: string): Promise<ProjectExpense> => {
    const response = await apiClient.get<ApiResponse<ProjectExpense>>(
      `${BASE}/${projectId}/expenses/${id}`
    );
    return response.data.data!;
  },

  // Create expense
  create: async (
    projectId: string,
    data: ProjectExpenseRequest
  ): Promise<ProjectExpense> => {
    const response = await apiClient.post<ApiResponse<ProjectExpense>>(
      `${BASE}/${projectId}/expenses`,
      data
    );
    return response.data.data!;
  },

  // Update expense
  update: async (
    projectId: string,
    id: string,
    data: ProjectExpenseRequest
  ): Promise<ProjectExpense> => {
    const response = await apiClient.put<ApiResponse<ProjectExpense>>(
      `${BASE}/${projectId}/expenses/${id}`,
      data
    );
    return response.data.data!;
  },

  // Delete expense
  delete: async (projectId: string, id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${projectId}/expenses/${id}`);
  },
};
