import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  StockHistory,
  StockMovementRequest,
  ProductSaleRequest,
  StockSummary,
  StockMovementType,
} from '@/types';

const STOCK_BASE = '/stock';

export const stockApi = {
  // Get stock history with pagination
  list: async (page = 0, size = 20): Promise<PageResponse<StockHistory>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const response = await apiClient.get<ApiResponse<PageResponse<StockHistory>>>(
      `${STOCK_BASE}?${params}`
    );
    return response.data.data!;
  },

  // Get stock history by product
  listByProduct: async (
    productId: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<StockHistory>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const response = await apiClient.get<ApiResponse<PageResponse<StockHistory>>>(
      `${STOCK_BASE}/product/${productId}?${params}`
    );
    return response.data.data!;
  },

  // Get stock history by movement type
  listByType: async (
    type: StockMovementType,
    page = 0,
    size = 20
  ): Promise<PageResponse<StockHistory>> => {
    const params = new URLSearchParams({
      type,
      page: page.toString(),
      size: size.toString(),
    });

    const response = await apiClient.get<ApiResponse<PageResponse<StockHistory>>>(
      `${STOCK_BASE}/by-type?${params}`
    );
    return response.data.data!;
  },

  // Get stock history by date range
  listByDateRange: async (
    startDate: string,
    endDate: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<StockHistory>> => {
    const params = new URLSearchParams({
      startDate,
      endDate,
      page: page.toString(),
      size: size.toString(),
    });

    const response = await apiClient.get<ApiResponse<PageResponse<StockHistory>>>(
      `${STOCK_BASE}/by-date?${params}`
    );
    return response.data.data!;
  },

  // Record a stock movement (purchase, adjustment, etc.)
  recordMovement: async (data: StockMovementRequest): Promise<StockHistory> => {
    const response = await apiClient.post<ApiResponse<StockHistory>>(
      `${STOCK_BASE}/movement`,
      data
    );
    return response.data.data!;
  },

  // Record a product sale (reduces stock + creates transaction)
  recordSale: async (data: ProductSaleRequest): Promise<StockHistory> => {
    const response = await apiClient.post<ApiResponse<StockHistory>>(
      `${STOCK_BASE}/sale`,
      data
    );
    return response.data.data!;
  },

  // Get stock summary/statistics
  getSummary: async (startDate?: string, endDate?: string): Promise<StockSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const url = params.toString()
      ? `${STOCK_BASE}/summary?${params}`
      : `${STOCK_BASE}/summary`;

    const response = await apiClient.get<ApiResponse<StockSummary>>(url);
    return response.data.data!;
  },

  // Get movement types
  getMovementTypes: async (): Promise<StockMovementType[]> => {
    const response = await apiClient.get<ApiResponse<StockMovementType[]>>(
      `${STOCK_BASE}/movement-types`
    );
    return response.data.data!;
  },
};
