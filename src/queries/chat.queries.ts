import { useQuery, useMutation } from '@tanstack/react-query';
import { chatApi } from '@/services/api';
import type { ChatMessageRequest } from '@/types';

export const chatKeys = {
  all: ['chat'] as const,
  sessions: () => [...chatKeys.all, 'sessions'] as const,
  sessionList: (page: number, size: number) =>
    [...chatKeys.sessions(), { page, size }] as const,
  messages: () => [...chatKeys.all, 'messages'] as const,
  sessionMessages: (sessionId: string) =>
    [...chatKeys.messages(), sessionId] as const,
};

/** Fetch message history for a given session. Only enabled when sessionId is provided. */
export function useChatSessionMessages(sessionId: string | null) {
  return useQuery({
    queryKey: chatKeys.sessionMessages(sessionId ?? ''),
    queryFn: () => chatApi.getSessionMessages(sessionId!),
    enabled: !!sessionId,
    staleTime: 0,
  });
}

/** Fetch paginated list of chat sessions. */
export function useChatSessions(page = 0, size = 20) {
  return useQuery({
    queryKey: chatKeys.sessionList(page, size),
    queryFn: () => chatApi.getSessions(page, size),
  });
}

/** Mutation to send a chat message. Caller handles optimistic UI updates. */
export function useSendChatMessage() {
  return useMutation({
    mutationFn: (data: ChatMessageRequest) => chatApi.sendMessage(data),
  });
}
