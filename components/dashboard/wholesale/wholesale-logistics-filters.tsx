"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardOrderFilterSection } from "@/components/dashboard/dashboard-order-filter-section";
import {
  DashboardFilterField,
  DashboardSearchInput,
} from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
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
    preset:
      "last_30_days" | "current_month" | "previous_month" | "last_3_months",
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
      activeFilterCount={[
        filters.salesUserId !== "all",
        Boolean(filters.storeName),
        filters.costState !== "all",
        Boolean(filters.searchText),
        filters.fromDate !== defaultRange.fromDate ||
          filters.toDate !== defaultRange.toDate,
        filters.searchMode !== "date_range",
      ].filter(Boolean).length}
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
      primary={
        <DashboardFilterField label={t("filters.search")}>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <DashboardSearchInput
              onChange={(value) => onChange({ searchText: value })}
              onKeyDown={(event) => {
                if (event.key === "Enter" && filters.searchText.trim()) {
                  event.preventDefault();
                  onExactSearch();
                }
              }}
              placeholder={t("filters.searchPlaceholder")}
              value={filters.searchText}
            />
            <Button
              className="shrink-0"
              disabled={!filters.searchText.trim()}
              onClick={onExactSearch}
              type="button"
              variant="outline"
              size="compact"
            >
              <Search className="size-4" />
              {frameworkT("exactSearch.action")}
            </Button>
          </div>
        </DashboardFilterField>
      }
      resetDisabled={resetDisabled}
    >
      <DashboardFilterField label={t("filters.sales")}>
        <Select
          aria-label={t("filters.sales")}
          onValueChange={(salesUserId) => onChange({ salesUserId })}
          options={[
            { label: t("filters.allSales"), value: "all" },
            { label: t("filters.unassigned"), value: "unassigned" },
            ...salesProfiles.map((profile) => ({
              label:
                profile.name || profile.email || t("fallbacks.unnamedSales"),
              value: profile.user_id,
            })),
          ]}
          value={filters.salesUserId}
        />
      </DashboardFilterField>

      <DashboardFilterField label={t("filters.store")}>
        <Select
          aria-label={t("filters.store")}
          onValueChange={(storeName) => onChange({ storeName })}
          options={[
            { label: t("filters.allStores"), value: "" },
            ...storeOptions.map((option) => ({
              label: option.store_name,
              value: option.store_name,
            })),
          ]}
          value={filters.storeName}
        />
      </DashboardFilterField>

      <DashboardFilterField
        controlId="wholesale-logistics-date-from"
        label={t("filters.fromDate")}
      >
        <DatePicker
          onValueChange={(fromDate) => onChange({ fromDate })}
          required
          value={filters.fromDate}
        />
      </DashboardFilterField>

      <DashboardFilterField label={t("filters.toDate")}>
        <DatePicker
          min={filters.fromDate}
          onValueChange={(toDate) => onChange({ toDate })}
          required
          value={filters.toDate}
        />
      </DashboardFilterField>

      <DashboardFilterField label={t("filters.costState")}>
        <Select
          aria-label={t("filters.costState")}
          onValueChange={(value) =>
            onChange({
              costState: value as WholesaleLogisticsFilters["costState"],
            })
          }
          options={[
            { label: t("filters.allCosts"), value: "all" },
            { label: t("filters.recorded"), value: "recorded" },
            { label: t("filters.missing"), value: "missing" },
          ]}
          value={filters.costState}
        />
      </DashboardFilterField>

    </DashboardOrderFilterSection>
  );
}
