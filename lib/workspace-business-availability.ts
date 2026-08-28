import type { AppRole } from "./auth-routing";
import { getDefaultSignedInPathForRole } from "./auth-routing";
import {
  isEnabledWorkspaceBusinessKey,
  isRegisteredWorkspaceBusinessKey,
  type EnabledWorkspaceBusinessKey,
} from "./workspace-config";

export const BUSINESS_UNAVAILABLE_ERROR_CODE = "businessUnavailable" as const;
export const BUSINESS_UNAVAILABLE_PATH = "/business-unavailable" as const;

/**
 * 登录后的落点只由“账号权限与本次发布启用业务的交集”决定。
 * 空数组不是查询失败，而是账号当前没有可以进入的业务。
 */
export function getSignedInWorkspaceDestination(
  role: AppRole,
  businesses: readonly EnabledWorkspaceBusinessKey[],
) {
  return businesses.length > 0
    ? getDefaultSignedInPathForRole(role)
    : BUSINESS_UNAVAILABLE_PATH;
}

/**
 * 服务端接口先区分“系统不认识的值”和“系统认识但本次停用的业务”。
 * 前者属于参数错误，后者使用稳定错误码，方便界面展示日常语言提示。
 */
export function parseEnabledWorkspaceBusinessKey(
  value: unknown,
): EnabledWorkspaceBusinessKey {
  if (typeof value !== "string" || !isRegisteredWorkspaceBusinessKey(value)) {
    throw new Error("workspace_business_invalid_input");
  }

  if (!isEnabledWorkspaceBusinessKey(value)) {
    throw new Error(BUSINESS_UNAVAILABLE_ERROR_CODE);
  }

  return value;
}

export function isBusinessUnavailableError(error: unknown) {
  return getErrorMessage(error).includes(BUSINESS_UNAVAILABLE_ERROR_CODE);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "";
}
