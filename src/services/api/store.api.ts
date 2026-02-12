/**
 * QuickStore API service for storefront and order management.
 */
import apiClient from './client';
import type {
  Store,
  StoreRequest,
  StoreOrder,
  OrderRequest,
  SubaccountSetupRequest,
  SubaccountResponse,
  PaystackBank,
  BankAccountResolution,
  OrderStatus,
  OrderPaymentStatus,
} from '@/types/store.types';
import type { ApiResponse, PageResponse } from '@/types/api.types';

const STORE_BASE = '/store';

export const storeApi = {
  // ==================== Store Management ====================

  /**
   * Create a new store
   */
  create: async (data: StoreRequest): Promise<ApiResponse<Store>> => {
    const response = await apiClient.post<ApiResponse<Store>>(STORE_BASE, data);
    return response.data;
  },

  /**
   * Get my store
   */
  getMyStore: async (): Promise<ApiResponse<Store>> => {
    const response = await apiClient.get<ApiResponse<Store>>(STORE_BASE);
    return response.data;
  },

  /**
   * Update store settings
   */
  update: async (data: StoreRequest): Promise<ApiResponse<Store>> => {
    const response = await apiClient.put<ApiResponse<Store>>(STORE_BASE, data);
    return response.data;
  },

  /**
   * Check if a slug is available
   */
  checkSlugAvailability: async (slug: string): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.get<ApiResponse<boolean>>(`${STORE_BASE}/check-slug`, {
      params: { slug },
    });
    return response.data;
  },

  /**
   * Toggle store active status
   */
  toggleStatus: async (active: boolean): Promise<ApiResponse<Store>> => {
    const response = await apiClient.post<ApiResponse<Store>>(`${STORE_BASE}/toggle-status`, null, {
      params: { active },
    });
    return response.data;
  },

  /**
   * Toggle accepting orders
   */
  toggleOrders: async (acceptOrders: boolean): Promise<ApiResponse<Store>> => {
    const response = await apiClient.post<ApiResponse<Store>>(`${STORE_BASE}/toggle-orders`, null, {
      params: { acceptOrders },
    });
    return response.data;
  },

  /**
   * Upload store logo
   */
  uploadLogo: async (file: File): Promise<ApiResponse<Store>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<Store>>(
      `${STORE_BASE}/logo`,
      formData
    );
    return response.data;
  },

  /**
   * Upload store banner
   */
  uploadBanner: async (file: File): Promise<ApiResponse<Store>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<Store>>(
      `${STORE_BASE}/banner`,
      formData
    );
    return response.data;
  },

  // ==================== Order Management ====================

  /**
   * Create a new order (POS)
   */
  createOrder: async (data: OrderRequest): Promise<ApiResponse<StoreOrder>> => {
    const response = await apiClient.post<ApiResponse<StoreOrder>>(`${STORE_BASE}/orders`, data);
    return response.data;
  },

  /**
   * List orders with optional status filter
   */
  listOrders: async (
    page: number = 0,
    size: number = 20,
    status?: OrderStatus
  ): Promise<ApiResponse<PageResponse<StoreOrder>>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<StoreOrder>>>(`${STORE_BASE}/orders`, {
      params: { page, size, status },
    });
    return response.data;
  },

  /**
   * Search orders
   */
  searchOrders: async (
    query: string,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PageResponse<StoreOrder>>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<StoreOrder>>>(`${STORE_BASE}/orders/search`, {
      params: { query, page, size },
    });
    return response.data;
  },

  /**
   * Get order details
   */
  getOrder: async (orderId: string): Promise<ApiResponse<StoreOrder>> => {
    const response = await apiClient.get<ApiResponse<StoreOrder>>(`${STORE_BASE}/orders/${orderId}`);
    return response.data;
  },

  /**
   * Confirm an order
   */
  confirmOrder: async (orderId: string): Promise<ApiResponse<StoreOrder>> => {
    const response = await apiClient.post<ApiResponse<StoreOrder>>(`${STORE_BASE}/orders/${orderId}/confirm`);
    return response.data;
  },

  /**
   * Mark order as processing
   */
  markProcessing: async (orderId: string): Promise<ApiResponse<StoreOrder>> => {
    const response = await apiClient.post<ApiResponse<StoreOrder>>(`${STORE_BASE}/orders/${orderId}/processing`);
    return response.data;
  },

  /**
   * Mark order as ready
   */
  markReady: async (orderId: string): Promise<ApiResponse<StoreOrder>> => {
    const response = await apiClient.post<ApiResponse<StoreOrder>>(`${STORE_BASE}/orders/${orderId}/ready`);
    return response.data;
  },

  /**
   * Complete an order
   */
  completeOrder: async (orderId: string): Promise<ApiResponse<StoreOrder>> => {
    const response = await apiClient.post<ApiResponse<StoreOrder>>(`${STORE_BASE}/orders/${orderId}/complete`);
    return response.data;
  },

  /**
   * Cancel an order
   */
  cancelOrder: async (orderId: string, reason?: string): Promise<ApiResponse<StoreOrder>> => {
    const response = await apiClient.post<ApiResponse<StoreOrder>>(`${STORE_BASE}/orders/${orderId}/cancel`, null, {
      params: { reason },
    });
    return response.data;
  },

  /**
   * Update payment status
   */
  updatePayment: async (
    orderId: string,
    status: OrderPaymentStatus,
    method?: string,
    reference?: string
  ): Promise<ApiResponse<StoreOrder>> => {
    const response = await apiClient.post<ApiResponse<StoreOrder>>(`${STORE_BASE}/orders/${orderId}/payment`, null, {
      params: { status, method, reference },
    });
    return response.data;
  },

  /**
   * Get pending orders count
   */
  getPendingCount: async (): Promise<ApiResponse<number>> => {
    const response = await apiClient.get<ApiResponse<number>>(`${STORE_BASE}/orders/pending/count`);
    return response.data;
  },

  // ==================== Payment Setup (Accurify Pay) ====================

  /**
   * Setup Paystack subaccount
   */
  setupPaymentAccount: async (data: SubaccountSetupRequest): Promise<ApiResponse<SubaccountResponse>> => {
    const response = await apiClient.post<ApiResponse<SubaccountResponse>>(`${STORE_BASE}/payments/setup`, data);
    return response.data;
  },

  /**
   * Get payment account details
   */
  getPaymentAccount: async (): Promise<ApiResponse<SubaccountResponse>> => {
    const response = await apiClient.get<ApiResponse<SubaccountResponse>>(`${STORE_BASE}/payments/setup`);
    return response.data;
  },

  /**
   * Get list of banks
   */
  getBanks: async (): Promise<ApiResponse<PaystackBank[]>> => {
    const response = await apiClient.get<ApiResponse<PaystackBank[]>>(`${STORE_BASE}/payments/banks`);
    return response.data;
  },

  /**
   * Resolve bank account
   */
  resolveBankAccount: async (accountNumber: string, bankCode: string): Promise<ApiResponse<BankAccountResolution>> => {
    const response = await apiClient.get<ApiResponse<BankAccountResolution>>(`${STORE_BASE}/payments/resolve-account`, {
      params: { accountNumber, bankCode },
    });
    return response.data;
  },
};

export default storeApi;
