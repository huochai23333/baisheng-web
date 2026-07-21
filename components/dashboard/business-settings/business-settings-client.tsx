"use client";

import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import {
  DashboardAccessState,
  DashboardPageShell,
} from "@/components/dashboard/dashboard-page-shell";
import type { BusinessSettingsPageData } from "@/lib/business-settings";
import { getWorkspaceBusinessSettingsModule } from "@/lib/workspace-business-modules";

import { BusinessSettingsPanel } from "./business-settings-panel";
import { useBusinessSettingsViewModel } from "./use-business-settings-view-model";

export function BusinessSettingsClient({
  initialData,
}: {
  initialData: BusinessSettingsPageData;
}) {
  const t = useTranslations("SystemSettings");
  const settingsModule = getWorkspaceBusinessSettingsModule(
    initialData.business,
  );
  const viewModel = useBusinessSettingsViewModel(initialData);

  return (
    <DashboardPageShell
      header={
        <DashboardSectionHeader
          badge={t("businessHeader.badge")}
          badgeIcon={<Settings className="size-3.5" />}
          contentClassName="max-w-3xl"
          description={
            settingsModule
              ? t(settingsModule.descriptionKey)
              : t("businessHeader.description")
          }
          presentation="overview"
          title={
            settingsModule
              ? t(settingsModule.titleKey)
              : t("businessHeader.title")
          }
        />
      }
    >
      {!initialData.hasPermission ? (
        <DashboardAccessState
          description={t("states.noPermissionDescription")}
          kind="permission"
          title={t("states.noPermissionTitle")}
        />
      ) : (
        <BusinessSettingsPanel
          canManageCommissionSettings={initialData.canManageCommissionSettings}
          commissionRuleSettings={viewModel.commissionRuleSettings}
          onCommissionRuleRowsChange={viewModel.setCommissionRuleSettings}
          onOrderDiscountRowsChange={viewModel.setOrderDiscountOptions}
          onServiceFeeRowsChange={viewModel.setServiceFeeTypeOptions}
          onServiceOrderPriceRowsChange={viewModel.setServiceOrderPriceOptions}
          onWholesaleOrderEditSettingsChange={
            viewModel.setWholesaleOrderEditSettings
          }
          orderDiscountOptions={viewModel.orderDiscountOptions}
          settingsModule={settingsModule}
          serviceFeeTypeOptions={viewModel.serviceFeeTypeOptions}
          serviceOrderPriceOptions={viewModel.serviceOrderPriceOptions}
          serviceOrderTypeOptions={initialData.serviceOrderTypeOptions}
          wholesaleOrderEditSettings={viewModel.wholesaleOrderEditSettings}
        />
      )}
    </DashboardPageShell>
  );
}
