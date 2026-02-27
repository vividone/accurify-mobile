import apiClient from './client';
import type {
  ApiResponse,
  ReconciliationSession,
  ReconciliationSuggestion,
  ReconciliationMatch,
  StartReconciliationRequest,
  ConfirmMatchRequest,
} from '@/types';

const BASE = '/reconciliation';

export const reconciliationApi = {
  startSession: async (data: StartReconciliationRequest): Promise<ReconciliationSession> => {
    const response = await apiClient.post<ApiResponse<ReconciliationSession>>(
      `${BASE}/sessions`,
      data
    );
    return response.data.data!;
  },

  getSessions: async (bankAccountId?: string): Promise<ReconciliationSession[]> => {
    const params = bankAccountId ? `?bankAccountId=${bankAccountId}` : '';
    const response = await apiClient.get<ApiResponse<ReconciliationSession[]>>(
      `${BASE}/sessions${params}`
    );
    return response.data.data!;
  },

  getSession: async (sessionId: string): Promise<ReconciliationSession> => {
    const response = await apiClient.get<ApiResponse<ReconciliationSession>>(
      `${BASE}/sessions/${sessionId}`
    );
    return response.data.data!;
  },

  getSuggestions: async (sessionId: string): Promise<ReconciliationSuggestion[]> => {
    const response = await apiClient.get<ApiResponse<ReconciliationSuggestion[]>>(
      `${BASE}/sessions/${sessionId}/suggestions`
    );
    return response.data.data!;
  },

  confirmMatch: async (sessionId: string, data: ConfirmMatchRequest): Promise<ReconciliationMatch> => {
    const response = await apiClient.post<ApiResponse<ReconciliationMatch>>(
      `${BASE}/sessions/${sessionId}/matches`,
      data
    );
    return response.data.data!;
  },

  rejectMatch: async (sessionId: string, matchId: string): Promise<void> => {
    await apiClient.delete(`${BASE}/sessions/${sessionId}/matches/${matchId}`);
  },

  completeSession: async (sessionId: string): Promise<ReconciliationSession> => {
    const response = await apiClient.post<ApiResponse<ReconciliationSession>>(
      `${BASE}/sessions/${sessionId}/complete`
    );
    return response.data.data!;
  },

  getMatches: async (sessionId: string): Promise<ReconciliationMatch[]> => {
    const response = await apiClient.get<ApiResponse<ReconciliationMatch[]>>(
      `${BASE}/sessions/${sessionId}/matches`
    );
    return response.data.data!;
  },
};
