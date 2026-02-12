export enum BillStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum BillCategory {
  SALARIES_WAGES = 'SALARIES_WAGES',
  RENT = 'RENT',
  UTILITIES = 'UTILITIES',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  SOFTWARE_SUBSCRIPTIONS = 'SOFTWARE_SUBSCRIPTIONS',
  PROFESSIONAL_FEES = 'PROFESSIONAL_FEES',
  MARKETING_ADVERTISING = 'MARKETING_ADVERTISING',
  TRAVEL = 'TRAVEL',
  REPAIRS_MAINTENANCE = 'REPAIRS_MAINTENANCE',
  INSURANCE = 'INSURANCE',
  BANK_CHARGES = 'BANK_CHARGES',
  DEPRECIATION = 'DEPRECIATION',
  COST_OF_GOODS_SOLD = 'COST_OF_GOODS_SOLD',
  INVENTORY_PURCHASES = 'INVENTORY_PURCHASES',
  OTHER_EXPENSES = 'OTHER_EXPENSES',
}

export const BillCategoryLabels: Record<BillCategory, string> = {
  [BillCategory.SALARIES_WAGES]: 'Salaries & Wages',
  [BillCategory.RENT]: 'Rent Expense',
  [BillCategory.UTILITIES]: 'Utilities',
  [BillCategory.OFFICE_SUPPLIES]: 'Office Supplies',
  [BillCategory.SOFTWARE_SUBSCRIPTIONS]: 'Software & Subscriptions',
  [BillCategory.PROFESSIONAL_FEES]: 'Professional Fees',
  [BillCategory.MARKETING_ADVERTISING]: 'Marketing & Advertising',
  [BillCategory.TRAVEL]: 'Travel Expenses',
  [BillCategory.REPAIRS_MAINTENANCE]: 'Repairs & Maintenance',
  [BillCategory.INSURANCE]: 'Insurance',
  [BillCategory.BANK_CHARGES]: 'Bank Charges',
  [BillCategory.DEPRECIATION]: 'Depreciation',
  [BillCategory.COST_OF_GOODS_SOLD]: 'Cost of Goods Sold',
  [BillCategory.INVENTORY_PURCHASES]: 'Inventory Purchases',
  [BillCategory.OTHER_EXPENSES]: 'Other Expenses',
};

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  isActive: boolean;
  whtRate?: number; // 0.05 for 5%, 0.10 for 10%
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  whtRate?: number;
  notes?: string;
}

export interface BillItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  category?: BillCategory;
  glAccountCode?: string;
  glAccountName?: string;
}

export interface BillItemRequest {
  description: string;
  quantity: number;
  unitPrice: number;
  category?: BillCategory;
  glAccountId?: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  status: BillStatus;
  billDate: string;
  dueDate?: string;
  supplierReference?: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  description?: string;
  notes?: string;
  documentUrl?: string;
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  supplier?: {
    id: string;
    name: string;
    email?: string;
    whtRate?: number;
  };
  items: BillItem[];
  approvalJournalEntryId?: string;
  paymentJournalEntryId?: string;
}

export interface BillRequest {
  supplierId?: string;
  supplierReference?: string;
  supplierName: string;
  supplierEmail?: string;
  billDate: string;
  dueDate?: string;
  description?: string;
  notes?: string;
  vatRate?: number;
  items: BillItemRequest[];
}

export interface MarkBillPaidRequest {
  paidAt: string;
  paymentReference?: string;
}

export interface AccountsPayableSummary {
  totalPayable: number;
  unpaidBillsCount: number;
}

export interface ParsedLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  confidence?: number;
}

export interface ParsedBillData {
  // Header information
  supplierName?: string;
  supplierEmail?: string;
  supplierPhone?: string;
  supplierAddress?: string;
  billNumber?: string;
  billDate?: string;
  dueDate?: string;
  description?: string;

  // Line items
  items?: ParsedLineItem[];

  // Amounts
  subtotal?: number;
  vatRate?: number;
  vatAmount?: number;
  total?: number;

  // Parsing metadata
  successful: boolean;
  errorMessage?: string;
  warnings?: string[];
  confidenceScore?: number;
}
