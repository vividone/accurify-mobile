// ── Project Health ──────────────────────────────────────────────

export type HealthStatus = 'GREEN' | 'YELLOW' | 'RED';

export interface ProjectHealthItem {
  projectId: string;
  projectName: string;
  clientName: string | null;
  billingModel: string;
  status: string;
  budgetHealth: HealthStatus;
  marginHealth: HealthStatus;
  scheduleHealth: HealthStatus;
  wipAgeHealth: HealthStatus;
  overallHealth: HealthStatus;
  budgetConsumedPercent: number | null;
  grossMarginPercent: number | null;
  daysToDeadline: number | null;
  percentComplete: number | null;
  wipAgeDays: number;
  revenue: number;
  totalCost: number;
  wipBalance: number;
}

export interface ProjectHealthReport {
  totalProjects: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  projects: ProjectHealthItem[];
}

// ── Utilization ────────────────────────────────────────────────

export type UtilizationStatus = 'OPTIMAL' | 'UNDER_UTILIZED' | 'OVER_UTILIZED';

export interface TeamMemberUtilization {
  teamMemberId: string;
  name: string;
  roleTitle: string | null;
  billableHours: number;
  nonBillableHours: number;
  availableHours: number;
  utilizationPercent: number;
  effectiveRate: number;
  costRate: number;
  revenueGenerated: number;
  status: UtilizationStatus;
}

export interface UtilizationReport {
  teamSize: number;
  overallUtilization: number;
  benchmarkUtilization: number;
  totalBillableHours: number;
  totalAvailableHours: number;
  effectiveBillingRate: number;
  revenuePerEmployee: number;
  teamMembers: TeamMemberUtilization[];
}

// ── Retainer Health ────────────────────────────────────────────

export type RetainerHealthStatus = 'HEALTHY' | 'OVER_SERVICED' | 'UNDER_UTILIZED' | 'EXPIRING';

export interface RetainerHealthItem {
  retainerId: string;
  name: string;
  clientName: string | null;
  projectName: string | null;
  monthlyFee: number;
  includedHours: number;
  usedHours: number;
  burnRate: number;
  status: RetainerHealthStatus;
  daysToExpiry: number | null;
  lastPeriodUtilization: number;
  unbilledOverageAmount: number;
}

export interface RetainerHealthReport {
  totalRetainers: number;
  totalMRR: number;
  averageUtilization: number;
  overServicedCount: number;
  underUtilizedCount: number;
  expiringCount: number;
  retainers: RetainerHealthItem[];
}

// ── Rate Analysis ──────────────────────────────────────────────

export interface ClientRateAnalysis {
  clientId: string;
  clientName: string;
  hoursWorked: number;
  standardAmount: number;
  actualAmount: number;
  effectiveRate: number;
  realizationRate: number;
}

export interface TeamMemberRateAnalysis {
  teamMemberId: string;
  name: string;
  roleTitle: string | null;
  hoursWorked: number;
  revenueGenerated: number;
  effectiveRate: number;
  costRate: number;
  marginPerHour: number;
}

export interface RateAnalysisReport {
  averageStandardRate: number;
  effectiveRate: number;
  realizationRate: number;
  revenueGap: number;
  byClient: ClientRateAnalysis[];
  byTeamMember: TeamMemberRateAnalysis[];
}
