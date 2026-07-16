"use client";

import {
  DashboardFormDialog,
  DashboardFormTextarea,
  dashboardFormInputClassName,
} from "@/components/dashboard/dashboard-form-dialog";

import type { NoticeTone } from "../dashboard-shared-ui";
import type { OperatorReimbursementFormState } from "./operator-reimbursements-display";

type OperatorReimbursementFormDialogProps = {
  copy: {
    amountLabel: string;
    cancel: string;
    contentLabel: string;
    contentPlaceholder: string;
    createDescription: string;
    createSubmit: string;
    createTitle: string;
    spentAtLabel: string;
  };
  feedback: { tone: NoticeTone; message: string } | null;
  formState: OperatorReimbursementFormState;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  onUpdateField: <Key extends keyof OperatorReimbursementFormState>(
    field: Key,
    value: OperatorReimbursementFormState[Key],
  ) => void;
  open: boolean;
  pending: boolean;
};

export function OperatorReimbursementFormDialog({
  copy,
  feedback,
  formState,
  onOpenChange,
  onSubmit,
  onUpdateField,
  open,
  pending,
}: OperatorReimbursementFormDialogProps) {
  // 弹窗只收集用户能理解的三个字段，报销状态和周期由数据库自动处理。
  return (
    <DashboardFormDialog
      cancelLabel={copy.cancel}
      description={copy.createDescription}
      feedback={feedback}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      open={open}
      pending={pending}
      submitLabel={copy.createSubmit}
      title={copy.createTitle}
    >
        <div className="grid gap-4 md:grid-cols-[0.8fr_1fr]">
          <label className="grid gap-2 text-sm font-semibold text-[#31424e]">
            {copy.spentAtLabel}
            <input
              className={dashboardFormInputClassName}
              onChange={(event) =>
                onUpdateField("spentAt", event.target.value)
              }
              type="date"
              value={formState.spentAt}
            />
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
        </div>

        <label className="grid gap-2 text-sm font-semibold text-[#31424e]">
          {copy.contentLabel}
          <DashboardFormTextarea
            onChange={(event) => onUpdateField("content", event.target.value)}
            placeholder={copy.contentPlaceholder}
            value={formState.content}
          />
        </label>
    </DashboardFormDialog>
  );
}
