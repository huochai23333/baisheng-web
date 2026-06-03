"use client";

import { useCallback, useMemo, useState } from "react";

import { markBrowserCloudSyncActivity } from "@/lib/browser-sync-recovery";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import {
  createUserTodo,
  deleteUserTodo,
  getUserTodos,
  sortUserTodos,
  toUserTodoErrorMessage,
  updateUserTodo,
  type UserTodoItemRow,
  type UserTodoUpdateInput,
} from "@/lib/user-todos";

import type { NoticeTone } from "../dashboard-shared-ui";
import { useWorkspaceSyncEffect } from "../workspace-session-provider";
import {
  createEmptyHomeTodoForm,
  createHomeTodoFormFromRow,
  filterHomeTodos,
  getHomeTodoCounts,
  toUserTodoMutationInput,
  validateHomeTodoForm,
  type HomeTodoCopy,
  type HomeTodoFilter,
  type HomeTodoFormState,
} from "./dashboard-home-todo-display";

type Feedback = { message: string; tone: NoticeTone } | null;
type PendingAction =
  | "create"
  | "edit"
  | `complete:${string}`
  | `delete:${string}`
  | `important:${string}`
  | null;
type TogglePendingAction = `complete:${string}` | `important:${string}`;

type UseDashboardHomeTodosOptions = {
  copy: HomeTodoCopy;
  initialTodos: UserTodoItemRow[];
};

export function useDashboardHomeTodos({
  copy,
  initialTodos,
}: UseDashboardHomeTodosOptions) {
  const supabase = getBrowserSupabaseClient();
  const [todos, setTodos] = useState(() => sortUserTodos(initialTodos));
  const [filter, setFilter] = useState<HomeTodoFilter>("active");
  const [quickDraft, setQuickDraft] = useState<HomeTodoFormState>(() =>
    createEmptyHomeTodoForm(),
  );
  const [formState, setFormState] = useState<HomeTodoFormState>(() =>
    createEmptyHomeTodoForm(),
  );
  const [editingTodo, setEditingTodo] = useState<UserTodoItemRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserTodoItemRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pageFeedback, setPageFeedback] = useState<Feedback>(null);
  const [dialogFeedback, setDialogFeedback] = useState<Feedback>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const applyTodo = useCallback((updatedTodo: UserTodoItemRow) => {
    setTodos((current) =>
      sortUserTodos(
        current.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo)),
      ),
    );
  }, []);

  const refreshTodos = useCallback(
    async ({ isMounted }: { isMounted: () => boolean }) => {
      if (!supabase) {
        return;
      }

      try {
        const nextTodos = await getUserTodos(supabase);

        if (isMounted()) {
          setTodos(nextTodos);
        }
      } catch (error) {
        if (!isMounted()) {
          return;
        }

        setPageFeedback({
          message: toUserTodoErrorMessage(error, copy.errors),
          tone: "error",
        });
      }
    },
    [copy.errors, supabase],
  );

  useWorkspaceSyncEffect(refreshTodos);

  const counts = useMemo(() => getHomeTodoCounts(todos), [todos]);
  const filteredTodos = useMemo(
    () => filterHomeTodos(todos, filter),
    [filter, todos],
  );

  const updateQuickDraftField = useCallback(
    <Key extends keyof HomeTodoFormState>(
      field: Key,
      value: HomeTodoFormState[Key],
    ) => {
      setQuickDraft((current) => ({
        ...current,
        [field]: value,
      }));
    },
    [],
  );

  const updateFormField = useCallback(
    <Key extends keyof HomeTodoFormState>(
      field: Key,
      value: HomeTodoFormState[Key],
    ) => {
      setFormState((current) => ({
        ...current,
        [field]: value,
      }));
    },
    [],
  );

  const handleCreate = useCallback(async () => {
    if (!supabase || pendingAction) {
      return;
    }

    const validationMessage = validateHomeTodoForm(quickDraft, copy.validation);

    if (validationMessage) {
      setPageFeedback({ message: validationMessage, tone: "error" });
      return;
    }

    setPendingAction("create");
    setPageFeedback(null);

    try {
      const createdTodo = await createUserTodo(
        supabase,
        toUserTodoMutationInput(quickDraft),
      );

      markBrowserCloudSyncActivity();
      setTodos((current) => sortUserTodos([createdTodo, ...current]));
      setQuickDraft(createEmptyHomeTodoForm());
      setFilter("active");
      setPageFeedback({
        message: copy.feedback.createSuccess,
        tone: "success",
      });
    } catch (error) {
      setPageFeedback({
        message: toUserTodoErrorMessage(error, copy.errors),
        tone: "error",
      });
    } finally {
      setPendingAction(null);
    }
  }, [copy, pendingAction, quickDraft, supabase]);

  const openEditDialog = useCallback((todo: UserTodoItemRow) => {
    setEditingTodo(todo);
    setFormState(createHomeTodoFormFromRow(todo));
    setDialogFeedback(null);
    setDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open && pendingAction === "edit") {
        return;
      }

      setDialogOpen(open);

      if (!open) {
        setDialogFeedback(null);
      }
    },
    [pendingAction],
  );

  const openDeleteDialog = useCallback((todo: UserTodoItemRow) => {
    setDeleteTarget(todo);
    setPageFeedback(null);
  }, []);

  const handleDeleteDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open && deleteTarget && pendingAction === `delete:${deleteTarget.id}`) {
        return;
      }

      if (!open) {
        setDeleteTarget(null);
      }
    },
    [deleteTarget, pendingAction],
  );

  const saveTodoUpdate = useCallback(
    async (
      todo: UserTodoItemRow,
      input: UserTodoUpdateInput,
      action: TogglePendingAction,
      successMessage?: string,
    ) => {
      if (!supabase || pendingAction) {
        return;
      }

      setPendingAction(action);
      setPageFeedback(null);

      try {
        const updatedTodo = await updateUserTodo(supabase, todo.id, input);

        markBrowserCloudSyncActivity();
        applyTodo(updatedTodo);

        if (successMessage) {
          setPageFeedback({ message: successMessage, tone: "success" });
        }
      } catch (error) {
        setPageFeedback({
          message: toUserTodoErrorMessage(error, copy.errors),
          tone: "error",
        });
      } finally {
        setPendingAction(null);
      }
    },
    [applyTodo, copy.errors, pendingAction, supabase],
  );

  const handleToggleComplete = useCallback(
    (todo: UserTodoItemRow) => {
      void saveTodoUpdate(
        todo,
        {
          dueDate: todo.due_date,
          isCompleted: !todo.is_completed,
          isImportant: todo.is_important,
          notes: todo.notes,
          title: todo.title,
        },
        `complete:${todo.id}`,
      );
    },
    [saveTodoUpdate],
  );

  const handleToggleImportant = useCallback(
    (todo: UserTodoItemRow) => {
      void saveTodoUpdate(
        todo,
        {
          dueDate: todo.due_date,
          isCompleted: todo.is_completed,
          isImportant: !todo.is_important,
          notes: todo.notes,
          title: todo.title,
        },
        `important:${todo.id}`,
      );
    },
    [saveTodoUpdate],
  );

  const handleSubmitEdit = useCallback(async () => {
    if (!editingTodo || !supabase || pendingAction) {
      return;
    }

    const validationMessage = validateHomeTodoForm(formState, copy.validation);

    if (validationMessage) {
      setDialogFeedback({ message: validationMessage, tone: "error" });
      return;
    }

    setPendingAction("edit");
    setDialogFeedback(null);

    try {
      const updatedTodo = await updateUserTodo(
        supabase,
        editingTodo.id,
        toUserTodoMutationInput(formState),
      );

      markBrowserCloudSyncActivity();
      applyTodo(updatedTodo);
      setPageFeedback({
        message: copy.feedback.updateSuccess,
        tone: "success",
      });
      setDialogOpen(false);
      setEditingTodo(null);
      setFormState(createEmptyHomeTodoForm());
    } catch (error) {
      setDialogFeedback({
        message: toUserTodoErrorMessage(error, copy.errors),
        tone: "error",
      });
    } finally {
      setPendingAction(null);
    }
  }, [applyTodo, copy, editingTodo, formState, pendingAction, supabase]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget || !supabase || pendingAction) {
      return;
    }

    setPendingAction(`delete:${deleteTarget.id}`);
    setPageFeedback(null);

    try {
      await deleteUserTodo(supabase, deleteTarget.id);

      markBrowserCloudSyncActivity();
      setTodos((current) =>
        current.filter((item) => item.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
      setPageFeedback({
        message: copy.feedback.deleteSuccess,
        tone: "success",
      });
    } catch (error) {
      setPageFeedback({
        message: toUserTodoErrorMessage(error, copy.errors),
        tone: "error",
      });
    } finally {
      setPendingAction(null);
    }
  }, [copy, deleteTarget, pendingAction, supabase]);

  return {
    counts,
    deleteTarget,
    dialogFeedback,
    dialogOpen,
    editingTodo,
    filter,
    filteredTodos,
    formState,
    handleConfirmDelete,
    handleCreate,
    handleDelete: openDeleteDialog,
    handleDeleteDialogOpenChange,
    handleDialogOpenChange,
    handleSubmitEdit,
    handleToggleComplete,
    handleToggleImportant,
    openEditDialog,
    openDeleteDialog,
    pageFeedback,
    pendingAction,
    quickDraft,
    setFilter,
    todos,
    updateFormField,
    updateQuickDraftField,
  };
}

export type DashboardHomeTodosState = ReturnType<typeof useDashboardHomeTodos>;
