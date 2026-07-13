import { normalizeUserStatus } from "./auth-metadata";
import type {
  TeamClient,
  TeamDetail,
  TeamManagerCandidate,
  TeamMember,
  TeamOverview,
  TeamSalesmanCandidate,
} from "./team-management-types";
import {
  normalizeInteger,
  normalizeOptionalString,
} from "./value-normalizers";

export const EMPTY_TEAM_DETAIL: TeamDetail = {
  team: null,
  members: [],
  clients: [],
};

/**
 * RPC 返回的是运行时数据，TypeScript 无法保证字段真实存在。
 * 这些函数逐项检查并提供安全默认值，页面只接触稳定的数据结构。
 */
export function normalizeTeamDetail(value: unknown): TeamDetail {
  if (!isRecord(value)) return EMPTY_TEAM_DETAIL;

  return {
    team: "team" in value ? normalizeTeamOverview(value.team) : null,
    members: "members" in value ? normalizeTeamMembers(value.members) : [],
    clients: "clients" in value ? normalizeTeamClients(value.clients) : [],
  };
}

export function normalizeTeamOverview(value: unknown): TeamOverview | null {
  if (!isRecord(value)) return null;
  const teamId = normalizeField(value, "team_id");
  if (!teamId) return null;

  return {
    team_id: teamId,
    team_name: normalizeField(value, "team_name"),
    manager_user_id: normalizeField(value, "manager_user_id"),
    manager_name: normalizeField(value, "manager_name"),
    manager_email: normalizeField(value, "manager_email"),
    member_count: normalizeIntegerField(value, "member_count"),
    active_member_count: normalizeIntegerField(value, "active_member_count"),
    client_count: normalizeIntegerField(value, "client_count"),
    vip_client_count: normalizeIntegerField(value, "vip_client_count"),
    last_member_joined_at: normalizeField(value, "last_member_joined_at"),
    can_manage: value.can_manage === true,
  };
}

export function normalizeTeamSalesmanCandidate(
  value: unknown,
): TeamSalesmanCandidate | null {
  if (!isRecord(value)) return null;
  const userId = normalizeField(value, "user_id");
  if (!userId) return null;

  return {
    user_id: userId,
    name: normalizeField(value, "name"),
    email: normalizeField(value, "email"),
    status: normalizeStatusField(value),
    created_at: normalizeField(value, "created_at"),
    current_team_id: normalizeField(value, "current_team_id"),
    current_team_name: normalizeField(value, "current_team_name"),
    direct_client_count: normalizeIntegerField(value, "direct_client_count"),
    assignable: value.assignable === true,
  };
}

export function normalizeTeamManagerCandidate(
  value: unknown,
): TeamManagerCandidate | null {
  if (!isRecord(value)) return null;
  const userId = normalizeField(value, "user_id");
  if (!userId) return null;

  return {
    user_id: userId,
    name: normalizeField(value, "name"),
    email: normalizeField(value, "email"),
    status: normalizeStatusField(value),
    created_at: normalizeField(value, "created_at"),
    current_team_id: normalizeField(value, "current_team_id"),
    current_team_name: normalizeField(value, "current_team_name"),
    assignable: value.assignable === true,
  };
}

function normalizeTeamMembers(value: unknown) {
  return Array.isArray(value)
    ? value
        .map(normalizeTeamMember)
        .filter((item): item is TeamMember => item !== null)
    : [];
}

function normalizeTeamClients(value: unknown) {
  return Array.isArray(value)
    ? value
        .map(normalizeTeamClient)
        .filter((item): item is TeamClient => item !== null)
    : [];
}

function normalizeTeamMember(value: unknown): TeamMember | null {
  if (!isRecord(value)) return null;
  const userId = normalizeField(value, "user_id");
  if (!userId) return null;
  return {
    user_id: userId,
    name: normalizeField(value, "name"),
    email: normalizeField(value, "email"),
    status: normalizeStatusField(value),
    created_at: normalizeField(value, "created_at"),
    joined_at: normalizeField(value, "joined_at"),
    client_count: normalizeIntegerField(value, "client_count"),
  };
}

function normalizeTeamClient(value: unknown): TeamClient | null {
  if (!isRecord(value)) return null;
  const userId = normalizeField(value, "user_id");
  if (!userId) return null;
  return {
    user_id: userId,
    name: normalizeField(value, "name"),
    email: normalizeField(value, "email"),
    status: normalizeStatusField(value),
    created_at: normalizeField(value, "created_at"),
    referrer_user_id: normalizeField(value, "referrer_user_id"),
    referrer_name: normalizeField(value, "referrer_name"),
    vip_status: value.vip_status === true,
  };
}

function normalizeField(value: Record<string, unknown>, key: string) {
  return key in value ? normalizeOptionalString(value[key]) : null;
}

function normalizeIntegerField(value: Record<string, unknown>, key: string) {
  return key in value ? normalizeInteger(value[key]) : 0;
}

function normalizeStatusField(value: Record<string, unknown>) {
  return "status" in value ? normalizeUserStatus(value.status) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
