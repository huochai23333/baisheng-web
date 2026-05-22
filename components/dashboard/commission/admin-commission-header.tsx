"use client";

import { BadgeDollarSign, Coins, ReceiptText, WalletCards } from "lucide-react";
import { useTranslations } from "next-intl";

import { useLocale } from "@/components/i18n/locale-provider";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";

import { formatCommissionMoney } from "./commission-display";

export type AdminCommissionHeaderSummary = {
  paidAmount: number;
  pendingAmount: number;
  recordCount: number;
  totalAmount: number;
};

export function AdminCommissionHeader({
  summary,
}: {
  summary: AdminCommissionHeaderSummary;
}) {
  const t = useTranslations("Commission");
  const { locale } = useLocale();

  return (
    <DashboardSectionHeader
      badge={t("header.badge")}
      description={t("header.description")}
      metrics={[
        {
          accent: "blue",
          icon: <ReceiptText className="size-5" />,
          key: "recordCount",
          label: t("summary.recordCount"),
          labelClassName: "sm:min-h-10 sm:leading-5",
          value: summary.recordCount.toString(),
        },
        {
          accent: "green",
          icon: <WalletCards className="size-5" />,
          key: "totalAmount",
          label: t("summary.totalAmount"),
          labelClassName: "sm:min-h-10 sm:leading-5",
          value: formatCommissionMoney(summary.totalAmount, locale),
        },
        {
          accent: "gold",
          icon: <Coins className="size-5" />,
          key: "pendingAmount",
          label: t("summary.pendingAmount"),
          labelClassName: "sm:min-h-10 sm:leading-5",
          value: formatCommissionMoney(summary.pendingAmount, locale),
        },
        {
          accent: "blue",
          icon: <BadgeDollarSign className="size-5" />,
          key: "paidAmount",
          label: t("summary.paidAmount"),
          labelClassName: "sm:min-h-10 sm:leading-5",
          value: formatCommissionMoney(summary.paidAmount, locale),
        },
      ]}
      metricsClassName="sm:grid-cols-2 xl:grid-cols-4"
      metricsPlacement="below"
      title={t("header.title")}
    />
  );
}
