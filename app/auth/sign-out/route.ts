import { type NextRequest, NextResponse } from "next/server";

import { getRequestPublicOrigin } from "@/lib/public-site-origin";

const DEFAULT_SIGN_OUT_REDIRECT_PATH = "/login";
const SUPABASE_AUTH_COOKIE_PATTERN =
  /^sb-.*-auth-token(?:\.\d+)?(?:-code-verifier)?$/;

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(getSafeRedirectUrl(request));

  response.headers.set("Cache-Control", "no-store");
  expireSupabaseAuthCookies(request, response);

  return response;
}

function getSafeRedirectUrl(request: NextRequest) {
  const publicOrigin = getRequestPublicOrigin(request);
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

  // 线上可能同时存在当前子域和根域 Cookie，因此两种域都写入过期值。
  return [hostname, `.${rootDomain}`];
}
