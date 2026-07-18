"use client";

import { Select } from "@/components/ui/select";

import {
  BadgeCheck,
  Clock3,
  Filter,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";

import {
  DashboardFilterField,
  DashboardFilterPanel,
  DashboardListSection,
  DashboardSearchInput,
} from "@/components/dashboard/dashboard-section-panel";
import {
  DashboardSectionHeader,
  type DashboardSectionHeaderMetric,
} from "@/components/dashboard/dashboard-section-header";
import { EmptyState } from "@/components/dashboard/dashboard-shared-ui";
import type {
  BusinessVipMembershipAction,
  BusinessVipPageData,
  BusinessVipRequest,
  BusinessVipReviewAction,
  BusinessVipRow,
} from "@/lib/business-vip-management";
import type { Locale } from "@/lib/locale";

import {
  BUSINESS_VIP_STATUS_FILTERS,
  type BusinessVipStatusFilter,
} from "./business-vip-display";
import {
  BusinessVipMobileCard,
  BusinessVipTable,
} from "./business-vip-row-list";
import { BusinessVipWholesaleCustomerList } from "./business-vip-wholesale-list";
import { BusinessVipWholesaleRecordTable } from "./business-vip-wholesale-records";

export function BusinessVipHeaderSection({
  data,
  summary,
}: {
  data: BusinessVipPageData;
  summary: { activeCount: number; pendingCount: number; totalCount: number };
}) {
  const t = useTranslations("BusinessVip");
  const metrics = [
    {
      accent: "blue",
      icon: <UserRound className="size-5" />,
      key: "total",
      label: t("summary.total"),
      value: summary.totalCount,
    },
    {
      accent: "green",
      icon: <BadgeCheck className="size-5" />,
      key: "active",
      label: t("summary.active"),
      value: summary.activeCount,
    },
    ...(data.business === "wholesale"
      ? []
      : [
          {
            accent: "gold",
            icon: <Clock3 className="size-5" />,
            key: "pending",
            label: t("summary.pending"),
            value: summary.pendingCount,
          } satisfies DashboardSectionHeaderMetric,
        ]),
  ] satisfies DashboardSectionHeaderMetric[];

  return (
    <DashboardSectionHeader
      badge={t(`business.${data.business}`)}
      badgeIcon={<Sparkles className="size-4" />}
      description={
        data.business === "wholesale"
          ? t(`header.wholesale.${data.mode}.description`)
          : t(`header.${data.mode}.description`)
      }
      metrics={metrics}
      metricsClassName={
        data.business === "wholesale"
          ? "grid-cols-2"
          : "grid-cols-2 md:grid-cols-3"
      }
      metricsPlacement="below"
      title={t("header.title")}
    />
  );
}

export function BusinessVipFiltersSection({
  onSearchTextChange,
  onStatusFilterChange,
  searchText,
  statusFilter,
}: {
  onSearchTextChange: (value: string) => void;
  onStatusFilterChange: (value: BusinessVipStatusFilter) => void;
  searchText: string;
  statusFilter: BusinessVipStatusFilter;
}) {
  const t = useTranslations("BusinessVip");

  return (
    <DashboardFilterPanel gridClassName="gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
      <DashboardFilterField label={t("filters.search")}>
        <DashboardSearchInput
          onChange={onSearchTextChange}
          placeholder={t("filters.searchPlaceholder")}
          value={searchText}
        />
      </DashboardFilterField>
      <DashboardFilterField label={t("filters.status")}>
        <Select
          onValueChange={onStatusFilterChange}
          options={BUSINESS_VIP_STATUS_FILTERS.map((filter) => ({
            label: t(`filters.statusOptions.${filter}`),
            value: filter,
          }))}
          value={statusFilter}
        />
      </DashboardFilterField>
    </DashboardFilterPanel>
  );
}

export function BusinessVipDirectorySection({
  business,
  canAdmin,
  canRequest,
  filteredRows,
  locale,
  onOpenAdjust,
  onOpenRequest,
  onOpenReview,
  onOpenWholesaleAction,
  onOpenWholesaleRecords,
  pendingActionKey,
}: {
  business: BusinessVipPageData["business"];
  canAdmin: boolean;
  canRequest: boolean;
  filteredRows: BusinessVipRow[];
  locale: Locale;
  onOpenAdjust: (row: BusinessVipRow) => void;
  onOpenRequest: (row: BusinessVipRow) => void;
  onOpenReview: (
    row: BusinessVipRow,
    request: BusinessVipRequest,
    action: BusinessVipReviewAction,
  ) => void;
  onOpenWholesaleAction: (
    row: BusinessVipRow,
    action: BusinessVipMembershipAction,
  ) => void;
  onOpenWholesaleRecords: (row: BusinessVipRow) => void;
  pendingActionKey: string | null;
}) {
  const t = useTranslations("BusinessVip");

  if (business === "wholesale") {
    return (
      <>
        <DashboardListSection
          description={t("directory.wholesaleDescription")}
          eyebrow={t("directory.eyebrow")}
          title={t("directory.wholesaleTitle")}
        >
          {filteredRows.length === 0 ? (
            <EmptyState
              description={t("directory.emptyDescription")}
              icon={<Filter className="size-5" />}
              title={t("directory.emptyTitle")}
            />
          ) : (
            <BusinessVipWholesaleCustomerList
              canManage={canAdmin || canRequest}
              locale={locale}
              onOpenAction={onOpenWholesaleAction}
              onOpenRecords={onOpenWholesaleRecords}
              pendingActionKey={pendingActionKey}
              rows={filteredRows}
            />
          )}
        </DashboardListSection>
        <DashboardListSection
          description={t("operationRecords.description")}
          eyebrow={t("operationRecords.eyebrow")}
          title={t("operationRecords.title")}
        >
          <BusinessVipWholesaleRecordTable
            locale={locale}
            rows={filteredRows}
          />
        </DashboardListSection>
      </>
    );
  }

  return (
    <DashboardListSection
      description={t("directory.description")}
      eyebrow={t("directory.eyebrow")}
      title={t("directory.title")}
    >
      {filteredRows.length === 0 ? (
        <EmptyState
          description={t("directory.emptyDescription")}
          icon={<Filter className="size-5" />}
          title={t("directory.emptyTitle")}
        />
      ) : (
        <>
          <div className="hidden lg:block">
            <BusinessVipTable
              canAdmin={canAdmin}
              canRequest={canRequest}
              locale={locale}
              onOpenAdjust={onOpenAdjust}
              onOpenRequest={onOpenRequest}
              onOpenReview={onOpenReview}
              pendingActionKey={pendingActionKey}
              rows={filteredRows}
            />
          </div>
          <div className="grid gap-3 lg:hidden">
            {filteredRows.map((row) => (
              <BusinessVipMobileCard
                canAdmin={canAdmin}
                canRequest={canRequest}
                key={row.targetId}
                locale={locale}
                onOpenAdjust={onOpenAdjust}
                onOpenRequest={onOpenRequest}
                onOpenReview={onOpenReview}
                pendingActionKey={pendingActionKey}
                row={row}
              />
            ))}
          </div>
        </>
      )}
    </DashboardListSection>
  );
}
