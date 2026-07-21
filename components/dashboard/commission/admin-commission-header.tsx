"use client";

import { useTranslations } from "next-intl";

import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";

export function AdminCommissionHeader() {
  const t = useTranslations("Commission");

  return (
    <DashboardSectionHeader
      presentation="work"
      title={t("header.title")}
    />
  );
}
