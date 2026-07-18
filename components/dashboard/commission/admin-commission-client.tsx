"use client";

import { useTranslations } from "next-intl";

import type { AdminCommissionPageData } from "@/lib/admin-commission";
import {
  DashboardAccessState,
  DashboardPageShell,
} from "@/components/dashboard/dashboard-page-shell";

import {
  AdminCommissionTableSection,
  CommissionBeneficiarySummarySection,
  CommissionFiltersSection,
} from "./admin-commission-sections";
import { AdminCommissionHeader } from "./admin-commission-header";
import { AdminTaskCommissionSection } from "./admin-task-commission-section";
import { CommissionBoardSwitch } from "./commission-board-switch";
import { useAdminCommissionViewModel } from "./use-admin-commission-view-model";

/** 管理端佣金 Client 只负责把 view-model 连接到各业务区块。 */
export function AdminCommissionClient({
  initialData,
}: {
  initialData: AdminCommissionPageData;
}) {
  const t = useTranslations("Commission");
  const viewModel = useAdminCommissionViewModel(initialData);

  return (
    <DashboardPageShell
      feedback={viewModel.pageFeedback}
      header={<AdminCommissionHeader />}
    >
      {!viewModel.hasPermission ? (
        <DashboardAccessState
          description={t("states.noPermissionDescription")}
          kind="permission"
          title={t("states.noPermissionTitle")}
        />
      ) : (
        <>
          <CommissionBoardSwitch
            onChange={viewModel.setActiveBoard}
            options={viewModel.boardOptions}
            value={viewModel.activeBoard}
          />

          {viewModel.activeBoard === "normal" ? (
            <>
              <CommissionFiltersSection
                beneficiaryCount={viewModel.beneficiarySummaries.length}
                beneficiaryOptions={viewModel.beneficiaryOptions}
                categoryOptions={viewModel.categoryOptions}
                filters={viewModel.filters}
                hasActiveFilters={viewModel.hasActiveFilters}
                onFilterChange={viewModel.handleFilterChange}
                onResetFilters={viewModel.resetFilters}
                recordCount={viewModel.filteredCommissions.length}
                settlementOptions={viewModel.settlementOptions}
              />
              <CommissionBeneficiarySummarySection
                onViewAll={viewModel.drillDownToBeneficiary}
                rows={viewModel.beneficiarySummaries}
              />
              <AdminCommissionTableSection
                onFocusOrderNumber={viewModel.focusOrderNumber}
                onMarkAsPaid={viewModel.handleMarkCommissionAsPaid}
                pagination={viewModel.commissionsPagination}
                rows={viewModel.filteredCommissions}
                settlingCommissionId={viewModel.settlingCommissionId}
              />
            </>
          ) : (
            <AdminTaskCommissionSection
              onMarkAsPaid={viewModel.handleMarkTaskCommissionAsPaid}
              rows={viewModel.taskCommissions}
              settlingTaskCommissionId={viewModel.settlingTaskCommissionId}
            />
          )}
        </>
      )}
    </DashboardPageShell>
  );
}
