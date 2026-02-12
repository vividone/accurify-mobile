import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { statementApi } from '@/services/api/statement.api';
import type {
  UpdateStatementLineRequest,
  BulkUpdateLinesRequest,
  ImportStatementRequest,
} from '@/types';

// Query Keys
export const statementKeys = {
  all: ['statements'] as const,
  lists: () => [...statementKeys.all, 'list'] as const,
  list: (page: number, size: number) => [...statementKeys.lists(), { page, size }] as const,
  details: () => [...statementKeys.all, 'detail'] as const,
  detail: (id: string) => [...statementKeys.details(), id] as const,
  supportedBanks: () => [...statementKeys.all, 'supported-banks'] as const,
  overlap: (startDate: string, endDate: string, accountNumber?: string) =>
    [...statementKeys.all, 'overlap', { startDate, endDate, accountNumber }] as const,
};

// Queries

/**
 * Get all statement uploads for the business
 */
export function useStatementUploads(page = 0, size = 10) {
  return useQuery({
    queryKey: statementKeys.list(page, size),
    queryFn: () => statementApi.getUploads(page, size),
  });
}

/**
 * Get statement upload details with all parsed lines
 */
export function useStatementUploadDetail(uploadId: string | undefined) {
  return useQuery({
    queryKey: statementKeys.detail(uploadId!),
    queryFn: () => statementApi.getUploadDetail(uploadId!),
    enabled: !!uploadId,
  });
}

/**
 * Get list of supported bank statement formats
 */
export function useSupportedBanks() {
  return useQuery({
    queryKey: statementKeys.supportedBanks(),
    queryFn: () => statementApi.getSupportedBanks(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Check for overlapping statement uploads
 */
export function useCheckOverlap(
  startDate: string | null,
  endDate: string | null,
  accountNumber?: string
) {
  return useQuery({
    queryKey: statementKeys.overlap(startDate!, endDate!, accountNumber),
    queryFn: () => statementApi.checkOverlap(startDate!, endDate!, accountNumber),
    enabled: !!startDate && !!endDate,
  });
}

// Mutations

/**
 * Upload and parse a PDF bank statement
 */
export function useUploadStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, bankAccountId, bankName }: { file: File; bankAccountId?: string; bankName?: string }) =>
      statementApi.uploadStatement(file, bankAccountId, bankName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statementKeys.lists() });
    },
  });
}

/**
 * Update a statement line (approve, skip, change category)
 */
export function useUpdateStatementLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lineId, data }: { lineId: string; data: UpdateStatementLineRequest }) =>
      statementApi.updateLine(lineId, data),
    onSuccess: () => {
      // Invalidate the specific upload detail
      queryClient.invalidateQueries({ queryKey: statementKeys.details() });
    },
  });
}

/**
 * Bulk update multiple statement lines
 */
export function useBulkUpdateLines() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkUpdateLinesRequest) => statementApi.bulkUpdateLines(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statementKeys.details() });
    },
  });
}

/**
 * Import approved lines as transactions and journal entries
 */
export function useImportStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ImportStatementRequest) => statementApi.importLines(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statementKeys.all });
      // Also invalidate transactions and journals as they've been updated
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['journals'] });
    },
  });
}

/**
 * Cancel/delete a statement upload
 */
export function useCancelUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uploadId: string) => statementApi.cancelUpload(uploadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statementKeys.lists() });
    },
  });
}
