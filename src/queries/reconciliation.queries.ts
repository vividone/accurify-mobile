import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reconciliationApi } from '@/services/api';
import type { StartReconciliationRequest, ConfirmMatchRequest } from '@/types';

export const reconciliationKeys = {
  all: ['reconciliation'] as const,
  sessions: () => [...reconciliationKeys.all, 'sessions'] as const,
  session: (id: string) => [...reconciliationKeys.sessions(), id] as const,
  suggestions: (sessionId: string) => [...reconciliationKeys.session(sessionId), 'suggestions'] as const,
  matches: (sessionId: string) => [...reconciliationKeys.session(sessionId), 'matches'] as const,
};

export function useReconciliationSessions(bankAccountId?: string) {
  return useQuery({
    queryKey: [...reconciliationKeys.sessions(), { bankAccountId }],
    queryFn: () => reconciliationApi.getSessions(bankAccountId),
  });
}

export function useReconciliationSession(sessionId: string) {
  return useQuery({
    queryKey: reconciliationKeys.session(sessionId),
    queryFn: () => reconciliationApi.getSession(sessionId),
    enabled: !!sessionId,
  });
}

export function useReconciliationSuggestions(sessionId: string) {
  return useQuery({
    queryKey: reconciliationKeys.suggestions(sessionId),
    queryFn: () => reconciliationApi.getSuggestions(sessionId),
    enabled: !!sessionId,
  });
}

export function useReconciliationMatches(sessionId: string) {
  return useQuery({
    queryKey: reconciliationKeys.matches(sessionId),
    queryFn: () => reconciliationApi.getMatches(sessionId),
    enabled: !!sessionId,
  });
}

export function useStartReconciliationSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StartReconciliationRequest) => reconciliationApi.startSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reconciliationKeys.sessions() });
    },
  });
}

export function useConfirmMatch(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ConfirmMatchRequest) => reconciliationApi.confirmMatch(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reconciliationKeys.suggestions(sessionId) });
      queryClient.invalidateQueries({ queryKey: reconciliationKeys.matches(sessionId) });
      queryClient.invalidateQueries({ queryKey: reconciliationKeys.session(sessionId) });
    },
  });
}

export function useRejectMatch(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => reconciliationApi.rejectMatch(sessionId, matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reconciliationKeys.matches(sessionId) });
      queryClient.invalidateQueries({ queryKey: reconciliationKeys.session(sessionId) });
    },
  });
}

export function useCompleteReconciliationSession(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => reconciliationApi.completeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reconciliationKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: reconciliationKeys.session(sessionId) });
    },
  });
}
