"use client";

import * as FormControls from "@/components/ui/form-controls";
import { DatePicker } from "@/components/ui/date-picker";

import { useTranslations } from "next-intl";

import { DashboardOrderFilterSection } from "@/components/dashboard/dashboard-order-filter-section";
import { type AdminOrdersFilters } from "@/lib/admin-orders";
import {
  getDefaultOrderDateRange,
  type OrderDatePreset,
} from "@/lib/order-date-range";

import { Button } from "../../ui/button";
import {
  DashboardFilterField,
  dashboardFilterInputClassName,
} from "../dashboard-section-panel";

type AdminOrdersFiltersProps = {
  filters: AdminOrdersFilters;
  matchedOrdersCount: number;
  onClearFilters: () => void;
  onCreatedFromDateChange: (value: string) => void;
  onCreatedToDateChange: (value: string) => void;
  onDatePresetChange: (preset: Exclude<OrderDatePreset, "custom">) => void;
  onExitExactAllTimeSearch: () => void;
  onOrderEntryUserChange: (value: string) => void;
  onOrderNumberChange: (value: string) => void;
  onOrderingUserChange: (value: string) => void;
  onSearchExactOrderAllTime: () => void;
  showOrderEntryFilter: boolean;
  showOrderingFilter: boolean;
  totalOrdersCount: number;
};

/**
 * 普通订单筛选区单独负责输入、日期快捷范围和跨日期精确查询提示。
 * 表格 section 只需要组装筛选区与结果区，避免把筛选交互继续堆进表格渲染文件。
 */
export function AdminOrdersFilterPanel({
  filters,
  matchedOrdersCount,
  onClearFilters,
  onCreatedFromDateChange,
  onCreatedToDateChange,
  onDatePresetChange,
  onExitExactAllTimeSearch,
  onOrderEntryUserChange,
  onOrderNumberChange,
  onOrderingUserChange,
  onSearchExactOrderAllTime,
  showOrderEntryFilter,
  showOrderingFilter,
  totalOrdersCount,
}: AdminOrdersFiltersProps) {
  const t = useTranslations("Orders");
  const frameworkT = useTranslations("OrderListFramework");
  const defaultRange = getDefaultOrderDateRange();
  const hasActiveFilters = Boolean(
    filters.orderNumber ||
    filters.orderEntryUser ||
    filters.orderingUser ||
    filters.createdFromDate !== defaultRange.fromDate ||
    filters.createdToDate !== defaultRange.toDate ||
    filters.searchMode !== "date_range",
  );

  return (
    <DashboardOrderFilterSection
      customInputId="admin-order-date-from"
      dateRange={{
        fromDate: filters.createdFromDate,
        toDate: filters.createdToDate,
      }}
      exactOrderNumber={
        filters.searchMode === "exact_all_time"
          ? filters.orderNumber.trim()
          : null
      }
      gridClassName={getFilterGridClassName(
        showOrderEntryFilter,
        showOrderingFilter,
      )}
      onExitExactSearch={onExitExactAllTimeSearch}
      onPresetChange={onDatePresetChange}
      onReset={onClearFilters}
      resetDisabled={!hasActiveFilters}
    >
      <DashboardFilterField label={t("filters.orderNumberLabel")}>
        <div className="flex min-w-0 flex-col gap-2">
          <FormControls.Input
            className={`${dashboardFilterInputClassName} min-w-0`}
            onChange={(event) => onOrderNumberChange(event.target.value)}
            placeholder={t("filters.orderNumberPlaceholder")}
            type="text"
            value={filters.orderNumber}
          />
          <Button
            className="w-full"
            disabled={!filters.orderNumber.trim()}
            onClick={onSearchExactOrderAllTime}
            type="button"
            variant="outline"
          >
            {frameworkT("exactSearch.action")}
          </Button>
        </div>
      </DashboardFilterField>

      {showOrderEntryFilter ? (
        <DashboardFilterField label={t("filters.orderEntryUserLabel")}>
          <FormControls.Input
            className={dashboardFilterInputClassName}
            onChange={(event) => onOrderEntryUserChange(event.target.value)}
            placeholder={t("filters.orderEntryUserPlaceholder")}
            type="text"
            value={filters.orderEntryUser}
          />
        </DashboardFilterField>
      ) : null}

      {showOrderingFilter ? (
        <DashboardFilterField label={t("filters.orderingUserLabel")}>
          <FormControls.Input
            className={dashboardFilterInputClassName}
            onChange={(event) => onOrderingUserChange(event.target.value)}
            placeholder={t("filters.orderingUserPlaceholder")}
            type="text"
            value={filters.orderingUser}
          />
        </DashboardFilterField>
      ) : null}

      <DashboardFilterField
        controlId="admin-order-date-from"
        label={t("filters.createdFromDateLabel")}
      >
        <DatePicker
          onValueChange={onCreatedFromDateChange}
          required
          value={filters.createdFromDate}
        />
      </DashboardFilterField>

      <DashboardFilterField label={t("filters.createdToDateLabel")}>
        <DatePicker
          min={filters.createdFromDate}
          onValueChange={onCreatedToDateChange}
          required
          value={filters.createdToDate}
        />
      </DashboardFilterField>

      <div className="flex flex-col justify-end gap-3 lg:items-end">
        <p className="text-sm text-content-muted">
          {t("filters.resultSummary", {
            total: totalOrdersCount,
            matched: matchedOrdersCount,
          })}
        </p>
      </div>
    </DashboardOrderFilterSection>
  );
}

// 根据当前角色可见的人员筛选数量调整网格，避免桌面端日期输入被挤成窄列。
function getFilterGridClassName(
  showOrderEntryFilter: boolean,
  showOrderingFilter: boolean,
) {
  if (showOrderEntryFilter && showOrderingFilter) {
    return "md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto]";
  }
  if (showOrderingFilter) {
    return "md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto]";
  }
  return "md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto]";
}
