"use client";

import { ArrowLeftRight, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import { EmptyState } from "@/components/dashboard/dashboard-shared-ui";
import { ExchangeRatesClient } from "@/components/dashboard/exchange-rates/exchange-rates-client";
import type { AdminSystemSettingsPageData } from "@/lib/admin-system-settings";

export function AdminSystemSettingsClient({
  initialData,
}: {
  initialData: AdminSystemSettingsPageData;
}) {
  const t = useTranslations("SystemSettings");

  return (
    <section className="mx-auto flex w-full max-w-[1320px] flex-col gap-8">
      <DashboardSectionHeader
        badge={t("header.badge")}
        badgeIcon={<ArrowLeftRight className="size-3.5" />}
        contentClassName="max-w-3xl"
        description={t("header.description")}
        title={t("header.title")}
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
        <ExchangeRatesClient
          embedded
          homeHref="/admin/home"
          initialData={initialData.exchangeRates}
          mode="manage"
        />
      )}
    </section>
  );
}
