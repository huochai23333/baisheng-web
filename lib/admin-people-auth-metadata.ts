import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { AdminPersonAccountUpdatePayload } from "./admin-people";
import { AdminPeopleMutationError } from "./admin-people-mutation-errors";
import { withRequestTimeout } from "./request-timeout";
import { getSupabaseServiceRoleClient } from "./supabase-admin-server";

const ADMIN_PEOPLE_MUTATION_TIMEOUT_MS = 30_000;

export async function syncTargetAuthMetadata(
  input: AdminPersonAccountUpdatePayload,
) {
  try {
    const serviceSupabase = getSupabaseServiceRoleClient();
    const authUser = await getTargetAuthUser(
      serviceSupabase,
      input.targetUserId,
    );
    await updateTargetAuthMetadata(serviceSupabase, input.targetUserId, {
      ...readAppMetadata(authUser),
      role: input.nextRole,
      status: input.nextStatus,
    });
  } catch {
    // 数据库表和自定义访问令牌钩子是最终真相；Auth 元数据只是登录加速缓存。
    // 因此缓存同步失败不能回滚已经成功且可审计的数据库变更。
  }
}

async function getTargetAuthUser(
  serviceSupabase: SupabaseClient,
  targetUserId: string,
) {
  const { data, error } = await withRequestTimeout(
    serviceSupabase.auth.admin.getUserById(targetUserId),
    { timeoutMs: ADMIN_PEOPLE_MUTATION_TIMEOUT_MS },
  );
  if (error) {
    throw new AdminPeopleMutationError(
      error.status === 404 ? "notFound" : "serviceUnavailable",
    );
  }
  if (!data.user) throw new AdminPeopleMutationError("notFound");
  return data.user;
}

async function updateTargetAuthMetadata(
  serviceSupabase: SupabaseClient,
  targetUserId: string,
  appMetadata: Record<string, unknown>,
) {
  const { error } = await withRequestTimeout(
    serviceSupabase.auth.admin.updateUserById(targetUserId, {
      app_metadata: appMetadata,
    }),
    { timeoutMs: ADMIN_PEOPLE_MUTATION_TIMEOUT_MS },
  );
  if (error) throw new AdminPeopleMutationError("serviceUnavailable");
}

function readAppMetadata(user: User): Record<string, unknown> {
  return typeof user.app_metadata === "object" && user.app_metadata !== null
    ? user.app_metadata
    : {};
}
