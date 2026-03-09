import type { FiscalPeriodStatus } from './enums';

export interface FiscalPeriod {
  id: string;
  year: number;
  month: number;
  status: FiscalPeriodStatus;
  closedAt?: string;
  closedByName?: string;
  reopenedAt?: string;
  reopenedByName?: string;
}
