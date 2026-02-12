import type { StockMovementType } from './enums';

export interface StockHistory {
  id: string;
  productId: string;
  productName: string;
  productSku?: string;
  movementType: StockMovementType;
  movementTypeDisplayName: string;
  quantity: number;
  balanceAfter: number;
  date: string;
  unitPrice?: number;
  totalValue?: number;
  notes?: string;
  referenceId?: string;
  referenceType?: string;
  supplierName?: string;
  createdAt: string;
}

export interface StockMovementRequest {
  productId: string;
  movementType: StockMovementType;
  quantity: number;
  date: string;
  unitPrice?: number;
  notes?: string;
  supplierName?: string;
}

export interface ProductSaleRequest {
  productId: string;
  quantity: number;
  date: string;
  unitPrice?: number;
  notes?: string;
  clientId?: string;
  createTransaction?: boolean;
}

export interface StockSummary {
  totalMovements: number;
  purchaseCount: number;
  saleCount: number;
  adjustmentCount: number;
  totalPurchaseValue: number;
  totalSalesValue: number;
  recentMovements: StockHistory[];
}

export interface StockFilters {
  productId?: string;
  movementType?: StockMovementType;
  startDate?: string;
  endDate?: string;
}
