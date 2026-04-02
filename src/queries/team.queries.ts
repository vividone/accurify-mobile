import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '@/services/api/team.api';
import type { InviteTeamMemberRequest, UpdateTeamMemberRoleRequest } from '@/types/team.types';

export const teamKeys = {
  all: ['team'] as const,
  members: () => [...teamKeys.all, 'members'] as const,
};

export function useTeamMembers() {
  return useQuery({
    queryKey: teamKeys.members(),
    queryFn: () => teamApi.getTeamMembers(),
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteTeamMemberRequest) => teamApi.inviteMember(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teamKeys.members() }),
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamMemberRoleRequest }) =>
      teamApi.updateMemberRole(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teamKeys.members() }),
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamApi.removeMember(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teamKeys.members() }),
  });
}
