import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamMembersApi } from '@/services/api';
import type { TeamMemberRequest } from '@/types';

export const teamMemberKeys = {
  all: ['team-members'] as const,
  lists: () => [...teamMemberKeys.all, 'list'] as const,
  list: (page: number, size: number) =>
    [...teamMemberKeys.lists(), { page, size }] as const,
  details: () => [...teamMemberKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamMemberKeys.details(), id] as const,
};

export function useTeamMembers(page = 0, size = 20) {
  return useQuery({
    queryKey: teamMemberKeys.list(page, size),
    queryFn: () => teamMembersApi.list(page, size),
  });
}

export function useCreateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TeamMemberRequest) => teamMembersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamMemberKeys.lists() });
    },
  });
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TeamMemberRequest }) =>
      teamMembersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: teamMemberKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamMemberKeys.detail(id) });
    },
  });
}

export function useDeactivateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamMembersApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamMemberKeys.lists() });
    },
  });
}
