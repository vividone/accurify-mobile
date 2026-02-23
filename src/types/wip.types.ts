export type BillingModel = 'TIME_AND_MATERIALS' | 'FIXED_PRICE' | 'MILESTONE' | 'RETAINER';

export interface ProjectWipResponse {
  projectId: string;
  projectName: string;
  clientId: string | null;
  clientName: string | null;
  billingModel: BillingModel;
  status: string;
  wipBalance: number;
  totalBilled: number;
  totalRecognizedRevenue: number;
  contractValue: number | null;
  estimatedCost: number | null;
  percentComplete: number | null;
  overbillingAmount: number;
  underbillingAmount: number;
  ageBucket: number;
}

export interface WipAgeBucket {
  label: string;
  projectCount: number;
  amount: number;
}

export interface WipSummaryResponse {
  totalWipBalance: number;
  totalOverbilling: number;
  totalUnderbilling: number;
  projectCount: number;
  ageBuckets: WipAgeBucket[];
  projects: ProjectWipResponse[];
}
