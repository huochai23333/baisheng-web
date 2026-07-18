"use client";

import * as FormControls from "@/components/ui/form-controls";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";

import {
  FormDialog,
  DashboardFormTextarea,
  dashboardFormInputClassName,
} from "@/components/dashboard/dashboard-form-dialog";
import { companyExpenseCategoryValues } from "@/lib/company-expenses";
import type {
  CompanyExpenseCategory,
  CompanyExpenseRow,
} from "@/lib/company-expenses";

import type { FeedbackTone } from "../dashboard-shared-ui";
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
  feedback: { tone: FeedbackTone; message: string } | null;
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
    <FormDialog
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
        <FormControls.Field label={copy.expenseMonthLabel}>
          <DatePicker
            mode="month"
            onValueChange={(value) => onUpdateField("expenseMonth", value)}
            value={formState.expenseMonth}
          />
        </FormControls.Field>

        <FormControls.Field label={copy.expenseDateLabel}>
          <DatePicker
            onValueChange={(value) => onUpdateField("expenseDate", value)}
            value={formState.expenseDate}
          />
        </FormControls.Field>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-content-strong">
        {copy.titleLabel}
        <FormControls.Input
          className={dashboardFormInputClassName}
          onChange={(event) => onUpdateField("title", event.target.value)}
          placeholder={copy.titlePlaceholder}
          type="text"
          value={formState.title}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-semibold text-content-strong">
          {copy.categoryLabel}
          <Select
            onValueChange={(value) => onUpdateField("category", value)}
            options={companyExpenseCategoryValues.map((category) => ({
              label: copy.categoryOptions[category],
              value: category,
            }))}
            value={formState.category}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-content-strong">
          {copy.amountLabel}
          <FormControls.Input
            className={dashboardFormInputClassName}
            inputMode="decimal"
            min="0"
            onChange={(event) => onUpdateField("amount", event.target.value)}
            step="0.01"
            type="number"
            value={formState.amount}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-content-strong">
          {copy.currencyLabel}
          <Select
            onValueChange={(value) => onUpdateField("currencyCode", value)}
            options={currencyOptions.map((currencyCode) => ({
              label: currencyCode,
              value: currencyCode,
            }))}
            value={formState.currencyCode}
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-content-strong">
        {copy.payeeLabel}
        <FormControls.Input
          className={dashboardFormInputClassName}
          onChange={(event) => onUpdateField("payee", event.target.value)}
          placeholder={copy.payeePlaceholder}
          type="text"
          value={formState.payee}
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-content-strong">
        {copy.noteLabel}
        <DashboardFormTextarea
          onChange={(event) => onUpdateField("note", event.target.value)}
          placeholder={copy.notePlaceholder}
          value={formState.note}
        />
      </label>
    </FormDialog>
  );
}
