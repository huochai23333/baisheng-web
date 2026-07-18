"use client";

import { AdminOrdersServiceFeeSettings } from "@/components/dashboard/admin-orders/admin-orders-service-fee-settings";
import { AdminOrdersServiceOrderSettings } from "@/components/dashboard/admin-orders/admin-orders-service-order-settings";
import { AdminCommissionSettingsSection } from "@/components/dashboard/commission/admin-commission-settings-section";
import type { BusinessSettingsPageData } from "@/lib/business-settings";
import type { WorkspaceBusinessSettingsModule } from "@/lib/workspace-business-modules";

import { WholesaleOrderEditSettingsSection } from "./wholesale-order-edit-settings-section";

export function BusinessSettingsPanel({
  canManageCommissionSettings,
  commissionRuleSettings,
  onCommissionRuleRowsChange,
  onOrderDiscountRowsChange,
  onServiceFeeRowsChange,
  onServiceOrderPriceRowsChange,
  onWholesaleOrderEditSettingsChange,
  orderDiscountOptions,
  settingsModule,
  serviceFeeTypeOptions,
  serviceOrderPriceOptions,
  serviceOrderTypeOptions,
  wholesaleOrderEditSettings,
}: {
  canManageCommissionSettings: BusinessSettingsPageData["canManageCommissionSettings"];
  commissionRuleSettings: BusinessSettingsPageData["commissionRuleSettings"];
  onCommissionRuleRowsChange: (
    rows: BusinessSettingsPageData["commissionRuleSettings"],
  ) => void;
  onOrderDiscountRowsChange: (
    rows: BusinessSettingsPageData["orderDiscountOptions"],
  ) => void;
  onServiceFeeRowsChange: (
    rows: BusinessSettingsPageData["serviceFeeTypeOptions"],
  ) => void;
  onServiceOrderPriceRowsChange: (
    rows: BusinessSettingsPageData["serviceOrderPriceOptions"],
  ) => void;
  onWholesaleOrderEditSettingsChange: (
    settings: NonNullable<
      BusinessSettingsPageData["wholesaleOrderEditSettings"]
    >,
  ) => void;
  orderDiscountOptions: BusinessSettingsPageData["orderDiscountOptions"];
  settingsModule: WorkspaceBusinessSettingsModule | undefined;
  serviceFeeTypeOptions: BusinessSettingsPageData["serviceFeeTypeOptions"];
  serviceOrderPriceOptions: BusinessSettingsPageData["serviceOrderPriceOptions"];
  serviceOrderTypeOptions: BusinessSettingsPageData["serviceOrderTypeOptions"];
  wholesaleOrderEditSettings: BusinessSettingsPageData["wholesaleOrderEditSettings"];
}) {
  if (!settingsModule) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      {settingsModule.sections.map((section) => {
        if (section.kind === "tourismServiceFees") {
          return (
            <AdminOrdersServiceFeeSettings
              initialRows={serviceFeeTypeOptions}
              key={section.kind}
              onRowsChange={onServiceFeeRowsChange}
            />
          );
        }

        if (section.kind === "tourismServiceOrders") {
          return (
            <AdminOrdersServiceOrderSettings
              initialDiscounts={orderDiscountOptions}
              initialPrices={serviceOrderPriceOptions}
              key={section.kind}
              serviceOrderTypes={serviceOrderTypeOptions}
              onDiscountsChange={onOrderDiscountRowsChange}
              onPricesChange={onServiceOrderPriceRowsChange}
            />
          );
        }

        if (section.kind === "wholesaleOrderEditWindow") {
          return (
            <WholesaleOrderEditSettingsSection
              initialSettings={wholesaleOrderEditSettings}
              key={section.kind}
              onSettingsChange={onWholesaleOrderEditSettingsChange}
            />
          );
        }

        return (
          <AdminCommissionSettingsSection
            canManageSettings={canManageCommissionSettings}
            key={`${section.kind}-${section.ruleCodes.join("-")}`}
            onRowsChange={onCommissionRuleRowsChange}
            rows={commissionRuleSettings}
            ruleCodes={section.ruleCodes}
          />
        );
      })}
    </div>
  );
}
