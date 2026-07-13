import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getCurrentSessionContext,
  type AppRole,
  type UserStatus,
} from "./user-self-service";
import type {
  ExchangeRatesPageMode,
  ExchangeRateViewerContext,
} from "./exchange-rate-types";

const READABLE_EXCHANGE_RATE_ROLES = new Set<AppRole>([
  "administrator",
  "operator",
  "manager",
  "salesman",
  "promoter",
  "finance",
  "client",
]);

/** 读取当前登录人的身份，供汇率页面在查询数据前完成权限判断。 */
export async function getCurrentExchangeRateViewerContext(
  supabase: SupabaseClient,
): Promise<ExchangeRateViewerContext | null> {
  const { user, role, status } = await getCurrentSessionContext(supabase);

  if (!user) return null;

  return { user, role, status };
}

export function canReadExchangeRatesByRole(
  role: AppRole | null,
  status: UserStatus | null,
) {
  return (
    role === "administrator" ||
    (!!role && READABLE_EXCHANGE_RATE_ROLES.has(role) && status === "active")
  );
}

export function canManageExchangeRatesByRole(role: AppRole | null) {
  return role === "administrator";
}

export function canViewExchangeRatesPage(
  mode: ExchangeRatesPageMode,
  role: AppRole | null,
  status: UserStatus | null,
) {
  return mode === "manage"
    ? canManageExchangeRatesByRole(role)
    : canReadExchangeRatesByRole(role, status);
}
