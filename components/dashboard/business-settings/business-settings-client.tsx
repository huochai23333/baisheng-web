"use client";

import { useState } from "react";

import { Settings, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import { EmptyState } from "@/components/dashboard/dashboard-shared-ui";
import type { BusinessSettingsPageData } from "@/lib/business-settings";
import { getWorkspaceBusinessSettingsModule } from "@/lib/workspace-business-modules";

import { BusinessSettingsPanel } from "./business-settings-panel";

export function BusinessSettingsClient({
  initialData,
}: {
  initialData: BusinessSettingsPageData;
}) {
  const t = useTranslations("SystemSettings");
  const settingsModule = getWorkspaceBusinessSettingsModule(initialData.business);
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

  return (
    <section className="mx-auto flex w-full max-w-[1320px] flex-col gap-8">
      <DashboardSectionHeader
        badge={t("businessHeader.badge")}
        badgeIcon={<Settings className="size-3.5" />}
        contentClassName="max-w-3xl"
        description={
          settingsModule
            ? t(settingsModule.descriptionKey)
            : t("businessHeader.description")
        }
        title={settingsModule ? t(settingsModule.titleKey) : t("businessHeader.title")}
      />

      {!initialData.hasPermission ? (
        <section className="rounded-[28px] border border-white/85 bg-white/72 p-6 shadow-[0_18px_45px_rgba(96,113,128,0.06)] xl:p-8">
          <EmptyState
            description={t("states.noPermissionDescription")}
            icon={<ShieldAlert className="size-6" />}
            title={t("states.noPermissionTitle")}
          />
        </section>
      ) : (
        <BusinessSettingsPanel
          canManageCommissionSettings={initialData.canManageCommissionSettings}
          commissionRuleSettings={commissionRuleSettings}
          onCommissionRuleRowsChange={setCommissionRuleSettings}
          onOrderDiscountRowsChange={setOrderDiscountOptions}
          onServiceFeeRowsChange={setServiceFeeTypeOptions}
          onServiceOrderPriceRowsChange={setServiceOrderPriceOptions}
          onWholesaleOrderEditSettingsChange={setWholesaleOrderEditSettings}
          orderDiscountOptions={orderDiscountOptions}
          settingsModule={settingsModule}
          serviceFeeTypeOptions={serviceFeeTypeOptions}
          serviceOrderPriceOptions={serviceOrderPriceOptions}
          serviceOrderTypeOptions={initialData.serviceOrderTypeOptions}
          wholesaleOrderEditSettings={wholesaleOrderEditSettings}
        />
      )}
    </section>
  );
}
