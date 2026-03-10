export type SenderType = 'USER' | 'BOT' | 'SYSTEM';

export type ChatChannel = 'WEB' | 'STOREFRONT' | 'MOBILE' | 'WHATSAPP';

export type ChatSessionStatus = 'ACTIVE' | 'CLOSED' | 'EXPIRED';

export type ChatIntent =
  | 'CREATE_INVOICE'
  | 'SEND_INVOICE'
  | 'RECORD_EXPENSE'
  | 'RECORD_INCOME'
  | 'QUERY_REVENUE'
  | 'QUERY_PROFIT'
  | 'QUERY_UNPAID'
  | 'QUERY_EXPENSES'
  | 'QUERY_CASH_FLOW'
  | 'CLIENT_LOOKUP'
  | 'SEARCH_PRODUCT'
  | 'ADD_TO_CART'
  | 'VIEW_CART'
  | 'REMOVE_FROM_CART'
  | 'PLACE_ORDER'
  | 'TRACK_ORDER'
  | 'CHECK_STOCK'
  | 'ADD_PRODUCT'
  | 'UPDATE_PRODUCT_PRICE'
  | 'TOGGLE_PRODUCT_VISIBILITY'
  | 'DEACTIVATE_PRODUCT'
  | 'LOW_STOCK_ALERT'
  | 'OUT_OF_STOCK'
  | 'INVENTORY_SUMMARY'
  | 'EXPIRING_PRODUCTS'
  | 'RECORD_PURCHASE'
  | 'ADJUST_STOCK'
  | 'RECORD_MANUAL_SALE'
  | 'VIEW_ORDERS'
  | 'COMPLETE_ORDER'
  | 'CANCEL_ORDER_BUSINESS'
  | 'ORDER_DETAILS'
  | 'CREATE_CLIENT'
  | 'MARK_INVOICE_PAID'
  | 'CANCEL_INVOICE'
  | 'CREATE_BILL'
  | 'QUERY_BILLS'
  | 'CREATE_CREDIT_NOTE'
  | 'QUERY_TAX'
  | 'HELP'
  | 'GREET'
  | 'UNKNOWN';

export interface ChatMessageRequest {
  message: string;
  channel: ChatChannel;
  sessionId?: string;
  context?: Record<string, unknown>;
}

export interface ChatMessageResponse {
  messageId: string;
  sessionId: string;
  content: string;
  intent: ChatIntent;
  suggestions: string[];
  actionResult?: Record<string, unknown>;
  timestamp: string;
}

export interface ChatSessionResponse {
  id: string;
  channel: ChatChannel;
  status: ChatSessionStatus;
  messageCount: number;
  lastMessage: string;
  lastActivityAt: string;
  createdAt: string;
}

export interface ChatMessageHistoryItem {
  id: string;
  senderType: SenderType;
  content: string;
  intent?: ChatIntent;
  createdAt: string;
}

/** Unified message type for chat page local state */
export interface ChatMessage {
  id: string;
  senderType: SenderType;
  content: string;
  intent?: ChatIntent;
  suggestions?: string[];
  actionResult?: Record<string, unknown>;
  timestamp: string;
  feedbackRating?: FeedbackRating;
}

export type FeedbackRating = 'POSITIVE' | 'NEGATIVE';

export interface ChatFeedbackRequest {
  rating: FeedbackRating;
  correctedIntent?: ChatIntent;
  feedbackText?: string;
}

// Proactive Messages
export type ProactiveMessageType = 'INSIGHT' | 'ALERT' | 'REMINDER' | 'RECOMMENDATION';
export type ProactiveMessageStatus = 'PENDING' | 'DELIVERED' | 'DISMISSED' | 'ACTED_ON';
export type MessagePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface ProactiveMessage {
  id: string;
  messageType: ProactiveMessageType;
  title: string;
  content: string;
  priority: MessagePriority;
  status: ProactiveMessageStatus;
  createdAt: string;
}

// AI Settings
export interface AiSettingsResponse {
  proactiveEnabled: boolean;
  proactiveChannels: string | null;
  proactiveFrequency: string | null;
  feedbackVisible: boolean;
  customInstructions: string | null;
  learnedRules: number;
  totalFeedbackGiven: number;
  positiveFeedback: number;
  negativeFeedback: number;
}

export interface AiSettingsRequest {
  proactiveEnabled?: boolean;
  proactiveChannels?: string;
  proactiveFrequency?: string;
  feedbackVisible?: boolean;
  customInstructions?: string;
}
