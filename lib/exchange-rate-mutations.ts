import type { SupabaseClient } from "@supabase/supabase-js";

import { normalizeCurrencyCode, normalizeCurrencyList } from "./exchange-rate-display";
import { toExchangeRateFunctionError } from "./exchange-rate-errors";
import {
  EXCHANGE_RATE_SELECT,
  type ExchangeRateFormInput,
  type ExchangeRateRow,
  type ExchangeRateSyncPairRow,
  type ExchangeRateSyncSettingsRow,
  type ManualExchangeRateFetchResult,
} from "./exchange-rate-types";
import { withRequestTimeout } from "./request-timeout";

const EXCHANGE_RATE_SYNC_TIMEOUT_MS = 30_000;

/** 本模块只负责会改变数据库或触发 Edge Function 的操作。 */
export async function setExchangeRateAutoSyncEnabled(
  supabase: SupabaseClient,
  enabled: boolean,
) {
  const { data, error } = await withRequestTimeout(
    supabase
      .from("exchange_rate_sync_settings")
      .upsert({ id: true, is_enabled: enabled }, { onConflict: "id" })
      .select("id,is_enabled,updated_at,updated_by")
      .maybeSingle<ExchangeRateSyncSettingsRow>(),
  );
  if (error) throw error;
  return data;
}

export async function addExchangeRateSyncPair(
  supabase: SupabaseClient,
  baseCurrency: string,
) {
  const normalizedBaseCurrency = normalizeCurrencyCode(baseCurrency);
  if (!/^[A-Z]{3}$/.test(normalizedBaseCurrency)) {
    throw new Error("请输入 3 位货币代码，例如 USD。");
  }

  const { data, error } = await withRequestTimeout(
    supabase
      .from("exchange_rate_sync_pairs")
      .upsert(
        {
          base_currency: normalizedBaseCurrency,
          target_currency: "CNY",
          is_enabled: true,
        },
        { onConflict: "base_currency,target_currency" },
      )
      .select(
        "id,base_currency,target_currency,is_enabled,created_at,updated_at,created_by",
      )
      .maybeSingle<ExchangeRateSyncPairRow>(),
  );
  if (error) throw error;
  return data;
}

export async function removeExchangeRateSyncPair(
  supabase: SupabaseClient,
  pairId: string,
) {
  const { error } = await withRequestTimeout(
    supabase.from("exchange_rate_sync_pairs").delete().eq("id", pairId),
  );
  if (error) throw error;
}

export async function triggerManualExchangeRateFetch(
  supabase: SupabaseClient,
  baseCurrencies: string[],
): Promise<ManualExchangeRateFetchResult> {
  const normalizedBaseCurrencies = normalizeCurrencyList(baseCurrencies);
  if (normalizedBaseCurrencies.length === 0) {
    throw new Error("请至少填写一个要获取的币种。");
  }

  const { data, error } = await withRequestTimeout(
    supabase.functions.invoke("exchange-rate-sync", {
      body: { trigger: "manual", baseCurrencies: normalizedBaseCurrencies },
    }),
    {
      timeoutMs: EXCHANGE_RATE_SYNC_TIMEOUT_MS,
      message: "今天的汇率暂时获取失败，请稍后重试或联系管理员。",
    },
  );
  if (error) throw await toExchangeRateFunctionError(error);

  const payload = data as Partial<ManualExchangeRateFetchResult> | null;
  return {
    results: Array.isArray(payload?.results) ? payload.results : [],
    successCount:
      typeof payload?.successCount === "number"
        ? payload.successCount
        : Array.isArray(payload?.results)
          ? payload.results.filter((item) => item.ok).length
          : 0,
  };
}

export async function createExchangeRate(
  supabase: SupabaseClient,
  input: ExchangeRateFormInput,
) {
  const { data, error } = await withRequestTimeout(
    supabase
      .from("exchange_rate")
      .insert(toExchangeRatePayload(input))
      .select(EXCHANGE_RATE_SELECT)
      .maybeSingle<ExchangeRateRow>(),
  );
  if (error) throw error;
  if (!data) throw new Error("创建汇率记录失败，请稍后重试。");
  return data;
}

export async function updateExchangeRate(
  supabase: SupabaseClient,
  rateId: string,
  input: ExchangeRateFormInput,
) {
  const { data, error } = await withRequestTimeout(
    supabase
      .from("exchange_rate")
      .update(toExchangeRatePayload(input))
      .eq("id", rateId)
      .select(EXCHANGE_RATE_SELECT)
      .maybeSingle<ExchangeRateRow>(),
  );
  if (error) throw error;
  if (!data) throw new Error("未找到需要更新的汇率记录。");
  return data;
}

export async function deleteExchangeRate(
  supabase: SupabaseClient,
  rateId: string,
) {
  const { error } = await withRequestTimeout(
    supabase.from("exchange_rate").delete().eq("id", rateId),
  );
  if (error) throw error;
}

function toExchangeRatePayload(input: ExchangeRateFormInput) {
  return {
    original_currency: normalizeCurrencyCode(input.originalCurrency),
    target_currency: normalizeCurrencyCode(input.targetCurrency),
    daily_exchange_rate: input.dailyExchangeRate,
  };
}
