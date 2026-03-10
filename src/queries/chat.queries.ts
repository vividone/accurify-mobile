import { useQuery, useMutation } from '@tanstack/react-query';
import { chatApi } from '@/services/api';
import type { ChatMessageRequest, ChatFeedbackRequest, AiSettingsRequest } from '@/types';

export const chatKeys = {
  all: ['chat'] as const,
  sessions: () => [...chatKeys.all, 'sessions'] as const,
  sessionList: (page: number, size: number) =>
    [...chatKeys.sessions(), { page, size }] as const,
  messages: () => [...chatKeys.all, 'messages'] as const,
  sessionMessages: (sessionId: string) =>
    [...chatKeys.messages(), sessionId] as const,
  proactive: () => [...chatKeys.all, 'proactive'] as const,
  aiSettings: () => [...chatKeys.all, 'ai-settings'] as const,
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

/** Mutation to submit feedback on a bot message. */
export function useSubmitChatFeedback() {
  return useMutation({
    mutationFn: (data: { messageId: string; feedback: ChatFeedbackRequest }) =>
      chatApi.submitFeedback(data.messageId, data.feedback),
  });
}

/** Fetch proactive messages for the current user. */
export function useProactiveMessages() {
  return useQuery({
    queryKey: chatKeys.proactive(),
    queryFn: () => chatApi.getProactiveMessages(),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

/** Mutation to dismiss a proactive message. */
export function useDismissProactiveMessage() {
  return useMutation({
    mutationFn: (messageId: string) => chatApi.dismissProactiveMessage(messageId),
  });
}

/** Fetch AI settings. */
export function useAiSettings() {
  return useQuery({
    queryKey: chatKeys.aiSettings(),
    queryFn: () => chatApi.getAiSettings(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Mutation to update AI settings. */
export function useUpdateAiSettings() {
  return useMutation({
    mutationFn: (data: AiSettingsRequest) => chatApi.updateAiSettings(data),
  });
}
