import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  TimeEntry,
  TimeEntryRequest,
} from '@/types';

const TIME_ENTRIES_BASE = '/time-entries';

export const timeEntriesApi = {
  // List all time entries with pagination
  list: async (page = 0, size = 20): Promise<PageResponse<TimeEntry>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const response = await apiClient.get<ApiResponse<PageResponse<TimeEntry>>>(
      `${TIME_ENTRIES_BASE}?${params}`
    );
    return response.data.data!;
  },

  // List time entries for a specific project
  listByProject: async (
    projectId: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<TimeEntry>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const response = await apiClient.get<ApiResponse<PageResponse<TimeEntry>>>(
      `/projects/${projectId}/time-entries?${params}`
    );
    return response.data.data!;
  },

  // Get single time entry
  getById: async (id: string): Promise<TimeEntry> => {
    const response = await apiClient.get<ApiResponse<TimeEntry>>(
      `${TIME_ENTRIES_BASE}/${id}`
    );
    return response.data.data!;
  },

  // Create time entry
  create: async (data: TimeEntryRequest): Promise<TimeEntry> => {
    const response = await apiClient.post<ApiResponse<TimeEntry>>(
      TIME_ENTRIES_BASE,
      data
    );
    return response.data.data!;
  },

  // Update time entry
  update: async (id: string, data: TimeEntryRequest): Promise<TimeEntry> => {
    const response = await apiClient.put<ApiResponse<TimeEntry>>(
      `${TIME_ENTRIES_BASE}/${id}`,
      data
    );
    return response.data.data!;
  },

  // Delete time entry
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${TIME_ENTRIES_BASE}/${id}`);
  },
};
