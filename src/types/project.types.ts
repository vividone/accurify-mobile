export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum BudgetCategory {
  MATERIALS = 'MATERIALS',
  LABOUR = 'LABOUR',
  TRANSPORT = 'TRANSPORT',
  EQUIPMENT = 'EQUIPMENT',
  SUBCONTRACTOR = 'SUBCONTRACTOR',
  MARKETING = 'MARKETING',
  UTILITIES = 'UTILITIES',
  OTHER = 'OTHER',
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId?: string;
  clientName?: string;
  status: ProjectStatus;
  budgetAmount?: number;
  startDate?: string;
  endDate?: string;
  color?: string;
  totalBudget: number;
  totalIncome: number;
  totalExpenses: number;
  profit: number;
  budgetUsedPercent?: number;
  billingModel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRequest {
  name: string;
  description?: string;
  clientId?: string;
  status?: ProjectStatus;
  budgetAmount?: number;
  startDate?: string;
  endDate?: string;
  color?: string;
  billingModel?: string;
  contractValue?: number;
  estimatedCost?: number;
}

export interface BudgetLineItem {
  id: string;
  projectId: string;
  category: BudgetCategory;
  description: string;
  estimatedAmount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetLineItemRequest {
  category: BudgetCategory;
  description: string;
  estimatedAmount: number;
  sortOrder?: number;
}

export interface ProjectFinancialSummary {
  totalBudget: number;
  totalIncome: number;
  totalExpenses: number;
  profit: number;
  budgetUsedPercent: number | null;
  incomeHealth: string;
  expenseHealth: string;
  profitHealth: string;
  deliveryHealth: string;
}

export interface MilestoneRequest {
  name: string;
  description?: string;
  amount?: number;
  percentage?: number;
  dueDate?: string;
  sortOrder?: number;
  status?: string;
}

export interface MilestoneResponse {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  amount?: number | null;
  percentage?: number | null;
  status: string;
  dueDate?: string | null;
  completedAt?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
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
  expenseCost: number;
  totalCos: number;
  grossMargin: number;
  grossMarginPercent: number;
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
}
