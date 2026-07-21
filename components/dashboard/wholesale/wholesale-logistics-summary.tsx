"use client";

import {
  BadgeCheck,
  CircleAlert,
  CircleDollarSign,
  Clock3,
  Package,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { useLocale } from "@/components/i18n/locale-provider";
import { DashboardOperationalSummary } from "@/components/dashboard/dashboard-operational-summary";
import type { WholesaleLogisticsPage } from "@/lib/wholesale-logistics-page";

import {
  formatWholesaleLogisticsDateTime,
  formatWholesaleLogisticsMoney,
} from "./wholesale-logistics-display";
export function WholesaleLogisticsSummary({
  page,
}: {
  page: WholesaleLogisticsPage;
}) {
  const t = useTranslations("WholesaleBusiness.logisticsArchive");
  const { locale } = useLocale();
  const currencyStats = Object.entries(page.totalsByCurrency)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([currency, amount]) => ({
      icon: <CircleDollarSign className="size-4" />,
      id: `freight-${currency}`,
      label: currency,
      tone: "success" as const,
      value: formatWholesaleLogisticsMoney(amount, currency, locale),
    }));

  return (
    <DashboardOperationalSummary
      meta={{
        icon: <Clock3 className="size-4" />,
        label: t("summary.lastUpdated"),
        value: formatWholesaleLogisticsDateTime(page.lastUpdatedAt, locale),
      }}
      primaryItems={[
        {
          icon: <Package className="size-4" />,
          id: "orders",
          label: t("summary.orders"),
          tone: "info",
          value: `${page.totalCount}`,
        },
        {
          icon: <BadgeCheck className="size-4" />,
          id: "recorded",
          label: t("summary.recorded"),
          tone: "success",
          value: `${page.recordedCostCount}`,
        },
        {
          icon: <CircleAlert className="size-4" />,
          id: "missing",
          label: t("summary.missing"),
          tone: "warning",
          value: `${page.missingCostCount}`,
        },
      ]}
      secondaryItems={currencyStats}
      secondaryTitle={t("summary.freightTitle")}
    />
  );
}
