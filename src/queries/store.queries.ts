/**
 * React Query hooks for QuickStore.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeApi } from '@/services/api/store.api';
import { addonKeys } from './addon.queries';
import type {
  StoreRequest,
  OrderRequest,
  SubaccountSetupRequest,
  OrderStatus,
  OrderPaymentStatus,
} from '@/types/store.types';

// ==================== Query Keys ====================

export const storeKeys = {
  all: ['store'] as const,
  detail: () => [...storeKeys.all, 'detail'] as const,
  slugCheck: (slug: string) => [...storeKeys.all, 'slugCheck', slug] as const,
  orders: () => [...storeKeys.all, 'orders'] as const,
  orderList: (page: number, size: number, status?: OrderStatus) =>
    [...storeKeys.orders(), 'list', { page, size, status }] as const,
  orderSearch: (query: string, page: number, size: number) =>
    [...storeKeys.orders(), 'search', { query, page, size }] as const,
  orderDetail: (orderId: string) => [...storeKeys.orders(), 'detail', orderId] as const,
  pendingCount: () => [...storeKeys.orders(), 'pendingCount'] as const,
  payments: () => [...storeKeys.all, 'payments'] as const,
  paymentAccount: () => [...storeKeys.payments(), 'account'] as const,
  banks: () => [...storeKeys.payments(), 'banks'] as const,
  bankResolve: (accountNumber: string, bankCode: string) =>
    [...storeKeys.payments(), 'resolve', { accountNumber, bankCode }] as const,
};

// ==================== Store Queries ====================

/**
 * Get my store details
 * Returns null if store doesn't exist (404)
 */
export function useMyStore() {
  return useQuery({
    queryKey: storeKeys.detail(),
    queryFn: async () => {
      try {
        const response = await storeApi.getMyStore();
        return response.data;
      } catch (error: unknown) {
        // Return null if store doesn't exist (404)
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 404) {
            return null;
          }
        }
        throw error;
      }
    },
    retry: false, // Don't retry if store doesn't exist
  });
}

/**
 * Check slug availability
 */
export function useSlugAvailability(slug: string) {
  return useQuery({
    queryKey: storeKeys.slugCheck(slug),
    queryFn: async () => {
      const response = await storeApi.checkSlugAvailability(slug);
      return response.data;
    },
    enabled: slug.length >= 3,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Create store mutation
 */
export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreRequest) => storeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.detail() });
    },
  });
}

/**
 * Update store mutation
 */
export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreRequest) => storeApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.detail() });
    },
  });
}

/**
 * Toggle store status mutation
 */
export function useToggleStoreStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (active: boolean) => storeApi.toggleStatus(active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.detail() });
    },
  });
}

/**
 * Toggle accepting orders mutation
 */
export function useToggleAcceptOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (acceptOrders: boolean) => storeApi.toggleOrders(acceptOrders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.detail() });
    },
  });
}

/**
 * Upload store logo mutation
 */
export function useUploadStoreLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => storeApi.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.detail() });
    },
  });
}

/**
 * Upload store banner mutation
 */
export function useUploadStoreBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => storeApi.uploadBanner(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.detail() });
    },
  });
}

// ==================== Order Queries ====================

/**
 * List orders
 */
export function useOrders(page: number = 0, size: number = 20, status?: OrderStatus) {
  return useQuery({
    queryKey: storeKeys.orderList(page, size, status),
    queryFn: async () => {
      const response = await storeApi.listOrders(page, size, status);
      return response.data;
    },
  });
}

/**
 * Search orders
 */
export function useOrderSearch(query: string, page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: storeKeys.orderSearch(query, page, size),
    queryFn: async () => {
      const response = await storeApi.searchOrders(query, page, size);
      return response.data;
    },
    enabled: query.length >= 2,
  });
}

/**
 * Get order details
 */
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: storeKeys.orderDetail(orderId),
    queryFn: async () => {
      const response = await storeApi.getOrder(orderId);
      return response.data;
    },
    enabled: !!orderId,
  });
}

/**
 * Get pending orders count
 * @param enabled - Only fetch when store exists
 */
export function usePendingOrdersCount(enabled = true) {
  return useQuery({
    queryKey: storeKeys.pendingCount(),
    queryFn: async () => {
      const response = await storeApi.getPendingCount();
      return response.data;
    },
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
    enabled,
  });
}

/**
 * Create order mutation (POS)
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrderRequest) => storeApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.orders() });
    },
  });
}

/**
 * Confirm order mutation
 */
export function useConfirmOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => storeApi.confirmOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.orders() });
      queryClient.invalidateQueries({ queryKey: storeKeys.orderDetail(orderId) });
    },
  });
}

/**
 * Mark order processing mutation
 */
export function useMarkOrderProcessing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => storeApi.markProcessing(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.orders() });
      queryClient.invalidateQueries({ queryKey: storeKeys.orderDetail(orderId) });
    },
  });
}

/**
 * Mark order ready mutation
 */
export function useMarkOrderReady() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => storeApi.markReady(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.orders() });
      queryClient.invalidateQueries({ queryKey: storeKeys.orderDetail(orderId) });
    },
  });
}

/**
 * Complete order mutation
 */
export function useCompleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => storeApi.completeOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.orders() });
      queryClient.invalidateQueries({ queryKey: storeKeys.orderDetail(orderId) });
    },
  });
}

/**
 * Cancel order mutation
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      storeApi.cancelOrder(orderId, reason),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.orders() });
      queryClient.invalidateQueries({ queryKey: storeKeys.orderDetail(orderId) });
    },
  });
}

/**
 * Update payment mutation
 */
export function useUpdateOrderPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      status,
      method,
      reference,
    }: {
      orderId: string;
      status: OrderPaymentStatus;
      method?: string;
      reference?: string;
    }) => storeApi.updatePayment(orderId, status, method, reference),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: storeKeys.orders() });
      queryClient.invalidateQueries({ queryKey: storeKeys.orderDetail(orderId) });
    },
  });
}

// ==================== Payment Queries ====================

/**
 * Get payment account details
 * Returns null if not set up yet
 * @param enabled - Only fetch when store exists (default: true)
 */
export function usePaymentAccount(enabled = true) {
  return useQuery({
    queryKey: storeKeys.paymentAccount(),
    queryFn: async () => {
      try {
        const response = await storeApi.getPaymentAccount();
        // Ensure we never return undefined - return null if no data
        return response.data ?? null;
      } catch (error: unknown) {
        // Return null if store/payment not found (404) or server error (500)
        // This prevents auth interceptor from triggering logout
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
          const status = axiosError.response?.status;
          if (status === 404 || status === 500) {
            return null;
          }
        }
        // For other errors, still return null to prevent crashes
        console.error('Error fetching payment account:', error);
        return null;
      }
    },
    enabled,
    retry: false,
  });
}

/**
 * Get list of banks
 */
export function useBanks() {
  return useQuery({
    queryKey: storeKeys.banks(),
    queryFn: async () => {
      try {
        const response = await storeApi.getBanks();
        return response.data;
      } catch (error: unknown) {
        // Return empty array on error to prevent crashes
        console.error('Failed to fetch banks:', error);
        return [];
      }
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - banks rarely change
  });
}

/**
 * Resolve bank account
 */
export function useBankAccountResolution(accountNumber: string, bankCode: string) {
  return useQuery({
    queryKey: storeKeys.bankResolve(accountNumber, bankCode),
    queryFn: async () => {
      const response = await storeApi.resolveBankAccount(accountNumber, bankCode);
      return response.data;
    },
    enabled: accountNumber.length === 10 && !!bankCode,
    retry: false,
  });
}

/**
 * Setup payment account mutation
 */
export function useSetupPaymentAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubaccountSetupRequest) => {
      const response = await storeApi.setupPaymentAccount(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.paymentAccount() });
      queryClient.invalidateQueries({ queryKey: storeKeys.detail() });
      // Invalidate addon status since Accurify Pay is auto-activated on payment setup
      queryClient.invalidateQueries({ queryKey: addonKeys.all });
    },
    onError: (error) => {
      // Log error but don't propagate in a way that could trigger auth issues
      console.error('Failed to setup payment account:', error);
    },
  });
}
