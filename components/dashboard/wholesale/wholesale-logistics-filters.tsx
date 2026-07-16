"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardOrderFilterSection } from "@/components/dashboard/dashboard-order-filter-section";
import {
  DashboardFilterField,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import { getDefaultOrderDateRange } from "@/lib/order-date-range";
import type { WholesaleProfile } from "@/lib/wholesale";
import type {
  WholesaleLogisticsFilters,
  WholesaleLogisticsStoreOption,
} from "@/lib/wholesale-logistics-page";

import { getActiveSalesProfiles } from "./wholesale-logistics-display";

export function WholesaleLogisticsFiltersPanel({
  filters,
  onChange,
  onClear,
  onExactSearch,
  onExitExactSearch,
  onSelectDatePreset,
  profiles,
  storeOptions,
}: {
  filters: WholesaleLogisticsFilters;
  onChange: (changes: Partial<WholesaleLogisticsFilters>) => void;
  onClear: () => void;
  onExactSearch: () => void;
  onExitExactSearch: () => void;
  onSelectDatePreset: (
    preset: "last_30_days" | "current_month" | "previous_month" | "last_3_months",
  ) => void;
  profiles: WholesaleProfile[];
  storeOptions: WholesaleLogisticsStoreOption[];
}) {
  const t = useTranslations("WholesaleBusiness.logisticsArchive");
  const frameworkT = useTranslations("OrderListFramework");
  const salesProfiles = getActiveSalesProfiles(profiles);
  const defaultRange = getDefaultOrderDateRange();
  const resetDisabled =
    filters.salesUserId === "all" &&
    filters.storeName === "" &&
    filters.costState === "all" &&
    filters.searchText === "" &&
    filters.searchMode === "date_range" &&
    filters.fromDate === defaultRange.fromDate &&
    filters.toDate === defaultRange.toDate;

  return (
    <DashboardOrderFilterSection
      customInputId="wholesale-logistics-date-from"
      dateRange={{ fromDate: filters.fromDate, toDate: filters.toDate }}
      exactOrderNumber={
        filters.searchMode === "exact_all_time"
          ? filters.searchText.trim()
          : null
      }
      gridClassName="sm:grid-cols-2 xl:grid-cols-6"
      onExitExactSearch={onExitExactSearch}
      onPresetChange={onSelectDatePreset}
      onReset={onClear}
      resetDisabled={resetDisabled}
    >
      <DashboardFilterField label={t("filters.sales")}> 
        <select
          className={dashboardFilterInputClassName}
          onInput={(event) => onChange({ salesUserId: event.currentTarget.value })}
          value={filters.salesUserId}
        >
          <option value="all">{t("filters.allSales")}</option>
          <option value="unassigned">{t("filters.unassigned")}</option>
          {salesProfiles.map((profile) => (
            <option key={profile.user_id} value={profile.user_id}>
              {profile.name || profile.email || t("fallbacks.unnamedSales")}
            </option>
          ))}
        </select>
      </DashboardFilterField>

      <DashboardFilterField label={t("filters.store")}>
        <select
          className={dashboardFilterInputClassName}
          onInput={(event) => onChange({ storeName: event.currentTarget.value })}
          value={filters.storeName}
        >
          <option value="">{t("filters.allStores")}</option>
          {storeOptions.map((option) => (
            <option key={option.store_name} value={option.store_name}>
              {option.store_name}
            </option>
          ))}
        </select>
      </DashboardFilterField>

      <DashboardFilterField label={t("filters.fromDate")}>
        <input
          id="wholesale-logistics-date-from"
          className={dashboardFilterInputClassName}
          onChange={(event) => onChange({ fromDate: event.currentTarget.value })}
          required
          type="date"
          value={filters.fromDate}
        />
      </DashboardFilterField>

      <DashboardFilterField label={t("filters.toDate")}>
        <input
          className={dashboardFilterInputClassName}
          min={filters.fromDate}
          onChange={(event) => onChange({ toDate: event.currentTarget.value })}
          required
          type="date"
          value={filters.toDate}
        />
      </DashboardFilterField>

      <DashboardFilterField label={t("filters.costState")}>
        <select
          className={dashboardFilterInputClassName}
          onInput={(event) =>
            onChange({
              costState: event.currentTarget.value as WholesaleLogisticsFilters["costState"],
            })
          }
          value={filters.costState}
        >
          <option value="all">{t("filters.allCosts")}</option>
          <option value="recorded">{t("filters.recorded")}</option>
          <option value="missing">{t("filters.missing")}</option>
        </select>
      </DashboardFilterField>

      <DashboardFilterField label={t("filters.search")}>
        <div className="flex min-w-0 flex-col gap-2">
          <label className="relative block min-w-0">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8a949c]" />
            <input
              className={`${dashboardFilterInputClassName} min-w-0 pl-10`}
              onChange={(event) => onChange({ searchText: event.currentTarget.value })}
              onKeyDown={(event) => {
                if (event.key === "Enter" && filters.searchText.trim()) {
                  event.preventDefault();
                  onExactSearch();
                }
              }}
              placeholder={t("filters.searchPlaceholder")}
              type="search"
              value={filters.searchText}
            />
          </label>
          <Button
            className="min-h-10 rounded-full px-3"
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
    </DashboardOrderFilterSection>
  );
}
