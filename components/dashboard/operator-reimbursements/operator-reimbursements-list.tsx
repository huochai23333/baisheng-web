"use client";

import type { ReactNode } from "react";

import { CalendarDays, LoaderCircle, ReceiptText, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  OperatorReimbursementRow,
  OperatorReimbursementStatus,
} from "@/lib/operator-reimbursements";

import { DashboardListSection } from "../dashboard-section-panel";
import { EmptyState } from "../dashboard-shared-ui";
import {
  formatOperatorReimbursementAmount,
  formatOperatorReimbursementDate,
  formatOperatorReimbursementPeriod,
  getOperatorReimbursementStatusTone,
} from "./operator-reimbursements-display";

type OperatorReimbursementsListSectionProps = {
  copy: {
    amount: string;
    delete: string;
    emptyDescription: string;
    emptyTitle: string;
    period: string;
    recordsTitle: string;
    reimbursedAt: string;
    spentAt: string;
    status: string;
    statusOptions: Record<OperatorReimbursementStatus, string>;
    updatedAt: string;
  };
  locale: string;
  onDelete: (reimbursement: OperatorReimbursementRow) => void;
  pendingAction: { id: string; type: "delete" } | null;
  reimbursements: OperatorReimbursementRow[];
};

export function OperatorReimbursementsListSection({
  copy,
  locale,
  onDelete,
  pendingAction,
  reimbursements,
}: OperatorReimbursementsListSectionProps) {
  return (
    <DashboardListSection title={copy.recordsTitle}>
      {reimbursements.length === 0 ? (
        <EmptyState
          description={copy.emptyDescription}
          icon={<ReceiptText className="size-6" />}
          title={copy.emptyTitle}
        />
      ) : (
        <div className="grid gap-4">
          {reimbursements.map((reimbursement) => (
            <OperatorReimbursementCard
              copy={copy}
              key={reimbursement.id}
              locale={locale}
              onDelete={onDelete}
              pendingAction={pendingAction}
              reimbursement={reimbursement}
            />
          ))}
        </div>
      )}
    </DashboardListSection>
  );
}

function OperatorReimbursementCard({
  copy,
  locale,
  onDelete,
  pendingAction,
  reimbursement,
}: {
  copy: OperatorReimbursementsListSectionProps["copy"];
  locale: string;
  onDelete: (reimbursement: OperatorReimbursementRow) => void;
  pendingAction: OperatorReimbursementsListSectionProps["pendingAction"];
  reimbursement: OperatorReimbursementRow;
}) {
  const deletePending =
    pendingAction?.id === reimbursement.id && pendingAction.type === "delete";
  // 已报销记录作为结算凭证保留在列表中，只允许删除尚未报销的草稿记录。
  const canDelete = reimbursement.status === "unreimbursed";

  return (
    <article className="rounded-[24px] border border-[#e2e7eb] bg-[#fbfaf8] p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-semibold ${getOperatorReimbursementStatusTone(
                reimbursement.status,
              )}`}
            >
              {copy.statusOptions[reimbursement.status]}
            </span>
            <span className="inline-flex min-h-7 items-center rounded-full bg-[#f4efe6] px-3 py-1 text-xs font-semibold text-[#7a633e]">
              {formatOperatorReimbursementPeriod(
                {
                  end: reimbursement.reimbursement_period_end,
                  start: reimbursement.reimbursement_period_start,
                },
                locale,
              )}
            </span>
          </div>

          <h3 className="mt-3 break-words text-xl font-bold text-[#23313a] [overflow-wrap:anywhere]">
            {reimbursement.content}
          </h3>
          <p className="mt-2 break-words text-2xl font-bold text-[#486782] [overflow-wrap:anywhere]">
            {formatOperatorReimbursementAmount(reimbursement.amount, locale)}
          </p>

          <dl className="mt-4 grid gap-3 text-sm text-[#66737e] md:grid-cols-2 xl:grid-cols-5">
            <ReimbursementMeta label={copy.spentAt}>
              <CalendarDays className="size-4" />
              {formatOperatorReimbursementDate(reimbursement.spent_at, locale)}
            </ReimbursementMeta>
            <ReimbursementMeta label={copy.period}>
              <CalendarDays className="size-4" />
              {formatOperatorReimbursementPeriod(
                {
                  end: reimbursement.reimbursement_period_end,
                  start: reimbursement.reimbursement_period_start,
                },
                locale,
              )}
            </ReimbursementMeta>
            <ReimbursementMeta label={copy.status}>
              {copy.statusOptions[reimbursement.status]}
            </ReimbursementMeta>
            <ReimbursementMeta label={copy.reimbursedAt}>
              {formatOperatorReimbursementDate(
                reimbursement.reimbursed_at,
                locale,
              )}
            </ReimbursementMeta>
            <ReimbursementMeta label={copy.updatedAt}>
              {formatOperatorReimbursementDate(
                reimbursement.updated_at.slice(0, 10),
                locale,
              )}
            </ReimbursementMeta>
          </dl>
        </div>

        {canDelete ? (
          <div className="flex flex-wrap gap-2 xl:justify-end">
            <Button
              className="h-10 rounded-full border-[#e5c6c6] bg-white px-4 text-[#b64a4a] hover:bg-[#fff2f2]"
              disabled={deletePending}
              onClick={() => onDelete(reimbursement)}
              variant="outline"
            >
              {deletePending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {copy.delete}
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ReimbursementMeta({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold text-[#596773]">{label}</dt>
      <dd className="mt-1 flex min-w-0 items-center gap-1.5 break-words [overflow-wrap:anywhere]">
        {children}
      </dd>
    </div>
  );
}
