"use client";

import type { ReactNode } from "react";

import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Edit3,
  LoaderCircle,
  Star,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { UserTodoItemRow } from "@/lib/user-todos";

import {
  formatHomeTodoDueDate,
  getHomeTodoDueTone,
  type HomeTodoCopy,
  type HomeTodoFilter,
} from "./dashboard-home-todo-display";

type TodoFilterButtonProps = {
  active: boolean;
  count: number;
  filter: HomeTodoFilter;
  label: string;
  onClick: () => void;
};

export function TodoFilterButton({
  active,
  count,
  filter,
  label,
  onClick,
}: TodoFilterButtonProps) {
  return (
    <button
      aria-selected={active}
      className={cn(
        "min-h-10 rounded-full border px-4 text-sm font-semibold transition",
        active
          ? "border-[#486782] bg-[#486782] text-white"
          : "border-[#dfe5ea] bg-white text-[#60707d] hover:bg-[#f4f7f9]",
      )}
      data-count={count}
      data-testid={`home-todo-filter-${filter}`}
      onClick={onClick}
      role="tab"
      type="button"
    >
      {label}
    </button>
  );
}

type TodoItemProps = {
  copy: HomeTodoCopy;
  locale: string;
  onDelete: () => void;
  onEdit: () => void;
  onToggleComplete: () => void;
  onToggleImportant: () => void;
  pendingAction: string | null;
  todo: UserTodoItemRow;
};

export function TodoItem({
  copy,
  locale,
  onDelete,
  onEdit,
  onToggleComplete,
  onToggleImportant,
  pendingAction,
  todo,
}: TodoItemProps) {
  const completePending = pendingAction === `complete:${todo.id}`;
  const deletePending = pendingAction === `delete:${todo.id}`;
  const importantPending = pendingAction === `important:${todo.id}`;
  const dueDate = formatHomeTodoDueDate(todo, locale, copy.due);
  const dueTone = getHomeTodoDueTone(todo);

  return (
    <article
      className={cn(
        "rounded-[24px] border border-[#e2e7eb] bg-white p-4 shadow-[0_10px_24px_rgba(96,113,128,0.04)]",
        todo.is_completed ? "opacity-78" : "",
      )}
      data-testid="home-todo-item"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <button
            aria-label={
              todo.is_completed
                ? copy.actions.unmarkComplete
                : copy.actions.markComplete
            }
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d9e3e8] bg-[#f7fafb] text-[#486782] transition hover:bg-[#edf3f6]"
            data-testid="home-todo-complete-button"
            disabled={completePending}
            onClick={onToggleComplete}
            title={
              todo.is_completed
                ? copy.actions.unmarkComplete
                : copy.actions.markComplete
            }
            type="button"
          >
            {completePending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : todo.is_completed ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <Circle className="size-5" />
            )}
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4
                className={cn(
                  "min-w-0 max-w-full break-words text-base font-semibold leading-6 text-[#23313a] [overflow-wrap:anywhere]",
                  todo.is_completed ? "text-[#7f8a92] line-through" : "",
                )}
              >
                {todo.title}
              </h4>
              {todo.is_important ? (
                <span className="inline-flex min-h-7 items-center rounded-full bg-[#fff3cd] px-3 py-1 text-xs font-semibold text-[#8a6505]">
                  <Star className="mr-1 size-3.5 fill-current" />
                  {copy.actions.important}
                </span>
              ) : null}
              {todo.is_completed ? (
                <span className="inline-flex min-h-7 items-center rounded-full bg-[#e8f4ec] px-3 py-1 text-xs font-semibold text-[#4c7259]">
                  {copy.completedLabel}
                </span>
              ) : null}
            </div>

            {todo.notes ? (
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#65727d] [overflow-wrap:anywhere]">
                {todo.notes}
              </p>
            ) : null}

            {dueDate ? (
              <p
                className={cn(
                  "mt-3 inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-semibold",
                  dueTone === "overdue" && "bg-[#ffe6e3] text-[#a43d34]",
                  dueTone === "today" && "bg-[#fff1c7] text-[#8a6505]",
                  dueTone === "default" && "bg-[#eef3f6] text-[#486782]",
                )}
              >
                <CalendarDays className="mr-1.5 size-3.5" />
                {dueDate}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <IconActionButton
            active={todo.is_important}
            disabled={importantPending}
            label={
              todo.is_important
                ? copy.actions.unmarkImportant
                : copy.actions.markImportant
            }
            onClick={onToggleImportant}
            testId="home-todo-important-button"
          >
            {importantPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Star
                className={cn("size-4", todo.is_important ? "fill-current" : "")}
              />
            )}
          </IconActionButton>

          <IconActionButton
            label={copy.actions.edit}
            onClick={onEdit}
            testId="home-todo-edit-button"
          >
            <Edit3 className="size-4" />
          </IconActionButton>

          <IconActionButton
            danger
            disabled={deletePending}
            label={copy.actions.delete}
            onClick={onDelete}
            testId="home-todo-delete-button"
          >
            {deletePending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </IconActionButton>
        </div>
      </div>
    </article>
  );
}

function IconActionButton({
  active,
  children,
  danger,
  disabled,
  label,
  onClick,
  testId,
}: {
  active?: boolean;
  children: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border transition",
        active
          ? "border-[#e4c979] bg-[#fff6d8] text-[#a07604]"
          : "border-[#d9e3e8] bg-[#f7fafb] text-[#486782] hover:bg-[#edf3f6]",
        danger ? "text-[#a4473f] hover:bg-[#fff2f0]" : "",
      )}
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}
