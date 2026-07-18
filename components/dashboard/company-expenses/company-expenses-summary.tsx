"use client";

import { WalletCards } from "lucide-react";

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
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {summaries.length === 0 ? (
        <div className="rounded-[24px] border border-border-subtle bg-white/72 px-5 py-4 text-sm leading-7 text-content-muted">
          {copy.empty}
        </div>
      ) : (
        summaries.map((summary) => (
          <div
            className="rounded-[24px] border border-white/85 bg-white/72 p-5 shadow-[var(--surface-shadow-interactive)]"
            key={summary.currencyCode}
          >
            <div className="flex items-center gap-3 text-primary">
              <div className="flex size-10 items-center justify-center rounded-full bg-status-info-soft">
                <WalletCards className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-content-muted">
                  {summary.currencyCode}
                </p>
                <p className="text-sm text-content-muted">
                  {copy.count(summary.count)}
                </p>
              </div>
            </div>
            <p className="mt-4 break-words text-2xl font-bold text-content-strong [overflow-wrap:anywhere]">
              {formatCompanyExpenseAmount(
                summary.amount,
                summary.currencyCode,
                locale,
              )}
            </p>
          </div>
        ))
      )}
    </section>
  );
}
