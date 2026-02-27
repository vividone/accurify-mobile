import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import {
  useReconciliationSessions,
  useReconciliationSuggestions,
  useReconciliationMatches,
  useStartReconciliationSession,
  useConfirmMatch,
  useCompleteReconciliationSession,
} from '@/queries';
import { useBankAccounts } from '@/queries';
import { useUIStore } from '@/store/ui.store';
import { formatDate } from '@/utils/date';
import type { ReconciliationSession } from '@/types';

const startSchema = z.object({
  bankAccountId: z.string().min(1, 'Bank account is required'),
  periodStart: z.string().min(1, 'Start date is required'),
  periodEnd: z.string().min(1, 'End date is required'),
  bankStatementBalance: z.number({ error: 'Balance required' }),
  notes: z.string().optional(),
});

type StartFormValues = z.infer<typeof startSchema>;

function confidenceColor(score: number) {
  if (score >= 80) return 'text-success';
  if (score >= 50) return 'text-warning';
  return 'text-danger';
}

function StatusPill({ status }: { status: ReconciliationSession['status'] }) {
  const map = {
    IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-100 text-blue-700' },
    COMPLETED: { label: 'Completed', cls: 'bg-green-100 text-green-700' },
    ABANDONED: { label: 'Abandoned', cls: 'bg-gray-100 text-gray-500' },
  } as const;
  const cfg = map[status];
  return (
    <span className={`text-helper-01 font-medium px-2 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

type Tab = 'sessions' | 'suggestions' | 'matches';

export function BankReconciliationPage() {
  const [tab, setTab] = useState<Tab>('sessions');
  const [startOpen, setStartOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const showNotification = useUIStore((s) => s.showNotification);

  const { data: sessions = [], isLoading: sessionsLoading } = useReconciliationSessions();
  const { data: bankAccounts = [] } = useBankAccounts();

  const { data: suggestions = [], isLoading: suggestionsLoading } = useReconciliationSuggestions(
    activeSessionId ?? ''
  );
  const { data: matches = [], isLoading: matchesLoading } = useReconciliationMatches(
    activeSessionId ?? ''
  );

  const startSession = useStartReconciliationSession();
  const confirmMatch = useConfirmMatch(activeSessionId ?? '');
  const completeSession = useCompleteReconciliationSession(activeSessionId ?? '');

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StartFormValues>({
    resolver: zodResolver(startSchema),
    defaultValues: {
      bankAccountId: '',
      periodStart: '',
      periodEnd: '',
      bankStatementBalance: 0,
      notes: '',
    },
  });

  const onStartSubmit = async (values: StartFormValues) => {
    try {
      const session = await startSession.mutateAsync(values);
      setActiveSessionId(session.id);
      setTab('suggestions');
      setStartOpen(false);
      reset();
      showNotification('Success', 'Reconciliation session started', 'success');
    } catch {
      showNotification('Error', 'Failed to start reconciliation session', 'error');
    }
  };

  const handleConfirmMatch = async (suggestion: {
    bankTransactionId: string;
    matchedEntityId: string;
    matchedEntityType: string;
    matchType: string;
  }) => {
    if (!activeSessionId) return;
    try {
      await confirmMatch.mutateAsync({
        bankTransactionId: suggestion.bankTransactionId,
        matchedEntityId: suggestion.matchedEntityId,
        matchedEntityType: suggestion.matchedEntityType,
        matchType: suggestion.matchType,
      });
      showNotification('Success', 'Match confirmed', 'success');
    } catch {
      showNotification('Error', 'Failed to confirm match', 'error');
    }
  };

  const handleComplete = async () => {
    if (!activeSessionId) return;
    try {
      await completeSession.mutateAsync();
      showNotification('Success', 'Reconciliation session completed', 'success');
      setActiveSessionId(null);
      setTab('sessions');
    } catch {
      showNotification('Error', 'Failed to complete session', 'error');
    }
  };

  return (
    <>
      <PageHeader
        title="Bank Reconciliation"
        actions={
          <button
            onClick={() => setStartOpen(true)}
            className="text-body-01 font-medium text-primary active:opacity-70"
          >
            + New
          </button>
        }
      />

      <div className="page-content">
        {/* Active session banner */}
        {activeSession && activeSession.status === 'IN_PROGRESS' && (
          <div className="mb-4 bg-blue-50 rounded-lg px-4 py-3 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 flex-1">
              <InformationCircleIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-body-01 text-blue-800 font-medium">
                  {activeSession.bankAccountName}
                </p>
                <p className="text-helper-01 text-blue-600">
                  {formatDate(activeSession.periodStart)} – {formatDate(activeSession.periodEnd)} ·{' '}
                  {activeSession.matchedCount} matched
                </p>
              </div>
            </div>
            <button
              onClick={handleComplete}
              className="text-helper-01 font-medium text-blue-700 whitespace-nowrap active:opacity-70"
            >
              Complete
            </button>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex border-b border-gray-20 mb-4">
          {(['sessions', 'suggestions', 'matches'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-body-01 font-medium capitalize border-b-2 transition-colors ${
                tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-40'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Sessions tab */}
        {tab === 'sessions' && (
          <div className="space-y-3">
            {sessionsLoading ? (
              <div className="text-center py-8 text-gray-40 text-body-01">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <ArrowPathIcon className="w-10 h-10 text-gray-30 mx-auto mb-3" />
                <p className="text-body-01 text-gray-50">No reconciliation sessions yet</p>
                <p className="text-helper-01 text-gray-40 mt-1">
                  Start a new session to reconcile your bank transactions
                </p>
                <button
                  onClick={() => setStartOpen(true)}
                  className="mt-4 px-4 py-2 bg-primary text-white text-body-01 font-medium rounded-lg"
                >
                  Start Session
                </button>
              </div>
            ) : (
              sessions.map((session) => (
                <Card key={session.id}>
                  <button
                    className="w-full text-left"
                    onClick={() => {
                      setActiveSessionId(session.id);
                      setTab('suggestions');
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-body-01 font-medium text-gray-100">
                        {session.bankAccountName}
                      </p>
                      <StatusPill status={session.status} />
                    </div>
                    <p className="text-helper-01 text-gray-50">
                      {formatDate(session.periodStart)} – {formatDate(session.periodEnd)}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-helper-01 text-gray-40">
                        Matched: {session.matchedCount}
                      </span>
                      <span className="text-helper-01 text-gray-40">
                        Unmatched: {session.unmatchedBankCount}
                      </span>
                    </div>
                  </button>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Suggestions tab */}
        {tab === 'suggestions' && (
          <div className="space-y-3">
            {!activeSessionId ? (
              <div className="text-center py-8 text-gray-40 text-body-01">
                Select a session first
              </div>
            ) : suggestionsLoading ? (
              <div className="text-center py-8 text-gray-40 text-body-01">
                Loading suggestions...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircleIcon className="w-10 h-10 text-gray-30 mx-auto mb-3" />
                <p className="text-body-01 text-gray-50">No suggestions available</p>
                <p className="text-helper-01 text-gray-40 mt-1">
                  All transactions have been matched or there are no candidates
                </p>
              </div>
            ) : (
              suggestions.map((s) => (
                <Card key={s.bankTransactionId}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-helper-01 text-gray-40 mb-0.5">Bank transaction</p>
                      <p className="text-body-01 font-medium text-gray-100">
                        ₦{(s.bankAmount / 100).toLocaleString()}
                      </p>
                      <p className="text-helper-01 text-gray-50">{formatDate(s.bankDate)}</p>
                      {s.bankDescription && (
                        <p className="text-helper-01 text-gray-40 truncate">{s.bankDescription}</p>
                      )}
                      <div className="mt-2 pt-2 border-t border-gray-10">
                        <p className="text-helper-01 text-gray-40 mb-0.5">Matched with</p>
                        <p className="text-body-01 text-gray-70">{s.matchedDescription || s.matchedEntityType}</p>
                        <p className="text-helper-01 text-gray-50">
                          ₦{(s.matchedAmount / 100).toLocaleString()} · {formatDate(s.matchedDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`text-label-01 font-semibold ${confidenceColor(s.confidenceScore)}`}>
                        {s.confidenceScore}%
                      </span>
                      <button
                        onClick={() => handleConfirmMatch(s)}
                        className="px-3 py-1.5 bg-primary text-white text-helper-01 font-medium rounded-lg active:opacity-70"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Matches tab */}
        {tab === 'matches' && (
          <div className="space-y-3">
            {!activeSessionId ? (
              <div className="text-center py-8 text-gray-40 text-body-01">
                Select a session first
              </div>
            ) : matchesLoading ? (
              <div className="text-center py-8 text-gray-40 text-body-01">Loading matches...</div>
            ) : matches.length === 0 ? (
              <div className="text-center py-12">
                <ClockIcon className="w-10 h-10 text-gray-30 mx-auto mb-3" />
                <p className="text-body-01 text-gray-50">No confirmed matches yet</p>
              </div>
            ) : (
              matches.map((m) => (
                <Card key={m.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-body-01 font-medium text-gray-100">
                        ₦{(m.bankAmount / 100).toLocaleString()}
                      </p>
                      <p className="text-helper-01 text-gray-50">{formatDate(m.bankDate)}</p>
                      {m.bankDescription && (
                        <p className="text-helper-01 text-gray-40 truncate">{m.bankDescription}</p>
                      )}
                      <p className="text-helper-01 text-gray-40 mt-1">
                        {m.matchedEntityType} · {m.matchMethod}
                      </p>
                    </div>
                    <CheckCircleIcon className="w-5 h-5 text-success flex-shrink-0" />
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Start Session Sheet */}
      <Transition show={startOpen} as={Fragment}>
        <Dialog onClose={() => setStartOpen(false)} className="relative z-[60]">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-x-0 bottom-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="translate-y-full"
              enterTo="translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="translate-y-0"
              leaveTo="translate-y-full"
            >
              <Dialog.Panel
                className="bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
                style={{ paddingBottom: 'calc(var(--safe-area-bottom) + 1rem)' }}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-20 flex-shrink-0">
                  <Dialog.Title className="text-heading-02 text-gray-100">
                    New Reconciliation Session
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={() => setStartOpen(false)}
                    className="p-1 text-gray-50 active:bg-gray-10 rounded-full"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmit(onStartSubmit)}
                  className="overflow-y-auto flex-1 px-5 py-4 space-y-4"
                >
                  <div>
                    <label className="block text-label-01 text-gray-60 mb-1">
                      Bank Account <span className="text-danger">*</span>
                    </label>
                    <select
                      {...register('bankAccountId')}
                      className="w-full h-11 px-3 border border-gray-30 rounded-lg text-body-01 text-gray-100 bg-white focus:outline-none focus:border-primary"
                    >
                      <option value="">Select account</option>
                      {bankAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.bankName} — {acc.accountNumberMasked}
                        </option>
                      ))}
                    </select>
                    {errors.bankAccountId && (
                      <p className="text-helper-01 text-danger mt-1">{errors.bankAccountId.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-label-01 text-gray-60 mb-1">
                        Period Start <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        {...register('periodStart')}
                        className="w-full h-11 px-3 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:border-primary"
                      />
                      {errors.periodStart && (
                        <p className="text-helper-01 text-danger mt-1">{errors.periodStart.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-label-01 text-gray-60 mb-1">
                        Period End <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        {...register('periodEnd')}
                        className="w-full h-11 px-3 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:border-primary"
                      />
                      {errors.periodEnd && (
                        <p className="text-helper-01 text-danger mt-1">{errors.periodEnd.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-label-01 text-gray-60 mb-1">
                      Bank Statement Closing Balance (₦) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...register('bankStatementBalance', { valueAsNumber: true })}
                      className="w-full h-11 px-3 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:border-primary"
                    />
                    {errors.bankStatementBalance && (
                      <p className="text-helper-01 text-danger mt-1">{errors.bankStatementBalance.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-label-01 text-gray-60 mb-1">Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Optional notes..."
                      {...register('notes')}
                      className="w-full px-3 py-2 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting ? 'Starting...' : 'Start Session'}
                  </button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
