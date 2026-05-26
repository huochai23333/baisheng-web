"use client";

import { LoaderCircle } from "lucide-react";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { PageBanner, type NoticeTone } from "@/components/dashboard/dashboard-shared-ui";
import { Button } from "@/components/ui/button";
import type { UserTodoItemRow } from "@/lib/user-todos";

import type {
  HomeTodoCopy,
  HomeTodoFormState,
} from "./dashboard-home-todo-display";

type HomeTodoDialogProps = {
  copy: HomeTodoCopy;
  feedback: { message: string; tone: NoticeTone } | null;
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

const inputClassName =
  "min-h-11 rounded-2xl border border-[#d8dee3] bg-white px-4 text-sm text-[#23313a] outline-none transition focus:border-[#86a5ba] focus:ring-4 focus:ring-[#dbe8f0]";
const textareaClassName = `${inputClassName} min-h-[150px] resize-y py-3 leading-7`;

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
  return open ? (
    <DashboardDialog
      actions={
        <>
          <Button
            className="h-11 rounded-full border-[#d4d8dc] bg-white px-5 text-[#486782] hover:bg-[#f2f4f6]"
            data-testid="home-todo-dialog-cancel"
            disabled={pending}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            {copy.actions.cancel}
          </Button>
          <Button
            className="h-11 rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79]"
            data-testid="home-todo-dialog-save"
            disabled={pending}
            onClick={onSubmit}
            type="button"
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {copy.actions.save}
          </Button>
        </>
      }
      description={copy.dialog.description}
      onOpenChange={onOpenChange}
      open={open}
      title={copy.dialog.title}
    >
      <div className="space-y-5">
        {feedback ? (
          <PageBanner tone={feedback.tone}>{feedback.message}</PageBanner>
        ) : null}

        <label className="grid gap-2 text-sm font-semibold text-[#31424e]">
          {copy.dialog.titleLabel}
          <input
            className={inputClassName}
            data-testid="home-todo-dialog-title"
            onChange={(event) => onUpdateField("title", event.target.value)}
            placeholder={copy.dialog.titlePlaceholder}
            type="text"
            value={formState.title}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[#31424e]">
          {copy.dialog.notesLabel}
          <textarea
            className={textareaClassName}
            data-testid="home-todo-dialog-notes"
            onChange={(event) => onUpdateField("notes", event.target.value)}
            placeholder={copy.dialog.notesPlaceholder}
            value={formState.notes}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[#31424e]">
          {copy.dialog.dueDateLabel}
          <input
            className={inputClassName}
            data-testid="home-todo-dialog-due-date"
            onChange={(event) => onUpdateField("dueDate", event.target.value)}
            type="date"
            value={formState.dueDate}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-12 items-center gap-3 rounded-[18px] border border-[#d8dee3] bg-white px-4 text-sm font-semibold text-[#31424e]">
            <input
              checked={formState.isImportant}
              className="size-4 accent-[#486782]"
              data-testid="home-todo-dialog-important"
              onChange={(event) =>
                onUpdateField("isImportant", event.target.checked)
              }
              type="checkbox"
            />
            {copy.dialog.importantLabel}
          </label>

          <label className="flex min-h-12 items-center gap-3 rounded-[18px] border border-[#d8dee3] bg-white px-4 text-sm font-semibold text-[#31424e]">
            <input
              checked={formState.isCompleted}
              className="size-4 accent-[#486782]"
              data-testid="home-todo-dialog-completed"
              onChange={(event) =>
                onUpdateField("isCompleted", event.target.checked)
              }
              type="checkbox"
            />
            {copy.dialog.completedLabel}
          </label>
        </div>
      </div>
    </DashboardDialog>
  ) : null;
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
            className="h-11 rounded-full border-[#d4d8dc] bg-white px-5 text-[#486782] hover:bg-[#f2f4f6]"
            data-testid="home-todo-delete-dialog-cancel"
            disabled={pending}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            {copy.actions.cancel}
          </Button>
          <Button
            className="h-11 rounded-full bg-[#a4473f] px-5 text-white hover:bg-[#903b35]"
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
      <div className="break-words rounded-[20px] border border-[#efe1dd] bg-white px-4 py-3 text-sm font-semibold leading-6 text-[#31424e] [overflow-wrap:anywhere]">
        {todo.title}
      </div>
    </DashboardDialog>
  ) : null;
}
