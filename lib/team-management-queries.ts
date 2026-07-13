import type { SupabaseClient } from "@supabase/supabase-js";

import { withRequestTimeout } from "./request-timeout";
import { isSalesStaffRole } from "./sales-staff-roles";
import {
  EMPTY_TEAM_DETAIL,
  normalizeTeamDetail,
  normalizeTeamManagerCandidate,
  normalizeTeamOverview,
  normalizeTeamSalesmanCandidate,
} from "./team-management-normalizers";
import type {
  TeamDetail,
  TeamManagementPageData,
  TeamManagerCandidate,
  TeamOverview,
  TeamSalesmanCandidate,
} from "./team-management-types";
import {
  getCurrentSessionContext,
  type AppRole,
  type UserStatus,
} from "./user-self-service";

/** 团队页面只读取当前账号可见的 RPC 结果，最终范围仍由数据库权限控制。 */
export async function getVisibleTeamOverviews(
  supabase: SupabaseClient,
): Promise<TeamOverview[]> {
  const { data, error } = await withRequestTimeout(
    supabase.rpc("get_visible_team_overview"),
  );
  if (error) throw error;
  return Array.isArray(data)
    ? data
        .map(normalizeTeamOverview)
        .filter((item): item is TeamOverview => item !== null)
    : [];
}

export function canViewTeamPanel(
  role: AppRole | null,
  status: UserStatus | null,
) {
  if (role === "administrator") return true;
  return (
    status === "active" &&
    (role === "manager" ||
      role === "operator" ||
      role === "finance" ||
      isSalesStaffRole(role))
  );
}

export function resolvePreferredTeamId(
  overviews: TeamOverview[],
  preferredTeamId: string | null,
) {
  if (
    preferredTeamId &&
    overviews.some((team) => team.team_id === preferredTeamId)
  ) {
    return preferredTeamId;
  }
  return (
    overviews.find((team) => team.can_manage)?.team_id ??
    overviews[0]?.team_id ??
    null
  );
}

export async function getTeamManagementPageData(
  supabase: SupabaseClient,
  preferredTeamId?: string | null,
): Promise<TeamManagementPageData> {
  const sessionContext = await getCurrentSessionContext(supabase);
  if (!sessionContext.user) {
    return createEmptyPageData(null, null);
  }
  if (!canViewTeamPanel(sessionContext.role, sessionContext.status)) {
    return createEmptyPageData(sessionContext.role, sessionContext.status);
  }

  const overviews = await getVisibleTeamOverviews(supabase);
  const selectedTeamId = resolvePreferredTeamId(
    overviews,
    preferredTeamId ?? null,
  );
  const detail = selectedTeamId
    ? await getTeamDetail(supabase, selectedTeamId)
    : EMPTY_TEAM_DETAIL;
  const [candidateSalesmen, managerCandidates, createManagerCandidates] =
    await Promise.all([
      detail.team?.can_manage &&
      (sessionContext.role === "administrator" ||
        sessionContext.role === "manager")
        ? getTeamSalesmanCandidates(supabase, detail.team.team_id)
        : Promise.resolve([]),
      sessionContext.role === "administrator" && detail.team
        ? getTeamManagerCandidates(supabase, detail.team.team_id)
        : Promise.resolve([]),
      sessionContext.role === "administrator"
        ? getTeamManagerCandidates(supabase, null)
        : Promise.resolve([]),
    ]);

  return {
    viewerRole: sessionContext.role,
    viewerStatus: sessionContext.status,
    canView: true,
    overviews,
    detail,
    selectedTeamId: detail.team?.team_id ?? selectedTeamId ?? null,
    candidateSalesmen,
    managerCandidates,
    createManagerCandidates,
  };
}

export async function getTeamDetail(
  supabase: SupabaseClient,
  teamId?: string | null,
): Promise<TeamDetail> {
  const { data, error } = await withRequestTimeout(
    supabase.rpc("get_team_detail", { p_team_id: teamId ?? null }),
  );
  if (error) throw error;
  return normalizeTeamDetail(data);
}

export async function getTeamSalesmanCandidates(
  supabase: SupabaseClient,
  teamId?: string | null,
): Promise<TeamSalesmanCandidate[]> {
  const { data, error } = await withRequestTimeout(
    supabase.rpc("get_team_salesman_candidates", {
      p_team_id: teamId ?? null,
    }),
  );
  if (error) throw error;
  return Array.isArray(data)
    ? data
        .map(normalizeTeamSalesmanCandidate)
        .filter((item): item is TeamSalesmanCandidate => item !== null)
    : [];
}

export async function getTeamManagerCandidates(
  supabase: SupabaseClient,
  teamId?: string | null,
): Promise<TeamManagerCandidate[]> {
  const { data, error } = await withRequestTimeout(
    supabase.rpc("get_team_manager_candidates", {
      p_team_id: teamId ?? null,
    }),
  );
  if (error) throw error;
  return Array.isArray(data)
    ? data
        .map(normalizeTeamManagerCandidate)
        .filter((item): item is TeamManagerCandidate => item !== null)
    : [];
}

function createEmptyPageData(
  viewerRole: AppRole | null,
  viewerStatus: UserStatus | null,
): TeamManagementPageData {
  return {
    viewerRole,
    viewerStatus,
    canView: canViewTeamPanel(viewerRole, viewerStatus),
    overviews: [],
    detail: EMPTY_TEAM_DETAIL,
    selectedTeamId: null,
    candidateSalesmen: [],
    managerCandidates: [],
    createManagerCandidates: [],
  };
}
