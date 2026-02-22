export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum TimeEntryStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  INVOICED = 'INVOICED',
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId?: string;
  clientName?: string;
  status: ProjectStatus;
  budgetAmount?: number;
  hourlyRate?: number;
  startDate?: string;
  endDate?: string;
  color?: string;
  totalHours: number;
  billableHours: number;
  billableAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRequest {
  name: string;
  description?: string;
  clientId?: string;
  status?: ProjectStatus;
  budgetAmount?: number;
  hourlyRate?: number;
  startDate?: string;
  endDate?: string;
  color?: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  userId: string;
  userName: string;
  description?: string;
  entryDate: string;
  durationMinutes: number;
  billable: boolean;
  hourlyRate?: number;
  amount?: number;
  status: TimeEntryStatus;
  notes?: string;
  createdAt: string;
}

export interface TimeEntryRequest {
  projectId: string;
  description?: string;
  entryDate: string;
  durationMinutes: number;
  billable?: boolean;
  hourlyRate?: number;
  notes?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  userId?: string;
  userName?: string;
  roleTitle?: string;
  employmentType: string;
  annualCost?: number;
  availableHoursPerWeek: number;
  defaultBillingRate?: number;
  costRate?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberRequest {
  name: string;
  userId?: string;
  roleTitle?: string;
  employmentType?: string;
  annualCost?: number;
  availableHoursPerWeek?: number;
  defaultBillingRate?: number;
}

export interface ProjectExpense {
  id: string;
  projectId: string;
  projectName: string;
  description: string;
  amount: number;
  category?: string;
  billable: boolean;
  billId?: string;
  receiptUrl?: string;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectExpenseRequest {
  description: string;
  amount: number;
  category?: string;
  billable?: boolean;
  billId?: string;
  receiptUrl?: string;
  expenseDate: string;
}

export interface ProjectProfitability {
  projectId: string;
  projectName: string;
  clientId?: string;
  clientName?: string;
  status: string;
  revenue: number;
  laborCost: number;
  expenseCost: number;
  totalCos: number;
  grossMargin: number;
  grossMarginPercent: number;
  totalHours: number;
  billableHours: number;
  budget?: number;
  budgetUsedPercent?: number;
}

export interface ClientProfitability {
  clientId?: string;
  clientName: string;
  projectCount: number;
  revenue: number;
  totalCos: number;
  grossMargin: number;
  grossMarginPercent: number;
  totalHours: number;
  billableHours: number;
}
