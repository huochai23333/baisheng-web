import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getOrderDiscountTypeOptions,
  getServiceFeeTypeOptions,
  getServiceOrderPriceOptions,
  getServiceOrderTypeOptions,
  type OrderDiscountTypeOption,
  type ServiceOrderPriceOption,
  type ServiceOrderTypeOption,
} from "./admin-orders";
import {
  getCommissionRuleSettings,
  type CommissionRuleSetting,
} from "./commission-settings";
import { getCurrentSessionContext } from "./current-session-context";
import type { ServiceFeeTypeOption } from "./service-fee-types";
import {
  getWholesaleOrderEditSettings,
  type WholesaleOrderEditSettings,
} from "./wholesale-order-edit-settings";
import type { WorkspaceBusinessKey } from "./workspace-business-modules";

export type BusinessSettingsPageData = {
  business: WorkspaceBusinessKey;
  canManageCommissionSettings: boolean;
  commissionRuleSettings: CommissionRuleSetting[];
  hasPermission: boolean;
  orderDiscountOptions: OrderDiscountTypeOption[];
  serviceFeeTypeOptions: ServiceFeeTypeOption[];
  serviceOrderPriceOptions: ServiceOrderPriceOption[];
  serviceOrderTypeOptions: ServiceOrderTypeOption[];
  wholesaleOrderEditSettings: WholesaleOrderEditSettings | null;
};

export async function getBusinessSettingsPageData(
  supabase: SupabaseClient,
  business: WorkspaceBusinessKey,
): Promise<BusinessSettingsPageData> {
  const { user, role, status } = await getCurrentSessionContext(supabase);

  if (!user || role !== "administrator" || status !== "active") {
    return createEmptyBusinessSettingsPageData(business);
  }

  const [
    serviceFeeTypeOptions,
    serviceOrderTypeOptions,
    serviceOrderPriceOptions,
    orderDiscountOptions,
    commissionRuleSettings,
    wholesaleOrderEditSettings,
  ] = await Promise.all([
    getServiceFeeTypeOptions(supabase),
    getServiceOrderTypeOptions(supabase),
    getServiceOrderPriceOptions(supabase),
    getOrderDiscountTypeOptions(supabase),
    getCommissionRuleSettings(supabase),
    business === "wholesale"
      ? getWholesaleOrderEditSettings(supabase)
      : Promise.resolve(null),
  ]);

  return {
    business,
    canManageCommissionSettings: true,
    commissionRuleSettings,
    hasPermission: true,
    orderDiscountOptions,
    serviceFeeTypeOptions,
    serviceOrderPriceOptions,
    serviceOrderTypeOptions,
    wholesaleOrderEditSettings,
  };
}

function createEmptyBusinessSettingsPageData(
  business: WorkspaceBusinessKey,
): BusinessSettingsPageData {
  return {
    business,
    canManageCommissionSettings: false,
    commissionRuleSettings: [],
    hasPermission: false,
    orderDiscountOptions: [],
    serviceFeeTypeOptions: [],
    serviceOrderPriceOptions: [],
    serviceOrderTypeOptions: [],
    wholesaleOrderEditSettings: null,
  };
}
