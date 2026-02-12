/**
 * Universal Importer types for CSV imports and opening balances.
 */

// ==================== Enums ====================

export enum ImportType {
  PRODUCTS = 'PRODUCTS',
  CLIENTS = 'CLIENTS',
  CHART_OF_ACCOUNTS = 'CHART_OF_ACCOUNTS',
  JOURNAL_ENTRIES = 'JOURNAL_ENTRIES',
  OPENING_BALANCES = 'OPENING_BALANCES',
}

export enum ImportStatus {
  PENDING = 'PENDING',
  VALIDATING = 'VALIDATING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ImportErrorType {
  VALIDATION = 'VALIDATION',
  DUPLICATE = 'DUPLICATE',
  REFERENCE = 'REFERENCE',
  SYSTEM = 'SYSTEM',
}

// Enum metadata for display
export const IMPORT_TYPE_META: Record<ImportType, { displayName: string; description: string; icon: string }> = {
  [ImportType.PRODUCTS]: {
    displayName: 'Products',
    description: 'Import products with stock quantities',
    icon: 'Product',
  },
  [ImportType.CLIENTS]: {
    displayName: 'Clients',
    description: 'Import clients/customers',
    icon: 'UserMultiple',
  },
  [ImportType.CHART_OF_ACCOUNTS]: {
    displayName: 'Chart of Accounts',
    description: 'Import chart of accounts with opening balances',
    icon: 'ChartBubble',
  },
  [ImportType.JOURNAL_ENTRIES]: {
    displayName: 'Journal Entries',
    description: 'Import journal entries',
    icon: 'Document',
  },
  [ImportType.OPENING_BALANCES]: {
    displayName: 'Opening Balances',
    description: 'Import opening balances for existing accounts',
    icon: 'Calculator',
  },
};

export const IMPORT_STATUS_META: Record<ImportStatus, { displayName: string; color: string }> = {
  [ImportStatus.PENDING]: { displayName: 'Pending', color: 'gray' },
  [ImportStatus.VALIDATING]: { displayName: 'Validating', color: 'blue' },
  [ImportStatus.PROCESSING]: { displayName: 'Processing', color: 'purple' },
  [ImportStatus.COMPLETED]: { displayName: 'Completed', color: 'green' },
  [ImportStatus.FAILED]: { displayName: 'Failed', color: 'red' },
};

// ==================== Import Job Types ====================

export interface ImportJob {
  id: string;
  importType: ImportType;
  originalFilename: string;
  fileSizeBytes?: number;
  status: ImportStatus;
  totalRows: number;
  validRows: number;
  processedRows: number;
  failedRows: number;
  skippedRows: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface ImportError {
  id: string;
  rowNumber: number;
  fieldName?: string;
  errorType: ImportErrorType;
  errorMessage: string;
  rawData?: Record<string, string>;
}

// ==================== Template Types ====================

export interface ColumnMapping {
  column: string;
  field: string;
  required: boolean;
}

export interface ImportTemplate {
  id?: string;
  importType: ImportType;
  name: string;
  description: string;
  columnMappings: ColumnMapping[];
  sampleCsv: string;
}

// ==================== Validation Types ====================

export interface ValidationError {
  rowNumber: number;
  fieldName?: string;
  message: string;
}

export interface ImportValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: ValidationError[];
  preview: Record<string, string>[];
}

// ==================== Opening Balance Types ====================

export interface OpeningBalance {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  balanceDate: string;
  debitAmountKobo: number;
  creditAmountKobo: number;
  netBalanceKobo: number;
  description?: string;
  source: string;
  isPosted: boolean;
  postedAt?: string;
  createdAt: string;
}

export interface OpeningBalanceSummary {
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  balanceDate: string;
  accountCount: number;
}
