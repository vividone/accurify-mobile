import { Fragment, useState, useCallback, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  UsersIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import {
  useTeamMembers,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeactivateTeamMember,
  teamMemberKeys,
} from '@/queries';
import type { TeamMember, TeamMemberRequest } from '@/types';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { formatCurrency } from '@/utils/currency';

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE'];

function formatEmploymentType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

export function TeamMembersPage() {
  const queryClient = useQueryClient();
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const { data: membersData, isLoading } = useTeamMembers(0, 50);
  const members = membersData?.content ?? [];

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: teamMemberKeys.lists() });
  }, [queryClient]);

  const { containerRef, PullIndicator } = usePullToRefresh({ onRefresh: handleRefresh });

  return (
    <>
      <PageHeader
        title="Team Members"
        backTo="/app/dashboard"
        actions={
          <button
            onClick={() => setShowCreateSheet(true)}
            className="p-1.5 text-primary active:bg-gray-10 rounded-full"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        }
      />
      <div className="page-content" ref={containerRef}>
        <PullIndicator />

        {/* Team member list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No team members yet"
            description="Add team members to track labor costs and project assignments."
            action={
              <button
                onClick={() => setShowCreateSheet(true)}
                className="px-4 py-2 bg-primary text-white text-body-01 font-medium rounded-lg"
              >
                Add Team Member
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                onEdit={() => setEditingMember(member)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Team Member Bottom Sheet */}
      <TeamMemberSheet
        open={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
        mode="create"
      />

      {/* Edit Team Member Bottom Sheet */}
      {editingMember && (
        <TeamMemberSheet
          open={!!editingMember}
          onClose={() => setEditingMember(null)}
          mode="edit"
          member={editingMember}
        />
      )}
    </>
  );
}

function TeamMemberCard({
  member,
  onEdit,
}: {
  member: TeamMember;
  onEdit: () => void;
}) {
  const deactivateMember = useDeactivateTeamMember();

  const handleToggleActive = async () => {
    if (!member.active) return; // Cannot reactivate via toggle
    try {
      await deactivateMember.mutateAsync(member.id);
    } catch {
      // Error handled by React Query
    }
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-body-01 font-medium text-gray-100 truncate">
              {member.name}
            </p>
            <Badge variant={member.active ? 'success' : 'gray'}>
              {member.active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {member.roleTitle && (
            <p className="text-label-01 text-gray-50 truncate mb-2">
              {member.roleTitle}
            </p>
          )}
          <div className="flex items-center gap-4 text-helper-01 text-gray-40">
            <span>{formatEmploymentType(member.employmentType)}</span>
            {member.costRate != null && (
              <span>{formatCurrency(member.costRate)}/hr</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-3">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-50 active:bg-gray-10 rounded-full"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          {member.active ? (
            <button
              type="button"
              role="switch"
              aria-checked={member.active}
              onClick={handleToggleActive}
              disabled={deactivateMember.isPending}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-primary"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          ) : (
            <span className="px-2 py-0.5 text-helper-01 text-gray-40 bg-gray-10 rounded-full">
              Deactivated
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

function TeamMemberSheet({
  open,
  onClose,
  mode,
  member,
}: {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  member?: TeamMember;
}) {
  const createMember = useCreateTeamMember();
  const updateMember = useUpdateTeamMember();

  const [name, setName] = useState(member?.name ?? '');
  const [roleTitle, setRoleTitle] = useState(member?.roleTitle ?? '');
  const [employmentType, setEmploymentType] = useState(
    member?.employmentType ?? EMPLOYMENT_TYPES[0]
  );
  const [annualCost, setAnnualCost] = useState(
    member?.annualCost?.toString() ?? ''
  );
  const [availableHours, setAvailableHours] = useState(
    member?.availableHoursPerWeek?.toString() ?? '40'
  );
  const [billingRate, setBillingRate] = useState(
    member?.defaultBillingRate?.toString() ?? ''
  );

  // Reset form state when member prop changes to avoid stale data
  useEffect(() => {
    setName(member?.name ?? '');
    setRoleTitle(member?.roleTitle ?? '');
    setEmploymentType(member?.employmentType ?? EMPLOYMENT_TYPES[0]);
    setAnnualCost(member?.annualCost?.toString() ?? '');
    setAvailableHours(member?.availableHoursPerWeek?.toString() ?? '40');
    setBillingRate(member?.defaultBillingRate?.toString() ?? '');
  }, [member]);

  const isPending = createMember.isPending || updateMember.isPending;

  const handleSubmit = async () => {
    if (!name.trim()) return;

    const data: TeamMemberRequest = {
      name: name.trim(),
      roleTitle: roleTitle.trim() || undefined,
      employmentType,
      annualCost: annualCost ? parseFloat(annualCost) : undefined,
      availableHoursPerWeek: availableHours
        ? parseFloat(availableHours)
        : undefined,
      defaultBillingRate: billingRate ? parseFloat(billingRate) : undefined,
    };

    try {
      if (mode === 'edit' && member) {
        await updateMember.mutateAsync({ id: member.id, data });
      } else {
        await createMember.mutateAsync(data);
      }
      // Reset form
      setName('');
      setRoleTitle('');
      setEmploymentType(EMPLOYMENT_TYPES[0]);
      setAnnualCost('');
      setAvailableHours('40');
      setBillingRate('');
      onClose();
    } catch {
      // Error handled by React Query
    }
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[60]">
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
            enter="ease-out duration-200"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <Dialog.Panel
              className="bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
              style={{ paddingBottom: 'calc(var(--safe-area-bottom) + 1rem)' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-20 flex-shrink-0">
                <Dialog.Title className="text-heading-02 text-gray-100">
                  {mode === 'edit' ? 'Edit Team Member' : 'New Team Member'}
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-50 active:bg-gray-10 rounded-full"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter team member name"
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Role Title */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="e.g. Senior Developer"
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Employment Type */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Employment Type
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {EMPLOYMENT_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEmploymentType(type)}
                        className={clsx(
                          'px-3 py-1.5 rounded-full text-label-01 font-medium transition-colors',
                          employmentType === type
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-60 border border-gray-20'
                        )}
                      >
                        {formatEmploymentType(type)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Annual Cost */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Annual Cost (NGN)
                  </label>
                  <input
                    type="number"
                    value={annualCost}
                    onChange={(e) => setAnnualCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Available Hours Per Week */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Available Hours / Week
                  </label>
                  <input
                    type="number"
                    value={availableHours}
                    onChange={(e) => setAvailableHours(e.target.value)}
                    placeholder="40"
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Default Billing Rate */}
                <div>
                  <label className="block text-label-01 text-gray-70 mb-1">
                    Default Billing Rate (NGN/hr)
                  </label>
                  <input
                    type="number"
                    value={billingRate}
                    onChange={(e) => setBillingRate(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-11 px-3 bg-white border border-gray-20 rounded-lg text-body-01 text-gray-100 placeholder:text-gray-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="px-5 pt-3 flex-shrink-0">
                <button
                  onClick={handleSubmit}
                  disabled={!name.trim() || isPending}
                  className="w-full h-12 bg-primary text-white font-medium text-body-01 rounded-lg disabled:opacity-50"
                >
                  {isPending
                    ? mode === 'edit'
                      ? 'Saving...'
                      : 'Creating...'
                    : mode === 'edit'
                      ? 'Save Changes'
                      : 'Add Team Member'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
