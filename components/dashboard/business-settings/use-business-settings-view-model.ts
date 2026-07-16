"use client";

import { useState } from "react";

import type { BusinessSettingsPageData } from "@/lib/business-settings";

/**
 * 各规则区块保存后的最新行数据集中在 view-model。
 * 页面 Client 只把对应数据和更新函数传给规则区块，不直接维护表单状态。
 */
export function useBusinessSettingsViewModel(
  initialData: BusinessSettingsPageData,
) {
  const [serviceFeeTypeOptions, setServiceFeeTypeOptions] = useState(
    initialData.serviceFeeTypeOptions,
  );
  const [serviceOrderPriceOptions, setServiceOrderPriceOptions] = useState(
    initialData.serviceOrderPriceOptions,
  );
  const [orderDiscountOptions, setOrderDiscountOptions] = useState(
    initialData.orderDiscountOptions,
  );
  const [commissionRuleSettings, setCommissionRuleSettings] = useState(
    initialData.commissionRuleSettings,
  );
  const [wholesaleOrderEditSettings, setWholesaleOrderEditSettings] = useState(
    initialData.wholesaleOrderEditSettings,
  );

  return {
    commissionRuleSettings,
    orderDiscountOptions,
    serviceFeeTypeOptions,
    serviceOrderPriceOptions,
    setCommissionRuleSettings,
    setOrderDiscountOptions,
    setServiceFeeTypeOptions,
    setServiceOrderPriceOptions,
    setWholesaleOrderEditSettings,
    wholesaleOrderEditSettings,
  };
}

