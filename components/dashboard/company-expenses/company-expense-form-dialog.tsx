"use client";

import {
  DashboardFormDialog,
  DashboardFormTextarea,
  dashboardFormInputClassName,
} from "@/components/dashboard/dashboard-form-dialog";
import { companyExpenseCategoryValues } from "@/lib/company-expenses";
import type {
  CompanyExpenseCategory,
  CompanyExpenseRow,
} from "@/lib/company-expenses";

import type { NoticeTone } from "../dashboard-shared-ui";
import {
  companyExpenseCurrencyOptions,
  type CompanyExpenseFormState,
} from "./company-expenses-display";

type CompanyExpenseFormDialogProps = {
  copy: {
    amountLabel: string;
    cancel: string;
    categoryLabel: string;
    categoryOptions: Record<CompanyExpenseCategory, string>;
    createDescription: string;
    createSubmit: string;
    createTitle: string;
    currencyLabel: string;
    editDescription: string;
    editSubmit: string;
    editTitle: string;
    expenseDateLabel: string;
    expenseMonthLabel: string;
    noteLabel: string;
    notePlaceholder: string;
    payeeLabel: string;
    payeePlaceholder: string;
    titleLabel: string;
    titlePlaceholder: string;
  };
  editingExpense: CompanyExpenseRow | null;
  feedback: { tone: NoticeTone; message: string } | null;
  formState: CompanyExpenseFormState;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  onUpdateField: <Key extends keyof CompanyExpenseFormState>(
    field: Key,
    value: CompanyExpenseFormState[Key],
  ) => void;
  open: boolean;
  pending: boolean;
};

export function CompanyExpenseFormDialog({
  copy,
  editingExpense,
  feedback,
  formState,
  onOpenChange,
  onSubmit,
  onUpdateField,
  open,
  pending,
}: CompanyExpenseFormDialogProps) {
  const createMode = !editingExpense;
  const currencyOptions = Array.from(
    new Set([...companyExpenseCurrencyOptions, formState.currencyCode]),
  );

  return (
    <DashboardFormDialog
      cancelLabel={copy.cancel}
      description={createMode ? copy.createDescription : copy.editDescription}
      feedback={feedback}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      open={open}
      pending={pending}
      submitLabel={createMode ? copy.createSubmit : copy.editSubmit}
      title={createMode ? copy.createTitle : copy.editTitle}
    >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-[#31424e]">
            {copy.expenseMonthLabel}
            <input
              className={dashboardFormInputClassName}
              onChange={(event) =>
                onUpdateField("expenseMonth", event.target.value)
              }
              type="month"
              value={formState.expenseMonth}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#31424e]">
            {copy.expenseDateLabel}
            <input
              className={dashboardFormInputClassName}
              onChange={(event) =>
                onUpdateField("expenseDate", event.target.value)
              }
              type="date"
              value={formState.expenseDate}
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-semibold text-[#31424e]">
          {copy.titleLabel}
          <input
            className={dashboardFormInputClassName}
            onChange={(event) => onUpdateField("title", event.target.value)}
            placeholder={copy.titlePlaceholder}
            type="text"
            value={formState.title}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-semibold text-[#31424e]">
            {copy.categoryLabel}
            <select
              className={dashboardFormInputClassName}
              onChange={(event) =>
                onUpdateField(
                  "category",
                  event.target.value as CompanyExpenseCategory,
                )
              }
              value={formState.category}
            >
              {companyExpenseCategoryValues.map((category) => (
                <option key={category} value={category}>
                  {copy.categoryOptions[category]}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#31424e]">
            {copy.amountLabel}
            <input
              className={dashboardFormInputClassName}
              inputMode="decimal"
              min="0"
              onChange={(event) => onUpdateField("amount", event.target.value)}
              step="0.01"
              type="number"
              value={formState.amount}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#31424e]">
            {copy.currencyLabel}
            <select
              className={dashboardFormInputClassName}
              onChange={(event) =>
                onUpdateField("currencyCode", event.target.value)
              }
              value={formState.currencyCode}
            >
              {currencyOptions.map((currencyCode) => (
                <option key={currencyCode} value={currencyCode}>
                  {currencyCode}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-semibold text-[#31424e]">
          {copy.payeeLabel}
          <input
            className={dashboardFormInputClassName}
            onChange={(event) => onUpdateField("payee", event.target.value)}
            placeholder={copy.payeePlaceholder}
            type="text"
            value={formState.payee}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[#31424e]">
          {copy.noteLabel}
          <DashboardFormTextarea
            onChange={(event) => onUpdateField("note", event.target.value)}
            placeholder={copy.notePlaceholder}
            value={formState.note}
          />
        </label>
    </DashboardFormDialog>
  );
}
