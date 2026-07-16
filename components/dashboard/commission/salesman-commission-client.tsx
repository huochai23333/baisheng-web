"use client";

import { useTranslations } from "next-intl";

import {
  DashboardAccessState,
  DashboardPageShell,
} from "@/components/dashboard/dashboard-page-shell";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import type { SalesmanCommissionPageData } from "@/lib/salesman-commission";

import { CommissionBoardSwitch } from "./commission-board-switch";
import { SalesmanCommissionRecordsSection } from "./salesman-commission-records-section";
import { SalesmanTaskCommissionSection } from "./salesman-task-commission-section";
import { useSalesmanCommissionViewModel } from "./use-salesman-commission-view-model";

/** 业务员佣金 Client 只负责组装页头、访问状态与两个佣金看板。 */
export function SalesmanCommissionClient({
  initialData,
}: {
  initialData: SalesmanCommissionPageData;
}) {
  const t = useTranslations("Commission");
  const viewModel = useSalesmanCommissionViewModel(initialData);

  return (
    <DashboardPageShell
      feedback={viewModel.pageFeedback}
      header={
        <DashboardSectionHeader
          badge={t("salesman.header.badge")}
          description={t("salesman.header.description")}
          title={t("salesman.header.title")}
        />
      }
    >
      {!viewModel.hasPermission ? (
        <DashboardAccessState
          description={t("salesman.states.noPermissionDescription")}
          kind="permission"
          title={t("salesman.states.noPermissionTitle")}
        />
      ) : (
        <>
          <CommissionBoardSwitch
            onChange={viewModel.setActiveBoard}
            options={viewModel.boardOptions}
            value={viewModel.activeBoard}
          />
          {viewModel.activeBoard === "normal" ? (
            <SalesmanCommissionRecordsSection
              commissions={viewModel.commissions}
              pagination={viewModel.commissionsPagination}
            />
          ) : (
            <SalesmanTaskCommissionSection rows={viewModel.taskCommissions} />
          )}
        </>
      )}
    </DashboardPageShell>
  );
}
