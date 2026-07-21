"use client";

import * as FormControls from "@/components/ui/form-controls";

import { useTranslations } from "next-intl";

import { DashboardResourceFilterSection } from "@/components/dashboard/dashboard-resource-filter-section";
import {
  DashboardFilterField,
  DashboardSearchInput,
} from "@/components/dashboard/dashboard-section-panel";
import { Select, type SelectOption } from "@/components/ui/select";

import type {
  BeneficiarySummaryRow,
  CategoryFilter,
  CommissionFilterOption,
  CommissionFilters,
  SettlementFilter,
} from "./admin-commission-view-model";

export function CommissionFiltersSection({
  beneficiaryOptions,
  categoryOptions,
  filters,
  hasActiveFilters,
  onFilterChange,
  onResetFilters,
  settlementOptions,
}: {
  beneficiaryOptions: BeneficiarySummaryRow[];
  categoryOptions: readonly CommissionFilterOption<CategoryFilter>[];
  filters: CommissionFilters;
  hasActiveFilters: boolean;
  onFilterChange: <Key extends keyof CommissionFilters>(
    key: Key,
    value: CommissionFilters[Key],
  ) => void;
  onResetFilters: () => void;
  settlementOptions: readonly CommissionFilterOption<SettlementFilter>[];
}) {
  const t = useTranslations("Commission");
  // 这里逐项计算启用数量，移动端就能直接告诉用户当前有多少条件正在生效。
  // 布尔值数组最后只保留 true，因此得到的长度就是已启用筛选项的数量。
  const activeFilterCount = [
    Boolean(filters.searchText.trim()),
    Boolean(filters.beneficiaryUserId),
    Boolean(filters.orderNumber.trim()),
    filters.settlementStatus !== "all",
    filters.category !== "all",
  ].filter(Boolean).length;

  return (
    <DashboardResourceFilterSection
      activeFilterCount={activeFilterCount}
      footer={
        hasActiveFilters ? (
          <div className="flex flex-wrap gap-2 text-sm text-content-muted">
            <ActiveFilterChip
              active={Boolean(filters.beneficiaryUserId)}
              label={
                filters.beneficiaryUserId
                  ? `${t("chips.beneficiaryPrefix")}${
                      beneficiaryOptions.find(
                        (item) => item.userId === filters.beneficiaryUserId,
                      )?.label ?? t("chips.selected")
                    }`
                  : ""
              }
            />
            <ActiveFilterChip
              active={Boolean(filters.orderNumber)}
              label={
                filters.orderNumber
                  ? `${t("chips.orderNumberPrefix")}${filters.orderNumber}`
                  : ""
              }
            />
            <ActiveFilterChip
              active={filters.settlementStatus !== "all"}
              label={
                filters.settlementStatus !== "all"
                  ? `${t("chips.settlementPrefix")}${
                      settlementOptions.find(
                        (item) => item.value === filters.settlementStatus,
                      )?.label ?? filters.settlementStatus
                    }`
                  : ""
              }
            />
            <ActiveFilterChip
              active={filters.category !== "all"}
              label={
                filters.category !== "all"
                  ? `${t("chips.categoryPrefix")}${
                      categoryOptions.find(
                        (item) => item.value === filters.category,
                      )?.label ?? filters.category
                    }`
                  : ""
              }
            />
          </div>
        ) : undefined
      }
      gridClassName="md:grid-cols-2 xl:grid-cols-4"
      onReset={onResetFilters}
      primary={
        <DashboardSearchInput
          ariaLabel={t("filters.keywordLabel")}
          onChange={(value) => onFilterChange("searchText", value)}
          placeholder={t("filters.keywordPlaceholder")}
          value={filters.searchText}
        />
      }
      resetDisabled={!hasActiveFilters}
      resetLabel={t("filters.reset")}
    >
      <SelectField
        label={t("filters.beneficiaryLabel")}
        onChange={(value) => onFilterChange("beneficiaryUserId", value)}
        options={[
          { label: t("filters.allBeneficiaries"), value: "" },
          ...beneficiaryOptions.map((beneficiary) => ({
            label: beneficiary.label,
            value: beneficiary.userId,
          })),
        ]}
        value={filters.beneficiaryUserId}
      />
      <SearchField
        label={t("filters.orderNumberLabel")}
        onChange={(value) => onFilterChange("orderNumber", value)}
        placeholder={t("filters.orderNumberPlaceholder")}
        value={filters.orderNumber}
      />
      <SelectField
        label={t("filters.settlementStatusLabel")}
        onChange={(value) =>
          onFilterChange("settlementStatus", value as SettlementFilter)
        }
        options={settlementOptions}
        value={filters.settlementStatus}
      />
      <SelectField
        label={t("filters.categoryLabel")}
        onChange={(value) => onFilterChange("category", value as CategoryFilter)}
        options={categoryOptions}
        value={filters.category}
      />
    </DashboardResourceFilterSection>
  );
}

function SearchField({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <DashboardFilterField label={label}>
      <FormControls.Input
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </DashboardFilterField>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  value: string;
}) {
  return (
    <DashboardFilterField label={label}>
      <Select
        aria-label={label}
        onValueChange={onChange}
        options={options}
        value={value}
      />
    </DashboardFilterField>
  );
}

function ActiveFilterChip({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) {
  if (!active) {
    return null;
  }

  return (
    <span className="inline-flex items-center rounded-full bg-surface-inset px-3 py-1 text-xs font-medium text-primary">
      {label}
    </span>
  );
}
