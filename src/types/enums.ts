// Business types
export enum BusinessType {
  SERVICE = 'SERVICE',
  GOODS = 'GOODS',
}

// Industry types for Smart Seed CoA templates
export enum Industry {
  GENERAL = 'GENERAL',
  RETAIL = 'RETAIL',
  PHARMACY = 'PHARMACY',
  LOGISTICS = 'LOGISTICS',
  SERVICE = 'SERVICE',
  HOSPITALITY = 'HOSPITALITY',
}

export const INDUSTRY_META: Record<Industry, { displayName: string; description: string }> = {
  [Industry.GENERAL]: { displayName: 'General Business', description: 'Standard chart of accounts for any business' },
  [Industry.RETAIL]: { displayName: 'Retail', description: 'Shops, supermarkets, trading businesses' },
  [Industry.PHARMACY]: { displayName: 'Pharmacy', description: 'Pharmaceutical and medical supply businesses' },
  [Industry.LOGISTICS]: { displayName: 'Logistics', description: 'Transportation, delivery, and haulage' },
  [Industry.SERVICE]: { displayName: 'Service', description: 'Professional services, consulting, agencies' },
  [Industry.HOSPITALITY]: { displayName: 'Hospitality', description: 'Hotels, restaurants, bars, event centers' },
};

// Invoice status
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  CONVERTED = 'CONVERTED',
}

// Invoice type
export enum InvoiceType {
  STANDARD = 'STANDARD',
  PROFORMA = 'PROFORMA',
}

// Transaction types
export enum TransactionType {
  INFLOW = 'INFLOW',
  OUTFLOW = 'OUTFLOW',
}

// Transaction categories (NRS/FIRS compliant)
export enum TransactionCategory {
  // Inflow categories - Revenue
  SALES = 'SALES',
  SERVICE_REVENUE = 'SERVICE_REVENUE',
  CONSULTING_REVENUE = 'CONSULTING_REVENUE',
  RENTAL_INCOME = 'RENTAL_INCOME',
  INTEREST_INCOME = 'INTEREST_INCOME',
  DIVIDEND_INCOME = 'DIVIDEND_INCOME',
  COMMISSION_INCOME = 'COMMISSION_INCOME',
  DISCOUNT_RECEIVED = 'DISCOUNT_RECEIVED',
  FOREIGN_EXCHANGE_GAIN = 'FOREIGN_EXCHANGE_GAIN',
  GRANT = 'GRANT',
  // Inflow categories - Non-Revenue
  LOAN = 'LOAN',
  CAPITAL = 'CAPITAL',
  REFUND = 'REFUND',
  TRANSFER_IN = 'TRANSFER_IN',
  OTHER_INFLOW = 'OTHER_INFLOW',
  // Outflow categories - Operating Expenses
  SALARY = 'SALARY',
  PENSION = 'PENSION',
  PAYE = 'PAYE',
  RENT = 'RENT',
  UTILITIES = 'UTILITIES',
  BANK_CHARGES = 'BANK_CHARGES',
  INSURANCE = 'INSURANCE',
  ADVERTISING = 'ADVERTISING',
  TRANSPORT = 'TRANSPORT',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  REPAIRS_MAINTENANCE = 'REPAIRS_MAINTENANCE',
  TRAINING = 'TRAINING',
  LEGAL_COMPLIANCE = 'LEGAL_COMPLIANCE',
  AUDIT_FEES = 'AUDIT_FEES',
  PROFESSIONAL_FEES = 'PROFESSIONAL_FEES',
  SUBSCRIPTION = 'SUBSCRIPTION',
  COMMUNICATION = 'COMMUNICATION',
  FUEL_VEHICLE = 'FUEL_VEHICLE',
  SECURITY = 'SECURITY',
  CLEANING = 'CLEANING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  OPERATING_EXPENSE = 'OPERATING_EXPENSE',
  // Outflow categories - Cost of Sales
  INVENTORY = 'INVENTORY',
  // Outflow categories - Capital Expenditure
  EQUIPMENT = 'EQUIPMENT',
  // Outflow categories - Financial Expenses
  INTEREST_EXPENSE = 'INTEREST_EXPENSE',
  BANK_INTEREST = 'BANK_INTEREST',
  FOREIGN_EXCHANGE_LOSS = 'FOREIGN_EXCHANGE_LOSS',
  // Outflow categories - Tax & Statutory
  TAX_PAYMENT = 'TAX_PAYMENT',
  // Outflow categories - Non-Operating
  DEPRECIATION = 'DEPRECIATION',
  BAD_DEBTS = 'BAD_DEBTS',
  LOAN_REPAYMENT = 'LOAN_REPAYMENT',
  TRANSFER_OUT = 'TRANSFER_OUT',
  DONATION = 'DONATION',
  OTHER_OUTFLOW = 'OTHER_OUTFLOW',
  // Default
  UNCATEGORIZED = 'UNCATEGORIZED',
}

// Category metadata for UI (NRS/FIRS compliant)
export const CATEGORY_META: Record<
  TransactionCategory,
  {
    displayName: string;
    isRevenue: boolean;
    type: TransactionType | 'BOTH';
  }
> = {
  // Inflow - Revenue
  [TransactionCategory.SALES]: { displayName: 'Sales Revenue', isRevenue: true, type: TransactionType.INFLOW },
  [TransactionCategory.SERVICE_REVENUE]: { displayName: 'Service Revenue', isRevenue: true, type: TransactionType.INFLOW },
  [TransactionCategory.CONSULTING_REVENUE]: { displayName: 'Consulting Revenue', isRevenue: true, type: TransactionType.INFLOW },
  [TransactionCategory.RENTAL_INCOME]: { displayName: 'Rental Income', isRevenue: true, type: TransactionType.INFLOW },
  [TransactionCategory.INTEREST_INCOME]: { displayName: 'Interest Income', isRevenue: true, type: TransactionType.INFLOW },
  [TransactionCategory.DIVIDEND_INCOME]: { displayName: 'Dividend Income', isRevenue: true, type: TransactionType.INFLOW },
  [TransactionCategory.COMMISSION_INCOME]: { displayName: 'Commission Income', isRevenue: true, type: TransactionType.INFLOW },
  [TransactionCategory.DISCOUNT_RECEIVED]: { displayName: 'Discount Received', isRevenue: true, type: TransactionType.INFLOW },
  [TransactionCategory.FOREIGN_EXCHANGE_GAIN]: { displayName: 'Foreign Exchange Gain', isRevenue: true, type: TransactionType.INFLOW },
  [TransactionCategory.GRANT]: { displayName: 'Grant/Donation', isRevenue: true, type: TransactionType.INFLOW },

  // Inflow - Non-Revenue
  [TransactionCategory.LOAN]: { displayName: 'Loan Received', isRevenue: false, type: TransactionType.INFLOW },
  [TransactionCategory.CAPITAL]: { displayName: 'Capital Injection', isRevenue: false, type: TransactionType.INFLOW },
  [TransactionCategory.REFUND]: { displayName: 'Refund', isRevenue: false, type: TransactionType.INFLOW },
  [TransactionCategory.TRANSFER_IN]: { displayName: 'Transfer In', isRevenue: false, type: TransactionType.INFLOW },
  [TransactionCategory.OTHER_INFLOW]: { displayName: 'Other Inflow', isRevenue: false, type: TransactionType.INFLOW },

  // Outflow - Operating Expenses
  [TransactionCategory.SALARY]: { displayName: 'Salaries & Wages', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.PENSION]: { displayName: 'Pension Contributions', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.PAYE]: { displayName: 'PAYE', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.RENT]: { displayName: 'Rent Expense', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.UTILITIES]: { displayName: 'Utilities', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.BANK_CHARGES]: { displayName: 'Bank Charges', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.INSURANCE]: { displayName: 'Insurance', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.ADVERTISING]: { displayName: 'Advertising & Marketing', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.TRANSPORT]: { displayName: 'Transport & Logistics', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.OFFICE_SUPPLIES]: { displayName: 'Office Supplies', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.REPAIRS_MAINTENANCE]: { displayName: 'Repairs & Maintenance', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.TRAINING]: { displayName: 'Training & Development', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.LEGAL_COMPLIANCE]: { displayName: 'Legal & Compliance', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.AUDIT_FEES]: { displayName: 'Audit Fees', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.PROFESSIONAL_FEES]: { displayName: 'Professional Fees', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.SUBSCRIPTION]: { displayName: 'Subscriptions', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.COMMUNICATION]: { displayName: 'Communication', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.FUEL_VEHICLE]: { displayName: 'Fuel & Vehicle', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.SECURITY]: { displayName: 'Security', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.CLEANING]: { displayName: 'Cleaning & Sanitation', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.ENTERTAINMENT]: { displayName: 'Entertainment', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.OPERATING_EXPENSE]: { displayName: 'General Operating Expense', isRevenue: false, type: TransactionType.OUTFLOW },

  // Outflow - Cost of Sales
  [TransactionCategory.INVENTORY]: { displayName: 'Cost of Goods Sold', isRevenue: false, type: TransactionType.OUTFLOW },

  // Outflow - Capital Expenditure
  [TransactionCategory.EQUIPMENT]: { displayName: 'Equipment Purchase', isRevenue: false, type: TransactionType.OUTFLOW },

  // Outflow - Financial Expenses
  [TransactionCategory.INTEREST_EXPENSE]: { displayName: 'Interest Expense', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.BANK_INTEREST]: { displayName: 'Bank Interest Paid', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.FOREIGN_EXCHANGE_LOSS]: { displayName: 'Foreign Exchange Loss', isRevenue: false, type: TransactionType.OUTFLOW },

  // Outflow - Tax & Statutory
  [TransactionCategory.TAX_PAYMENT]: { displayName: 'Tax Payment', isRevenue: false, type: TransactionType.OUTFLOW },

  // Outflow - Non-Operating
  [TransactionCategory.DEPRECIATION]: { displayName: 'Depreciation', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.BAD_DEBTS]: { displayName: 'Bad Debts', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.LOAN_REPAYMENT]: { displayName: 'Loan Repayment', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.TRANSFER_OUT]: { displayName: 'Transfer Out', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.DONATION]: { displayName: 'Donations Paid', isRevenue: false, type: TransactionType.OUTFLOW },
  [TransactionCategory.OTHER_OUTFLOW]: { displayName: 'Other Expense', isRevenue: false, type: TransactionType.OUTFLOW },

  // Default
  [TransactionCategory.UNCATEGORIZED]: { displayName: 'Uncategorized', isRevenue: false, type: 'BOTH' },
};

export enum TransactionSource {
  MANUAL = 'MANUAL',
  INVOICE = 'INVOICE',
  BANK = 'BANK',
  PRODUCT_SALE = 'PRODUCT_SALE',
  RETAINER_SUBSCRIPTION = 'RETAINER_SUBSCRIPTION',
  PLATFORM_SUBSCRIPTION = 'PLATFORM_SUBSCRIPTION',
  PDF_STATEMENT = 'PDF_STATEMENT',
}

// Product categories
export enum ProductCategory {
  ELECTRONICS = 'ELECTRONICS',
  CLOTHING = 'CLOTHING',
  FOOD_BEVERAGES = 'FOOD_BEVERAGES',
  HEALTH_BEAUTY = 'HEALTH_BEAUTY',
  HOME_GARDEN = 'HOME_GARDEN',
  AUTOMOTIVE = 'AUTOMOTIVE',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  BUILDING_MATERIALS = 'BUILDING_MATERIALS',
  AGRICULTURE = 'AGRICULTURE',
  RAW_MATERIALS = 'RAW_MATERIALS',
  TEXTILES = 'TEXTILES',
  MACHINERY = 'MACHINERY',
  FURNITURE = 'FURNITURE',
  SPORTS_LEISURE = 'SPORTS_LEISURE',
  OTHER = 'OTHER',
}

export const PRODUCT_CATEGORY_META: Record<ProductCategory, { displayName: string; description: string }> = {
  [ProductCategory.ELECTRONICS]: { displayName: 'Electronics', description: 'Electronic devices and accessories' },
  [ProductCategory.CLOTHING]: { displayName: 'Clothing & Apparel', description: 'Clothes, shoes, and fashion accessories' },
  [ProductCategory.FOOD_BEVERAGES]: { displayName: 'Food & Beverages', description: 'Food products and drinks' },
  [ProductCategory.HEALTH_BEAUTY]: { displayName: 'Health & Beauty', description: 'Health, beauty, and personal care products' },
  [ProductCategory.HOME_GARDEN]: { displayName: 'Home & Garden', description: 'Home goods and gardening supplies' },
  [ProductCategory.AUTOMOTIVE]: { displayName: 'Automotive', description: 'Vehicle parts and accessories' },
  [ProductCategory.OFFICE_SUPPLIES]: { displayName: 'Office Supplies', description: 'Stationery and office equipment' },
  [ProductCategory.BUILDING_MATERIALS]: { displayName: 'Building Materials', description: 'Construction and building supplies' },
  [ProductCategory.AGRICULTURE]: { displayName: 'Agriculture', description: 'Farming and agricultural products' },
  [ProductCategory.RAW_MATERIALS]: { displayName: 'Raw Materials', description: 'Industrial raw materials' },
  [ProductCategory.TEXTILES]: { displayName: 'Textiles', description: 'Fabrics and textile products' },
  [ProductCategory.MACHINERY]: { displayName: 'Machinery & Equipment', description: 'Industrial machinery and equipment' },
  [ProductCategory.FURNITURE]: { displayName: 'Furniture', description: 'Home and office furniture' },
  [ProductCategory.SPORTS_LEISURE]: { displayName: 'Sports & Leisure', description: 'Sports equipment and leisure items' },
  [ProductCategory.OTHER]: { displayName: 'Other', description: 'Other product categories' },
};

// Stock movement types
export enum StockMovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  ADJUSTMENT_IN = 'ADJUSTMENT_IN',
  ADJUSTMENT_OUT = 'ADJUSTMENT_OUT',
  RETURN_FROM_CUSTOMER = 'RETURN_FROM_CUSTOMER',
  RETURN_TO_SUPPLIER = 'RETURN_TO_SUPPLIER',
  DAMAGED = 'DAMAGED',
  INITIAL = 'INITIAL',
}

export const STOCK_MOVEMENT_META: Record<StockMovementType, { displayName: string; addsStock: boolean }> = {
  [StockMovementType.PURCHASE]: { displayName: 'Purchase', addsStock: true },
  [StockMovementType.SALE]: { displayName: 'Sale', addsStock: false },
  [StockMovementType.ADJUSTMENT_IN]: { displayName: 'Adjustment (In)', addsStock: true },
  [StockMovementType.ADJUSTMENT_OUT]: { displayName: 'Adjustment (Out)', addsStock: false },
  [StockMovementType.RETURN_FROM_CUSTOMER]: { displayName: 'Customer Return', addsStock: true },
  [StockMovementType.RETURN_TO_SUPPLIER]: { displayName: 'Supplier Return', addsStock: false },
  [StockMovementType.DAMAGED]: { displayName: 'Damaged/Expired', addsStock: false },
  [StockMovementType.INITIAL]: { displayName: 'Initial Stock', addsStock: true },
};

// Subscription
export enum SubscriptionPlan {
  FREE = 'FREE',
  PREMIUM_MONTHLY = 'PREMIUM_MONTHLY',
  PREMIUM_YEARLY = 'PREMIUM_YEARLY',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  TRIALING = 'TRIALING',
  PAST_DUE = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

// Tax zones
export enum TaxZone {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
}

export const TAX_ZONE_CONFIG: Record<
  TaxZone,
  {
    label: string;
    message: string;
    color: string;
  }
> = {
  [TaxZone.GREEN]: {
    label: 'Safe',
    message: 'No VAT or CIT obligations',
    color: '#22C55E',
  },
  [TaxZone.YELLOW]: {
    label: 'VAT Required',
    message: 'VAT registration required. CIT exemption still applies.',
    color: '#EAB308',
  },
  [TaxZone.RED]: {
    label: 'Full Compliance',
    message: 'Full tax obligations apply. Consult a tax professional.',
    color: '#EF4444',
  },
};

export enum ThresholdStatus {
  BELOW = 'BELOW',
  EXCEEDED = 'EXCEEDED',
}

export enum BankAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  REAUTH_REQUIRED = 'REAUTH_REQUIRED',
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  MANAGER = 'MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
}

// Helper functions
export function getInflowCategories(): TransactionCategory[] {
  return Object.entries(CATEGORY_META)
    .filter(([_, meta]) => meta.type === TransactionType.INFLOW)
    .map(([key]) => key as TransactionCategory);
}

export function getOutflowCategories(): TransactionCategory[] {
  return Object.entries(CATEGORY_META)
    .filter(([_, meta]) => meta.type === TransactionType.OUTFLOW)
    .map(([key]) => key as TransactionCategory);
}
