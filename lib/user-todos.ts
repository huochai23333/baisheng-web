import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getDashboardQueryRange,
  MAX_DASHBOARD_QUERY_ROWS,
} from "./dashboard-pagination";
import { withRequestTimeout } from "./request-timeout";
import {
  getCurrentSessionContext,
  type UserStatus,
} from "./user-self-service";

export type UserTodoItemRow = {
  id: string;
  user_id: string;
  title: string;
  notes: string;
  is_completed: boolean;
  is_important: boolean;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UserTodoCreateInput = {
  dueDate: string | null;
  isImportant: boolean;
  notes: string;
  title: string;
};

export type UserTodoUpdateInput = UserTodoCreateInput & {
  isCompleted: boolean;
};

export type UserTodoErrorCopy = {
  authRequired: string;
  notFound: string;
  notesInvalid: string;
  permission: string;
  titleInvalid: string;
  unknown: string;
};

type UserTodoReaderContext = {
  status: UserStatus | null;
  userId: string;
};

const USER_TODO_SELECT =
  "id,user_id,title,notes,is_completed,is_important,due_date,completed_at,created_at,updated_at";
const USER_TODO_MUTATION_TIMEOUT_MS = 20_000;

export async function getUserTodos(
  supabase: SupabaseClient,
  context?: UserTodoReaderContext,
  limit = MAX_DASHBOARD_QUERY_ROWS,
) {
  const readerContext = context ?? (await getUserTodoReaderContext(supabase));

  if (!readerContext || readerContext.status !== "active") {
    return [];
  }

  const { from, to } = getDashboardQueryRange(limit);
  const { data, error } = await withRequestTimeout(
    supabase
      .from("user_todo_items")
      .select(USER_TODO_SELECT)
      .eq("user_id", readerContext.userId)
      .order("is_completed", { ascending: true })
      .order("is_important", { ascending: false })
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("updated_at", { ascending: false })
      .range(from, to)
      .returns<UserTodoItemRow[]>(),
  );

  if (error) {
    throw error;
  }

  return sortUserTodos(normalizeUserTodoRows(data));
}

export async function createUserTodo(
  supabase: SupabaseClient,
  input: UserTodoCreateInput,
) {
  const { data, error } = await withRequestTimeout(
    supabase
      .rpc("create_user_todo", {
        _due_date: normalizeTodoDueDate(input.dueDate),
        _is_important: input.isImportant,
        _notes: input.notes,
        _title: input.title,
      })
      .maybeSingle<UserTodoItemRow>(),
    { timeoutMs: USER_TODO_MUTATION_TIMEOUT_MS },
  );

  if (error) {
    throw error;
  }

  const todo = normalizeUserTodoRow(data);

  if (!todo) {
    throw new Error("todo_save_failed");
  }

  return todo;
}

export async function updateUserTodo(
  supabase: SupabaseClient,
  todoId: string,
  input: UserTodoUpdateInput,
) {
  const { data, error } = await withRequestTimeout(
    supabase
      .rpc("update_user_todo", {
        _due_date: normalizeTodoDueDate(input.dueDate),
        _is_completed: input.isCompleted,
        _is_important: input.isImportant,
        _notes: input.notes,
        _title: input.title,
        _todo_id: todoId,
      })
      .maybeSingle<UserTodoItemRow>(),
    { timeoutMs: USER_TODO_MUTATION_TIMEOUT_MS },
  );

  if (error) {
    throw error;
  }

  const todo = normalizeUserTodoRow(data);

  if (!todo) {
    throw new Error("todo_save_failed");
  }

  return todo;
}

export async function deleteUserTodo(
  supabase: SupabaseClient,
  todoId: string,
) {
  const { data, error } = await withRequestTimeout(
    supabase
      .rpc("delete_user_todo", {
        _todo_id: todoId,
      })
      .maybeSingle<UserTodoItemRow>(),
    { timeoutMs: USER_TODO_MUTATION_TIMEOUT_MS },
  );

  if (error) {
    throw error;
  }

  const todo = normalizeUserTodoRow(data);

  if (!todo) {
    throw new Error("todo_not_found");
  }

  return todo;
}

export function sortUserTodos(rows: readonly UserTodoItemRow[]) {
  return [...rows].sort((left, right) => {
    if (left.is_completed !== right.is_completed) {
      return left.is_completed ? 1 : -1;
    }

    if (!left.is_completed && left.is_important !== right.is_important) {
      return left.is_important ? -1 : 1;
    }

    if (!left.is_completed) {
      const dueDiff = getTodoDueSortTime(left) - getTodoDueSortTime(right);

      if (dueDiff !== 0) {
        return dueDiff;
      }
    }

    if (left.is_completed || right.is_completed) {
      return getTodoCompletedSortTime(right) - getTodoCompletedSortTime(left);
    }

    return getTodoUpdatedSortTime(right) - getTodoUpdatedSortTime(left);
  });
}

export function toUserTodoErrorMessage(
  error: unknown,
  copy: UserTodoErrorCopy,
) {
  const message = error instanceof Error ? error.message.trim() : "";
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("todo_auth_required")) {
    return copy.authRequired;
  }

  if (
    normalizedMessage.includes("todo_forbidden") ||
    normalizedMessage.includes("permission") ||
    normalizedMessage.includes("forbidden") ||
    normalizedMessage.includes("unauthorized") ||
    normalizedMessage.includes("row-level security")
  ) {
    return copy.permission;
  }

  if (normalizedMessage.includes("todo_title_invalid")) {
    return copy.titleInvalid;
  }

  if (normalizedMessage.includes("todo_notes_invalid")) {
    return copy.notesInvalid;
  }

  if (normalizedMessage.includes("todo_not_found")) {
    return copy.notFound;
  }

  return copy.unknown;
}

async function getUserTodoReaderContext(
  supabase: SupabaseClient,
): Promise<UserTodoReaderContext | null> {
  const { status, user } = await getCurrentSessionContext(supabase);

  if (!user) {
    return null;
  }

  return {
    status,
    userId: user.id,
  };
}

function normalizeUserTodoRows(value: UserTodoItemRow[] | null) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeUserTodoRow(item))
    .filter((item): item is UserTodoItemRow => item !== null);
}

function normalizeUserTodoRow(
  value: UserTodoItemRow | null,
): UserTodoItemRow | null {
  if (!value?.id || !value.user_id) {
    return null;
  }

  return {
    completed_at: value.completed_at,
    created_at: value.created_at,
    due_date: normalizeTodoDueDate(value.due_date),
    id: value.id,
    is_completed: Boolean(value.is_completed),
    is_important: Boolean(value.is_important),
    notes: value.notes?.trim() ?? "",
    title: value.title?.trim() ?? "",
    updated_at: value.updated_at,
    user_id: value.user_id,
  };
}

function normalizeTodoDueDate(value: string | null | undefined) {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  return normalized;
}

function getTodoDueSortTime(row: UserTodoItemRow) {
  if (!row.due_date) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Date.parse(`${row.due_date}T00:00:00+08:00`);
}

function getTodoCompletedSortTime(row: UserTodoItemRow) {
  const value = row.completed_at ?? row.updated_at ?? row.created_at;

  return value ? new Date(value).getTime() : 0;
}

function getTodoUpdatedSortTime(row: UserTodoItemRow) {
  const value = row.updated_at ?? row.created_at;

  return value ? new Date(value).getTime() : 0;
}
