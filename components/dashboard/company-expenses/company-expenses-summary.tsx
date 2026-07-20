"use client";

import { WalletCards } from "lucide-react";

import { MetricCard, MetricGrid } from "@/components/ui/data-display";
import { Surface } from "@/components/ui/surface";
import type { CompanyExpenseRow } from "@/lib/company-expenses";
import {
  formatCompanyExpenseAmount,
  getCompanyExpenseSummaries,
} from "./company-expenses-display";

/** 汇总卡只根据当前筛选结果计算展示值，不读取数据也不修改业务状态。 */
export function CompanyExpensesSummarySection({
  copy,
  expenses,
  locale,
}: {
  copy: { count: (count: number) => string; empty: string; title: string };
  expenses: CompanyExpenseRow[];
  locale: string;
}) {
  const summaries = getCompanyExpenseSummaries(expenses);

  return (
    <MetricGrid layout="four-column">
      {summaries.length === 0 ? (
        <Surface
          as="div"
          className="text-sm leading-7 text-content-muted"
          padding="regular"
          variant="inset"
        >
          {copy.empty}
        </Surface>
      ) : (
        summaries.map((summary) => (
          <MetricCard
            description={copy.count(summary.count)}
            icon={<WalletCards className="size-4" />}
            key={summary.currencyCode}
            label={summary.currencyCode}
            presentation="summary"
            value={formatCompanyExpenseAmount(
              summary.amount,
              summary.currencyCode,
              locale,
            )}
          />
        ))
      )}
    </MetricGrid>
  );
}
