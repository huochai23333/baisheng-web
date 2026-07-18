"use client";

import type { ReactNode } from "react";
import {
  CalendarDays,
  Edit3,
  LoaderCircle,
  ReceiptText,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  CompanyExpenseCategory,
  CompanyExpenseRow,
} from "@/lib/company-expenses";
import { DashboardListSection } from "../dashboard-section-panel";
import { EmptyState } from "../dashboard-shared-ui";
import {
  formatCompanyExpenseAmount,
  formatCompanyExpenseDate,
  formatCompanyExpenseMonth,
} from "./company-expenses-display";

type CompanyExpensesListSectionProps = {
  copy: {
    amount: string;
    categoryOptions: Record<CompanyExpenseCategory, string>;
    delete: string;
    edit: string;
    emptyDescription: string;
    emptyTitle: string;
    month: string;
    note: string;
    paidAt: string;
    payee: string;
    recordsTitle: string;
    updatedAt: string;
  };
  expenses: CompanyExpenseRow[];
  locale: string;
  onDelete: (expense: CompanyExpenseRow) => void;
  onEdit: (expense: CompanyExpenseRow) => void;
  pendingAction: { id: string; type: "delete" } | null;
};

/** 列表文件集中维护费用卡片和字段排版，页面 Client 不直接渲染记录。 */
export function CompanyExpensesListSection({
  copy,
  expenses,
  locale,
  onDelete,
  onEdit,
  pendingAction,
}: CompanyExpensesListSectionProps) {
  return (
    <DashboardListSection title={copy.recordsTitle}>
      {expenses.length === 0 ? (
        <EmptyState
          description={copy.emptyDescription}
          icon={<ReceiptText className="size-6" />}
          title={copy.emptyTitle}
        />
      ) : (
        <div className="grid gap-4">
          {expenses.map((expense) => (
            <CompanyExpenseCard
              copy={copy}
              expense={expense}
              key={expense.id}
              locale={locale}
              onDelete={onDelete}
              onEdit={onEdit}
              pendingAction={pendingAction}
            />
          ))}
        </div>
      )}
    </DashboardListSection>
  );
}

function CompanyExpenseCard({
  copy,
  expense,
  locale,
  onDelete,
  onEdit,
  pendingAction,
}: {
  copy: CompanyExpensesListSectionProps["copy"];
  expense: CompanyExpenseRow;
  locale: string;
  onDelete: (expense: CompanyExpenseRow) => void;
  onEdit: (expense: CompanyExpenseRow) => void;
  pendingAction: CompanyExpensesListSectionProps["pendingAction"];
}) {
  const deletePending =
    pendingAction?.id === expense.id && pendingAction.type === "delete";
  return (
    <article className="rounded-[24px] border border-border-subtle bg-surface-inset p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex min-h-7 items-center rounded-full bg-status-info-soft px-3 py-1 text-xs font-semibold text-primary">
              {copy.categoryOptions[expense.category]}
            </span>
            <span className="inline-flex min-h-7 items-center rounded-full bg-surface-inset px-3 py-1 text-xs font-semibold text-content-muted">
              {formatCompanyExpenseMonth(expense.expense_month, locale)}
            </span>
          </div>
          <h3 className="mt-3 break-words text-xl font-bold text-content-strong [overflow-wrap:anywhere]">
            {expense.title}
          </h3>
          <p className="mt-2 break-words text-2xl font-bold text-primary [overflow-wrap:anywhere]">
            {formatCompanyExpenseAmount(
              expense.amount,
              expense.currency_code,
              locale,
            )}
          </p>
          <dl className="mt-4 grid gap-3 text-sm text-content-muted md:grid-cols-2 xl:grid-cols-4">
            <ExpenseMeta label={copy.month}>
              <CalendarDays className="size-4" />
              {formatCompanyExpenseMonth(expense.expense_month, locale)}
            </ExpenseMeta>
            <ExpenseMeta label={copy.paidAt}>
              <CalendarDays className="size-4" />
              {formatCompanyExpenseDate(expense.expense_date, locale)}
            </ExpenseMeta>
            <ExpenseMeta label={copy.payee}>{expense.payee || "-"}</ExpenseMeta>
            <ExpenseMeta label={copy.updatedAt}>
              {formatCompanyExpenseDate(
                expense.updated_at.slice(0, 10),
                locale,
              )}
            </ExpenseMeta>
          </dl>
          {expense.note ? (
            <p className="mt-4 break-words rounded-[18px] bg-white px-4 py-3 text-sm leading-7 text-content-muted [overflow-wrap:anywhere]">
              <span className="font-semibold text-content-muted">
                {copy.note}：
              </span>
              {expense.note}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 xl:justify-end">
          <Button
            size="compact"
            disabled={deletePending}
            onClick={() => onEdit(expense)}
            variant="outline"
          >
            <Edit3 className="size-4" />
            {copy.edit}
          </Button>
          <Button
            size="compact"
            disabled={deletePending}
            onClick={() => onDelete(expense)}
            variant="danger"
          >
            {deletePending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {copy.delete}
          </Button>
        </div>
      </div>
    </article>
  );
}

function ExpenseMeta({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold text-content-muted">{label}</dt>
      <dd className="mt-1 flex min-w-0 items-center gap-1.5 break-words [overflow-wrap:anywhere]">
        {children}
      </dd>
    </div>
  );
}
