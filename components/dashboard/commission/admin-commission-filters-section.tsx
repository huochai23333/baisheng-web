"use client";

import * as FormControls from "@/components/ui/form-controls";

import { useTranslations } from "next-intl";
import { RefreshCcw, Search } from "lucide-react";

import {
  DashboardFilterField,
  DashboardListSection,
} from "@/components/dashboard/dashboard-section-panel";
import { Button } from "@/components/ui/button";
import { Select, type SelectOption } from "@/components/ui/select";

import type {
  BeneficiarySummaryRow,
  CategoryFilter,
  CommissionFilterOption,
  CommissionFilters,
  SettlementFilter,
} from "./admin-commission-view-model";

export function CommissionFiltersSection({
  beneficiaryCount,
  beneficiaryOptions,
  categoryOptions,
  filters,
  hasActiveFilters,
  onFilterChange,
  onResetFilters,
  recordCount,
  settlementOptions,
}: {
  beneficiaryCount: number;
  beneficiaryOptions: BeneficiarySummaryRow[];
  categoryOptions: readonly CommissionFilterOption<CategoryFilter>[];
  filters: CommissionFilters;
  hasActiveFilters: boolean;
  onFilterChange: <Key extends keyof CommissionFilters>(
    key: Key,
    value: CommissionFilters[Key],
  ) => void;
  onResetFilters: () => void;
  recordCount: number;
  settlementOptions: readonly CommissionFilterOption<SettlementFilter>[];
}) {
  const t = useTranslations("Commission");

  return (
    <DashboardListSection
      actions={
        <Button
          size="default"
          onClick={onResetFilters}
          type="button"
          variant="outline"
        >
          <RefreshCcw className="size-4" />
          {t("filters.reset")}
        </Button>
      }
      bodyClassName="space-y-5"
      description={t("filters.description", {
        beneficiaries: beneficiaryCount,
        records: recordCount,
      })}
      title={t("filters.title")}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SearchField
          label={t("filters.keywordLabel")}
          onChange={(value) => onFilterChange("searchText", value)}
          placeholder={t("filters.keywordPlaceholder")}
          value={filters.searchText}
        />
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
          onChange={(value) =>
            onFilterChange("category", value as CategoryFilter)
          }
          options={categoryOptions}
          value={filters.category}
        />
      </div>
      {hasActiveFilters ? (
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
      ) : null}
    </DashboardListSection>
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
      <div className="flex items-center gap-3 rounded-record-card border border-border bg-surface-interactive px-4 shadow-surface-interactive">
        <Search className="size-4 text-content-muted" />
        <FormControls.Input
          className="h-12 w-full bg-transparent text-sm text-content-strong outline-none placeholder:text-content-subtle"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type="text"
          value={value}
        />
      </div>
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
