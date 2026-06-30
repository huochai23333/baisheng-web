"use client";

import { LoaderCircle } from "lucide-react";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { Button } from "@/components/ui/button";
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

const inputClassName =
  "min-h-11 rounded-2xl border border-[#d8dee3] bg-white px-4 text-sm text-[#23313a] outline-none transition focus:border-[#86a5ba] focus:ring-4 focus:ring-[#dbe8f0]";
const textareaClassName = `${inputClassName} min-h-[120px] resize-y py-3 leading-7`;

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

  return open ? (
    <DashboardDialog
      actions={
        <>
          <Button
            className="h-11 rounded-full border-[#d4d8dc] bg-white px-5 text-[#486782] hover:bg-[#f2f4f6]"
            disabled={pending}
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            {copy.cancel}
          </Button>
          <Button
            className="h-11 rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79]"
            disabled={pending}
            onClick={onSubmit}
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {createMode ? copy.createSubmit : copy.editSubmit}
          </Button>
        </>
      }
      description={createMode ? copy.createDescription : copy.editDescription}
      onOpenChange={onOpenChange}
      open={open}
      title={createMode ? copy.createTitle : copy.editTitle}
    >
      <div className="space-y-5">
        {feedback ? (
          <p className="rounded-[20px] border border-[#f1d1d1] bg-[#fff2f2] px-4 py-3 text-sm leading-7 text-[#9f3535]">
            {feedback.message}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-[#31424e]">
            {copy.expenseMonthLabel}
            <input
              className={inputClassName}
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
              className={inputClassName}
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
            className={inputClassName}
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
              className={inputClassName}
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
              className={inputClassName}
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
              className={inputClassName}
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
            className={inputClassName}
            onChange={(event) => onUpdateField("payee", event.target.value)}
            placeholder={copy.payeePlaceholder}
            type="text"
            value={formState.payee}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[#31424e]">
          {copy.noteLabel}
          <textarea
            className={textareaClassName}
            onChange={(event) => onUpdateField("note", event.target.value)}
            placeholder={copy.notePlaceholder}
            value={formState.note}
          />
        </label>
      </div>
    </DashboardDialog>
  ) : null;
}
