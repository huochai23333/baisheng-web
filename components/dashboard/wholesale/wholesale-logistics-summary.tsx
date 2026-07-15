"use client";

import { useTranslations } from "next-intl";

import { useLocale } from "@/components/i18n/locale-provider";
import type { WholesaleLogisticsPage } from "@/lib/wholesale-logistics-page";

import {
  formatWholesaleLogisticsDateTime,
  formatWholesaleLogisticsMoney,
} from "./wholesale-logistics-display";
import { WholesaleStatGrid } from "./wholesale-ui";

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
      label: t("summary.freight", { currency }),
      value: formatWholesaleLogisticsMoney(amount, currency, locale),
    }));

  return (
    <WholesaleStatGrid
      stats={[
        { label: t("summary.orders"), value: `${page.totalCount}` },
        { label: t("summary.recorded"), value: `${page.recordedCostCount}` },
        { label: t("summary.missing"), value: `${page.missingCostCount}` },
        {
          label: t("summary.lastUpdated"),
          value: formatWholesaleLogisticsDateTime(page.lastUpdatedAt, locale),
        },
        ...currencyStats,
      ]}
    />
  );
}
