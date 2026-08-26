"use client";

import { ArrowLeftRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import {
  DashboardAccessState,
  DashboardPageShell,
} from "@/components/dashboard/dashboard-page-shell";
import type { ExchangeRatesWorkspacePageData } from "@/lib/exchange-rates-page";

import { ExchangeRatesClient } from "./exchange-rates-client";

export function ExchangeRatesPageClient({
  homeHref,
  initialData,
}: {
  homeHref: string;
  initialData: ExchangeRatesWorkspacePageData;
}) {
  const t = useTranslations("SystemSettings");
  const isManageMode = initialData.mode === "manage";

  // 页面组件只根据服务端已经确认的模式组装页头和汇率内容。
  return (
    <DashboardPageShell
      header={
        <DashboardSectionHeader
          badge={t("header.badge")}
          badgeIcon={<ArrowLeftRight className="size-3.5" />}
          contentClassName="max-w-3xl"
          description={t(
            isManageMode
              ? "header.manageDescription"
              : "header.readonlyDescription",
          )}
          presentation="overview"
          title={t("header.title")}
        />
      }
    >
      {!initialData.exchangeRates.hasPermission ? (
        <DashboardAccessState
          description={t("states.noPermissionDescription")}
          kind="permission"
          title={t("states.noPermissionTitle")}
        />
      ) : (
        <ExchangeRatesClient
          embedded
          homeHref={homeHref}
          initialData={initialData.exchangeRates}
          mode={initialData.mode}
        />
      )}
    </DashboardPageShell>
  );
}
