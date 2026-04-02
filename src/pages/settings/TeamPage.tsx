import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, UserPlusIcon, TrashIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useTeamMembers, useInviteMember, useUpdateMemberRole, useRemoveMember } from '@/queries/team.queries';
import { BusinessRole } from '@/types/enums';
import type { TeamMember } from '@/types/team.types';
import { useUIStore } from '@/store/ui.store';

const ROLE_OPTIONS = [
  { value: BusinessRole.ADMIN, label: 'Admin' },
  { value: BusinessRole.BOOKKEEPER, label: 'Bookkeeper' },
  { value: BusinessRole.STORE_OPERATOR, label: 'Store Operator' },
  { value: BusinessRole.VIEW_ONLY, label: 'View Only' },
];

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-blue-100 text-blue-800',
  BOOKKEEPER: 'bg-green-100 text-green-800',
  STORE_OPERATOR: 'bg-amber-100 text-amber-800',
  VIEW_ONLY: 'bg-gray-100 text-gray-600',
};

export function TeamPage() {
  const navigate = useNavigate();
  const showNotification = useUIStore((s) => s.showNotification);
  const { data: members, isLoading } = useTeamMembers();
  const inviteMutation = useInviteMember();
  const updateRoleMutation = useUpdateMemberRole();
  const removeMutation = useRemoveMember();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<BusinessRole>(BusinessRole.BOOKKEEPER);

  const handleInvite = () => {
    inviteMutation.mutate(
      { email: inviteEmail, businessRole: inviteRole },
      {
        onSuccess: () => {
          setShowInvite(false);
          setInviteEmail('');
          setInviteRole(BusinessRole.BOOKKEEPER);
          showNotification('Success', 'Invitation sent', 'success');
        },
        onError: () => showNotification('Error', 'Failed to send invite', 'error'),
      }
    );
  };

  const handleRoleChange = (member: TeamMember, newRole: BusinessRole) => {
    updateRoleMutation.mutate(
      { id: member.id, data: { businessRole: newRole } },
      { onError: () => showNotification('Error', 'Failed to update role', 'error') }
    );
  };

  const handleRemove = (member: TeamMember) => {
    if (window.confirm(`Remove ${member.email} from the team?`)) {
      removeMutation.mutate(member.id, {
        onSuccess: () => showNotification('Success', 'Team member removed', 'success'),
        onError: () => showNotification('Error', 'Failed to remove member', 'error'),
      });
    }
  };

  const inputClass = 'w-full h-11 px-3 border border-gray-30 rounded-lg text-body-01 text-gray-100 focus:outline-none focus:border-primary bg-white';
  const labelClass = 'block text-label-01 text-gray-60 mb-1';

  return (
    <div className="page-content space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/app/settings')} className="p-1 text-gray-50">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-heading-03 text-gray-100">Team</h1>
          <p className="text-helper-01 text-gray-50">Manage who has access</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-1 bg-primary text-white text-body-01 font-medium px-3 py-2 rounded-lg"
        >
          <UserPlusIcon className="w-4 h-4" />
          Invite
        </button>
      </div>

      {/* Members list */}
      {isLoading ? (
        <p className="text-body-01 text-gray-50 text-center py-8">Loading...</p>
      ) : !members || members.length === 0 ? (
        <p className="text-body-01 text-gray-50 text-center py-8">No team members yet.</p>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="bg-white rounded-xl p-4 shadow-card">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-body-01 font-medium text-gray-100 truncate">
                    {member.firstName || member.lastName
                      ? `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim()
                      : member.email}
                  </p>
                  <p className="text-helper-01 text-gray-50 truncate">{member.email}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${ROLE_COLORS[member.businessRole] ?? ROLE_COLORS.VIEW_ONLY}`}>
                  {member.businessRole === BusinessRole.OWNER ? 'Owner' : member.businessRole.replace('_', ' ')}
                </span>
              </div>

              {member.businessRole !== BusinessRole.OWNER && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-10">
                  <select
                    value={member.businessRole}
                    onChange={(e) => handleRoleChange(member, e.target.value as BusinessRole)}
                    className="flex-1 h-9 px-2 text-body-02 border border-gray-20 rounded-lg bg-white text-gray-100"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemove(member)}
                    className="p-2 text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              )}

              {!member.acceptedAt && (
                <p className="text-helper-01 text-amber-600 mt-2">Invitation pending</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Invite Sheet */}
      <Transition show={showInvite} as={Fragment}>
        <Dialog onClose={() => setShowInvite(false)} className="relative z-[60]">
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>
          <div className="fixed inset-x-0 bottom-0">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="translate-y-full" enterTo="translate-y-0" leave="ease-in duration-200" leaveFrom="translate-y-0" leaveTo="translate-y-full">
              <Dialog.Panel className="bg-white rounded-t-2xl">
                <div className="px-5 pt-4 pb-3 border-b border-gray-20 flex items-center justify-between">
                  <Dialog.Title className="text-heading-03 text-gray-100">Invite Member</Dialog.Title>
                  <button onClick={() => setShowInvite(false)} className="p-1 text-gray-50">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-5 py-5 space-y-4">
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input
                      className={inputClass}
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Role *</label>
                    <select
                      className={inputClass}
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as BusinessRole)}
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleInvite}
                    disabled={!inviteEmail || inviteMutation.isPending}
                    className="w-full h-12 bg-primary text-white rounded-lg font-medium text-body-01 disabled:opacity-50"
                  >
                    {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
