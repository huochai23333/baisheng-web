import type { AppRole, UserStatus } from "./user-self-service";

/** 团队管理页面使用的已归一化数据类型。 */
export type TeamOverview = {
  team_id: string;
  team_name: string | null;
  manager_user_id: string | null;
  manager_name: string | null;
  manager_email: string | null;
  member_count: number;
  active_member_count: number;
  client_count: number;
  vip_client_count: number;
  last_member_joined_at: string | null;
  can_manage: boolean;
};

export type TeamMember = {
  user_id: string;
  name: string | null;
  email: string | null;
  status: UserStatus | null;
  created_at: string | null;
  joined_at: string | null;
  client_count: number;
};

export type TeamClient = {
  user_id: string;
  name: string | null;
  email: string | null;
  status: UserStatus | null;
  created_at: string | null;
  referrer_user_id: string | null;
  referrer_name: string | null;
  vip_status: boolean;
};

export type TeamDetail = {
  team: TeamOverview | null;
  members: TeamMember[];
  clients: TeamClient[];
};

export type TeamSalesmanCandidate = {
  user_id: string;
  name: string | null;
  email: string | null;
  status: UserStatus | null;
  created_at: string | null;
  current_team_id: string | null;
  current_team_name: string | null;
  direct_client_count: number;
  assignable: boolean;
};

export type TeamManagerCandidate = {
  user_id: string;
  name: string | null;
  email: string | null;
  status: UserStatus | null;
  created_at: string | null;
  current_team_id: string | null;
  current_team_name: string | null;
  assignable: boolean;
};

export type TeamManagementPageData = {
  viewerRole: AppRole | null;
  viewerStatus: UserStatus | null;
  canView: boolean;
  overviews: TeamOverview[];
  detail: TeamDetail;
  selectedTeamId: string | null;
  candidateSalesmen: TeamSalesmanCandidate[];
  managerCandidates: TeamManagerCandidate[];
  createManagerCandidates: TeamManagerCandidate[];
};
