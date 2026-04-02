import type { BusinessRole } from './enums';

export interface TeamMember {
  id: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  businessRole: BusinessRole;
  invitedAt?: string;
  acceptedAt?: string;
  active: boolean;
}

export interface InviteTeamMemberRequest {
  email: string;
  businessRole: BusinessRole;
  firstName?: string;
  lastName?: string;
}

export interface UpdateTeamMemberRoleRequest {
  businessRole: BusinessRole;
}
