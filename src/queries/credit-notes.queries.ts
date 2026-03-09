import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creditNotesApi } from '@/services/api';
import type { CreditNoteRequest } from '@/types';

export const creditNoteKeys = {
  all: ['credit-notes'] as const,
  lists: () => [...creditNoteKeys.all, 'list'] as const,
  list: (page: number, size: number) => [...creditNoteKeys.lists(), { page, size }] as const,
  details: () => [...creditNoteKeys.all, 'detail'] as const,
  detail: (id: string) => [...creditNoteKeys.details(), id] as const,
};

export function useCreditNotes(page = 0, size = 20) {
  return useQuery({
    queryKey: creditNoteKeys.list(page, size),
    queryFn: () => creditNotesApi.list(page, size),
  });
}

export function useCreditNote(id: string) {
  return useQuery({
    queryKey: creditNoteKeys.detail(id),
    queryFn: () => creditNotesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCreditNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreditNoteRequest) => creditNotesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditNoteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useIssueCreditNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => creditNotesApi.issue(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: creditNoteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: creditNoteKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['gl'] });
    },
  });
}

export function useVoidCreditNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => creditNotesApi.void_(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: creditNoteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: creditNoteKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['gl'] });
    },
  });
}
