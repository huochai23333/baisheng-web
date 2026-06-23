import type { SupabaseClient } from "@supabase/supabase-js";

import { withRequestTimeout } from "./request-timeout";

const DEFAULT_WHOLESALE_ORDER_EDIT_WINDOW_DAYS = 30;

export type WholesaleOrderEditSettings = {
  directEditWindowDays: number;
  updatedAt: string | null;
  updatedByUserId: string | null;
};

type WholesaleOrderEditSettingsRecord = {
  direct_edit_window_days: number | string | null;
  updated_at: string | null;
  updated_by_user_id: string | null;
};

export async function getWholesaleOrderEditSettings(
  supabase: SupabaseClient,
): Promise<WholesaleOrderEditSettings> {
  const { data, error } = await withRequestTimeout(
    supabase
      .from("wholesale_order_edit_settings")
      .select("direct_edit_window_days,updated_at,updated_by_user_id")
      .maybeSingle<WholesaleOrderEditSettingsRecord>(),
  );

  if (error) {
    throw error;
  }

  return normalizeWholesaleOrderEditSettings(data);
}

export async function updateWholesaleOrderEditSettings(
  supabase: SupabaseClient,
  directEditWindowDays: number,
): Promise<WholesaleOrderEditSettings> {
  const { data, error } = await withRequestTimeout(
    supabase
      .rpc("update_wholesale_order_edit_settings", {
        p_direct_edit_window_days: directEditWindowDays,
      })
      .single<WholesaleOrderEditSettingsRecord>(),
  );

  if (error) {
    throw error;
  }

  return normalizeWholesaleOrderEditSettings(data);
}

function normalizeWholesaleOrderEditSettings(
  row: WholesaleOrderEditSettingsRecord | null,
): WholesaleOrderEditSettings {
  return {
    directEditWindowDays:
      parseInteger(row?.direct_edit_window_days) ??
      DEFAULT_WHOLESALE_ORDER_EDIT_WINDOW_DAYS,
    updatedAt: typeof row?.updated_at === "string" ? row.updated_at : null,
    updatedByUserId:
      typeof row?.updated_by_user_id === "string"
        ? row.updated_by_user_id
        : null,
  };
}

function parseInteger(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}
