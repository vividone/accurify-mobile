import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { useChatSessionMessages, useSendChatMessage } from '@/queries/chat.queries';
import type { ChatMessage, ChatMessageRequest } from '@/types';

// ==================== Constants ====================

const SESSION_KEY = 'accurify_chat_session_id';

const INITIAL_GREETING =
  "Hi! I'm your Accurify assistant. I can help you create invoices, track expenses, check revenue, manage inventory, and more. What would you like to do?";

const INITIAL_SUGGESTIONS = [
  'Create an Invoice',
  'Revenue this month',
  'Unpaid invoices',
  'Record an expense',
  'Help',
];

// ==================== Helpers ====================

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  const lines = html.split('\n');
  const result: string[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const isBullet = /^[-*]\s+/.test(trimmed);

    if (isBullet) {
      if (!inList) {
        result.push('<ul class="list-disc pl-5 my-1 space-y-0.5">');
        inList = true;
      }
      result.push(`<li>${trimmed.replace(/^[-*]\s+/, '')}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (trimmed === '') {
        result.push('<br/>');
      } else {
        result.push(`<p class="mb-1 last:mb-0">${trimmed}</p>`);
      }
    }
  }
  if (inList) result.push('</ul>');

  return result.join('');
}

function formatMessageTime(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function getSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

function saveSessionId(id: string): void {
  localStorage.setItem(SESSION_KEY, id);
}

// ==================== Component ====================

export function ChatPage() {
  const navigate = useNavigate();

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(() => getSessionId());

  // Message state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // React Query
  const { data: historyMessages, isLoading: historyLoading } =
    useChatSessionMessages(sessionId);
  const sendMessageMutation = useSendChatMessage();

  // Load history on mount if session exists
  useEffect(() => {
    if (historyMessages && !historyLoaded) {
      if (historyMessages.length > 0) {
        const restored: ChatMessage[] = historyMessages.map((item) => ({
          id: item.id,
          senderType: item.senderType,
          content: item.content,
          intent: item.intent,
          timestamp: item.createdAt,
        }));
        setMessages(restored);
      } else {
        setMessages([createGreeting()]);
      }
      setHistoryLoaded(true);
    }
  }, [historyMessages, historyLoaded]);

  // Show greeting if no session
  useEffect(() => {
    if (!sessionId && messages.length === 0) {
      setMessages([createGreeting()]);
    }
  }, [sessionId, messages.length]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendMessageMutation.isPending]);

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  function createGreeting(): ChatMessage {
    return {
      id: `greeting-${Date.now()}`,
      senderType: 'BOT',
      content: INITIAL_GREETING,
      suggestions: INITIAL_SUGGESTIONS,
      timestamp: new Date().toISOString(),
    };
  }

  // Send message
  const handleSend = useCallback(
    async (messageText?: string) => {
      const text = (messageText || inputValue).trim();
      if (!text || sendMessageMutation.isPending) return;

      setError(null);
      setInputValue('');

      // Optimistic: add user message immediately
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        senderType: 'USER',
        content: text,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const request: ChatMessageRequest = {
          message: text,
          channel: 'MOBILE',
          sessionId: sessionId || undefined,
        };

        const response = await sendMessageMutation.mutateAsync(request);

        // Persist session ID if new
        if (response.sessionId && response.sessionId !== sessionId) {
          setSessionId(response.sessionId);
          saveSessionId(response.sessionId);
        }

        // Add bot response
        const botMessage: ChatMessage = {
          id: response.messageId,
          senderType: 'BOT',
          content: response.content,
          intent: response.intent,
          suggestions: response.suggestions,
          actionResult: response.actionResult,
          timestamp: response.timestamp,
        };
        setMessages((prev) => [...prev, botMessage]);
      } catch (err: unknown) {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError.response?.status === 429) {
          setError('You are sending messages too quickly. Please wait a moment.');
        } else {
          setError('Failed to send message. Please try again.');
        }
      }
    },
    [inputValue, sendMessageMutation, sessionId]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => handleSend(suggestion),
    [handleSend]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // ==================== Render ====================

  return (
    <div
      className="flex flex-col bg-gray-10"
      style={{
        height: 'calc(100vh - var(--header-height))',
        marginLeft: '-1rem',
        marginRight: '-1rem',
        marginTop: '-0.5rem',
      }}
    >
      {/* Chat header */}
      <div className="flex items-center gap-3 h-12 px-4 bg-primary flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-white active:bg-white/20 rounded-full"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <SparklesIcon className="w-5 h-5 text-white" />
        <h1 className="flex-1 text-body-01 font-semibold text-white truncate">
          AI Assistant
        </h1>
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        style={{ overscrollBehavior: 'contain' }}
        role="log"
        aria-live="polite"
      >
        {historyLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-10 rounded-xl bg-gray-20 animate-pulse ${
                  i % 2 === 0 ? 'self-start w-3/4' : 'self-end w-1/2'
                }`}
              />
            ))}
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.senderType === 'USER';
            const isLastBot =
              msg.senderType === 'BOT' && index === messages.length - 1;

            return (
              <div key={msg.id} className="flex flex-col">
                {/* Message bubble */}
                <div
                  className={`max-w-[85%] ${
                    isUser ? 'self-end' : 'self-start'
                  }`}
                >
                  {isUser ? (
                    <div className="px-3.5 py-2.5 rounded-2xl rounded-br-md bg-primary text-white text-body-01 leading-relaxed break-words">
                      {msg.content}
                    </div>
                  ) : (
                    <div
                      className="px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white text-gray-100 shadow-card text-body-01 leading-relaxed break-words"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(msg.content),
                      }}
                    />
                  )}
                  <span
                    className={`text-helper-01 text-gray-40 mt-0.5 px-1 block ${
                      isUser ? 'text-right' : ''
                    }`}
                  >
                    {formatMessageTime(msg.timestamp)}
                  </span>
                </div>

                {/* Suggestion chips - only on last bot message, hidden while loading */}
                {isLastBot &&
                  msg.suggestions &&
                  msg.suggestions.length > 0 &&
                  !sendMessageMutation.isPending && (
                    <div className="flex flex-wrap gap-2 mt-2 self-start">
                      {msg.suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-label-01 px-3 py-1.5 rounded-full border border-primary text-primary bg-white active:bg-primary active:text-white transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {sendMessageMutation.isPending && (
          <div className="self-start max-w-[85%]">
            <div className="px-3.5 py-3 rounded-2xl rounded-bl-md bg-white shadow-card flex items-center gap-1.5">
              <div className="w-2 h-2 bg-gray-40 rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-gray-40 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-2 h-2 bg-gray-40 rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="self-center text-label-01 text-danger bg-red-50 px-3 py-2 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white border-t border-gray-20"
        style={{
          paddingBottom:
            'calc(var(--bottom-bar-height) + var(--safe-area-bottom) + 0.625rem)',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask me anything..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sendMessageMutation.isPending}
          autoComplete="off"
          className="flex-1 h-10 px-4 bg-gray-10 rounded-full text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputValue.trim() || sendMessageMutation.isPending}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary rounded-full text-white disabled:opacity-40 active:bg-blue-700 transition-colors"
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
