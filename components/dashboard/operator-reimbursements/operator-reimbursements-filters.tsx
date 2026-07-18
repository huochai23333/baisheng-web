"use client";

import { Select } from "@/components/ui/select";

import type {
  OperatorReimbursementPeriod,
  OperatorReimbursementStatus,
} from "@/lib/operator-reimbursements";

import {
  DashboardFilterField,
  DashboardSearchInput,
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
        ariaLabel={copy.searchPlaceholder}
        onChange={onSearchQueryChange}
        placeholder={copy.searchPlaceholder}
        value={searchQuery}
      />

      <DashboardFilterField label={copy.periodLabel}>
        <Select
          onValueChange={onPeriodFilterChange}
          options={[
            { label: copy.allPeriods, value: "all" },
            // 周期选项来自已存在的记录；没有记录的周期不展示，避免用户选到空月份。
            ...periodOptions.map((period) => ({
              label: formatOperatorReimbursementPeriod(period, locale),
              value: period.start,
            })),
          ]}
          value={periodFilter}
        />
      </DashboardFilterField>

      <DashboardFilterField label={copy.statusLabel}>
        <Select
          onValueChange={onStatusFilterChange}
          options={[
            { label: copy.allStatuses, value: "all" },
            {
              label: copy.statusOptions.unreimbursed,
              value: "unreimbursed",
            },
            { label: copy.statusOptions.reimbursed, value: "reimbursed" },
          ]}
          value={statusFilter}
        />
      </DashboardFilterField>
    </DashboardResourceFilterSection>
  );
}
