import type { UserTodoErrorCopy, UserTodoItemRow } from "@/lib/user-todos";

export type HomeTodoFilter = "active" | "all" | "completed";

export type HomeTodoFormState = {
  dueDate: string;
  isCompleted: boolean;
  isImportant: boolean;
  notes: string;
  title: string;
};

export type HomeTodoFeedbackCopy = {
  createSuccess: string;
  deleteConfirm: (title: string) => string;
  deleteSuccess: string;
  updateSuccess: string;
};

export type HomeTodoValidationCopy = {
  notesTooLong: string;
  titleRequired: string;
  titleTooLong: string;
};

export type HomeTodoCopy = {
  actions: {
    add: string;
    cancel: string;
    delete: string;
    edit: string;
    important: string;
    markComplete: string;
    markImportant: string;
    save: string;
    unmarkComplete: string;
    unmarkImportant: string;
  };
  completedLabel: string;
  description: string;
  dialog: {
    completedLabel: string;
    description: string;
    dueDateLabel: string;
    importantLabel: string;
    notesLabel: string;
    notesPlaceholder: string;
    title: string;
    titleLabel: string;
    titlePlaceholder: string;
  };
  due: {
    overdue: (date: string) => string;
    today: string;
    tomorrow: string;
  };
  empty: Record<HomeTodoFilter, { description: string; title: string }>;
  errors: UserTodoErrorCopy;
  feedback: HomeTodoFeedbackCopy;
  filters: Record<HomeTodoFilter, (count: number) => string>;
  quickAdd: {
    dueDateLabel: string;
    placeholder: string;
  };
  title: string;
  validation: HomeTodoValidationCopy;
};

type HomeTodoTranslator = (
  key: string,
  values?: Record<string, number | string>,
) => string;

const TODO_TITLE_MAX_LENGTH = 120;
const TODO_NOTES_MAX_LENGTH = 2000;

export const homeTodoFilterValues: readonly HomeTodoFilter[] = [
  "active",
  "all",
  "completed",
];

export function createHomeTodoCopy(t: HomeTodoTranslator): HomeTodoCopy {
  return {
    actions: {
      add: t("todos.actions.add"),
      cancel: t("todos.actions.cancel"),
      delete: t("todos.actions.delete"),
      edit: t("todos.actions.edit"),
      important: t("todos.actions.important"),
      markComplete: t("todos.actions.markComplete"),
      markImportant: t("todos.actions.markImportant"),
      save: t("todos.actions.save"),
      unmarkComplete: t("todos.actions.unmarkComplete"),
      unmarkImportant: t("todos.actions.unmarkImportant"),
    },
    completedLabel: t("todos.completedLabel"),
    description: t("todos.description"),
    dialog: {
      completedLabel: t("todos.dialog.completedLabel"),
      description: t("todos.dialog.description"),
      dueDateLabel: t("todos.dialog.dueDateLabel"),
      importantLabel: t("todos.dialog.importantLabel"),
      notesLabel: t("todos.dialog.notesLabel"),
      notesPlaceholder: t("todos.dialog.notesPlaceholder"),
      title: t("todos.dialog.title"),
      titleLabel: t("todos.dialog.titleLabel"),
      titlePlaceholder: t("todos.dialog.titlePlaceholder"),
    },
    due: {
      overdue: (date) => t("todos.due.overdue", { date }),
      today: t("todos.due.today"),
      tomorrow: t("todos.due.tomorrow"),
    },
    empty: {
      active: {
        description: t("todos.empty.activeDescription"),
        title: t("todos.empty.activeTitle"),
      },
      all: {
        description: t("todos.empty.allDescription"),
        title: t("todos.empty.allTitle"),
      },
      completed: {
        description: t("todos.empty.completedDescription"),
        title: t("todos.empty.completedTitle"),
      },
    },
    errors: {
      authRequired: t("todos.errors.authRequired"),
      notFound: t("todos.errors.notFound"),
      notesInvalid: t("todos.errors.notesInvalid"),
      permission: t("todos.errors.permission"),
      titleInvalid: t("todos.errors.titleInvalid"),
      unknown: t("todos.errors.unknown"),
    },
    feedback: {
      createSuccess: t("todos.feedback.createSuccess"),
      deleteConfirm: (title) => t("todos.feedback.deleteConfirm", { title }),
      deleteSuccess: t("todos.feedback.deleteSuccess"),
      updateSuccess: t("todos.feedback.updateSuccess"),
    },
    filters: {
      active: (count) => t("todos.filters.active", { count }),
      all: (count) => t("todos.filters.all", { count }),
      completed: (count) => t("todos.filters.completed", { count }),
    },
    quickAdd: {
      dueDateLabel: t("todos.quickAdd.dueDateLabel"),
      placeholder: t("todos.quickAdd.placeholder"),
    },
    title: t("todos.title"),
    validation: {
      notesTooLong: t("todos.validation.notesTooLong"),
      titleRequired: t("todos.validation.titleRequired"),
      titleTooLong: t("todos.validation.titleTooLong"),
    },
  };
}

export function createEmptyHomeTodoForm(): HomeTodoFormState {
  return {
    dueDate: "",
    isCompleted: false,
    isImportant: false,
    notes: "",
    title: "",
  };
}

export function createHomeTodoFormFromRow(
  row: UserTodoItemRow,
): HomeTodoFormState {
  return {
    dueDate: row.due_date ?? "",
    isCompleted: row.is_completed,
    isImportant: row.is_important,
    notes: row.notes,
    title: row.title,
  };
}

export function validateHomeTodoForm(
  formState: HomeTodoFormState,
  copy: HomeTodoValidationCopy,
) {
  const title = formState.title.trim();
  const notes = formState.notes.trim();

  if (!title) {
    return copy.titleRequired;
  }

  if (title.length > TODO_TITLE_MAX_LENGTH) {
    return copy.titleTooLong;
  }

  if (notes.length > TODO_NOTES_MAX_LENGTH) {
    return copy.notesTooLong;
  }

  return null;
}

export function toUserTodoMutationInput(formState: HomeTodoFormState) {
  return {
    dueDate: formState.dueDate || null,
    isCompleted: formState.isCompleted,
    isImportant: formState.isImportant,
    notes: formState.notes,
    title: formState.title,
  };
}

export function getHomeTodoCounts(todos: readonly UserTodoItemRow[]) {
  const completed = todos.filter((todo) => todo.is_completed).length;
  const active = todos.length - completed;

  return {
    active,
    all: todos.length,
    completed,
  };
}

export function filterHomeTodos(
  todos: readonly UserTodoItemRow[],
  filter: HomeTodoFilter,
) {
  if (filter === "active") {
    return todos.filter((todo) => !todo.is_completed);
  }

  if (filter === "completed") {
    return todos.filter((todo) => todo.is_completed);
  }

  return [...todos];
}

export function formatHomeTodoDueDate(
  todo: UserTodoItemRow,
  locale: string,
  copy: HomeTodoCopy["due"],
) {
  if (!todo.due_date) {
    return "";
  }

  const formattedDate = formatTodoDate(todo.due_date, locale);

  if (todo.is_completed) {
    return formattedDate;
  }

  const today = getShanghaiDateKey();

  if (todo.due_date < today) {
    return copy.overdue(formattedDate);
  }

  if (todo.due_date === today) {
    return copy.today;
  }

  if (todo.due_date === addDaysToDateKey(today, 1)) {
    return copy.tomorrow;
  }

  return formattedDate;
}

export function getHomeTodoDueTone(todo: UserTodoItemRow) {
  if (!todo.due_date || todo.is_completed) {
    return "default" as const;
  }

  const today = getShanghaiDateKey();

  if (todo.due_date < today) {
    return "overdue" as const;
  }

  if (todo.due_date === today) {
    return "today" as const;
  }

  return "default" as const;
}

function formatTodoDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "Asia/Shanghai",
  }).format(new Date(`${value}T00:00:00+08:00`));
}

function getShanghaiDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Shanghai",
    year: "numeric",
  }).formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));

  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

function addDaysToDateKey(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00+08:00`);
  date.setUTCDate(date.getUTCDate() + days);

  return getShanghaiDateKey(date);
}
