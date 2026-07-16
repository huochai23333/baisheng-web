"use client";

import type { ReactNode } from "react";
import { ReceiptText } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardPaginationFooter } from "@/components/dashboard/dashboard-collection-section";
import {
  DashboardListSection,
  DashboardTableFrame,
} from "@/components/dashboard/dashboard-section-panel";
import {
  EmptyState,
  formatDateTime,
} from "@/components/dashboard/dashboard-shared-ui";
import { useLocale } from "@/components/i18n/locale-provider";
import type {
  AdminCommissionRow,
  CommissionSettlementStatus,
} from "@/lib/admin-commission";
import type { useDashboardPagination } from "@/lib/use-dashboard-pagination";
import { cn } from "@/lib/utils";

import {
  formatCommissionMoney,
  getCommissionCategoryLabel,
  getCommissionOrderStatusLabel,
  getCommissionOriginText,
  getCommissionSettlementStatusLabel,
} from "./commission-display";

type CommissionPagination = ReturnType<typeof useDashboardPagination<AdminCommissionRow>>;

/** 普通佣金记录的表格和空状态单独成区块，页面 Client 不直接渲染行数据。 */
export function SalesmanCommissionRecordsSection({
  commissions,
  pagination,
}: {
  commissions: AdminCommissionRow[];
  pagination: CommissionPagination;
}) {
  const t = useTranslations("Commission");
  const { locale } = useLocale();

  if (commissions.length === 0) {
    return (
      <DashboardListSection>
        <EmptyState
          description={t("salesman.states.emptyDescription")}
          icon={<ReceiptText className="size-6" />}
          title={t("salesman.states.emptyTitle")}
        />
      </DashboardListSection>
    );
  }

  return (
    <DashboardListSection
      description={t("salesman.table.description")}
      title={t("salesman.table.title")}
    >
      <DashboardTableFrame
        footer={
          <DashboardPaginationFooter
            endIndex={pagination.endIndex}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
            onNextPage={pagination.goToNextPage}
            onPreviousPage={pagination.goToPreviousPage}
            page={pagination.page}
            pageCount={pagination.pageCount}
            startIndex={pagination.startIndex}
            totalItems={pagination.totalItems}
          />
        }
      >
        <table className="w-full min-w-[980px] divide-y divide-[#e6e2db] text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold tracking-[0.16em] text-[#8b959c] uppercase">
              <th className="px-4 py-3">{t("salesman.table.columns.origin")}</th>
              <th className="px-4 py-3">{t("salesman.table.columns.orderCustomer")}</th>
              <th className="px-4 py-3">{t("salesman.table.columns.category")}</th>
              <th className="px-4 py-3">{t("salesman.table.columns.amount")}</th>
              <th className="px-4 py-3">{t("salesman.table.columns.settlement")}</th>
              <th className="px-4 py-3">{t("salesman.table.columns.time")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#efebe5]">
            {pagination.items.map((commission) => (
              <tr
                className="align-top transition-colors hover:bg-[#f7f7f5]"
                key={commission.id}
              >
                <td className="px-4 py-4">
                  <div className="max-w-sm text-sm leading-7 text-[#22313a]">
                    {getCommissionOriginText(commission, t)}
                  </div>
                  {commission.settlementNote ? (
                    <p className="mt-2 max-w-sm text-xs leading-6 text-[#79848d]">
                      {t("shared.note", { note: commission.settlementNote })}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-4">
                  <DetailLine label={t("shared.fields.orderNumber")} value={commission.orderNumber} />
                  <DetailLine label={t("shared.fields.customer")} value={commission.sourceCustomer?.label ?? t("shared.fallback.none")} />
                </td>
                <td className="px-4 py-4">
                  <div className="font-medium text-[#22313a]">
                    {getCommissionCategoryLabel(commission.category, t)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <InlineChip tone="blue">{getCommissionOrderStatusLabel(commission.orderStatus, t)}</InlineChip>
                    {commission.isOrderDeleted ? <InlineChip tone="gold">{t("shared.deletedOrder")}</InlineChip> : null}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-semibold text-[#22313a]">{formatCommissionMoney(commission.commissionAmountRmb, locale)}</div>
                  <div className="mt-2 text-xs leading-6 text-[#79848d]">{t("salesman.table.amountHint", { amount: formatCommissionMoney(commission.orderAmountRmb, locale) })}</div>
                </td>
                <td className="px-4 py-4">
                  <InlineChip tone={getSettlementTone(commission.settlementStatus)}>{getCommissionSettlementStatusLabel(commission.settlementStatus, t)}</InlineChip>
                </td>
                <td className="px-4 py-4">
                  <DetailLine label={t("shared.fields.createdAt")} value={formatDateTime(commission.createdAt, locale)} />
                  <DetailLine label={t("shared.fields.settledAt")} value={formatDateTime(commission.settledAt, locale)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DashboardTableFrame>
    </DashboardListSection>
  );
}

function InlineChip({ children, tone }: { children: ReactNode; tone: "blue" | "green" | "gold" }) {
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", tone === "blue" && "bg-[#e4edf3] text-[#486782]", tone === "green" && "bg-[#e7f3ea] text-[#4c7259]", tone === "gold" && "bg-[#fbf1d9] text-[#9a6a07]")}>{children}</span>;
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return <div className="leading-7 text-[#66727b]"><span className="text-xs text-[#8a949c]">{label}: </span><span>{value}</span></div>;
}

function getSettlementTone(status: CommissionSettlementStatus) {
  if (status === "paid") return "green";
  if (status === "pending" || status === "reversed") return "gold";
  return "blue";
}

