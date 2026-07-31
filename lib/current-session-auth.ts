import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

import {
  ensureSessionTracking,
  getSessionCache,
  type SessionCacheState,
} from "./current-session-cache";
import { withRequestTimeout } from "./request-timeout";

const AUTH_SESSION_TIMEOUT_MS = 8_000;
const AUTH_SESSION_RETRY_DELAY_MS = 350;
const AUTH_SESSION_TIMEOUT_MESSAGE = "登录状态同步较慢，请稍后重试。";

export async function getCurrentSession(
  supabase: SupabaseClient,
): Promise<Session | null> {
  const sessionCache = getSessionCache(supabase);
  ensureSessionTracking(supabase, sessionCache);

  if (sessionCache.currentSessionSnapshot !== undefined) {
    return sessionCache.currentSessionSnapshot;
  }
  if (!sessionCache.currentSessionRequest) {
    sessionCache.currentSessionRequest = resolveWithSingleTimeoutRetry(
      () => fetchCurrentSession(supabase),
      () => sessionCache.currentSessionSnapshot,
      (session) => {
        sessionCache.currentSessionSnapshot = session;
      },
    ).finally(() => {
      sessionCache.currentSessionRequest = null;
    });
  }
  return sessionCache.currentSessionRequest;
}

export async function getCurrentUser(
  supabase: SupabaseClient,
): Promise<User | null> {
  const sessionCache = getSessionCache(supabase);
  ensureSessionTracking(supabase, sessionCache);

  if (sessionCache.currentUserSnapshot !== undefined) {
    return sessionCache.currentUserSnapshot;
  }
  if (!sessionCache.currentUserRequest) {
    sessionCache.currentUserRequest = resolveWithSingleTimeoutRetry(
      () => fetchCurrentUser(supabase),
      () => sessionCache.currentUserSnapshot,
      (user) => {
        sessionCache.currentUserSnapshot = user;
      },
    ).finally(() => {
      sessionCache.currentUserRequest = null;
    });
  }
  return sessionCache.currentUserRequest;
}

export async function getCurrentClaims(
  supabase: SupabaseClient,
): Promise<unknown | null> {
  const sessionCache = getSessionCache(supabase);
  ensureSessionTracking(supabase, sessionCache);

  if (
    sessionCache.currentSessionSnapshot === null ||
    sessionCache.currentUserSnapshot === null
  ) {
    sessionCache.currentClaimsSnapshot = null;
    return null;
  }
  if (sessionCache.currentClaimsSnapshot !== undefined) {
    return sessionCache.currentClaimsSnapshot;
  }
  if (!sessionCache.currentClaimsRequest) {
    sessionCache.currentClaimsRequest = resolveCurrentClaims(
      supabase,
      sessionCache,
    ).finally(() => {
      sessionCache.currentClaimsRequest = null;
    });
  }
  return sessionCache.currentClaimsRequest;
}

async function fetchCurrentSession(supabase: SupabaseClient) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

async function fetchCurrentUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    if (isAuthSessionMissingError(error)) return null;
    throw error;
  }
  return user;
}

async function resolveCurrentClaims(
  supabase: SupabaseClient,
  sessionCache: SessionCacheState,
) {
  const { data, error } = await supabase.auth.getClaims();
  const claims = error ? null : (data?.claims ?? null);
  sessionCache.currentClaimsSnapshot = claims;
  return claims;
}

async function resolveWithSingleTimeoutRetry<T>(
  request: () => Promise<T>,
  readSnapshot: () => T | undefined,
  writeSnapshot: (value: T) => void,
) {
  try {
    const value = await runTimedRequest(request);
    writeSnapshot(value);
    return value;
  } catch (error) {
    const snapshot = readSnapshot();
    if (snapshot !== undefined) return snapshot;
    if (!isSessionTimeoutError(error)) throw error;

    // 浏览器刚恢复或网络短暂抖动时只重试一次，避免多个调用方形成重试风暴。
    await delay(AUTH_SESSION_RETRY_DELAY_MS);
    const delayedSnapshot = readSnapshot();
    if (delayedSnapshot !== undefined) return delayedSnapshot;

    const value = await runTimedRequest(request);
    writeSnapshot(value);
    return value;
  }
}

function runTimedRequest<T>(request: () => Promise<T>) {
  return withRequestTimeout(request(), {
    timeoutMs: AUTH_SESSION_TIMEOUT_MS,
    message: AUTH_SESSION_TIMEOUT_MESSAGE,
  });
}

function isSessionTimeoutError(error: unknown) {
  return error instanceof Error && error.message === AUTH_SESSION_TIMEOUT_MESSAGE;
}

function isAuthSessionMissingError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "AuthSessionMissingError" ||
      error.message.toLowerCase().includes("auth session missing"))
  );
}

function delay(timeoutMs: number) {
  return new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, timeoutMs);
  });
}
