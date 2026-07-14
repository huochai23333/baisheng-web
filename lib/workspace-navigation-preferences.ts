import type { SupabaseClient } from "@supabase/supabase-js";

import { withRequestTimeout } from "./request-timeout";
import {
  workspaceBusinessKeys,
  type WorkspaceBusinessKey,
} from "./workspace-config";

export type WorkspaceNavigationPreferenceRow = {
  created_at: string;
  open_business_keys: WorkspaceBusinessKey[];
  updated_at: string;
  user_id: string;
};

const WORKSPACE_NAVIGATION_PREFERENCE_SELECT =
  "user_id,open_business_keys,created_at,updated_at";
const WORKSPACE_NAVIGATION_PREFERENCE_TIMEOUT_MS = 20_000;

/**
 * 读取当前登录账号自己的桌面导航偏好。
 * 数据库 RLS 已经把查询限制为当前账号，所以这里不接收外部 userId，
 * 避免调用者误把别人的账号 ID 拼进查询。
 */
export async function getCurrentWorkspaceNavigationPreference(
  supabase: SupabaseClient,
) {
  const { data, error } = await withRequestTimeout(
    supabase
      .from("user_workspace_navigation_preferences")
      .select(WORKSPACE_NAVIGATION_PREFERENCE_SELECT)
      .maybeSingle<WorkspaceNavigationPreferenceRow>(),
    { timeoutMs: WORKSPACE_NAVIGATION_PREFERENCE_TIMEOUT_MS },
  );

  if (error) {
    throw error;
  }

  return normalizeWorkspaceNavigationPreferenceRow(data);
}

/**
 * 保存当前账号展开的业务分组。真正的账号校验、active 状态校验和去重
 * 都在数据库 RPC 中完成，浏览器只负责提交界面上的最新结果。
 */
export async function saveCurrentWorkspaceNavigationPreference(
  supabase: SupabaseClient,
  openBusinessKeys: readonly WorkspaceBusinessKey[],
) {
  const { data, error } = await withRequestTimeout(
    supabase
      .rpc("save_user_workspace_navigation_preference", {
        _open_business_keys: normalizeWorkspaceNavigationBusinessKeys(
          openBusinessKeys,
        ),
      })
      .maybeSingle<WorkspaceNavigationPreferenceRow>(),
    { timeoutMs: WORKSPACE_NAVIGATION_PREFERENCE_TIMEOUT_MS },
  );

  if (error) {
    throw error;
  }

  const preference = normalizeWorkspaceNavigationPreferenceRow(data);

  if (!preference) {
    throw new Error("workspace_navigation_preference_save_failed");
  }

  return preference;
}

/**
 * 业务键始终按系统配置顺序输出。这样无论用户先点旅游还是先点批发，
 * 相同的展开组合都会得到相同数组，状态比较和数据库写入都更稳定。
 */
export function normalizeWorkspaceNavigationBusinessKeys(
  value: unknown,
): WorkspaceBusinessKey[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return workspaceBusinessKeys.filter((businessKey) =>
    value.includes(businessKey),
  );
}

function normalizeWorkspaceNavigationPreferenceRow(
  value: WorkspaceNavigationPreferenceRow | null,
): WorkspaceNavigationPreferenceRow | null {
  if (!value?.user_id) {
    return null;
  }

  return {
    created_at: value.created_at,
    open_business_keys: normalizeWorkspaceNavigationBusinessKeys(
      value.open_business_keys,
    ),
    updated_at: value.updated_at,
    user_id: value.user_id,
  };
}
