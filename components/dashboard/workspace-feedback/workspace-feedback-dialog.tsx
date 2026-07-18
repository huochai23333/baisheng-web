"use client";

import * as FormControls from "@/components/ui/form-controls";
import { Select } from "@/components/ui/select";

import {
  FormDialog,
  DashboardFormTextarea,
  dashboardFormInputClassName,
} from "@/components/dashboard/dashboard-form-dialog";
import type { FeedbackTone } from "@/components/dashboard/dashboard-shared-ui";
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
  feedback: { tone: FeedbackTone; message: string } | null;
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
    <FormDialog
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
      <label className="grid gap-2 text-sm font-semibold text-content-strong">
        {copy.typeLabel}
        <Select
          onValueChange={(value) => onUpdateField("feedbackType", value)}
          options={workspaceFeedbackTypeValues.map((feedbackType) => ({
            label: copy.typeOptions[feedbackType],
            value: feedbackType,
          }))}
          value={formState.feedbackType}
        />
      </label>

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

      <label className="grid gap-2 text-sm font-semibold text-content-strong">
        {copy.contentLabel}
        <DashboardFormTextarea
          className="min-h-[180px]"
          onChange={(event) => onUpdateField("content", event.target.value)}
          placeholder={copy.contentPlaceholder}
          value={formState.content}
        />
      </label>
    </FormDialog>
  );
}
