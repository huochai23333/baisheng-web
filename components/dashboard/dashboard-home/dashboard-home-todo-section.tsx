"use client";

import {
  ListTodo,
  LoaderCircle,
  Plus,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { EmptyState, PageBanner } from "../dashboard-shared-ui";
import {
  HomeTodoDeleteDialog,
  HomeTodoDialog,
} from "./dashboard-home-todo-dialog";
import {
  homeTodoFilterValues,
  type HomeTodoCopy,
} from "./dashboard-home-todo-display";
import { TodoFilterButton, TodoItem } from "./dashboard-home-todo-list";
import type { DashboardHomeTodosState } from "./use-dashboard-home-todos";

type HomeTodosSectionProps = {
  copy: HomeTodoCopy;
  density?: "comfortable" | "compact";
  frame?: "card" | "plain";
  state: DashboardHomeTodosState;
  locale: string;
};

export function HomeTodosSection({
  copy,
  density = "comfortable",
  frame = "card",
  state: todoState,
  locale,
}: HomeTodosSectionProps) {
  const emptyCopy = copy.empty[todoState.filter];
  const createPending = todoState.pendingAction === "create";
  const compact = density === "compact";

  return (
    <section
      className={cn(
        frame === "card"
          ? "rounded-[28px] border border-white/85 bg-white/72 p-6 shadow-[0_18px_45px_rgba(96,113,128,0.06)] xl:p-8"
          : "flex h-full min-h-0 flex-col overflow-hidden",
      )}
      data-testid="home-todos-section"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h3
            className={cn(
              "flex items-center gap-2 font-bold tracking-tight text-[#23313a]",
              compact ? "text-lg" : "text-2xl",
            )}
          >
            <ListTodo
              className={cn("text-[#486782]", compact ? "size-5" : "size-6")}
            />
            {copy.title}
          </h3>
          <p
            className={cn(
              "mt-2 text-sm leading-7 text-[#69747d]",
              compact && "text-xs leading-6",
            )}
          >
            {copy.description}
          </p>
        </div>
      </div>

      <form
        className={cn(
          "mt-6 grid gap-3 rounded-[24px] border border-[#e2e7eb] bg-[#fbfaf8] p-4 lg:grid-cols-[minmax(0,1fr)_180px_auto_auto]",
          frame === "plain" && "mt-4",
        )}
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

      <div
        className={cn(
          "mt-6",
          frame === "plain" && "min-h-0 flex-1 overflow-y-auto pr-1",
        )}
      >
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
