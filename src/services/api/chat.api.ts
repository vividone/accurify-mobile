import apiClient from './client';
import type {
  ApiResponse,
  PageResponse,
  ChatMessageRequest,
  ChatMessageResponse,
  ChatSessionResponse,
  ChatMessageHistoryItem,
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
};
