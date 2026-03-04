import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  Project,
  ProjectRequest,
  ProjectStatus,
  BudgetLineItem,
  BudgetLineItemRequest,
  ProjectFinancialSummary,
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

  // --- Budget Line Items ---

  getBudgetLineItems: async (projectId: string): Promise<BudgetLineItem[]> => {
    const response = await apiClient.get<ApiResponse<BudgetLineItem[]>>(
      `${PROJECTS_BASE}/${projectId}/budget`
    );
    return response.data.data!;
  },

  createBudgetLineItem: async (
    projectId: string,
    data: BudgetLineItemRequest
  ): Promise<BudgetLineItem> => {
    const response = await apiClient.post<ApiResponse<BudgetLineItem>>(
      `${PROJECTS_BASE}/${projectId}/budget`,
      data
    );
    return response.data.data!;
  },

  updateBudgetLineItem: async (
    projectId: string,
    id: string,
    data: BudgetLineItemRequest
  ): Promise<BudgetLineItem> => {
    const response = await apiClient.put<ApiResponse<BudgetLineItem>>(
      `${PROJECTS_BASE}/${projectId}/budget/${id}`,
      data
    );
    return response.data.data!;
  },

  deleteBudgetLineItem: async (projectId: string, id: string): Promise<void> => {
    await apiClient.delete(`${PROJECTS_BASE}/${projectId}/budget/${id}`);
  },

  // --- Financial Summary ---

  getFinancialSummary: async (projectId: string): Promise<ProjectFinancialSummary> => {
    const response = await apiClient.get<ApiResponse<ProjectFinancialSummary>>(
      `${PROJECTS_BASE}/${projectId}/financial-summary`
    );
    return response.data.data!;
  },
};
