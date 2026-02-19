import apiClient from './client';
import type { ApiResponse, PageResponse, FixedAsset } from '@/types';

const ASSETS_BASE = '/fixed-assets';

export const assetsApi = {
  // Get all fixed assets with pagination
  list: async (page = 0, size = 20): Promise<PageResponse<FixedAsset>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const response = await apiClient.get<ApiResponse<PageResponse<FixedAsset>>>(
      `${ASSETS_BASE}?${params}`
    );
    return response.data.data!;
  },

  // Get a single fixed asset by ID
  getById: async (id: string): Promise<FixedAsset> => {
    const response = await apiClient.get<ApiResponse<FixedAsset>>(
      `${ASSETS_BASE}/${id}`
    );
    return response.data.data!;
  },
};
