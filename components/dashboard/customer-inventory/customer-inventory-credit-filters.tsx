"use client";

import { useTranslations } from "next-intl";

import {
  DashboardFilterField,
  DashboardSearchInput,
} from "@/components/dashboard/dashboard-section-panel";
import { DashboardResourceFilterSection } from "@/components/dashboard/dashboard-resource-filter-section";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import type { CustomerInventoryPageData } from "@/lib/customer-inventory-types";

import type { InventoryCreditFilters } from "./use-customer-inventory-credit-filters";

export function CustomerInventoryCreditFilters({
  activeFilterCount,
  data,
  filters,
  isClient,
  onClear,
  onFilterChange,
  visibleCount,
}: {
  activeFilterCount: number;
  data: CustomerInventoryPageData;
  filters: InventoryCreditFilters;
  isClient: boolean;
  onClear: () => void;
  onFilterChange: <Key extends keyof InventoryCreditFilters>(
    key: Key,
    value: InventoryCreditFilters[Key],
  ) => void;
  visibleCount: number;
}) {
  const t = useTranslations("CustomerInventory");

  return (
    <div className="mb-4" data-testid="customer-inventory-credit-filters">
      <DashboardResourceFilterSection
        activeFilterCount={activeFilterCount}
        gridClassName="sm:grid-cols-2 xl:grid-cols-4"
        onReset={onClear}
        primary={
          <DashboardFilterField label={t("filters.keyword")}>
            <DashboardSearchInput
              onChange={(value) => onFilterChange("keyword", value)}
              placeholder={t("filters.creditKeywordPlaceholder")}
              value={filters.keyword}
            />
          </DashboardFilterField>
        }
        resetDisabled={activeFilterCount === 0}
        resetLabel={t("filters.clear")}
        summary={t("filters.resultCount", {
          total: data.credits.length,
          visible: visibleCount,
        })}
      >
        {!isClient ? (
          <DashboardFilterField label={t("fields.customer")}>
            <Select
              onValueChange={(value) => onFilterChange("customerId", value)}
              options={[
                { label: t("filters.allCustomers"), value: "all" },
                ...data.customers.map((customer) => ({
                  label: customer.unique_name,
                  value: customer.id,
                })),
              ]}
              value={filters.customerId}
            />
          </DashboardFilterField>
        ) : null}
        <DashboardFilterField label={t("filters.creditTier")}>
          <Select
            onValueChange={(value) =>
              onFilterChange("tier", value as InventoryCreditFilters["tier"])
            }
            options={[
              { label: t("filters.allTiers"), value: "all" },
              {
                label: t("tiers.fixed_200_usd"),
                value: "fixed_200_usd",
              },
              {
                label: t("tiers.single_order_50"),
                value: "single_order_50",
              },
              { label: t("tiers.all_orders_5"), value: "all_orders_5" },
            ]}
            value={filters.tier}
          />
        </DashboardFilterField>
        <DashboardFilterField label={t("filters.creditStatus")}>
          <Select
            onValueChange={(value) =>
              onFilterChange(
                "status",
                value as InventoryCreditFilters["status"],
              )
            }
            options={[
              { label: t("filters.allStatuses"), value: "all" },
              { label: t("creditStatus.pending"), value: "pending" },
              { label: t("creditStatus.active"), value: "active" },
              { label: t("creditStatus.rejected"), value: "rejected" },
              { label: t("creditStatus.repaid"), value: "repaid" },
            ]}
            value={filters.status}
          />
        </DashboardFilterField>
        <DashboardFilterField label={t("filters.dueState")}>
          <Select
            onValueChange={(value) =>
              onFilterChange(
                "dueState",
                value as InventoryCreditFilters["dueState"],
              )
            }
            options={[
              { label: t("filters.allDueStates"), value: "all" },
              {
                label: t("dueStates.more_than_7_days"),
                value: "more_than_7_days",
              },
              {
                label: t("dueStates.due_within_7_days"),
                value: "due_within_7_days",
              },
              { label: t("dueStates.due_today"), value: "due_today" },
              { label: t("dueStates.overdue"), value: "overdue" },
              { label: t("dueStates.not_started"), value: "not_started" },
              { label: t("dueStates.repaid"), value: "repaid" },
            ]}
            value={filters.dueState}
          />
        </DashboardFilterField>
        <DashboardFilterField label={t("filters.applicationFromDate")}>
          <DatePicker
            max={filters.toDate || undefined}
            onValueChange={(value) => onFilterChange("fromDate", value)}
            value={filters.fromDate}
          />
        </DashboardFilterField>
        <DashboardFilterField label={t("filters.applicationToDate")}>
          <DatePicker
            min={filters.fromDate || undefined}
            onValueChange={(value) => onFilterChange("toDate", value)}
            value={filters.toDate}
          />
        </DashboardFilterField>
      </DashboardResourceFilterSection>
    </div>
  );
}
