"use client";

import { RefreshCcw } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  DashboardFilterField,
  DashboardFilterPanel,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";

import type { WholesaleClaimFilters } from "./wholesale-claims-view-model";

export function WholesaleClaimsFiltersPanel({
  filters,
  hasActiveFilters,
  onChange,
  onClear,
}: {
  filters: WholesaleClaimFilters;
  hasActiveFilters: boolean;
  onChange: (changes: Partial<WholesaleClaimFilters>) => void;
  onClear: () => void;
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_claims_section",
  );

  return (
    <DashboardFilterPanel
      footer={
        <div className="flex justify-end">
          <Button
            className="min-h-10 whitespace-normal rounded-full border border-[#d8dde2] bg-white text-[#486782] hover:bg-[#eef3f6]"
            disabled={!hasActiveFilters}
            onClick={onClear}
            type="button"
            variant="outline"
          >
            <RefreshCcw className="size-4 shrink-0" />
            {uiText("clearFilters")}
          </Button>
        </div>
      }
      gridClassName="sm:grid-cols-2 xl:grid-cols-4"
    >
      <DashboardFilterField label={uiText("attribute005")}>
        <input
          className={dashboardFilterInputClassName}
          onChange={(event) => onChange({ searchText: event.target.value })}
          placeholder={uiText("attribute006")}
          type="search"
          value={filters.searchText}
        />
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
          className={dashboardFilterInputClassName}
          onChange={(event) => {
            const nextDate = event.target.value;
            onChange({
              purchasedFromDate: nextDate,
              ...(filters.purchasedToDate &&
              nextDate &&
              filters.purchasedToDate < nextDate
                ? { purchasedToDate: nextDate }
                : {}),
            });
          }}
          type="date"
          value={filters.purchasedFromDate}
        />
      </DashboardFilterField>
      <DashboardFilterField label={uiText("purchaseToLabel")}>
        <input
          className={dashboardFilterInputClassName}
          min={filters.purchasedFromDate || undefined}
          onChange={(event) =>
            onChange({ purchasedToDate: event.target.value })
          }
          type="date"
          value={filters.purchasedToDate}
        />
      </DashboardFilterField>
    </DashboardFilterPanel>
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
