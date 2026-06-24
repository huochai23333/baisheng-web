import type { SupabaseClient } from "@supabase/supabase-js";

import { withRequestTimeout } from "./request-timeout";

const COMMISSION_RULE_SELECT = "rule_code,config,sort_order,updated_at";

export const COMMISSION_RULE_CODES = [
  "service_escort_salesman",
  "digital_survival_salesman",
  "service_referral_rate",
  "vip_first_year_referral_bonus",
  "wholesale_order_salesman_tier",
  "wholesale_referral_order_amount_rate",
  "wholesale_referral_waybill_bonus",
] as const;

export type CommissionRuleCode = (typeof COMMISSION_RULE_CODES)[number];

export type CommissionRuleConfig = Record<string, number>;

export type CommissionRuleSetting = {
  config: CommissionRuleConfig;
  ruleCode: CommissionRuleCode;
  sortOrder: number;
  updatedAt: string | null;
};

type CommissionRuleSettingRecord = {
  config: unknown;
  rule_code: string | null;
  sort_order: number | string | null;
  updated_at: string | null;
};

export async function getCommissionRuleSettings(
  supabase: SupabaseClient,
): Promise<CommissionRuleSetting[]> {
  const { data, error } = await withRequestTimeout(
    supabase
      .from("commission_rule_settings")
      .select(COMMISSION_RULE_SELECT)
      .order("sort_order", { ascending: true })
      .returns<CommissionRuleSettingRecord[]>(),
  );

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((row) => normalizeCommissionRuleSetting(row))
    .filter((row): row is CommissionRuleSetting => row !== null);
}

export async function updateCommissionRuleSetting(
  supabase: SupabaseClient,
  ruleCode: CommissionRuleCode,
  config: CommissionRuleConfig,
): Promise<CommissionRuleSetting> {
  const { data, error } = await withRequestTimeout(
    supabase
      .rpc("update_commission_rule_setting", {
        p_config: config,
        p_rule_code: ruleCode,
      })
      .single<CommissionRuleSettingRecord>(),
  );

  if (error) {
    throw error;
  }

  const normalized = normalizeCommissionRuleSetting(data);

  if (!normalized) {
    throw new Error("Commission setting could not be saved.");
  }

  return normalized;
}

function normalizeCommissionRuleSetting(
  row: CommissionRuleSettingRecord | null,
): CommissionRuleSetting | null {
  const ruleCode = normalizeCommissionRuleCode(row?.rule_code);

  if (!ruleCode) {
    return null;
  }

  return {
    config: normalizeRuleConfig(row?.config),
    ruleCode,
    sortOrder: parseNumber(row?.sort_order) ?? 0,
    updatedAt: typeof row?.updated_at === "string" ? row.updated_at : null,
  };
}

function normalizeCommissionRuleCode(
  value: string | null | undefined,
): CommissionRuleCode | null {
  return COMMISSION_RULE_CODES.find((code) => code === value) ?? null;
}

function normalizeRuleConfig(value: unknown): CommissionRuleConfig {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce<CommissionRuleConfig>((result, [key, item]) => {
    const parsed = parseNumber(item);

    if (parsed !== null) {
      result[key] = parsed;
    }

    return result;
  }, {});
}

function parseNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}
