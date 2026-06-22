import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getExchangeRatesPageData,
  type ExchangeRatesPageData,
} from "./exchange-rates";
import { getCurrentSessionContext } from "./current-session-context";

export type AdminSystemSettingsPageData = {
  exchangeRates: ExchangeRatesPageData;
  hasPermission: boolean;
};

export async function getAdminSystemSettingsPageData(
  supabase: SupabaseClient,
): Promise<AdminSystemSettingsPageData> {
  const { user, role, status } = await getCurrentSessionContext(supabase);

  if (!user || role !== "administrator" || status !== "active") {
    return createEmptyAdminSystemSettingsPageData();
  }

  const exchangeRates = await getExchangeRatesPageData(supabase, "manage");

  return {
    exchangeRates,
    hasPermission: true,
  };
}

function createEmptyAdminSystemSettingsPageData(): AdminSystemSettingsPageData {
  return {
    exchangeRates: {
      hasPermission: false,
      rates: [],
      syncState: null,
    },
    hasPermission: false,
  };
}
