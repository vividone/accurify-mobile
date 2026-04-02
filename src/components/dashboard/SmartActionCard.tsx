import { useNavigate } from 'react-router-dom';
import { XMarkIcon, CheckCircleIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useOnboardingStatus, useDismissAction } from '@/queries/onboarding.queries';
import type { ActionPriority } from '@/types/onboarding.types';

const BADGE_STYLES: Record<string, string> = {
  red: 'bg-red-100 text-red-800',
  amber: 'bg-amber-100 text-amber-800',
  blue: 'bg-blue-100 text-blue-800',
  grey: 'bg-gray-100 text-gray-600',
};

const PRIORITY_LABELS: Record<ActionPriority, string> = {
  URGENT: 'Urgent',
  MONEY: 'Action needed',
  GROWTH: 'Grow',
  SETUP: 'Setup',
  ENGAGEMENT: 'Tip',
};

/**
 * Mobile equivalent of the web SmartActionPanel.
 * Shows the highest-priority NBA with dismiss + milestones strip.
 * Always visible on the dashboard — never hides.
 */
export function SmartActionCard() {
  const navigate = useNavigate();
  const { data: status } = useOnboardingStatus();
  const { mutate: dismiss } = useDismissAction();

  const action = status?.nextBestAction;
  const milestones = status?.milestones ?? [];

  if (!action) return null;

  const badgeColor = action.badgeColor ?? 'grey';
  const priority = (action.priority ?? 'ENGAGEMENT') as ActionPriority;

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      {/* Priority Action */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className={`shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${BADGE_STYLES[badgeColor] ?? BADGE_STYLES.grey}`}>
            {PRIORITY_LABELS[priority] ?? priority}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{action.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
          </div>
          {action.actionKey && action.actionKey !== 'ALL_CAUGHT_UP' && (
            <button
              onClick={() => dismiss(action.actionKey!)}
              className="shrink-0 p-1 -mr-1 rounded-full text-gray-400 hover:text-gray-600"
              aria-label="Dismiss action"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => navigate(action.actionPath)}
          className="mt-3 w-full flex items-center justify-center gap-1 bg-blue-600 text-white text-sm font-medium py-2 rounded-lg active:bg-blue-700"
        >
          {action.actionLabel}
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Milestones strip */}
      {milestones.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-2.5 flex flex-wrap gap-x-4 gap-y-1">
          {milestones.map((m) => (
            <div key={m.key} className="flex items-center gap-1 text-xs text-gray-500">
              <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
