"use client";

import { BadgeCheck, ReceiptText, WalletCards } from "lucide-react";

import { MetricCard, MetricGrid } from "@/components/ui/data-display";
import type {
  OperatorReimbursementPeriod,
  OperatorReimbursementRow,
} from "@/lib/operator-reimbursements";

import {
  formatOperatorReimbursementAmount,
  getOperatorReimbursementSummaries,
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
    <MetricGrid layout="three-column">
      <MetricCard
        description={copy.count(summaries.currentUnreimbursed.count)}
        icon={<WalletCards className="size-4" />}
        label={copy.currentUnreimbursed}
        presentation="summary"
        tone="info"
        value={formatOperatorReimbursementAmount(
          summaries.currentUnreimbursed.amount,
          locale,
        )}
      />
      <MetricCard
        description={copy.count(summaries.currentReimbursed.count)}
        icon={<BadgeCheck className="size-4" />}
        label={copy.currentReimbursed}
        presentation="summary"
        tone="info"
        value={formatOperatorReimbursementAmount(
          summaries.currentReimbursed.amount,
          locale,
        )}
      />
      <MetricCard
        description={copy.count(summaries.totalUnreimbursed.count)}
        icon={<ReceiptText className="size-4" />}
        label={copy.totalUnreimbursed}
        presentation="summary"
        tone="info"
        value={formatOperatorReimbursementAmount(
          summaries.totalUnreimbursed.amount,
          locale,
        )}
      />
    </MetricGrid>
  );
}
