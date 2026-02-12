import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billsApi } from '@/services/api';
import type { BillRequest, BillStatus, MarkBillPaidRequest } from '@/types';

export const billKeys = {
  all: ['bills'] as const,
  lists: () => [...billKeys.all, 'list'] as const,
  list: (page: number, size: number, status?: BillStatus) =>
    [...billKeys.lists(), { page, size, status }] as const,
  details: () => [...billKeys.all, 'detail'] as const,
  detail: (id: string) => [...billKeys.details(), id] as const,
  summary: () => [...billKeys.all, 'summary'] as const,
};

export function useBills(page = 0, size = 20, status?: BillStatus) {
  return useQuery({
    queryKey: billKeys.list(page, size, status),
    queryFn: () => billsApi.list(page, size, status),
  });
}

export function useBill(id: string) {
  return useQuery({
    queryKey: billKeys.detail(id),
    queryFn: () => billsApi.getById(id),
    enabled: !!id,
  });
}

export function useParseBill() {
  return useMutation({
    mutationFn: (file: File) => billsApi.parse(file),
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BillRequest) => billsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.lists() });
      queryClient.invalidateQueries({ queryKey: billKeys.summary() });
    },
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BillRequest }) =>
      billsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: billKeys.lists() });
      queryClient.invalidateQueries({ queryKey: billKeys.detail(id) });
    },
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => billsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.lists() });
      queryClient.invalidateQueries({ queryKey: billKeys.summary() });
    },
  });
}

export function useApproveBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => billsApi.approve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: billKeys.lists() });
      queryClient.invalidateQueries({ queryKey: billKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: billKeys.summary() });
      // Invalidate GL queries as a journal entry was created
      queryClient.invalidateQueries({ queryKey: ['gl'] });
    },
  });
}

export function useMarkBillPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MarkBillPaidRequest }) =>
      billsApi.markAsPaid(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: billKeys.lists() });
      queryClient.invalidateQueries({ queryKey: billKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: billKeys.summary() });
      // Invalidate GL queries as a payment journal entry was created
      queryClient.invalidateQueries({ queryKey: ['gl'] });
      // Also invalidate dashboard as it shows accounts payable
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCancelBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      billsApi.cancel(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: billKeys.lists() });
      queryClient.invalidateQueries({ queryKey: billKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: billKeys.summary() });
    },
  });
}

export function useUploadBillDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ billId, file }: { billId: string; file: File }) =>
      billsApi.uploadDocument(billId, file),
    onSuccess: (_, { billId }) => {
      queryClient.invalidateQueries({ queryKey: billKeys.detail(billId) });
    },
  });
}

export function useAccountsPayableSummary() {
  return useQuery({
    queryKey: billKeys.summary(),
    queryFn: () => billsApi.getSummary(),
  });
}
