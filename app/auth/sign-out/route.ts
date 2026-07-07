import { type NextRequest, NextResponse } from "next/server";

import { getCompanyPublicOrigin } from "@/lib/company-config";

const DEFAULT_SIGN_OUT_REDIRECT_PATH = "/login";
const DEFAULT_PUBLIC_ORIGIN = getCompanyPublicOrigin();
const LOCAL_PUBLIC_HOST_PATTERN = /^(?:localhost|127\.0\.0\.1)(?::\d+)?$/;
const ALLOWED_PUBLIC_HOSTS = new Set(
  [DEFAULT_PUBLIC_ORIGIN, process.env.NEXT_PUBLIC_SITE_URL]
    .map(getOriginHost)
    .filter((host): host is string => Boolean(host)),
);
const SUPABASE_AUTH_COOKIE_PATTERN =
  /^sb-.*-auth-token(?:\.\d+)?(?:-code-verifier)?$/;

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(getSafeRedirectUrl(request));

  response.headers.set("Cache-Control", "no-store");
  expireSupabaseAuthCookies(request, response);

  return response;
}

function getSafeRedirectUrl(request: NextRequest) {
  const publicOrigin = getPublicOrigin(request);
  const nextPath =
    request.nextUrl.searchParams.get("next") ?? DEFAULT_SIGN_OUT_REDIRECT_PATH;

  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return new URL(DEFAULT_SIGN_OUT_REDIRECT_PATH, publicOrigin);
  }

  return new URL(nextPath, publicOrigin);
}

function expireSupabaseAuthCookies(
  request: NextRequest,
  response: NextResponse,
) {
  const cookieNames = Array.from(
    new Set(
      request.cookies
        .getAll()
        .map((cookie) => cookie.name)
        .filter(isSupabaseAuthCookieName),
    ),
  );
  const cookieDomains = getCookieDomains(request.nextUrl.hostname);

  cookieNames.forEach((name) => {
    expireCookie(response, name);
    cookieDomains.forEach((domain) => expireCookie(response, name, domain));
  });
}

function isSupabaseAuthCookieName(name: string) {
  return SUPABASE_AUTH_COOKIE_PATTERN.test(name);
}

function expireCookie(response: NextResponse, name: string, domain?: string) {
  const cookieOptions = {
    name,
    value: "",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  };

  response.cookies.set(domain ? { ...cookieOptions, domain } : cookieOptions);
}

function getCookieDomains(hostname: string) {
  if (hostname === "localhost" || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) {
    return [];
  }

  const parts = hostname.split(".");

  if (parts.length < 2) {
    return [];
  }

  const rootDomain = parts.slice(-2).join(".");

  // 线上可能使用 account.pt5china.com 或根域 Cookie，两种域都写过期值。
  return [hostname, `.${rootDomain}`];
}

function getPublicOrigin(request: NextRequest) {
  const forwardedHost = getFirstHeaderValue(request.headers.get("x-forwarded-host"));
  const host = normalizePublicHost(
    forwardedHost ?? getFirstHeaderValue(request.headers.get("host")),
  );

  // 0.0.0.0 只能用来监听网卡，浏览器不应该把它当成可访问的登录地址。
  // 如果请求头里的地址不可用，就退回到项目配置的公开地址。
  if (!host || !isAllowedPublicHost(host)) {
    return DEFAULT_PUBLIC_ORIGIN;
  }

  // 本地开发域名使用 http；线上公开域名统一使用 https。
  const protocol = LOCAL_PUBLIC_HOST_PATTERN.test(host) ? "http" : "https";

  return `${protocol}://${host}`;
}

function getFirstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

function getOriginHost(origin: string | undefined) {
  if (!origin) {
    return null;
  }

  try {
    return new URL(origin).host.toLowerCase();
  } catch {
    return null;
  }
}

function normalizePublicHost(value: string | null) {
  const host = value?.trim().toLowerCase();

  if (!host || host.startsWith("0.0.0.0") || /[/?#@\\]/.test(host)) {
    return null;
  }

  return host;
}

function isAllowedPublicHost(host: string) {
  return ALLOWED_PUBLIC_HOSTS.has(host) || LOCAL_PUBLIC_HOST_PATTERN.test(host);
}
