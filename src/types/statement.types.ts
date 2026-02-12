// Statement Upload Types
import type { TransactionType } from './enums';

export type StatementUploadStatus =
  | 'UPLOADING'
  | 'PARSING'
  | 'PARSED'
  | 'IMPORTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type StatementLineStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'SKIPPED'
  | 'IMPORTED'
  | 'DUPLICATE'
  | 'ERROR';

export type { TransactionType };

export interface StatementUploadResponse {
  id: string;
  originalFilename: string;
  fileSizeBytes: number;
  status: StatementUploadStatus;

  // Detected info
  detectedBankName: string | null;
  statementStartDate: string | null;
  statementEndDate: string | null;
  accountNumberExtracted: string | null;
  accountNameExtracted: string | null;

  // Linked bank account
  bankAccountId: string | null;
  bankAccountName: string | null;

  // Statistics
  totalLinesParsed: number;
  linesImported: number;
  linesSkipped: number;
  linesDuplicate: number;
  linesPending: number;
  linesApproved: number;

  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StatementLineResponse {
  id: string;
  lineNumber: number;
  transactionDate: string;
  valueDate: string | null;
  description: string;
  reference: string | null;
  transactionType: TransactionType;
  amountKobo: number;
  balanceAfterKobo: number | null;
  status: StatementLineStatus;

  // Duplicate detection
  isDuplicate: boolean;
  transactionHash: string;

  // Categorization
  suggestedCategoryId: string | null;
  suggestedCategoryName: string | null;
  suggestedCategoryCode: string | null;
  categoryConfidence: number | null;

  selectedCategoryId: string | null;
  selectedCategoryName: string | null;
  selectedCategoryCode: string | null;

  // Manual GL account override
  manualGlAccountId: string | null;
  manualGlAccountName: string | null;
  manualGlAccountCode: string | null;

  // GL Account preview (before import) - effective GL account
  suggestedGlAccountCode: string | null;
  suggestedGlAccountName: string | null;
  suggestedGlAccountFlow: string | null;

  // User notes
  userNotes: string | null;

  // Import result
  importedTransactionId: string | null;
  importedJournalEntryId: string | null;
  importedJournalNumber: string | null;
  importedGlAccountCode: string | null;
  importedGlAccountName: string | null;
  errorMessage: string | null;
}

export interface StatementUploadDetailResponse extends StatementUploadResponse {
  lines: StatementLineResponse[];
}

export interface UpdateStatementLineRequest {
  status: StatementLineStatus;
  selectedCategoryId?: string;
  manualGlAccountId?: string;
  userNotes?: string;
}

export interface BulkUpdateLinesRequest {
  lineIds: string[];
  status: StatementLineStatus;
  categoryId?: string;
  manualGlAccountId?: string;
}

export interface ImportStatementRequest {
  statementUploadId: string;
  bankAccountId?: string;
  autoApproveAll?: boolean;
}

export interface ImportStatementResponse {
  statementUploadId: string;
  totalLines: number;
  linesImported: number;
  linesSkipped: number;
  linesDuplicate: number;
  linesError: number;
  message: string;
}

// Overlap check types
export interface OverlapCheckRequest {
  startDate: string;
  endDate: string;
  accountNumber?: string;
}

export interface OverlappingUpload {
  id: string;
  originalFilename: string;
  detectedBankName: string | null;
  accountNumber: string | null;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

export interface OverlapCheckResponse {
  hasOverlap: boolean;
  overlappingCount: number;
  overlappingUploads: OverlappingUpload[];
  warningMessage: string | null;
}
