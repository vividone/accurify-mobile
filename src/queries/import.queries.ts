/**
 * React Query hooks for Universal Importer.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { importApi } from '@/services/api/import.api';
import type { ImportType } from '@/types/import.types';

// ==================== Query Keys ====================

export const importKeys = {
  all: ['import'] as const,
  templates: () => [...importKeys.all, 'templates'] as const,
  template: (type: ImportType) => [...importKeys.templates(), type] as const,
  jobs: () => [...importKeys.all, 'jobs'] as const,
  jobList: (page: number, size: number, type?: ImportType) =>
    [...importKeys.jobs(), 'list', { page, size, type }] as const,
  jobDetail: (jobId: string) => [...importKeys.jobs(), 'detail', jobId] as const,
  jobErrors: (jobId: string) => [...importKeys.jobs(), 'errors', jobId] as const,
  openingBalances: (balanceDate?: string) =>
    [...importKeys.all, 'openingBalances', { balanceDate }] as const,
  trialBalanceCheck: (balanceDate: string) =>
    [...importKeys.all, 'trialBalanceCheck', balanceDate] as const,
};

// ==================== Template Queries ====================

/**
 * Get all available import templates
 */
export function useImportTemplates() {
  return useQuery({
    queryKey: importKeys.templates(),
    queryFn: async () => {
      const response = await importApi.getAllTemplates();
      return response.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour - templates rarely change
  });
}

/**
 * Get template for a specific import type
 */
export function useImportTemplate(type: ImportType) {
  return useQuery({
    queryKey: importKeys.template(type),
    queryFn: async () => {
      const response = await importApi.getTemplate(type);
      return response.data;
    },
    enabled: !!type,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Download sample CSV mutation (returns data, not a query)
 */
export function useDownloadSampleCsv() {
  return useMutation({
    mutationFn: async (type: ImportType) => {
      const csv = await importApi.downloadSampleCsv(type);
      // Create and trigger download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type.toLowerCase()}_sample.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return csv;
    },
  });
}

// ==================== Validation & Import ====================

/**
 * Validate CSV file mutation
 */
export function useValidateCsv() {
  return useMutation({
    mutationFn: ({ type, file }: { type: ImportType; file: File }) =>
      importApi.validateCsv(type, file),
  });
}

/**
 * Start import mutation
 */
export function useStartImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, file }: { type: ImportType; file: File }) =>
      importApi.startImport(type, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: importKeys.jobs() });
    },
  });
}

// ==================== Import Job Queries ====================

/**
 * List import jobs
 */
export function useImportJobs(page: number = 0, size: number = 20, type?: ImportType) {
  return useQuery({
    queryKey: importKeys.jobList(page, size, type),
    queryFn: async () => {
      const response = await importApi.listJobs(page, size, type);
      return response.data;
    },
  });
}

/**
 * Get import job details
 */
export function useImportJob(jobId: string) {
  return useQuery({
    queryKey: importKeys.jobDetail(jobId),
    queryFn: async () => {
      const response = await importApi.getJob(jobId);
      return response.data;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Poll every 2 seconds if job is still processing
      const data = query.state.data;
      if (data && (data.status === 'PENDING' || data.status === 'PROCESSING')) {
        return 2000;
      }
      return false;
    },
  });
}

/**
 * Get import job errors
 */
export function useImportJobErrors(jobId: string) {
  return useQuery({
    queryKey: importKeys.jobErrors(jobId),
    queryFn: async () => {
      const response = await importApi.getJobErrors(jobId);
      return response.data;
    },
    enabled: !!jobId,
  });
}

// ==================== Opening Balance Queries ====================

/**
 * Get opening balances
 */
export function useOpeningBalances(balanceDate?: string) {
  return useQuery({
    queryKey: importKeys.openingBalances(balanceDate),
    queryFn: async () => {
      const response = await importApi.getOpeningBalances(balanceDate);
      return response.data;
    },
  });
}

/**
 * Check if trial balance is balanced
 */
export function useTrialBalanceCheck(balanceDate: string) {
  return useQuery({
    queryKey: importKeys.trialBalanceCheck(balanceDate),
    queryFn: async () => {
      const response = await importApi.checkTrialBalance(balanceDate);
      return response.data;
    },
    enabled: !!balanceDate,
  });
}

/**
 * Post opening balances mutation
 */
export function usePostOpeningBalances() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (balanceDate: string) => importApi.postOpeningBalances(balanceDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: importKeys.openingBalances() });
    },
  });
}
