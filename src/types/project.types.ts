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
