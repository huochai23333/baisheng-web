"use client";

import { Search } from "lucide-react";

import {
  companyExpenseCategoryValues,
  type CompanyExpenseCategory,
} from "@/lib/company-expenses";
import { DashboardResourceFilterSection } from "../dashboard-resource-filter-section";
import {
  DashboardFilterField,
  DashboardSearchInput,
  dashboardFilterInputClassName,
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
        icon={<Search className="size-4 text-[#7c8a96]" />}
        onChange={onSearchQueryChange}
        placeholder={copy.searchPlaceholder}
        value={searchQuery}
      />
      <DashboardFilterField label={copy.monthLabel}>
        <select
          className={dashboardFilterInputClassName}
          onChange={(event) => onMonthFilterChange(event.target.value)}
          value={monthFilter}
        >
          <option value="all">{copy.allMonths}</option>
          {monthOptions.map((month) => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </DashboardFilterField>
      <DashboardFilterField label={copy.categoryLabel}>
        <select
          className={dashboardFilterInputClassName}
          onChange={(event) =>
            onCategoryFilterChange(event.target.value as CompanyExpenseCategory | "all")
          }
          value={categoryFilter}
        >
          <option value="all">{copy.allCategories}</option>
          {companyExpenseCategoryValues.map((category) => (
            <option key={category} value={category}>{copy.categoryOptions[category]}</option>
          ))}
        </select>
      </DashboardFilterField>
      <DashboardFilterField label={copy.currencyLabel}>
        <select
          className={dashboardFilterInputClassName}
          onChange={(event) => onCurrencyFilterChange(event.target.value)}
          value={currencyFilter}
        >
          <option value="all">{copy.allCurrencies}</option>
          {currencyOptions.map((currencyCode) => (
            <option key={currencyCode} value={currencyCode}>{currencyCode}</option>
          ))}
        </select>
      </DashboardFilterField>
    </DashboardResourceFilterSection>
  );
}
