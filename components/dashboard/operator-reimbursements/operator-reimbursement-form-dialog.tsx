"use client";

import { LoaderCircle } from "lucide-react";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { Button } from "@/components/ui/button";

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

const inputClassName =
  "min-h-11 rounded-2xl border border-[#d8dee3] bg-white px-4 text-sm text-[#23313a] outline-none transition focus:border-[#86a5ba] focus:ring-4 focus:ring-[#dbe8f0]";
const textareaClassName = `${inputClassName} min-h-[120px] resize-y py-3 leading-7`;

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
            {copy.createSubmit}
          </Button>
        </>
      }
      description={copy.createDescription}
      onOpenChange={onOpenChange}
      open={open}
      title={copy.createTitle}
    >
      <div className="space-y-5">
        {feedback ? (
          <p className="rounded-[20px] border border-[#f1d1d1] bg-[#fff2f2] px-4 py-3 text-sm leading-7 text-[#9f3535]">
            {feedback.message}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-[0.8fr_1fr]">
          <label className="grid gap-2 text-sm font-semibold text-[#31424e]">
            {copy.spentAtLabel}
            <input
              className={inputClassName}
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
              className={inputClassName}
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
          <textarea
            className={textareaClassName}
            onChange={(event) => onUpdateField("content", event.target.value)}
            placeholder={copy.contentPlaceholder}
            value={formState.content}
          />
        </label>
      </div>
    </DashboardDialog>
  ) : null;
}
