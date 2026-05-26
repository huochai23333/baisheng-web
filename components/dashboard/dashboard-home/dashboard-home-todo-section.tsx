"use client";

import type { ReactNode } from "react";

import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Edit3,
  ListTodo,
  LoaderCircle,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserTodoItemRow } from "@/lib/user-todos";

import { EmptyState, PageBanner } from "../dashboard-shared-ui";
import {
  HomeTodoDeleteDialog,
  HomeTodoDialog,
} from "./dashboard-home-todo-dialog";
import {
  formatHomeTodoDueDate,
  getHomeTodoDueTone,
  homeTodoFilterValues,
  type HomeTodoCopy,
  type HomeTodoFilter,
} from "./dashboard-home-todo-display";
import { useDashboardHomeTodos } from "./use-dashboard-home-todos";

type HomeTodosSectionProps = {
  copy: HomeTodoCopy;
  initialTodos: UserTodoItemRow[];
  locale: string;
};

export function HomeTodosSection({
  copy,
  initialTodos,
  locale,
}: HomeTodosSectionProps) {
  const todoState = useDashboardHomeTodos({ copy, initialTodos });
  const emptyCopy = copy.empty[todoState.filter];
  const createPending = todoState.pendingAction === "create";

  return (
    <section
      className="rounded-[28px] border border-white/85 bg-white/72 p-6 shadow-[0_18px_45px_rgba(96,113,128,0.06)] xl:p-8"
      data-testid="home-todos-section"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[#23313a]">
            <ListTodo className="size-6 text-[#486782]" />
            {copy.title}
          </h3>
          <p className="mt-2 text-sm leading-7 text-[#69747d]">
            {copy.description}
          </p>
        </div>
      </div>

      <form
        className="mt-6 grid gap-3 rounded-[24px] border border-[#e2e7eb] bg-[#fbfaf8] p-4 lg:grid-cols-[minmax(0,1fr)_180px_auto_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          void todoState.handleCreate();
        }}
      >
        <input
          aria-label={copy.quickAdd.placeholder}
          className="h-12 min-w-0 rounded-[18px] border border-[#dfe5ea] bg-white px-4 text-sm text-[#23313a] outline-none transition placeholder:text-[#8a949c] focus:border-[#bfd2e1] focus:ring-4 focus:ring-[#bfd2e1]/30"
          data-testid="home-todo-title-input"
          onChange={(event) =>
            todoState.updateQuickDraftField("title", event.target.value)
          }
          placeholder={copy.quickAdd.placeholder}
          type="text"
          value={todoState.quickDraft.title}
        />

        <label className="block min-w-0">
          <span className="sr-only">{copy.quickAdd.dueDateLabel}</span>
          <input
            className="h-12 w-full rounded-[18px] border border-[#dfe5ea] bg-white px-3 text-sm text-[#23313a] outline-none transition focus:border-[#bfd2e1] focus:ring-4 focus:ring-[#bfd2e1]/30"
            onChange={(event) =>
              todoState.updateQuickDraftField("dueDate", event.target.value)
            }
            type="date"
            value={todoState.quickDraft.dueDate}
          />
        </label>

        <button
          aria-label={
            todoState.quickDraft.isImportant
              ? copy.actions.unmarkImportant
              : copy.actions.markImportant
          }
          aria-pressed={todoState.quickDraft.isImportant}
          className={cn(
            "flex h-12 w-full items-center justify-center rounded-[18px] border text-[#7b858d] transition sm:w-12",
            todoState.quickDraft.isImportant
              ? "border-[#e4c979] bg-[#fff6d8] text-[#a07604]"
              : "border-[#dfe5ea] bg-white hover:bg-[#f4f7f9]",
          )}
          data-testid="home-todo-quick-important"
          onClick={() =>
            todoState.updateQuickDraftField(
              "isImportant",
              !todoState.quickDraft.isImportant,
            )
          }
          title={
            todoState.quickDraft.isImportant
              ? copy.actions.unmarkImportant
              : copy.actions.markImportant
          }
          type="button"
        >
          <Star
            className={cn(
              "size-4",
              todoState.quickDraft.isImportant ? "fill-current" : "",
            )}
          />
        </button>

        <Button
          className="h-12 rounded-[18px] bg-[#486782] px-5 text-white hover:bg-[#3e5f79]"
          data-testid="home-todo-add-button"
          disabled={createPending}
          type="submit"
        >
          {createPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          {copy.actions.add}
        </Button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist">
        {homeTodoFilterValues.map((filterValue) => (
          <TodoFilterButton
            active={todoState.filter === filterValue}
            count={todoState.counts[filterValue]}
            filter={filterValue}
            key={filterValue}
            label={copy.filters[filterValue](todoState.counts[filterValue])}
            onClick={() => todoState.setFilter(filterValue)}
          />
        ))}
      </div>

      {todoState.pageFeedback ? (
        <div className="mt-5">
          <PageBanner tone={todoState.pageFeedback.tone}>
            {todoState.pageFeedback.message}
          </PageBanner>
        </div>
      ) : null}

      <div className="mt-6">
        {todoState.filteredTodos.length === 0 ? (
          <EmptyState
            description={emptyCopy.description}
            icon={<ListTodo className="size-6" />}
            title={emptyCopy.title}
          />
        ) : (
          <div className="space-y-3">
            {todoState.filteredTodos.map((todo) => (
              <TodoItem
                copy={copy}
                key={todo.id}
                locale={locale}
                onDelete={() => void todoState.handleDelete(todo)}
                onEdit={() => todoState.openEditDialog(todo)}
                onToggleComplete={() => todoState.handleToggleComplete(todo)}
                onToggleImportant={() => todoState.handleToggleImportant(todo)}
                pendingAction={todoState.pendingAction}
                todo={todo}
              />
            ))}
          </div>
        )}
      </div>

      <HomeTodoDialog
        copy={copy}
        feedback={todoState.dialogFeedback}
        formState={todoState.formState}
        onOpenChange={todoState.handleDialogOpenChange}
        onSubmit={() => void todoState.handleSubmitEdit()}
        onUpdateField={todoState.updateFormField}
        open={todoState.dialogOpen}
        pending={todoState.pendingAction === "edit"}
      />
      <HomeTodoDeleteDialog
        copy={copy}
        onConfirm={() => void todoState.handleConfirmDelete()}
        onOpenChange={todoState.handleDeleteDialogOpenChange}
        open={todoState.deleteTarget !== null}
        pending={
          todoState.deleteTarget
            ? todoState.pendingAction === `delete:${todoState.deleteTarget.id}`
            : false
        }
        todo={todoState.deleteTarget}
      />
    </section>
  );
}

function TodoFilterButton({
  active,
  count,
  filter,
  label,
  onClick,
}: {
  active: boolean;
  count: number;
  filter: HomeTodoFilter;
  label: string;
  onClick: () => void;
}) {
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

function TodoItem({
  copy,
  locale,
  onDelete,
  onEdit,
  onToggleComplete,
  onToggleImportant,
  pendingAction,
  todo,
}: {
  copy: HomeTodoCopy;
  locale: string;
  onDelete: () => void;
  onEdit: () => void;
  onToggleComplete: () => void;
  onToggleImportant: () => void;
  pendingAction: string | null;
  todo: UserTodoItemRow;
}) {
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
                  dueTone === "overdue" &&
                    "bg-[#ffe6e3] text-[#a43d34]",
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
