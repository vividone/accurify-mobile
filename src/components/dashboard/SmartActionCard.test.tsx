import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SmartActionCard } from './SmartActionCard';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockDismiss = vi.fn();
vi.mock('@/queries/onboarding.queries', () => ({
  useOnboardingStatus: vi.fn(),
  useDismissAction: () => ({ mutate: mockDismiss }),
}));

import { useOnboardingStatus } from '@/queries/onboarding.queries';
const mockedUseOnboardingStatus = vi.mocked(useOnboardingStatus);

function mockStatus(overrides = {}) {
  mockedUseOnboardingStatus.mockReturnValue({
    data: {
      hasBusinessProfile: true,
      hasClients: true,
      hasInvoices: true,
      hasTransactions: true,
      hasBankAccount: false,
      completedSteps: 4,
      totalSteps: 4,
      completionPercentage: 100,
      isComplete: true,
      businessGoal: 'SEND_INVOICES' as const,
      nextBestAction: {
        title: '3 invoices overdue',
        description: 'Follow up on overdue invoices.',
        actionLabel: 'View Overdue',
        actionPath: '/app/invoices?status=OVERDUE',
        priority: 'URGENT' as const,
        actionKey: 'OVERDUE_INVOICES',
        badgeColor: 'red',
      },
      milestones: [
        { key: 'FIRST_CLIENT', label: 'Added first client', achievedAt: '2026-01-15T10:00:00Z' },
        { key: 'FIRST_INVOICE', label: 'Sent first invoice', achievedAt: '2026-01-16T10:00:00Z' },
      ],
      ...overrides,
    },
    isLoading: false,
    error: null,
  } as ReturnType<typeof useOnboardingStatus>);
}

describe('SmartActionCard (Mobile)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the priority badge and action text', () => {
    mockStatus();
    render(<SmartActionCard />);

    expect(screen.getByText('Urgent')).toBeInTheDocument();
    expect(screen.getByText('3 invoices overdue')).toBeInTheDocument();
    expect(screen.getByText('Follow up on overdue invoices.')).toBeInTheDocument();
  });

  it('navigates when CTA button is clicked', () => {
    mockStatus();
    render(<SmartActionCard />);

    fireEvent.click(screen.getByText('View Overdue'));
    expect(mockNavigate).toHaveBeenCalledWith('/app/invoices?status=OVERDUE');
  });

  it('calls dismiss mutation when X is clicked', () => {
    mockStatus();
    render(<SmartActionCard />);

    const dismissBtn = screen.getByLabelText('Dismiss action');
    fireEvent.click(dismissBtn);
    expect(mockDismiss).toHaveBeenCalledWith('OVERDUE_INVOICES');
  });

  it('hides dismiss button for ALL_CAUGHT_UP', () => {
    mockStatus({
      nextBestAction: {
        title: "You\u2019re all caught up!",
        description: 'Check your reports.',
        actionLabel: 'View Reports',
        actionPath: '/app/income-statement',
        priority: 'ENGAGEMENT',
        actionKey: 'ALL_CAUGHT_UP',
        badgeColor: 'grey',
      },
    });
    render(<SmartActionCard />);

    expect(screen.queryByLabelText('Dismiss action')).not.toBeInTheDocument();
  });

  it('renders milestones strip', () => {
    mockStatus();
    render(<SmartActionCard />);

    expect(screen.getByText('Added first client')).toBeInTheDocument();
    expect(screen.getByText('Sent first invoice')).toBeInTheDocument();
  });

  it('does not render milestones when empty', () => {
    mockStatus({ milestones: [] });
    render(<SmartActionCard />);

    expect(screen.queryByText('Added first client')).not.toBeInTheDocument();
  });

  it('returns null when no action data', () => {
    mockedUseOnboardingStatus.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useOnboardingStatus>);

    const { container } = render(<SmartActionCard />);
    expect(container.firstChild).toBeNull();
  });
});
