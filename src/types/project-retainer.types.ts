export type RolloverPolicy = 'EXPIRE' | 'ROLLOVER' | 'REFUND';

export interface RetainerRequest {
  projectId: string;
  clientId?: string;
  name: string;
  monthlyAmount: number;
  monthlyHours: number;
  rolloverPolicy?: RolloverPolicy;
  maxRolloverHours?: number;
  startDate: string;
  endDate?: string;
}

export interface RetainerResponse {
  id: string;
  projectId: string;
  projectName: string;
  clientId: string | null;
  clientName: string | null;
  name: string;
  monthlyAmount: number;
  monthlyHours: number;
  rolloverPolicy: RolloverPolicy;
  maxRolloverHours: number | null;
  status: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RetainerPeriodResponse {
  id: string;
  retainerAgreementId: string;
  periodStart: string;
  periodEnd: string;
  allocatedHours: number;
  usedHours: number;
  rolloverHours: number;
  remainingHours: number;
  amountRecognized: number;
  utilizationPercent: number;
  status: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneRequest {
  name: string;
  description?: string;
  amount: number;
  percentage?: number;
  dueDate?: string;
  sortOrder?: number;
}

export interface MilestoneResponse {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  amount: number;
  percentage: number | null;
  status: string;
  dueDate: string | null;
  completedAt: string | null;
  invoiceId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
