import type { SupabaseClient } from "@supabase/supabase-js";

import { normalizeAppRole, normalizeUserStatus } from "./auth-metadata";
import {
  ensureSessionTracking,
  getSessionCache,
  type AppAccessContext,
  type SessionCacheState,
} from "./current-session-cache";
import { withRequestTimeout } from "./request-timeout";

const ACCESS_CONTEXT_TIMEOUT_MS = 8_000;
const ACCESS_CONTEXT_TIMEOUT_MESSAGE = "登录状态同步较慢，请稍后重试。";

/**
 * 数据库 RPC 是角色和状态的最终可信来源。
 * 读取失败时返回 null，薄编排层会继续使用已验证 JWT 或用户元数据作为降级来源。
 */
export async function getCurrentAppAccessContext(
  supabase: SupabaseClient,
): Promise<AppAccessContext | null> {
  const sessionCache = getSessionCache(supabase);
  ensureSessionTracking(supabase, sessionCache);

  if (sessionCache.currentUserSnapshot === null) {
    sessionCache.currentAccessContextSnapshot = null;
    return null;
  }
  if (sessionCache.currentAccessContextSnapshot !== undefined) {
    return sessionCache.currentAccessContextSnapshot;
  }
  if (!sessionCache.currentAccessContextRequest) {
    sessionCache.currentAccessContextRequest = resolveCurrentAppAccessContext(
      supabase,
      sessionCache,
    ).finally(() => {
      sessionCache.currentAccessContextRequest = null;
    });
  }
  return sessionCache.currentAccessContextRequest;
}

async function resolveCurrentAppAccessContext(
  supabase: SupabaseClient,
  sessionCache: SessionCacheState,
) {
  try {
    const { data, error } = await withRequestTimeout(
      supabase.rpc("get_current_app_access_context"),
      {
        timeoutMs: ACCESS_CONTEXT_TIMEOUT_MS,
        message: ACCESS_CONTEXT_TIMEOUT_MESSAGE,
      },
    );
    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    const record = readRecord(row);
    const context = record
      ? {
          role: normalizeAppRole(record.role),
          status: normalizeUserStatus(record.status),
        }
      : null;
    sessionCache.currentAccessContextSnapshot = context;
    return context;
  } catch {
    sessionCache.currentAccessContextSnapshot = null;
    return null;
  }
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}
