import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  ChatMessageRequest,
  ChatMessageResponse,
  ChatSessionResponse,
  ChatMessageHistoryItem,
  ChatFeedbackRequest,
  ProactiveMessage,
  AiSettingsResponse,
  AiSettingsRequest,
} from '@/types';

const CHAT_BASE = '/chat';

export const chatApi = {
  /** Send a message to the AI chat assistant. POST /api/v1/chat/message */
  sendMessage: async (data: ChatMessageRequest): Promise<ChatMessageResponse> => {
    const response = await apiClient.post<ApiResponse<ChatMessageResponse>>(
      `${CHAT_BASE}/message`,
      data
    );
    return response.data.data!;
  },

  /** Get paginated list of user's chat sessions. GET /api/v1/chat/sessions */
  getSessions: async (
    page = 0,
    size = 20
  ): Promise<PageResponse<ChatSessionResponse>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: 'lastActivityAt,desc',
    });
    const response = await apiClient.get<ApiResponse<PageResponse<ChatSessionResponse>>>(
      `${CHAT_BASE}/sessions?${params}`
    );
    return response.data.data!;
  },

  /** Get all messages for a specific chat session. GET /api/v1/chat/sessions/{sessionId}/messages */
  getSessionMessages: async (
    sessionId: string
  ): Promise<ChatMessageHistoryItem[]> => {
    const response = await apiClient.get<ApiResponse<ChatMessageHistoryItem[]>>(
      `${CHAT_BASE}/sessions/${sessionId}/messages`
    );
    return response.data.data!;
  },

  /** Submit feedback on a bot message. POST /api/v1/chat/messages/{messageId}/feedback */
  submitFeedback: async (
    messageId: string,
    data: ChatFeedbackRequest
  ): Promise<void> => {
    await apiClient.post<ApiResponse<unknown>>(
      `${CHAT_BASE}/messages/${messageId}/feedback`,
      data
    );
  },

  /** Get pending proactive messages. GET /api/v1/chat/proactive */
  getProactiveMessages: async (): Promise<ProactiveMessage[]> => {
    const response = await apiClient.get<ApiResponse<ProactiveMessage[]>>(
      `${CHAT_BASE}/proactive`
    );
    return response.data.data ?? [];
  },

  /** Dismiss a proactive message. PUT /api/v1/chat/proactive/{id}/dismiss */
  dismissProactiveMessage: async (messageId: string): Promise<void> => {
    await apiClient.put(`${CHAT_BASE}/proactive/${messageId}/dismiss`);
  },

  /** Mark proactive message as acted on. PUT /api/v1/chat/proactive/{id}/acted */
  markProactiveActedOn: async (messageId: string): Promise<void> => {
    await apiClient.put(`${CHAT_BASE}/proactive/${messageId}/acted`);
  },

  /** Get AI settings. GET /api/v1/chat/settings/ai */
  getAiSettings: async (): Promise<AiSettingsResponse> => {
    const response = await apiClient.get<ApiResponse<AiSettingsResponse>>(
      `${CHAT_BASE}/settings/ai`
    );
    return response.data.data!;
  },

  /** Update AI settings. PUT /api/v1/chat/settings/ai */
  updateAiSettings: async (data: AiSettingsRequest): Promise<AiSettingsResponse> => {
    const response = await apiClient.put<ApiResponse<AiSettingsResponse>>(
      `${CHAT_BASE}/settings/ai`,
      data
    );
    return response.data.data!;
  },
};
