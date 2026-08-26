import type { SupabaseClient } from "@supabase/supabase-js";

import {
  canReadExchangeRatesByRole,
  getCurrentExchangeRateViewerContext,
  getExchangeRatesPageData,
  type ExchangeRatesPageData,
  type ExchangeRatesPageMode,
} from "./exchange-rates";

export type ExchangeRatesWorkspacePageData = {
  exchangeRates: ExchangeRatesPageData;
  mode: ExchangeRatesPageMode;
};

/**
 * 汇率页面先按数据库中的当前身份决定展示模式。
 * 管理员可以维护和获取汇率，其他已激活内部账号只能查看已经保存的记录。
 */
export async function getExchangeRatesWorkspacePageData(
  supabase: SupabaseClient,
): Promise<ExchangeRatesWorkspacePageData> {
  const viewer = await getCurrentExchangeRateViewerContext(supabase);
  const mode: ExchangeRatesPageMode =
    viewer?.role === "administrator" ? "manage" : "readonly";

  if (!viewer || !canReadExchangeRatesByRole(viewer.role, viewer.status)) {
    return createEmptyExchangeRatesWorkspacePageData(mode);
  }

  return {
    exchangeRates: await getExchangeRatesPageData(supabase, mode, viewer),
    mode,
  };
}

function createEmptyExchangeRatesWorkspacePageData(
  mode: ExchangeRatesPageMode,
): ExchangeRatesWorkspacePageData {
  return {
    exchangeRates: {
      hasPermission: false,
      rates: [],
      syncState: null,
    },
    mode,
  };
}
