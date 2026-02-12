/**
 * QuickStore types for storefront and order management.
 */

// ==================== Enums ====================

export enum OrderSource {
  STOREFRONT = 'STOREFRONT',
  POS = 'POS',
  WHATSAPP = 'WHATSAPP',
  MANUAL = 'MANUAL',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum OrderPaymentStatus {
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export enum FulfillmentType {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
}

// Enum metadata for display
export const ORDER_STATUS_META: Record<OrderStatus, { displayName: string; color: string }> = {
  [OrderStatus.PENDING]: { displayName: 'Pending', color: 'gray' },
  [OrderStatus.CONFIRMED]: { displayName: 'Confirmed', color: 'blue' },
  [OrderStatus.PROCESSING]: { displayName: 'Processing', color: 'purple' },
  [OrderStatus.READY]: { displayName: 'Ready', color: 'teal' },
  [OrderStatus.COMPLETED]: { displayName: 'Completed', color: 'green' },
  [OrderStatus.CANCELLED]: { displayName: 'Cancelled', color: 'red' },
};

export const PAYMENT_STATUS_META: Record<OrderPaymentStatus, { displayName: string; color: string }> = {
  [OrderPaymentStatus.UNPAID]: { displayName: 'Unpaid', color: 'red' },
  [OrderPaymentStatus.PARTIAL]: { displayName: 'Partial', color: 'orange' },
  [OrderPaymentStatus.PAID]: { displayName: 'Paid', color: 'green' },
  [OrderPaymentStatus.REFUNDED]: { displayName: 'Refunded', color: 'gray' },
};

export const ORDER_SOURCE_META: Record<OrderSource, { displayName: string; icon: string }> = {
  [OrderSource.STOREFRONT]: { displayName: 'Storefront', icon: 'ShoppingCart' },
  [OrderSource.POS]: { displayName: 'POS', icon: 'Store' },
  [OrderSource.WHATSAPP]: { displayName: 'WhatsApp', icon: 'Chat' },
  [OrderSource.MANUAL]: { displayName: 'Manual', icon: 'Add' },
};

// ==================== Store Types ====================

export interface Store {
  id: string;
  storeName: string;
  storeSlug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  phone?: string;
  email?: string;
  whatsappNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  businessHours?: Record<string, { open: string; close: string }>;
  isActive: boolean;
  acceptOrders: boolean;
  minimumOrderKobo: number;
  deliveryFeeKobo: number;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  acceptBankTransfer: boolean;
  acceptCash: boolean;
  acceptOnlinePayment: boolean;
  primaryColor: string;
  currency: string;
  publicUrl: string;
  // Accurify Pay fields
  paystackSubaccountCode?: string;
  settlementBankCode?: string;
  settlementAccountNumber?: string;
  settlementAccountName?: string;
  platformFeePercentage?: number;
  subaccountVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreRequest {
  storeName: string;
  storeSlug: string;
  description?: string;
  phone?: string;
  email?: string;
  whatsappNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  businessHours?: Record<string, { open: string; close: string }>;
  minimumOrderKobo?: number;
  deliveryFeeKobo?: number;
  pickupAvailable?: boolean;
  deliveryAvailable?: boolean;
  acceptBankTransfer?: boolean;
  acceptCash?: boolean;
  acceptOnlinePayment?: boolean;
  primaryColor?: string;
}

// ==================== Order Types ====================

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku?: string;
  unitPriceKobo: number;
  quantity: number;
  totalKobo: number;
  notes?: string;
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
  unitPrice?: number;
  notes?: string;
}

export interface StoreOrder {
  id: string;
  storeId: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  source: OrderSource;
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
  deliveryNotes?: string;
  subtotalKobo: number;
  discountKobo: number;
  taxKobo: number;
  deliveryFeeKobo: number;
  totalKobo: number;
  paymentStatus: OrderPaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  paidAmountKobo: number;
  paidAt?: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderRequest {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  source?: OrderSource;
  fulfillmentType?: FulfillmentType;
  deliveryNotes?: string;
  items: OrderItemRequest[];
  notes?: string;
}

// ==================== Payment Types ====================

export interface SubaccountSetupRequest {
  bankCode: string;
  accountNumber: string;
  businessName?: string;
}

export interface SubaccountResponse {
  subaccountCode: string;
  businessName: string;
  bankCode: string;
  bankName?: string;
  accountNumber: string;
  accountName: string;
  platformFeePercentage: number;
  isVerified: boolean;
  verifiedAt?: string;
}

export interface PaymentInitResponse {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amountKobo: number;
  platformFeeKobo: number;
  merchantAmountKobo: number;
}

export interface PaystackBank {
  code: string;
  name: string;
  slug?: string;
  type: string;
  active: boolean;
}

export interface BankAccountResolution {
  accountNumber: string;
  accountName: string;
  bankCode: string;
}

// ==================== Dashboard Types ====================

export interface StoreDashboard {
  todaysOrders: number;
  todaysRevenue: number;
  pendingOrders: number;
  totalOrders: number;
  totalRevenue: number;
}
