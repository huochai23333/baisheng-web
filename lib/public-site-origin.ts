import type { NextRequest } from "next/server";

import { companyConfig, getCompanyPublicOrigin } from "./company-config";

const LOCAL_PUBLIC_HOST_PATTERN = /^(?:localhost|127\.0\.0\.1)(?::\d+)?$/;

/**
 * 读取部署平台提供的公开地址，并把它收敛成只有协议和域名的 origin。
 * 部署人员如果漏写 https://、误填路径或加入账号密码，系统会退回公司默认域名，
 * 避免确认邮件和退出登录页面因为 new URL 收到无效基础地址而直接返回 500。
 */
export function getConfiguredPublicOrigin() {
  return getCompanyPublicOrigin();
}

/**
 * 优先使用当前请求中的可信域名，使同一套代码既能在线上运行，也能在本地测试。
 * 代理转发头可能包含逗号分隔的多级地址，因此这里只读取最靠近用户的第一项。
 */
export function getRequestPublicOrigin(request: NextRequest) {
  const configuredOrigin = getConfiguredPublicOrigin();
  const forwardedHost = getFirstHeaderValue(
    request.headers.get("x-forwarded-host"),
  );
  const host = normalizePublicHost(
    forwardedHost ?? getFirstHeaderValue(request.headers.get("host")),
  );
  const allowedHosts = new Set(
    [companyConfig.defaultPublicOrigin, configuredOrigin]
      .map(getOriginHost)
      .filter((allowedHost): allowedHost is string => Boolean(allowedHost)),
  );

  if (
    !host ||
    (!allowedHosts.has(host) && !LOCAL_PUBLIC_HOST_PATTERN.test(host))
  ) {
    return configuredOrigin;
  }

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
