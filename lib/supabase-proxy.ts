import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentAppAccessContext } from "./current-app-access-context";
import {
  getDefaultSignedInPathForRole,
  getWorkspaceBasePath,
} from "./auth-routing";
import { getSupabaseEnv } from "./supabase";

const AUTH_ENTRY_PATHS = new Set(["/", "/login", "/register", "/forgot-password"]);

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const currentBasePath = getWorkspaceBasePath(pathname);
  const hasAuthCookie = request.cookies.getAll().some((cookie) =>
    isSupabaseAuthCookieName(cookie.name),
  );

  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!hasAuthCookie) {
    if (currentBasePath) {
      return createRedirectResponse(request, supabaseResponse, "/login", {
        clearSearch: true,
      });
    }

    return supabaseResponse;
  }

  const { supabaseUrl, supabaseKey } = getSupabaseEnv();

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({
          request,
        });

        cookiesToSet.forEach((cookie) => {
          supabaseResponse.cookies.set(cookie);
        });

        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const userId = error ? null : (user?.id ?? null);

  if (currentBasePath) {
    if (!userId) {
      return createRedirectResponse(request, supabaseResponse, "/login", {
        clearSearch: true,
      });
    }
  }

  if (AUTH_ENTRY_PATHS.has(pathname) && userId) {
    let accessContext;

    try {
      // 部署后恢复旧会话时也必须查询数据库，不能使用可能过期的 Auth 元数据决定工作台。
      accessContext = await getCurrentAppAccessContext(supabase);
    } catch {
      // 让认证页面继续由服务端读取同一上下文并进入现有友好错误页，禁止猜测为客户角色。
      return supabaseResponse;
    }

    if (accessContext.status !== "active") {
      return createRedirectResponse(
        request,
        supabaseResponse,
        "/auth/sign-out",
        { search: "?next=%2Flogin" },
      );
    }

    if (!accessContext.role) {
      // 缺少有效角色时交给认证页面显示错误，不能再默认跳转到 /client/home。
      return supabaseResponse;
    }

    return createRedirectResponse(
      request,
      supabaseResponse,
      getDefaultSignedInPathForRole(accessContext.role),
      {
        clearSearch: true,
      },
    );
  }

  return supabaseResponse;
}

function isSupabaseAuthCookieName(name: string) {
  return /^sb-.*-auth-token(?:\.\d+)?$/.test(name);
}

function createRedirectResponse(
  request: NextRequest,
  supabaseResponse: NextResponse,
  destinationPath: string,
  options?: {
    clearSearch?: boolean;
    search?: string;
  },
) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = destinationPath;

  if (options?.search !== undefined) {
    redirectUrl.search = options.search;
  } else if (options?.clearSearch) {
    redirectUrl.search = "";
  }

  const response = NextResponse.redirect(redirectUrl);

  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });

  return response;
}
