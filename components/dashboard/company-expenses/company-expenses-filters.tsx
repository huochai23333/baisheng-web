"use client";

import { Select } from "@/components/ui/select";

import {
  companyExpenseCategoryValues,
  type CompanyExpenseCategory,
} from "@/lib/company-expenses";
import { DashboardResourceFilterSection } from "../dashboard-resource-filter-section";
import {
  DashboardFilterField,
  DashboardSearchInput,
} from "../dashboard-section-panel";

type CompanyExpensesFilterSectionProps = {
  categoryFilter: CompanyExpenseCategory | "all";
  copy: {
    allCategories: string;
    allCurrencies: string;
    allMonths: string;
    categoryLabel: string;
    categoryOptions: Record<CompanyExpenseCategory, string>;
    currencyLabel: string;
    monthLabel: string;
    searchPlaceholder: string;
  };
  currencyFilter: string;
  currencyOptions: string[];
  monthFilter: string;
  monthOptions: string[];
  onCategoryFilterChange: (value: CompanyExpenseCategory | "all") => void;
  onCurrencyFilterChange: (value: string) => void;
  onMonthFilterChange: (value: string) => void;
  onReset: () => void;
  onSearchQueryChange: (value: string) => void;
  searchQuery: string;
};

/** 筛选区只把用户输入交给 view-model，恢复逻辑也由 view-model 统一提供。 */
export function CompanyExpensesFilterSection({
  categoryFilter,
  copy,
  currencyFilter,
  currencyOptions,
  monthFilter,
  monthOptions,
  onCategoryFilterChange,
  onCurrencyFilterChange,
  onMonthFilterChange,
  onReset,
  onSearchQueryChange,
  searchQuery,
}: CompanyExpensesFilterSectionProps) {
  return (
    <DashboardResourceFilterSection
      gridClassName="lg:grid-cols-[1.2fr_repeat(3,minmax(0,0.8fr))]"
      onReset={onReset}
      resetDisabled={
        !searchQuery &&
        monthFilter === "all" &&
        categoryFilter === "all" &&
        currencyFilter === "all"
      }
    >
      <DashboardSearchInput
        ariaLabel={copy.searchPlaceholder}
        onChange={onSearchQueryChange}
        placeholder={copy.searchPlaceholder}
        value={searchQuery}
      />
      <DashboardFilterField label={copy.monthLabel}>
        <Select
          onValueChange={onMonthFilterChange}
          options={[
            { label: copy.allMonths, value: "all" },
            ...monthOptions.map((month) => ({ label: month, value: month })),
          ]}
          value={monthFilter}
        />
      </DashboardFilterField>
      <DashboardFilterField label={copy.categoryLabel}>
        <Select
          onValueChange={onCategoryFilterChange}
          options={[
            { label: copy.allCategories, value: "all" },
            ...companyExpenseCategoryValues.map((category) => ({
              label: copy.categoryOptions[category],
              value: category,
            })),
          ]}
          value={categoryFilter}
        />
      </DashboardFilterField>
      <DashboardFilterField label={copy.currencyLabel}>
        <Select
          onValueChange={onCurrencyFilterChange}
          options={[
            { label: copy.allCurrencies, value: "all" },
            ...currencyOptions.map((currencyCode) => ({
              label: currencyCode,
              value: currencyCode,
            })),
          ]}
          value={currencyFilter}
        />
      </DashboardFilterField>
    </DashboardResourceFilterSection>
  );
}
