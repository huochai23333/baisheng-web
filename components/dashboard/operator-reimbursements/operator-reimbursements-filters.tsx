"use client";

import { Search } from "lucide-react";

import type {
  OperatorReimbursementPeriod,
  OperatorReimbursementStatus,
} from "@/lib/operator-reimbursements";

import {
  DashboardFilterField,
  DashboardSearchInput,
  dashboardFilterInputClassName,
} from "../dashboard-section-panel";
import { DashboardResourceFilterSection } from "../dashboard-resource-filter-section";
import { formatOperatorReimbursementPeriod } from "./operator-reimbursements-display";

type OperatorReimbursementsFilterSectionProps = {
  copy: {
    allPeriods: string;
    allStatuses: string;
    periodLabel: string;
    searchPlaceholder: string;
    statusLabel: string;
    statusOptions: Record<OperatorReimbursementStatus, string>;
  };
  locale: string;
  onPeriodFilterChange: (value: string) => void;
  onReset: () => void;
  onSearchQueryChange: (value: string) => void;
  onStatusFilterChange: (value: OperatorReimbursementStatus | "all") => void;
  periodFilter: string;
  periodOptions: OperatorReimbursementPeriod[];
  searchQuery: string;
  statusFilter: OperatorReimbursementStatus | "all";
};

export function OperatorReimbursementsFilterSection({
  copy,
  locale,
  onPeriodFilterChange,
  onReset,
  onSearchQueryChange,
  onStatusFilterChange,
  periodFilter,
  periodOptions,
  searchQuery,
  statusFilter,
}: OperatorReimbursementsFilterSectionProps) {
  return (
    <DashboardResourceFilterSection
      gridClassName="lg:grid-cols-[1.4fr_repeat(2,minmax(0,0.8fr))]"
      onReset={onReset}
      resetDisabled={
        !searchQuery && periodFilter === "all" && statusFilter === "all"
      }
    >
      <DashboardSearchInput
        icon={<Search className="size-4 text-[#7c8a96]" />}
        onChange={onSearchQueryChange}
        placeholder={copy.searchPlaceholder}
        value={searchQuery}
      />

      <DashboardFilterField label={copy.periodLabel}>
        <select
          className={dashboardFilterInputClassName}
          onChange={(event) => onPeriodFilterChange(event.target.value)}
          value={periodFilter}
        >
          <option value="all">{copy.allPeriods}</option>
          {/* 周期选项来自已存在的记录；没有记录的周期不展示，避免用户选到空月份。 */}
          {periodOptions.map((period) => (
            <option key={period.start} value={period.start}>
              {formatOperatorReimbursementPeriod(period, locale)}
            </option>
          ))}
        </select>
      </DashboardFilterField>

      <DashboardFilterField label={copy.statusLabel}>
        <select
          className={dashboardFilterInputClassName}
          onChange={(event) =>
            onStatusFilterChange(
              event.target.value as OperatorReimbursementStatus | "all",
            )
          }
          value={statusFilter}
        >
          <option value="all">{copy.allStatuses}</option>
          <option value="unreimbursed">
            {copy.statusOptions.unreimbursed}
          </option>
          <option value="reimbursed">{copy.statusOptions.reimbursed}</option>
        </select>
      </DashboardFilterField>
    </DashboardResourceFilterSection>
  );
}
