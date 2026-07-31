import type { SupabaseClient } from "@supabase/supabase-js";

import type { AdminPersonAccountUpdatePayload } from "./admin-people";
import type { SalesmanBusinessBoard } from "./salesman-business-access";
import { withRequestTimeout } from "./request-timeout";
import type { WorkspaceBusinessKey } from "./workspace-business-access";

const ADMIN_PEOPLE_MUTATION_TIMEOUT_MS = 30_000;

export async function prepareAdminPersonAccountChange(
  supabase: SupabaseClient,
  input: AdminPersonAccountUpdatePayload,
) {
  await runRpc(supabase, "admin_prepare_person_account_change", {
    _target_user_id: input.targetUserId,
    _next_role: input.nextRole,
    _next_status: input.nextStatus,
    _next_city: input.nextCity,
  });
}

export async function applyAdminPersonAccountChange(
  supabase: SupabaseClient,
  input: AdminPersonAccountUpdatePayload,
) {
  await runRpc(supabase, "admin_apply_person_account_change", {
    _target_user_id: input.targetUserId,
    _next_role: input.nextRole,
    _next_status: input.nextStatus,
    _next_city: input.nextCity,
    _note: input.note ?? null,
  });
}

export async function setSalesmanBusinessAccess(
  supabase: SupabaseClient,
  targetUserId: string,
  businessBoards: SalesmanBusinessBoard[],
) {
  await runRpc(supabase, "admin_set_salesman_business_access", {
    _salesman_user_id: targetUserId,
    _business_boards: businessBoards,
  });
}

export async function setWorkspaceBusinessAccess(
  supabase: SupabaseClient,
  targetUserId: string,
  workspaceBusinessAccess: WorkspaceBusinessKey[],
) {
  await runRpc(supabase, "admin_set_workspace_business_access", {
    _target_user_id: targetUserId,
    _business_keys: workspaceBusinessAccess,
  });
}

async function runRpc(
  supabase: SupabaseClient,
  functionName: string,
  parameters: Record<string, unknown>,
) {
  // 所有人员数据库变更共享同一超时和错误处理，编排层只决定调用顺序。
  const { error } = await withRequestTimeout(
    supabase.rpc(functionName, parameters),
    { timeoutMs: ADMIN_PEOPLE_MUTATION_TIMEOUT_MS },
  );
  if (error) throw error;
}
