"use client";

import { useTranslations } from "next-intl";

import { DashboardOrderFilterSection } from "@/components/dashboard/dashboard-order-filter-section";
import {
  DashboardFilterField,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import {
  getDefaultOrderDateRange,
  type OrderDatePreset,
} from "@/lib/order-date-range";
import type { WholesaleClaimFilters } from "@/lib/wholesale-claims-page";

type QuickOrderDatePreset = Exclude<OrderDatePreset, "custom">;

export function WholesaleClaimsFiltersPanel({
  filters,
  onChange,
  onClear,
  onExactSearch,
  onExitExactSearch,
  onPreset,
}: {
  filters: WholesaleClaimFilters;
  onChange: (changes: Partial<WholesaleClaimFilters>) => void;
  onClear: () => void;
  onExactSearch: () => void;
  onExitExactSearch: () => void;
  onPreset: (preset: QuickOrderDatePreset) => void;
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_claims_section",
  );
  const frameworkT = useTranslations("OrderListFramework");
  const defaultRange = getDefaultOrderDateRange();
  const resetDisabled =
    filters.searchText === "" &&
    filters.recipientName === "" &&
    filters.searchMode === "date_range" &&
    filters.fromDate === defaultRange.fromDate &&
    filters.toDate === defaultRange.toDate;

  return (
    <DashboardOrderFilterSection
      customInputId="wholesale-claims-date-from"
      dateRange={{ fromDate: filters.fromDate, toDate: filters.toDate }}
      exactOrderNumber={
        filters.searchMode === "exact_all_time"
          ? filters.exactOrderNumber
          : null
      }
      gridClassName="sm:grid-cols-2 xl:grid-cols-4"
      onExitExactSearch={onExitExactSearch}
      onPresetChange={onPreset}
      onReset={onClear}
      resetDisabled={resetDisabled}
    >
      <DashboardFilterField label={uiText("attribute005")}>
        <div className="grid gap-2">
          <input
            className={dashboardFilterInputClassName}
            onChange={(event) => onChange({ searchText: event.target.value })}
            placeholder={uiText("attribute006")}
            type="search"
            value={filters.searchText}
          />
          <Button
            className="min-h-9 rounded-full"
            disabled={!filters.searchText.trim()}
            onClick={onExactSearch}
            type="button"
            variant="outline"
          >
            {frameworkT("exactSearch.action")}
          </Button>
        </div>
      </DashboardFilterField>
      <DashboardFilterField label={uiText("recipientFilterLabel")}>
        <input
          className={dashboardFilterInputClassName}
          onChange={(event) => onChange({ recipientName: event.target.value })}
          placeholder={uiText("recipientFilterPlaceholder")}
          type="search"
          value={filters.recipientName}
        />
      </DashboardFilterField>
      <DashboardFilterField label={uiText("purchaseFromLabel")}>
        <input
          id="wholesale-claims-date-from"
          className={dashboardFilterInputClassName}
          onChange={(event) => {
            const nextDate = event.target.value;
            if (!nextDate) return;
            onChange({
              fromDate: nextDate,
              exactOrderNumber: "",
              searchMode: "date_range",
              ...(filters.toDate < nextDate
                ? { toDate: nextDate }
                : {}),
            });
          }}
          required
          type="date"
          value={filters.fromDate}
        />
      </DashboardFilterField>
      <DashboardFilterField label={uiText("purchaseToLabel")}>
        <input
          className={dashboardFilterInputClassName}
          min={filters.fromDate}
          onChange={(event) => {
            const nextDate = event.target.value;
            if (!nextDate) return;
            onChange({
              exactOrderNumber: "",
              searchMode: "date_range",
              toDate: nextDate,
            });
          }}
          required
          type="date"
          value={filters.toDate}
        />
      </DashboardFilterField>
    </DashboardOrderFilterSection>
  );
}

export function WholesaleClaimsBulkToolbar({
  onClaim,
  onClear,
  selectedCount,
}: {
  onClaim: () => void;
  onClear: () => void;
  selectedCount: number;
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_claims_section",
  );

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-[18px] border border-[#d7e1e8] bg-[#f1f6f8] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold leading-6 text-[#344b5d]">
        {uiText("selectedCount", { count: selectedCount })}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          className="min-h-10 whitespace-normal rounded-full"
          onClick={onClear}
          type="button"
          variant="outline"
        >
          {uiText("clearSelection")}
        </Button>
        <Button
          className="min-h-10 whitespace-normal rounded-full bg-[#486782] text-white hover:bg-[#3e5f79]"
          onClick={onClaim}
          type="button"
        >
          {uiText("bulkClaim")}
        </Button>
      </div>
    </div>
  );
}
