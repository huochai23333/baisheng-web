"use client";

import { ArrowLeftRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import {
  DashboardAccessState,
  DashboardPageShell,
} from "@/components/dashboard/dashboard-page-shell";
import { ExchangeRatesClient } from "@/components/dashboard/exchange-rates/exchange-rates-client";
import type { AdminSystemSettingsPageData } from "@/lib/admin-system-settings";

export function AdminSystemSettingsClient({
  initialData,
}: {
  initialData: AdminSystemSettingsPageData;
}) {
  const t = useTranslations("SystemSettings");

  return (
    <DashboardPageShell
      header={
        <DashboardSectionHeader
          badge={t("header.badge")}
          badgeIcon={<ArrowLeftRight className="size-3.5" />}
          contentClassName="max-w-3xl"
          description={t("header.description")}
          title={t("header.title")}
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
        <ExchangeRatesClient
          embedded
          homeHref="/admin/home"
          initialData={initialData.exchangeRates}
          mode="manage"
        />
      )}
    </DashboardPageShell>
  );
}
