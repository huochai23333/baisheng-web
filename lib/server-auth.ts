import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  canAccessWorkspaceBasePath,
  getDefaultSignedInPathForRole,
  type AppRole,
} from "./auth-routing";
import { normalizeAppRole, normalizeUserStatus, type UserStatus } from "./auth-metadata";
import { getServerSupabaseClient } from "./supabase-server";

type ServerAuthContext = {
  hasAuthCookie: boolean;
  role: AppRole | null;
  status: UserStatus | null;
  userId: string | null;
};

export async function getServerAuthContext(): Promise<ServerAuthContext> {
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore.getAll().some((cookie) =>
    isSupabaseAuthCookieName(cookie.name),
  );

  if (!hasAuthCookie) {
    return {
      hasAuthCookie: false,
      role: null,
      status: null,
      userId: null,
    };
  }

  const supabase = await getServerSupabaseClient();
  // getUser 会向 Supabase Auth 验证令牌，不能用浏览器 Cookie 中未经验证的会话直接放行。
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      hasAuthCookie: true,
      role: null,
      status: null,
      userId: null,
    };
  }

  // 角色和状态从数据库 RPC 读取；这里有错误就向上抛出，避免退回客户端元数据放行。
  const { data, error } = await supabase.rpc("get_current_app_access_context");

  if (error) {
    throw error;
  }

  const value = Array.isArray(data) ? data[0] : data;
  const accessContext = readRecord(value);

  return {
    hasAuthCookie: true,
    role: normalizeAppRole(accessContext?.role),
    status: normalizeUserStatus(accessContext?.status),
    userId: user.id,
  };
}

function isSupabaseAuthCookieName(name: string) {
  return /^sb-.*-auth-token(?:\.\d+)?$/.test(name);
}

export async function redirectAuthenticatedUserToWorkspace() {
  const { hasAuthCookie, role, status, userId } = await getServerAuthContext();

  if (!userId) {
    if (hasAuthCookie) {
      redirect("/auth/sign-out?next=%2Flogin");
    }

    return;
  }

  if (status !== "active") {
    redirect("/auth/sign-out?next=%2Flogin");
  }

  redirect(getDefaultSignedInPathForRole(role));
}

export async function requireWorkspaceAccess(expectedBasePath: string) {
  const { hasAuthCookie, role, status, userId } = await getServerAuthContext();

  if (!userId) {
    redirect(hasAuthCookie ? "/auth/sign-out?next=%2Flogin" : "/login");
  }

  if (status !== "active") {
    redirect("/auth/sign-out?next=%2Flogin");
  }

  if (!canAccessWorkspaceBasePath(role, expectedBasePath)) {
    redirectToWorkspaceAccessLimited();
  }
}

// 使用普通页面承载越权提示，避免 Next.js 实验性 forbidden 边界在开发环境触发性能测量异常。
export function redirectToWorkspaceAccessLimited(): never {
  redirect("/access-limited");
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}
