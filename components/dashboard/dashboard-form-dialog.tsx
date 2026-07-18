"use client";

import type { ReactNode } from "react";

import { LoaderCircle } from "lucide-react";

import { ActionGroup } from "@/components/ui/action-group";
import { Button } from "../ui/button";
import { controlVariants, Textarea } from "../ui/form-controls";
import { DashboardDialog } from "./dashboard-dialog";
import { FeedbackNotice, type FeedbackTone } from "./dashboard-shared-ui";

export const dashboardFormInputClassName = controlVariants({
  controlSize: "default",
});

/** 创建和编辑弹窗共用的标题、反馈与操作按钮。 */
export function FormDialog({
  cancelTestId,
  cancelLabel,
  children,
  description,
  feedback,
  onOpenChange,
  onSubmit,
  open,
  pending,
  submitLabel,
  submitTestId,
  title,
}: {
  cancelTestId?: string;
  cancelLabel: string;
  children: ReactNode;
  description?: string;
  feedback?: { message: string; tone: FeedbackTone } | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  open: boolean;
  pending: boolean;
  submitLabel: string;
  submitTestId?: string;
  title: string;
}) {
  if (!open) return null;

  return (
    <DashboardDialog
      actions={
        <ActionGroup>
          <Button
            data-testid={cancelTestId}
            disabled={pending}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            {cancelLabel}
          </Button>
          <Button
            data-testid={submitTestId}
            disabled={pending}
            onClick={onSubmit}
            type="button"
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {submitLabel}
          </Button>
        </ActionGroup>
      }
      description={description}
      onOpenChange={onOpenChange}
      open={open}
      title={title}
    >
      <div className="space-y-5">
        {feedback ? (
          <FeedbackNotice tone={feedback.tone}>{feedback.message}</FeedbackNotice>
        ) : null}
        {children}
      </div>
    </DashboardDialog>
  );
}

export function DashboardFormField({
  children,
  error,
  hint,
  label,
}: {
  children: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  label: ReactNode;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-semibold text-content-strong">
      <span>{label}</span>
      {children}
      {hint ? (
        <span className="text-xs font-normal leading-5 text-content-muted">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="text-xs font-normal leading-5 text-status-danger">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function DashboardFormTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <Textarea className={className} controlSize="default" {...props} />;
}
