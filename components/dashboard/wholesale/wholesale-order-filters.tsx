"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  DashboardFilterField,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { DashboardOrderFilterSection } from "@/components/dashboard/dashboard-order-filter-section";
import { UiMessage } from "@/components/i18n/ui-message";
import { Button } from "@/components/ui/button";
import type { WholesaleCustomer, WholesaleProfile } from "@/lib/wholesale";
import type { WholesaleOrderFilters } from "@/lib/wholesale-order-page";

type WholesaleOrderFiltersProps = {
  customers: WholesaleCustomer[];
  filters: WholesaleOrderFilters;
  hasActiveFilters: boolean;
  onClear: () => void;
  onExactSearch: () => void;
  onExitExactSearch: () => void;
  onSelectDatePreset: (
    preset: "last_30_days" | "current_month" | "previous_month" | "last_3_months",
  ) => void;
  onUpdate: <Key extends keyof WholesaleOrderFilters>(
    key: Key,
    value: WholesaleOrderFilters[Key],
  ) => void;
  salesAccounts: WholesaleProfile[];
};
export function WholesaleOrderFiltersPanel({
  customers,
  filters,
  hasActiveFilters,
  onClear,
  onExactSearch,
  onExitExactSearch,
  onSelectDatePreset,
  onUpdate,
  salesAccounts,
}: WholesaleOrderFiltersProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_order_filters",
  );
  const frameworkT = useTranslations("OrderListFramework");
  return (
    <DashboardOrderFilterSection
      customInputId="wholesale-order-date-from"
      dateRange={{
        fromDate: filters.orderedFromDate,
        toDate: filters.orderedToDate,
      }}
      exactOrderNumber={
        filters.searchMode === "exact_all_time"
          ? filters.searchText.trim()
          : null
      }
      gridClassName="md:grid-cols-2 xl:grid-cols-3"
      onExitExactSearch={onExitExactSearch}
      onPresetChange={onSelectDatePreset}
      onReset={onClear}
      resetDisabled={!hasActiveFilters}
    >
        <DashboardFilterField label={uiText("attribute001")}>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <input
              className={`${dashboardFilterInputClassName} min-w-0`}
              onChange={(event) => onUpdate("searchText", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && filters.searchText.trim()) {
                  event.preventDefault();
                  onExactSearch();
                }
              }}
              placeholder={uiText("attribute002")}
              type="search"
              value={filters.searchText}
            />
            <Button
              className="min-h-10 shrink-0 rounded-full px-3"
              disabled={!filters.searchText.trim()}
              onClick={onExactSearch}
              type="button"
              variant="outline"
            >
              <Search className="size-4" />
              {frameworkT("exactSearch.action")}
            </Button>
          </div>
        </DashboardFilterField>
        <DashboardFilterField label={uiText("attribute003")}>
          <select
            className={dashboardFilterInputClassName}
            onChange={(event) =>
              onUpdate(
                "status",
                event.target.value as WholesaleOrderFilters["status"],
              )
            }
            value={filters.status}
          >
            <option value="all">
              <UiMessage id="components_dashboard_wholesale_wholesale_order_filters.text004" />
            </option>
            <option value="unsettled">
              <UiMessage id="components_dashboard_wholesale_wholesale_order_filters.text005" />
            </option>
            <option value="partial_settled">
              <UiMessage id="components_dashboard_wholesale_wholesale_order_filters.text006" />
            </option>
            <option value="settled">
              <UiMessage id="components_dashboard_wholesale_wholesale_order_filters.text007" />
            </option>
          </select>
        </DashboardFilterField>
        <DashboardFilterField label={uiText("attribute004")}>
          <select
            className={dashboardFilterInputClassName}
            onChange={(event) => onUpdate("customerId", event.target.value)}
            value={filters.customerId}
          >
            <option value="">
              <UiMessage id="components_dashboard_wholesale_wholesale_order_filters.text008" />
            </option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.unique_name}
              </option>
            ))}
          </select>
        </DashboardFilterField>
        <DashboardFilterField label={uiText("attribute005")}>
          <select
            className={dashboardFilterInputClassName}
            onChange={(event) => onUpdate("salesUserId", event.target.value)}
            value={filters.salesUserId}
          >
            <option value="">
              <UiMessage id="components_dashboard_wholesale_wholesale_order_filters.text009" />
            </option>
            {salesAccounts.map((profile) => (
              <option key={profile.user_id} value={profile.user_id}>
                {profile.name || profile.email}
              </option>
            ))}
          </select>
        </DashboardFilterField>
        <DashboardFilterField label={uiText("attribute006")}>
          <input
            id="wholesale-order-date-from"
            className={dashboardFilterInputClassName}
            onChange={(event) => {
              const nextDate = event.target.value;
              onUpdate("orderedFromDate", nextDate);
              if (
                filters.orderedToDate &&
                nextDate &&
                filters.orderedToDate < nextDate
              ) {
                onUpdate("orderedToDate", nextDate);
              }
            }}
            required
            type="date"
            value={filters.orderedFromDate}
          />
        </DashboardFilterField>
        <DashboardFilterField label={uiText("attribute007")}>
          <input
            className={dashboardFilterInputClassName}
            min={filters.orderedFromDate || undefined}
            onChange={(event) => onUpdate("orderedToDate", event.target.value)}
            required
            type="date"
            value={filters.orderedToDate}
          />
        </DashboardFilterField>
    </DashboardOrderFilterSection>
  );
}
