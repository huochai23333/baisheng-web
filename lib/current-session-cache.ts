import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

import type { AppRole } from "./auth-routing";
import type { UserStatus } from "./auth-metadata";

const SESSION_TRACKING_REGISTRY_KEY = "__baishengSessionTrackingRegistry__" as const;

export type AppAccessContext = {
  role: AppRole | null;
  status: UserStatus | null;
};

/**
 * 同一个 Supabase 客户端在一次页面渲染中可能被多个组件共同使用。
 * 这里集中保存请求与快照，让各读取模块复用结果，而不是分别请求登录状态。
 */
export type SessionCacheState = {
  currentAccessContextRequest: Promise<AppAccessContext | null> | null;
  currentAccessContextSnapshot: AppAccessContext | null | undefined;
  currentClaimsRequest: Promise<unknown | null> | null;
  currentClaimsSnapshot: unknown | null | undefined;
  currentSessionRequest: Promise<Session | null> | null;
  currentSessionSnapshot: Session | null | undefined;
  currentUserRequest: Promise<User | null> | null;
  currentUserSnapshot: User | null | undefined;
  sessionTrackingCleanup: (() => void) | null;
  sessionTrackingReady: boolean;
  resetVersion: number;
};

const sessionCacheByClient = new WeakMap<SupabaseClient, SessionCacheState>();
let sessionCacheResetVersion = 0;

export function resetCurrentAuthContextCache() {
  sessionCacheResetVersion += 1;
}

export function getSessionCache(supabase: SupabaseClient) {
  const existingCache = sessionCacheByClient.get(supabase);

  if (existingCache) {
    if (existingCache.resetVersion !== sessionCacheResetVersion) {
      // 重置时同时取消旧监听，防止登出后仍由过期订阅写回旧用户。
      existingCache.sessionTrackingCleanup?.();
      existingCache.currentAccessContextRequest = null;
      existingCache.currentAccessContextSnapshot = undefined;
      existingCache.currentClaimsRequest = null;
      existingCache.currentClaimsSnapshot = undefined;
      existingCache.currentSessionRequest = null;
      existingCache.currentSessionSnapshot = undefined;
      existingCache.currentUserRequest = null;
      existingCache.currentUserSnapshot = undefined;
      existingCache.sessionTrackingCleanup = null;
      existingCache.sessionTrackingReady = false;
      existingCache.resetVersion = sessionCacheResetVersion;
    }

    return existingCache;
  }

  const sessionCache: SessionCacheState = {
    currentAccessContextRequest: null,
    currentAccessContextSnapshot: undefined,
    currentClaimsRequest: null,
    currentClaimsSnapshot: undefined,
    currentSessionRequest: null,
    currentSessionSnapshot: undefined,
    currentUserRequest: null,
    currentUserSnapshot: undefined,
    sessionTrackingCleanup: null,
    sessionTrackingReady: false,
    resetVersion: sessionCacheResetVersion,
  };

  sessionCacheByClient.set(supabase, sessionCache);
  return sessionCache;
}

export function ensureSessionTracking(
  supabase: SupabaseClient,
  sessionCache: SessionCacheState,
) {
  if (sessionCache.sessionTrackingReady) return;

  const sessionTrackingRegistry = getSessionTrackingRegistry();
  sessionTrackingRegistry.get(supabase)?.();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    // Auth 事件只负责使派生数据失效；真正的角色解析仍由各读取模块完成。
    sessionCache.currentAccessContextRequest = null;
    sessionCache.currentAccessContextSnapshot = undefined;
    sessionCache.currentClaimsRequest = null;
    sessionCache.currentClaimsSnapshot = undefined;
    sessionCache.currentSessionSnapshot = session;
    sessionCache.currentUserRequest = null;
    sessionCache.currentUserSnapshot = session ? undefined : null;
  });

  const cleanup = () => {
    subscription.unsubscribe();
    if (sessionTrackingRegistry.get(supabase) === cleanup) {
      sessionTrackingRegistry.delete(supabase);
    }
    if (sessionCache.sessionTrackingCleanup === cleanup) {
      sessionCache.sessionTrackingCleanup = null;
      sessionCache.sessionTrackingReady = false;
    }
  };

  sessionCache.sessionTrackingCleanup = cleanup;
  sessionCache.sessionTrackingReady = true;
  sessionTrackingRegistry.set(supabase, cleanup);
}

function getSessionTrackingRegistry() {
  const globalScope = globalThis as typeof globalThis & {
    [SESSION_TRACKING_REGISTRY_KEY]?: WeakMap<SupabaseClient, () => void>;
  };

  if (!globalScope[SESSION_TRACKING_REGISTRY_KEY]) {
    globalScope[SESSION_TRACKING_REGISTRY_KEY] = new WeakMap<
      SupabaseClient,
      () => void
    >();
  }

  return globalScope[SESSION_TRACKING_REGISTRY_KEY];
}
