"use client";

import { RefreshCcw, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  DashboardFilterField,
  DashboardFilterPanel,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
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
  profiles,
  storeOptions,
}: {
  filters: WholesaleLogisticsFilters;
  onChange: (changes: Partial<WholesaleLogisticsFilters>) => void;
  onClear: () => void;
  profiles: WholesaleProfile[];
  storeOptions: WholesaleLogisticsStoreOption[];
}) {
  const t = useTranslations("WholesaleBusiness.logisticsArchive");
  const salesProfiles = getActiveSalesProfiles(profiles);

  return (
    <DashboardFilterPanel
      footer={
        <div className="flex justify-end">
          <Button
            className="min-h-10 whitespace-normal rounded-full"
            onClick={onClear}
            type="button"
            variant="outline"
          >
            <RefreshCcw className="size-4 shrink-0" />
            {t("filters.clear")}
          </Button>
        </div>
      }
      gridClassName="sm:grid-cols-2 xl:grid-cols-6"
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
          className={dashboardFilterInputClassName}
          onChange={(event) => onChange({ fromDate: event.currentTarget.value })}
          type="date"
          value={filters.fromDate}
        />
      </DashboardFilterField>

      <DashboardFilterField label={t("filters.toDate")}>
        <input
          className={dashboardFilterInputClassName}
          onChange={(event) => onChange({ toDate: event.currentTarget.value })}
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
        <label className="relative block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8a949c]" />
          <input
            className={`${dashboardFilterInputClassName} pl-10`}
            onChange={(event) => onChange({ searchText: event.currentTarget.value })}
            placeholder={t("filters.searchPlaceholder")}
            type="search"
            value={filters.searchText}
          />
        </label>
      </DashboardFilterField>
    </DashboardFilterPanel>
  );
}
