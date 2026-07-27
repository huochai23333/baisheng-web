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

import type { InventoryOrderFilters } from "./use-customer-inventory-order-filters";

export function CustomerInventoryOrderFilters({
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
  filters: InventoryOrderFilters;
  isClient: boolean;
  onClear: () => void;
  onFilterChange: <Key extends keyof InventoryOrderFilters>(
    key: Key,
    value: InventoryOrderFilters[Key],
  ) => void;
  visibleCount: number;
}) {
  const t = useTranslations("CustomerInventory");
  const currencyOptions = Array.from(
    new Set(data.orders.map((order) => order.currency)),
  )
    .sort()
    .map((currency) => ({ label: currency, value: currency }));

  return (
    <div className="mb-4" data-testid="customer-inventory-order-filters">
      <DashboardResourceFilterSection
        activeFilterCount={activeFilterCount}
        gridClassName="sm:grid-cols-2 xl:grid-cols-4"
        onReset={onClear}
        primary={
          <DashboardFilterField label={t("filters.keyword")}>
            <DashboardSearchInput
              onChange={(value) => onFilterChange("keyword", value)}
              placeholder={t("filters.orderKeywordPlaceholder")}
              value={filters.keyword}
            />
          </DashboardFilterField>
        }
        resetDisabled={activeFilterCount === 0}
        resetLabel={t("filters.clear")}
        summary={t("filters.resultCount", {
          total: data.orders.length,
          visible: visibleCount,
        })}
      >
        {!isClient ? (
          <>
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
            <DashboardFilterField label={t("fields.salesman")}>
              <Select
                onValueChange={(value) => onFilterChange("salesUserId", value)}
                options={[
                  { label: t("filters.allSalesmen"), value: "all" },
                  ...data.profiles
                    .filter((profile) =>
                      ["administrator", "salesman"].includes(
                        profile.role ?? "",
                      ),
                    )
                    .map((profile) => ({
                      label: profile.name ?? profile.email ?? profile.user_id,
                      value: profile.user_id,
                    })),
                ]}
                value={filters.salesUserId}
              />
            </DashboardFilterField>
          </>
        ) : null}
        <DashboardFilterField label={t("fields.status")}>
          <Select
            onValueChange={(value) =>
              onFilterChange(
                "paymentStatus",
                value as InventoryOrderFilters["paymentStatus"],
              )
            }
            options={[
              { label: t("filters.allStatuses"), value: "all" },
              {
                label: t("paymentStatus.awaiting_payment"),
                value: "awaiting_payment",
              },
              { label: t("paymentStatus.paid"), value: "paid" },
              { label: t("paymentStatus.cancelled"), value: "cancelled" },
            ]}
            value={filters.paymentStatus}
          />
        </DashboardFilterField>
        <DashboardFilterField label={t("fields.currency")}>
          <Select
            onValueChange={(value) => onFilterChange("currency", value)}
            options={[
              { label: t("filters.allCurrencies"), value: "all" },
              ...currencyOptions,
            ]}
            value={filters.currency}
          />
        </DashboardFilterField>
        <DashboardFilterField label={t("filters.fromDate")}>
          <DatePicker
            max={filters.toDate || undefined}
            onValueChange={(value) => onFilterChange("fromDate", value)}
            value={filters.fromDate}
          />
        </DashboardFilterField>
        <DashboardFilterField label={t("filters.toDate")}>
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
