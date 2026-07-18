"use client";

import * as FormControls from "@/components/ui/form-controls";

import { LoaderCircle } from "lucide-react";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import {
  FormDialog,
  DashboardFormTextarea,
  dashboardFormInputClassName,
} from "@/components/dashboard/dashboard-form-dialog";
import type { FeedbackTone } from "@/components/dashboard/dashboard-shared-ui";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import type { UserTodoItemRow } from "@/lib/user-todos";

import type {
  HomeTodoCopy,
  HomeTodoFormState,
} from "./dashboard-home-todo-display";

type HomeTodoDialogProps = {
  copy: HomeTodoCopy;
  feedback: { message: string; tone: FeedbackTone } | null;
  formState: HomeTodoFormState;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  onUpdateField: <Key extends keyof HomeTodoFormState>(
    field: Key,
    value: HomeTodoFormState[Key],
  ) => void;
  open: boolean;
  pending: boolean;
};

export function HomeTodoDialog({
  copy,
  feedback,
  formState,
  onOpenChange,
  onSubmit,
  onUpdateField,
  open,
  pending,
}: HomeTodoDialogProps) {
  return (
    <FormDialog
      cancelLabel={copy.actions.cancel}
      cancelTestId="home-todo-dialog-cancel"
      description={copy.dialog.description}
      feedback={feedback}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      open={open}
      pending={pending}
      submitLabel={copy.actions.save}
      submitTestId="home-todo-dialog-save"
      title={copy.dialog.title}
    >
      <label className="grid gap-2 text-sm font-semibold text-content-strong">
        {copy.dialog.titleLabel}
        <FormControls.Input
          className={dashboardFormInputClassName}
          data-testid="home-todo-dialog-title"
          onChange={(event) => onUpdateField("title", event.target.value)}
          placeholder={copy.dialog.titlePlaceholder}
          type="text"
          value={formState.title}
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-content-strong">
        {copy.dialog.notesLabel}
        <DashboardFormTextarea
          className="min-h-[150px]"
          data-testid="home-todo-dialog-notes"
          onChange={(event) => onUpdateField("notes", event.target.value)}
          placeholder={copy.dialog.notesPlaceholder}
          value={formState.notes}
        />
      </label>

      <FormControls.Field label={copy.dialog.dueDateLabel}>
        <DatePicker
          data-testid="home-todo-dialog-due-date"
          onValueChange={(value) => onUpdateField("dueDate", value)}
          value={formState.dueDate}
        />
      </FormControls.Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex min-h-12 items-center gap-3 rounded-[18px] border border-border-subtle bg-white px-4 text-sm font-semibold text-content-strong">
          <FormControls.Checkbox
            checked={formState.isImportant}
            className="size-4 accent-primary"
            data-testid="home-todo-dialog-important"
            onChange={(event) =>
              onUpdateField("isImportant", event.target.checked)
            }
          />
          {copy.dialog.importantLabel}
        </label>

        <label className="flex min-h-12 items-center gap-3 rounded-[18px] border border-border-subtle bg-white px-4 text-sm font-semibold text-content-strong">
          <FormControls.Checkbox
            checked={formState.isCompleted}
            className="size-4 accent-primary"
            data-testid="home-todo-dialog-completed"
            onChange={(event) =>
              onUpdateField("isCompleted", event.target.checked)
            }
          />
          {copy.dialog.completedLabel}
        </label>
      </div>
    </FormDialog>
  );
}

type HomeTodoDeleteDialogProps = {
  copy: HomeTodoCopy;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pending: boolean;
  todo: UserTodoItemRow | null;
};

export function HomeTodoDeleteDialog({
  copy,
  onConfirm,
  onOpenChange,
  open,
  pending,
  todo,
}: HomeTodoDeleteDialogProps) {
  return open && todo ? (
    <DashboardDialog
      actions={
        <>
          <Button
            size="default"
            data-testid="home-todo-delete-dialog-cancel"
            disabled={pending}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            {copy.actions.cancel}
          </Button>
          <Button
            variant="secondary"
            size="default"
            data-testid="home-todo-delete-dialog-confirm"
            disabled={pending}
            onClick={onConfirm}
            type="button"
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {copy.actions.delete}
          </Button>
        </>
      }
      description={copy.feedback.deleteConfirm(todo.title)}
      onOpenChange={onOpenChange}
      open={open}
      title={copy.actions.delete}
    >
      <div className="break-words rounded-[20px] border border-border-subtle bg-white px-4 py-3 text-sm font-semibold leading-6 text-content-strong [overflow-wrap:anywhere]">
        {todo.title}
      </div>
    </DashboardDialog>
  ) : null;
}
