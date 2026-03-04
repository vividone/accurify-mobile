// ── Project Health ──────────────────────────────────────────────

export type HealthStatus = 'GREEN' | 'YELLOW' | 'RED';

export interface ProjectHealthItem {
  projectId: string;
  projectName: string;
  clientName: string | null;
  billingModel: string;
  status: string;
  budgetHealth: HealthStatus;
  profitHealth: HealthStatus;
  deliveryHealth: HealthStatus;
  paymentHealth: HealthStatus;
  overallHealth: HealthStatus;
  totalBudget: number | null;
  totalIncome: number;
  totalExpenses: number;
  profit: number;
  budgetConsumedPercent: number | null;
}

export interface ProjectHealthReport {
  totalProjects: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  projects: ProjectHealthItem[];
}
