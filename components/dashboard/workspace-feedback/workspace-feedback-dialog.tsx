"use client";

import {
  DashboardFormDialog,
  DashboardFormTextarea,
  dashboardFormInputClassName,
} from "@/components/dashboard/dashboard-form-dialog";
import type { NoticeTone } from "@/components/dashboard/dashboard-shared-ui";
import type { WorkspaceFeedbackType } from "@/lib/workspace-feedback";

import {
  workspaceFeedbackTypeValues,
  type WorkspaceFeedbackFormState,
} from "./workspace-feedback-display";

type WorkspaceFeedbackDialogProps = {
  copy: {
    cancel: string;
    contentLabel: string;
    contentPlaceholder: string;
    description: string;
    submit: string;
    title: string;
    titleLabel: string;
    titlePlaceholder: string;
    typeLabel: string;
    typeOptions: Record<WorkspaceFeedbackType, string>;
  };
  feedback: { tone: NoticeTone; message: string } | null;
  formState: WorkspaceFeedbackFormState;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  onUpdateField: <Key extends keyof WorkspaceFeedbackFormState>(
    field: Key,
    value: WorkspaceFeedbackFormState[Key],
  ) => void;
  open: boolean;
  pending: boolean;
};

export function WorkspaceFeedbackDialog({
  copy,
  feedback,
  formState,
  onOpenChange,
  onSubmit,
  onUpdateField,
  open,
  pending,
}: WorkspaceFeedbackDialogProps) {
  return (
    <DashboardFormDialog
      cancelLabel={copy.cancel}
      description={copy.description}
      feedback={feedback}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      open={open}
      pending={pending}
      submitLabel={copy.submit}
      title={copy.title}
    >
        <label className="grid gap-2 text-sm font-semibold text-[#31424e]">
          {copy.typeLabel}
          <select
            className={dashboardFormInputClassName}
            onChange={(event) =>
              onUpdateField(
                "feedbackType",
                event.target.value as WorkspaceFeedbackType,
              )
            }
            value={formState.feedbackType}
          >
            {workspaceFeedbackTypeValues.map((feedbackType) => (
              <option key={feedbackType} value={feedbackType}>
                {copy.typeOptions[feedbackType]}
              </option>
            ))}
          </select>
        </label>

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

        <label className="grid gap-2 text-sm font-semibold text-[#31424e]">
          {copy.contentLabel}
          <DashboardFormTextarea
            className="min-h-[180px]"
            onChange={(event) => onUpdateField("content", event.target.value)}
            placeholder={copy.contentPlaceholder}
            value={formState.content}
          />
        </label>
    </DashboardFormDialog>
  );
}
