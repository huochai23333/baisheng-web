"use client";

import type { ReactNode } from "react";

import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import { DashboardDialog } from "./dashboard-dialog";
import { PageBanner, type NoticeTone } from "./dashboard-shared-ui";

export const dashboardFormInputClassName =
  "min-h-11 w-full rounded-2xl border border-[#d8dee3] bg-white px-4 text-sm text-[#23313a] outline-none transition placeholder:text-[#8a949c] focus:border-[#86a5ba] focus:ring-4 focus:ring-[#dbe8f0]";

/** 创建和编辑弹窗共用的标题、反馈与操作按钮。 */
export function DashboardFormDialog({
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
  feedback?: { message: string; tone: NoticeTone } | null;
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
        <>
          <Button
            className="h-11 rounded-full px-5"
            data-testid={cancelTestId}
            disabled={pending}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            {cancelLabel}
          </Button>
          <Button
            className="h-11 rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79]"
            data-testid={submitTestId}
            disabled={pending}
            onClick={onSubmit}
            type="button"
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {submitLabel}
          </Button>
        </>
      }
      description={description}
      onOpenChange={onOpenChange}
      open={open}
      title={title}
    >
      <div className="space-y-5">
        {feedback ? (
          <PageBanner tone={feedback.tone}>{feedback.message}</PageBanner>
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
    <label className="grid min-w-0 gap-2 text-sm font-semibold text-[#31424e]">
      <span>{label}</span>
      {children}
      {hint ? (
        <span className="text-xs font-normal leading-5 text-[#6f7b85]">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="text-xs font-normal leading-5 text-[#b13d3d]">
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
  return (
    <textarea
      className={cn(
        dashboardFormInputClassName,
        "min-h-[120px] resize-y py-3 leading-7",
        className,
      )}
      {...props}
    />
  );
}
