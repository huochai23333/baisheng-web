"use client";

import * as FormControls from "@/components/ui/form-controls";

import { useTranslations } from "next-intl";

import { DashboardOrderFilterSection } from "@/components/dashboard/dashboard-order-filter-section";
import {
  DashboardFilterField,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
      activeFilterCount={[
        Boolean(filters.searchText),
        Boolean(filters.recipientName),
        filters.fromDate !== defaultRange.fromDate ||
          filters.toDate !== defaultRange.toDate,
        filters.searchMode !== "date_range",
      ].filter(Boolean).length}
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
      primary={
        <DashboardFilterField label={uiText("attribute005")}>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <FormControls.Input
              className={dashboardFilterInputClassName}
              onChange={(event) => onChange({ searchText: event.target.value })}
              placeholder={uiText("attribute006")}
              type="search"
              value={filters.searchText}
            />
            <Button
              disabled={!filters.searchText.trim()}
              onClick={onExactSearch}
              type="button"
              variant="outline"
              size="compact"
            >
              {frameworkT("exactSearch.action")}
            </Button>
          </div>
        </DashboardFilterField>
      }
      resetDisabled={resetDisabled}
    >
      <DashboardFilterField label={uiText("recipientFilterLabel")}>
        <FormControls.Input
          className={dashboardFilterInputClassName}
          onChange={(event) => onChange({ recipientName: event.target.value })}
          placeholder={uiText("recipientFilterPlaceholder")}
          type="search"
          value={filters.recipientName}
        />
      </DashboardFilterField>
      <DashboardFilterField
        controlId="wholesale-claims-date-from"
        label={uiText("purchaseFromLabel")}
      >
        <DatePicker
          onValueChange={(nextDate) => {
            if (!nextDate) return;
            onChange({
              fromDate: nextDate,
              exactOrderNumber: "",
              searchMode: "date_range",
              ...(filters.toDate < nextDate ? { toDate: nextDate } : {}),
            });
          }}
          required
          value={filters.fromDate}
        />
      </DashboardFilterField>
      <DashboardFilterField label={uiText("purchaseToLabel")}>
        <DatePicker
          min={filters.fromDate}
          onValueChange={(nextDate) => {
            if (!nextDate) return;
            onChange({
              exactOrderNumber: "",
              searchMode: "date_range",
              toDate: nextDate,
            });
          }}
          required
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
    <div className="mt-4 flex flex-col gap-3 rounded-record-card border border-border-subtle bg-surface-inset px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold leading-6 text-content-muted">
        {uiText("selectedCount", { count: selectedCount })}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={onClear}
          type="button"
          variant="outline"
          size="compact"
          wrap
        >
          {uiText("clearSelection")}
        </Button>
        <Button
          variant="primary"
          size="default"
          onClick={onClaim}
          type="button"
          wrap
        >
          {uiText("bulkClaim")}
        </Button>
      </div>
    </div>
  );
}
