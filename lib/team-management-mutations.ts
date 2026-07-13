import type { SupabaseClient } from "@supabase/supabase-js";

import { withRequestTimeout } from "./request-timeout";
import { normalizeOptionalString } from "./value-normalizers";

/** 所有会修改团队、负责人或成员关系的 RPC 集中在这里。 */
export async function saveTeamProfile(
  supabase: SupabaseClient,
  options: {
    teamName: string;
    teamId?: string | null;
    managerUserId?: string | null;
  },
) {
  const { data, error } = await withRequestTimeout(
    supabase.rpc("save_team_profile", {
      p_team_name: options.teamName.trim(),
      p_team_id: options.teamId ?? null,
      p_manager_user_id: options.managerUserId ?? null,
    }),
  );
  if (error) throw error;
  const teamId = normalizeOptionalString(data);
  if (!teamId) throw new Error("team profile save did not return team id");
  return teamId;
}

export async function deleteTeamProfile(
  supabase: SupabaseClient,
  teamId: string,
) {
  return runTeamIdMutation(
    supabase,
    "delete_team_profile",
    { p_team_id: teamId },
  );
}

export async function addTeamSalesman(
  supabase: SupabaseClient,
  options: { teamId?: string | null; salesmanUserId: string },
) {
  return runTeamIdMutation(supabase, "add_team_salesman", {
    p_team_id: options.teamId ?? null,
    p_salesman_user_id: options.salesmanUserId,
  });
}

export async function removeTeamSalesman(
  supabase: SupabaseClient,
  options: { teamId?: string | null; salesmanUserId: string },
) {
  return runTeamIdMutation(supabase, "remove_team_salesman", {
    p_team_id: options.teamId ?? null,
    p_salesman_user_id: options.salesmanUserId,
  });
}

async function runTeamIdMutation(
  supabase: SupabaseClient,
  functionName:
    | "delete_team_profile"
    | "add_team_salesman"
    | "remove_team_salesman",
  parameters: Record<string, string | null>,
) {
  // 三个 RPC 都只返回团队 ID，因此统一处理错误与空值归一化。
  const { data, error } = await withRequestTimeout(
    supabase.rpc(functionName, parameters),
  );
  if (error) throw error;
  return normalizeOptionalString(data);
}
