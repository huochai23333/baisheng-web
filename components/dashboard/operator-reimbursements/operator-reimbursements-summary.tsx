"use client";

import type { ReactNode } from "react";

import { BadgeCheck, ReceiptText, WalletCards } from "lucide-react";

import type {
  OperatorReimbursementPeriod,
  OperatorReimbursementRow,
} from "@/lib/operator-reimbursements";

import {
  formatOperatorReimbursementAmount,
  getOperatorReimbursementSummaries,
  type OperatorReimbursementSummary,
} from "./operator-reimbursements-display";

type OperatorReimbursementsSummarySectionProps = {
  copy: {
    count: (count: number) => string;
    currentPeriod: string;
    currentReimbursed: string;
    currentUnreimbursed: string;
    totalUnreimbursed: string;
  };
  currentPeriod: OperatorReimbursementPeriod;
  locale: string;
  reimbursements: OperatorReimbursementRow[];
};

export function OperatorReimbursementsSummarySection({
  copy,
  currentPeriod,
  locale,
  reimbursements,
}: OperatorReimbursementsSummarySectionProps) {
  // 汇总使用完整列表，而不是筛选后的列表，这样顶部数字始终反映当前真实待报销金额。
  const summaries = getOperatorReimbursementSummaries(
    reimbursements,
    currentPeriod,
  );

  return (
    <section className="grid gap-3 md:grid-cols-3">
      <SummaryCard
        copy={copy}
        icon={<WalletCards className="size-4" />}
        locale={locale}
        summary={summaries.currentUnreimbursed}
        title={copy.currentUnreimbursed}
      />
      <SummaryCard
        copy={copy}
        icon={<BadgeCheck className="size-4" />}
        locale={locale}
        summary={summaries.currentReimbursed}
        title={copy.currentReimbursed}
      />
      <SummaryCard
        copy={copy}
        icon={<ReceiptText className="size-4" />}
        locale={locale}
        summary={summaries.totalUnreimbursed}
        title={copy.totalUnreimbursed}
      />
    </section>
  );
}

function SummaryCard({
  copy,
  icon,
  locale,
  summary,
  title,
}: {
  copy: OperatorReimbursementsSummarySectionProps["copy"];
  icon: ReactNode;
  locale: string;
  summary: OperatorReimbursementSummary;
  title: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/85 bg-white/72 p-5 shadow-[var(--surface-shadow-interactive)]">
      <div className="flex items-center gap-3 text-primary">
        <div className="flex size-10 items-center justify-center rounded-full bg-status-info-soft">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-content-muted [overflow-wrap:anywhere]">
            {title}
          </p>
          <p className="text-sm text-content-muted">
            {copy.count(summary.count)}
          </p>
        </div>
      </div>
      <p className="mt-4 break-words text-2xl font-bold text-content-strong [overflow-wrap:anywhere]">
        {formatOperatorReimbursementAmount(summary.amount, locale)}
      </p>
    </div>
  );
}
