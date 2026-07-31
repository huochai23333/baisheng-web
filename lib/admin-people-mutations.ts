import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getAdminPersonRowById,
  type AdminPersonAccountUpdatePayload,
  type AdminPersonRow,
} from "./admin-people";
import { syncTargetAuthMetadata } from "./admin-people-auth-metadata";
import {
  applyAdminPersonAccountChange,
  prepareAdminPersonAccountChange,
  setSalesmanBusinessAccess,
  setWorkspaceBusinessAccess,
} from "./admin-people-mutation-database";
import { AdminPeopleMutationError } from "./admin-people-mutation-errors";
import {
  getSalesmanBusinessBoardsForRole,
  normalizeAccountCity,
  normalizeAdminPersonAccountUpdatePayload,
  resolveWorkspaceBusinessAccessForUpdate,
} from "./admin-people-mutation-input";
import { isSalesStaffRole } from "./sales-staff-roles";
import { getCurrentSessionContext } from "./user-self-service";
import { areWorkspaceBusinessAccessListsEqual } from "./workspace-business-access";

export {
  AdminPeopleMutationError,
  getAdminPeopleUpdateErrorCode,
  type AdminPeopleUpdateErrorCode,
} from "./admin-people-mutation-errors";

/**
 * 人员修改的薄编排层：验证操作者，计算差异，再按数据库、Auth 缓存顺序调度。
 * 输入规范化、具体 RPC 和 Auth 管理接口均不在此文件实现。
 */
export async function updateAdminPersonAccount(
  supabase: SupabaseClient,
  input: AdminPersonAccountUpdatePayload,
): Promise<AdminPersonRow> {
  const sessionContext = await getCurrentSessionContext(supabase);
  if (
    !sessionContext.user ||
    sessionContext.role !== "administrator" ||
    sessionContext.status !== "active"
  ) {
    throw new AdminPeopleMutationError("forbidden");
  }

  const payload = normalizeAdminPersonAccountUpdatePayload(input);
  const currentPerson = await getAdminPersonRowById(
    supabase,
    payload.targetUserId,
  );
  if (!currentPerson) throw new AdminPeopleMutationError("notFound");
  if (currentPerson.user_id === sessionContext.user.id) {
    throw new AdminPeopleMutationError("selfChange");
  }

  const accountWillChange =
    currentPerson.role !== payload.nextRole ||
    currentPerson.status !== payload.nextStatus;
  const cityWillChange =
    normalizeAccountCity(currentPerson.city) !== payload.nextCity;
  const workspaceBusinessAccess = resolveWorkspaceBusinessAccessForUpdate(
    currentPerson,
    payload,
  );
  const businessAccessWillChange =
    !areWorkspaceBusinessAccessListsEqual(
      currentPerson.workspace_business_access,
      workspaceBusinessAccess,
    );
  if (!accountWillChange && !cityWillChange && !businessAccessWillChange) {
    throw new AdminPeopleMutationError("noChange");
  }

  if (accountWillChange || cityWillChange) {
    await prepareAdminPersonAccountChange(supabase, payload);
    await applyAdminPersonAccountChange(supabase, payload);
    if (accountWillChange) await syncTargetAuthMetadata(payload);
  }
  if (businessAccessWillChange || accountWillChange) {
    await setWorkspaceBusinessAccess(
      supabase,
      payload.targetUserId,
      workspaceBusinessAccess,
    );
  }
  if (isSalesStaffRole(currentPerson.role) || isSalesStaffRole(payload.nextRole)) {
    await setSalesmanBusinessAccess(
      supabase,
      payload.targetUserId,
      getSalesmanBusinessBoardsForRole(payload.nextRole),
    );
  }

  const updatedPerson = await getAdminPersonRowById(
    supabase,
    payload.targetUserId,
  );
  if (!updatedPerson) throw new AdminPeopleMutationError("notFound");
  return updatedPerson;
}
