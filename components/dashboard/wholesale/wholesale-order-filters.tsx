"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { RefreshCcw } from "lucide-react";
import {
  DashboardFilterField,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import type { WholesaleCustomer, WholesaleProfile } from "@/lib/wholesale";
import type { WholesaleOrderFilters } from "@/lib/wholesale-order-page";
type WholesaleOrderFiltersProps = {
  customers: WholesaleCustomer[];
  filters: WholesaleOrderFilters;
  hasActiveFilters: boolean;
  onClear: () => void;
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
  onUpdate,
  salesAccounts,
}: WholesaleOrderFiltersProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_order_filters",
  );
  return (
    <section className="rounded-[24px] border border-[#e7e2db] bg-white/90 p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#253640]">
            <UiMessage id="components_dashboard_wholesale_wholesale_order_filters.text001" />
          </h2>
          <p className="mt-1 text-sm text-[#71808d]">
            <UiMessage id="components_dashboard_wholesale_wholesale_order_filters.text002" />
          </p>
        </div>
        <Button
          className="rounded-full border border-[#d8dde2] bg-white text-[#486782] hover:bg-[#eef3f6]"
          disabled={!hasActiveFilters}
          onClick={onClear}
          type="button"
          variant="outline"
        >
          <RefreshCcw className="size-4" />
          <UiMessage id="components_dashboard_wholesale_wholesale_order_filters.text003" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardFilterField label={uiText("attribute001")}>
          <input
            className={dashboardFilterInputClassName}
            onChange={(event) => onUpdate("searchText", event.target.value)}
            placeholder={uiText("attribute002")}
            type="search"
            value={filters.searchText}
          />
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
            type="date"
            value={filters.orderedFromDate}
          />
        </DashboardFilterField>
        <DashboardFilterField label={uiText("attribute007")}>
          <input
            className={dashboardFilterInputClassName}
            min={filters.orderedFromDate || undefined}
            onChange={(event) => onUpdate("orderedToDate", event.target.value)}
            type="date"
            value={filters.orderedToDate}
          />
        </DashboardFilterField>
      </div>
    </section>
  );
}
