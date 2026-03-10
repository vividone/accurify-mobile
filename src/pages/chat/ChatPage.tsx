import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useChatSessionMessages, useSendChatMessage, useSubmitChatFeedback, useProactiveMessages, useDismissProactiveMessage } from '@/queries/chat.queries';
import { useUIStore } from '@/store/ui.store';
import type { ChatMessage, ChatMessageRequest, FeedbackRating, ProactiveMessage } from '@/types';

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

// ==================== Inline Styles ====================

const ANIMATION_STYLES = `
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes dotPulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.4); opacity: 1; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;

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

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getDateLabel(date: Date): string {
  const today = new Date();
  if (isSameDay(date, today)) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

function saveSessionId(id: string): void {
  localStorage.setItem(SESSION_KEY, id);
}

function clearSessionId(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ==================== Component ====================

export function ChatPage() {
  const navigate = useNavigate();
  const showNotification = useUIStore((s) => s.showNotification);

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(() => getSessionId());

  // Message state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Scroll-to-bottom state
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [newMsgCount, setNewMsgCount] = useState(0);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Proactive messages state
  const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set());

  // React Query
  const { data: historyMessages, isLoading: historyLoading } =
    useChatSessionMessages(sessionId);
  const sendMessageMutation = useSendChatMessage();
  const feedbackMutation = useSubmitChatFeedback();
  const { data: proactiveMessages } = useProactiveMessages();
  const dismissMutation = useDismissProactiveMessage();

  // Visible proactive cards (not dismissed locally)
  const visibleProactiveCards = (proactiveMessages ?? []).filter(
    (m: ProactiveMessage) => !dismissedCards.has(m.id)
  );

  const handleDismissCard = useCallback(
    (msgId: string) => {
      setDismissedCards((prev) => new Set(prev).add(msgId));
      dismissMutation.mutate(msgId);
    },
    [dismissMutation]
  );

  // Feedback handler
  const handleFeedback = useCallback(
    (messageId: string, rating: FeedbackRating) => {
      // Skip for local/greeting messages
      if (messageId.startsWith('greeting-')) return;

      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, feedbackRating: rating } : m))
      );

      feedbackMutation.mutate(
        { messageId, feedback: { rating } },
        {
          onSuccess: () => {
            showNotification(
              'Thanks',
              rating === 'POSITIVE' ? 'Glad that helped!' : 'Thanks for the feedback',
              'success'
            );
          },
          onError: () => {
            // Revert optimistic update
            setMessages((prev) =>
              prev.map((m) =>
                m.id === messageId ? { ...m, feedbackRating: undefined } : m
              )
            );
          },
        }
      );
    },
    [feedbackMutation, showNotification]
  );

  // Determine if user is near bottom of the scroll container
  const isNearBottom = useCallback((): boolean => {
    const el = messagesContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }, []);

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

  // Auto-scroll (only if near bottom)
  useEffect(() => {
    if (isNearBottom()) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // User is scrolled up — increment unread count
      setNewMsgCount((c) => c + 1);
    }
  }, [messages, sendMessageMutation.isPending, isNearBottom]);

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

  // Scroll handler for messages container
  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!nearBottom);
    if (nearBottom) setNewMsgCount(0);
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBtn(false);
    setNewMsgCount(0);
  }, []);

  // New chat handler
  const handleNewChat = useCallback(() => {
    clearSessionId();
    setSessionId(null);
    setMessages([createGreeting()]);
    setError(null);
    setLastFailedMessage(null);
    setHistoryLoaded(false);
    setInputValue('');
  }, []);

  // Copy bot message to clipboard
  const handleCopyMessage = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied', 'Message copied to clipboard', 'success');
      } catch {
        // Fallback for browsers without clipboard API
        showNotification('Error', 'Could not copy message', 'error');
      }
    },
    [showNotification]
  );

  // Send message
  const handleSend = useCallback(
    async (messageText?: string) => {
      const text = (messageText || inputValue).trim();
      if (!text || sendMessageMutation.isPending) return;

      setError(null);
      setLastFailedMessage(null);
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
        setLastFailedMessage(text);
        const axiosError = err as { response?: { status?: number } };
        if (axiosError.response?.status === 429) {
          setError('You are sending messages too quickly. Please wait a moment.');
        } else {
          setError('Failed to send message. Tap to retry.');
        }
      }
    },
    [inputValue, sendMessageMutation, sessionId]
  );

  // Retry failed message
  const handleRetry = useCallback(() => {
    if (!lastFailedMessage) return;
    // Remove the failed user message bubble
    setMessages((prev) => {
      const lastUserIdx = [...prev].reverse().findIndex((m) => m.senderType === 'USER');
      if (lastUserIdx === -1) return prev;
      const idx = prev.length - 1 - lastUserIdx;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
    setError(null);
    const msg = lastFailedMessage;
    setLastFailedMessage(null);
    handleSend(msg);
  }, [lastFailedMessage, handleSend]);

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

  // Determine if message is the initial greeting
  const isGreetingMessage = (msg: ChatMessage): boolean =>
    msg.senderType === 'BOT' && msg.id.startsWith('greeting-');

  // Check if we should show a date separator before this message
  const shouldShowDateSeparator = (index: number): string | null => {
    if (index === 0) {
      try {
        return getDateLabel(new Date(messages[0].timestamp));
      } catch {
        return null;
      }
    }
    try {
      const prev = new Date(messages[index - 1].timestamp);
      const curr = new Date(messages[index].timestamp);
      if (!isSameDay(prev, curr)) {
        return getDateLabel(curr);
      }
    } catch {
      // ignore
    }
    return null;
  };

  // ==================== Render ====================

  const isGreeting =
    messages.length === 1 && isGreetingMessage(messages[0]);

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
      {/* Inline animation styles */}
      <style>{ANIMATION_STYLES}</style>

      {/* Chat header */}
      <div className="flex items-center gap-3 h-12 px-4 bg-primary flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-white active:bg-white/20 rounded-full transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <SparklesIcon className="w-5 h-5 text-white" />
        <h1 className="flex-1 text-body-01 font-semibold text-white truncate">
          AI Assistant
        </h1>
        <button
          onClick={handleNewChat}
          className="p-1.5 text-white active:bg-white/20 rounded-full transition-colors"
          aria-label="New chat"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Proactive insight cards */}
      {visibleProactiveCards.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2 space-y-2 bg-gray-10/80">
          {visibleProactiveCards.slice(0, 3).map((card: ProactiveMessage) => {
            const accent =
              card.messageType === 'ALERT'
                ? 'border-l-red-500 bg-red-50/50'
                : card.messageType === 'REMINDER'
                  ? 'border-l-amber-500 bg-amber-50/50'
                  : card.messageType === 'INSIGHT'
                    ? 'border-l-green-500 bg-green-50/50'
                    : 'border-l-blue-500 bg-blue-50/50';
            return (
              <div
                key={card.id}
                className={`rounded-lg border-l-4 ${accent} p-3 flex items-start gap-2`}
                style={{ animation: 'fadeInUp 300ms ease-out' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-label-01 font-semibold text-gray-100 truncate">
                    {card.title}
                  </p>
                  <p className="text-helper-01 text-gray-60 mt-0.5 line-clamp-2">
                    {card.content}
                  </p>
                </div>
                <button
                  onClick={() => handleDismissCard(card.id)}
                  className="flex-shrink-0 p-1 text-gray-40 active:text-gray-60 rounded-full"
                  aria-label="Dismiss"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 relative"
        style={{ overscrollBehavior: 'contain' }}
        role="log"
        aria-live="polite"
        onScroll={handleScroll}
      >
        {historyLoading ? (
          /* Skeleton loading */
          <div
            className="flex flex-col gap-3"
            style={{ animation: 'fadeIn 300ms ease-out' }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`rounded-xl bg-gray-20 animate-pulse ${
                  i % 2 === 0 ? 'self-start' : 'self-end'
                }`}
                style={{
                  height: i === 0 ? '3.5rem' : i === 2 ? '4rem' : '2.5rem',
                  width: i % 2 === 0 ? '75%' : i === 3 ? '40%' : '55%',
                }}
              />
            ))}
          </div>
        ) : isGreeting ? (
          /* Centered greeting state */
          <div
            className="flex flex-col items-center justify-center text-center px-4 pt-12"
            style={{ animation: 'fadeInUp 400ms ease-out' }}
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <SparklesIcon className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-heading-03 font-semibold text-gray-100 mb-2">
              AI Assistant
            </h2>
            <p className="text-body-01 text-gray-60 mb-6 max-w-[280px]">
              {INITIAL_GREETING}
            </p>
            {/* Suggestion chips centered */}
            <div className="flex flex-wrap justify-center gap-2">
              {INITIAL_SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-label-01 px-3.5 py-2 rounded-full border border-primary text-primary bg-white shadow-sm active:bg-primary active:text-white transition-colors"
                  style={{
                    animation: `fadeInUp 300ms ease-out ${i * 50}ms both`,
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message list */
          messages.map((msg, index) => {
            const isUser = msg.senderType === 'USER';
            const isLastBot =
              msg.senderType === 'BOT' && index === messages.length - 1;
            const dateSep = shouldShowDateSeparator(index);

            return (
              <div key={msg.id} className="flex flex-col">
                {/* Date separator */}
                {dateSep && (
                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-gray-20" />
                    <span className="text-helper-01 text-gray-40 whitespace-nowrap">
                      {dateSep}
                    </span>
                    <div className="flex-1 h-px bg-gray-20" />
                  </div>
                )}

                {/* Message row */}
                <div
                  className={`max-w-[85%] ${isUser ? 'self-end' : 'self-start'}`}
                  style={{
                    animation: isUser
                      ? 'slideInRight 200ms ease-out'
                      : 'slideInLeft 200ms ease-out',
                  }}
                >
                  {isUser ? (
                    <div className="px-3.5 py-2.5 rounded-2xl rounded-br-md bg-primary text-white text-body-01 leading-relaxed break-words">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      {/* Bot avatar */}
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center mt-0.5">
                        <SparklesIcon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      {/* Bot bubble */}
                      <div
                        className="px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white text-gray-100 shadow-card text-body-01 leading-relaxed break-words cursor-pointer active:bg-gray-10 transition-colors"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(msg.content),
                        }}
                        onClick={() => handleCopyMessage(msg.content)}
                        role="button"
                        tabIndex={0}
                        aria-label="Copy message"
                      />
                    </div>
                  )}
                  <div
                    className={`flex items-center gap-1.5 mt-0.5 px-1 ${
                      isUser ? 'justify-end' : 'pl-8'
                    }`}
                  >
                    <span className="text-helper-01 text-gray-40">
                      {formatMessageTime(msg.timestamp)}
                    </span>
                    {/* Feedback buttons — bot messages only, not greeting */}
                    {!isUser && !msg.id.startsWith('greeting-') && (
                      <span className="flex items-center gap-0.5 ml-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFeedback(msg.id, 'POSITIVE');
                          }}
                          disabled={!!msg.feedbackRating}
                          className={`p-1 rounded-full transition-colors ${
                            msg.feedbackRating === 'POSITIVE'
                              ? 'text-green-600'
                              : 'text-gray-30 active:text-green-600'
                          } disabled:opacity-60`}
                          aria-label="Helpful"
                        >
                          <HandThumbUpIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFeedback(msg.id, 'NEGATIVE');
                          }}
                          disabled={!!msg.feedbackRating}
                          className={`p-1 rounded-full transition-colors ${
                            msg.feedbackRating === 'NEGATIVE'
                              ? 'text-red-500'
                              : 'text-gray-30 active:text-red-500'
                          } disabled:opacity-60`}
                          aria-label="Not helpful"
                        >
                          <HandThumbDownIcon className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                {/* Suggestion chips - only on last bot message, hidden while loading */}
                {isLastBot &&
                  msg.suggestions &&
                  msg.suggestions.length > 0 &&
                  !sendMessageMutation.isPending && (
                    <div className="flex flex-wrap gap-2 mt-2 pl-8 self-start">
                      {msg.suggestions.map((suggestion, i) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-label-01 px-3.5 py-2 rounded-full border border-primary text-primary bg-white shadow-sm active:bg-primary active:text-white transition-colors"
                          style={{
                            animation: `fadeInUp 300ms ease-out ${i * 50}ms both`,
                          }}
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
          <div
            className="self-start max-w-[85%]"
            style={{ animation: 'fadeInUp 200ms ease-out' }}
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center mt-0.5">
                <SparklesIcon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="px-3.5 py-3 rounded-2xl rounded-bl-md bg-white shadow-card flex items-center gap-1.5">
                {[0, 200, 400].map((delay) => (
                  <div
                    key={delay}
                    className="w-1.5 h-1.5 bg-gray-40 rounded-full"
                    style={{
                      animation: `dotPulse 1.2s ease-in-out ${delay}ms infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error with retry */}
        {error && (
          <button
            onClick={lastFailedMessage ? handleRetry : undefined}
            className="self-center text-label-01 text-danger bg-red-50 px-4 py-2.5 rounded-lg text-center flex items-center gap-2 active:opacity-80 transition-opacity"
            style={{ animation: 'fadeInUp 200ms ease-out' }}
          >
            <ArrowPathIcon className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </button>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll-to-bottom FAB */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute right-5 bg-white shadow-card rounded-full w-9 h-9 flex items-center justify-center transition-opacity duration-200 active:scale-95"
          style={{
            bottom: 'calc(var(--bottom-bar-height) + var(--safe-area-bottom) + 4rem)',
          }}
          aria-label="Scroll to bottom"
        >
          <ChevronDownIcon className="w-5 h-5 text-gray-60" />
          {newMsgCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-1">
              {newMsgCount}
            </span>
          )}
        </button>
      )}

      {/* Input bar */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white"
        style={{
          boxShadow: '0 -1px 3px rgba(0,0,0,0.05)',
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
          className="flex-1 h-10 px-4 bg-gray-10 rounded-full text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputValue.trim() || sendMessageMutation.isPending}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary rounded-full text-white disabled:opacity-40 active:scale-90 transition-transform"
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
