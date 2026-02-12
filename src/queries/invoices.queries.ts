import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '@/services/api';
import type {
  InvoiceRequest,
  InvoiceFilters,
  MarkPaidRequest,
} from '@/types';

export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (page: number, size: number, filters?: InvoiceFilters) =>
    [...invoiceKeys.lists(), { page, size, filters }] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};

export function useInvoices(
  page = 0,
  size = 20,
  filters?: InvoiceFilters
) {
  return useQuery({
    queryKey: invoiceKeys.list(page, size, filters),
    queryFn: () => invoicesApi.list(page, size, filters),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoicesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InvoiceRequest) => invoicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InvoiceRequest }) =>
      invoicesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.send(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) });
    },
  });
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MarkPaidRequest }) =>
      invoicesApi.markPaid(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) });
      // Also invalidate dashboard as it shows unpaid invoices count
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useInvoicePdf(id: string, enabled = false) {
  return useQuery({
    queryKey: [...invoiceKeys.detail(id), 'pdf'] as const,
    queryFn: () => invoicesApi.getPdf(id),
    enabled: enabled && !!id,
    staleTime: 0, // Always fetch fresh PDF
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useResendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.resend(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) });
    },
  });
}

export function useSendReceipt() {
  return useMutation({
    mutationFn: (id: string) => invoicesApi.sendReceipt(id),
  });
}
