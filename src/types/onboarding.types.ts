export type OnboardingGoal =
  | 'SEND_INVOICES'
  | 'TRACK_EXPENSES'
  | 'MANAGE_TAXES'
  | 'FULL_ACCOUNTING'
  | 'SELL_ONLINE'
  | 'MANAGE_PROJECTS';

export type ActionPriority = 'URGENT' | 'MONEY' | 'GROWTH' | 'SETUP' | 'ENGAGEMENT';

export interface NextBestAction {
  title: string;
  description: string;
  actionLabel: string;
  actionPath: string;
  priority?: ActionPriority;
  actionKey?: string;
  badgeColor?: string;
}

export interface MilestoneItem {
  key: string;
  label: string;
  achievedAt?: string;
}

export interface OnboardingStatus {
  hasBusinessProfile: boolean;
  hasClients: boolean;
  hasInvoices: boolean;
  hasTransactions: boolean;
  hasBankAccount: boolean;
  completedSteps: number;
  totalSteps: number;
  completionPercentage: number;
  isComplete: boolean;
  businessGoal: OnboardingGoal | null;
  nextBestAction: NextBestAction | null;
  milestones?: MilestoneItem[];
}
