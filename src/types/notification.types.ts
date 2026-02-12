/**
 * Notification type enum values.
 */
export type NotificationType =
  | 'SYSTEM'
  | 'WELCOME'
  | 'SUBSCRIPTION_ACTIVATED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'SUBSCRIPTION_EXPIRING'
  | 'TRIAL_STARTED'
  | 'TRIAL_ENDING'
  | 'TRIAL_EXPIRED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'KYC_SUBMITTED'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'VETTING_SUBMITTED'
  | 'VETTING_APPROVED'
  | 'VETTING_REJECTED'
  | 'RETAINER_REQUEST'
  | 'RETAINER_ACTIVATED'
  | 'RETAINER_CANCELLED'
  | 'RETAINER_EXPIRING'
  | 'RETAINER_PAYMENT_RECEIVED'
  | 'RETAINER_PAYMENT_FAILED'
  | 'ACCOUNTANT_ASSIGNED'
  | 'ACCOUNTANT_REMOVED'
  | 'CLIENT_ASSIGNED'
  | 'CLIENT_REMOVED'
  | 'INVOICE_RECEIVED'
  | 'INVOICE_PAID'
  | 'INVOICE_OVERDUE'
  | 'NEW_USER_REGISTERED'
  | 'NEW_BUSINESS_CREATED'
  | 'KYC_PENDING_REVIEW'
  | 'VETTING_PENDING_REVIEW';

/**
 * Broadcast target audience.
 */
export type BroadcastTargetAudience =
  | 'ALL'
  | 'BUSINESS_USERS'
  | 'ACCOUNTANTS'
  | 'PREMIUM_SUBSCRIBERS'
  | 'FREE_TIER_USERS';

/**
 * Broadcast status.
 */
export type BroadcastStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'SENDING'
  | 'SENT'
  | 'FAILED'
  | 'CANCELLED';

/**
 * Notification response from API.
 */
export interface NotificationResponse {
  id: string;
  type: NotificationType;
  typeDisplayName: string;
  title: string;
  message: string;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  actionLabel?: string;
  referenceId?: string;
  referenceType?: string;
  isBroadcast: boolean;
  createdAt: string;
}

/**
 * Notification count response.
 */
export interface NotificationCountResponse {
  unreadCount: number;
}

/**
 * Request for marking notifications as read.
 */
export interface MarkNotificationsReadRequest {
  notificationIds: string[];
}

/**
 * Broadcast notification response.
 */
export interface BroadcastResponse {
  id: string;
  createdById: string;
  createdByName: string;
  targetAudience: BroadcastTargetAudience;
  targetAudienceDisplayName: string;
  type: NotificationType;
  typeDisplayName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  sendEmail: boolean;
  emailSubject?: string;
  status: BroadcastStatus;
  statusDisplayName: string;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount?: number;
  deliveredCount?: number;
  emailSentCount?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request for creating/updating a broadcast.
 */
export interface BroadcastRequest {
  targetAudience: BroadcastTargetAudience;
  type?: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  sendEmail: boolean;
  emailSubject?: string;
  scheduledAt?: string;
}

/**
 * Display configuration for notification types.
 */
export const notificationTypeConfig: Record<
  NotificationType,
  { icon: string; color: string }
> = {
  SYSTEM: { icon: 'information', color: 'blue' },
  WELCOME: { icon: 'user', color: 'green' },
  SUBSCRIPTION_ACTIVATED: { icon: 'checkmark--filled', color: 'green' },
  SUBSCRIPTION_CANCELLED: { icon: 'close--filled', color: 'gray' },
  SUBSCRIPTION_EXPIRING: { icon: 'warning--alt', color: 'orange' },
  TRIAL_STARTED: { icon: 'time', color: 'cyan' },
  TRIAL_ENDING: { icon: 'warning--alt', color: 'orange' },
  TRIAL_EXPIRED: { icon: 'time', color: 'red' },
  PAYMENT_SUCCESS: { icon: 'checkmark--filled', color: 'green' },
  PAYMENT_FAILED: { icon: 'error--filled', color: 'red' },
  KYC_SUBMITTED: { icon: 'document', color: 'blue' },
  KYC_APPROVED: { icon: 'checkmark--filled', color: 'green' },
  KYC_REJECTED: { icon: 'close--filled', color: 'red' },
  VETTING_SUBMITTED: { icon: 'certificate', color: 'blue' },
  VETTING_APPROVED: { icon: 'certificate--check', color: 'green' },
  VETTING_REJECTED: { icon: 'close--filled', color: 'red' },
  RETAINER_REQUEST: { icon: 'request-quote', color: 'blue' },
  RETAINER_ACTIVATED: { icon: 'partnership', color: 'green' },
  RETAINER_CANCELLED: { icon: 'close--filled', color: 'gray' },
  RETAINER_EXPIRING: { icon: 'warning--alt', color: 'orange' },
  RETAINER_PAYMENT_RECEIVED: { icon: 'currency', color: 'green' },
  RETAINER_PAYMENT_FAILED: { icon: 'error--filled', color: 'red' },
  ACCOUNTANT_ASSIGNED: { icon: 'user--follow', color: 'green' },
  ACCOUNTANT_REMOVED: { icon: 'user--x', color: 'gray' },
  CLIENT_ASSIGNED: { icon: 'building', color: 'green' },
  CLIENT_REMOVED: { icon: 'building', color: 'gray' },
  INVOICE_RECEIVED: { icon: 'document', color: 'blue' },
  INVOICE_PAID: { icon: 'checkmark--filled', color: 'green' },
  INVOICE_OVERDUE: { icon: 'warning--alt', color: 'red' },
  NEW_USER_REGISTERED: { icon: 'user--avatar', color: 'blue' },
  NEW_BUSINESS_CREATED: { icon: 'building', color: 'blue' },
  KYC_PENDING_REVIEW: { icon: 'pending', color: 'orange' },
  VETTING_PENDING_REVIEW: { icon: 'pending', color: 'orange' },
};

/**
 * Display names for broadcast target audiences.
 */
export const broadcastTargetAudienceLabels: Record<BroadcastTargetAudience, string> = {
  ALL: 'All Users',
  BUSINESS_USERS: 'Business Users',
  ACCOUNTANTS: 'Accountants',
  PREMIUM_SUBSCRIBERS: 'Premium Subscribers',
  FREE_TIER_USERS: 'Free Tier Users',
};

/**
 * Display names for broadcast statuses.
 */
export const broadcastStatusLabels: Record<BroadcastStatus, string> = {
  DRAFT: 'Draft',
  SCHEDULED: 'Scheduled',
  SENDING: 'Sending',
  SENT: 'Sent',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};
