import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  Product,
  ProductRequest,
  ProductSummary,
  ProductCategory,
} from '@/types';

const PRODUCTS_BASE = '/products';

export const productsApi = {
  // List products with pagination and filters
  list: async (
    page = 0,
    size = 20,
    filters?: { active?: boolean; category?: ProductCategory }
  ): Promise<PageResponse<Product>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters?.active !== undefined) {
      params.append('active', filters.active.toString());
    }
    if (filters?.category) {
      params.append('category', filters.category);
    }

    const response = await apiClient.get<ApiResponse<PageResponse<Product>>>(
      `${PRODUCTS_BASE}?${params}`
    );
    return response.data.data!;
  },

  // Search products by name or SKU
  search: async (query: string, page = 0, size = 20): Promise<PageResponse<Product>> => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      size: size.toString(),
    });
    const response = await apiClient.get<ApiResponse<PageResponse<Product>>>(
      `${PRODUCTS_BASE}/search?${params}`
    );
    return response.data.data!;
  },

  // Get single product
  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(
      `${PRODUCTS_BASE}/${id}`
    );
    return response.data.data!;
  },

  // Create product
  create: async (data: ProductRequest): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<Product>>(
      PRODUCTS_BASE,
      data
    );
    return response.data.data!;
  },

  // Update product
  update: async (id: string, data: ProductRequest): Promise<Product> => {
    const response = await apiClient.put<ApiResponse<Product>>(
      `${PRODUCTS_BASE}/${id}`,
      data
    );
    return response.data.data!;
  },

  // Delete product
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${PRODUCTS_BASE}/${id}`);
  },

  // Deactivate product (soft delete)
  deactivate: async (id: string): Promise<void> => {
    await apiClient.post(`${PRODUCTS_BASE}/${id}/deactivate`);
  },

  // Activate product
  activate: async (id: string): Promise<void> => {
    await apiClient.post(`${PRODUCTS_BASE}/${id}/activate`);
  },

  // Get product summary/statistics
  getSummary: async (): Promise<ProductSummary> => {
    const response = await apiClient.get<ApiResponse<ProductSummary>>(
      `${PRODUCTS_BASE}/summary`
    );
    return response.data.data!;
  },

  // Get low stock products
  getLowStock: async (): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `${PRODUCTS_BASE}/low-stock`
    );
    return response.data.data!;
  },

  // Get out of stock products
  getOutOfStock: async (): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `${PRODUCTS_BASE}/out-of-stock`
    );
    return response.data.data!;
  },

  // Get product categories
  getCategories: async (): Promise<ProductCategory[]> => {
    const response = await apiClient.get<ApiResponse<ProductCategory[]>>(
      `${PRODUCTS_BASE}/categories`
    );
    return response.data.data!;
  },

  // Upload product image
  uploadImage: async (productId: string, file: File): Promise<Product> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<Product>>(
      `${PRODUCTS_BASE}/${productId}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!;
  },
};
