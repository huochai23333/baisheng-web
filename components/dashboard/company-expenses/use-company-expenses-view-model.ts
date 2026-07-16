"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { useDashboardConfirm } from "@/components/dashboard/dashboard-confirm-provider";

import { markBrowserCloudSyncActivity } from "@/lib/browser-sync-recovery";
import {
  createCompanyExpense,
  deleteCompanyExpense,
  getCompanyExpensesPageData,
  sortCompanyExpenses,
  updateCompanyExpense,
  type CompanyExpenseCategory,
  type CompanyExpensesPageData,
  type CompanyExpenseRow,
} from "@/lib/company-expenses";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { normalizeSearchText } from "@/lib/value-normalizers";

import type { NoticeTone } from "../dashboard-shared-ui";
import { useWorkspaceSyncEffect } from "../workspace-session-provider";
import {
  createCompanyExpenseFormFromRow,
  createEmptyCompanyExpenseForm,
  getCompanyExpenseMonthValue,
  toCompanyExpenseErrorMessage,
  toCompanyExpenseInput,
  type CompanyExpenseFormState,
} from "./company-expenses-display";

type Feedback = { tone: NoticeTone; message: string } | null;
type PendingAction = { id: string; type: "delete" } | null;

type CompanyExpensesViewModelCopy = {
  createSuccess: string;
  deleteConfirm: (title: string) => string;
  deleteSuccess: string;
  invalidAmount: string;
  invalidMonth: string;
  missingAmount: string;
  missingTitle: string;
  notFoundError: string;
  permissionError: string;
  unknownError: string;
  updateSuccess: string;
};

type UseCompanyExpensesViewModelOptions = {
  copy: CompanyExpensesViewModelCopy;
  initialData: CompanyExpensesPageData;
};

export function useCompanyExpensesViewModel({
  copy,
  initialData,
}: UseCompanyExpensesViewModelOptions) {
  const confirm = useDashboardConfirm();
  const confirmT = useTranslations("DashboardFramework.confirm");
  const supabase = getBrowserSupabaseClient();
  const [expenses, setExpenses] = useState(initialData.expenses);
  const [hasPermission, setHasPermission] = useState(initialData.hasPermission);
  const [pageFeedback, setPageFeedback] = useState<Feedback>(null);
  const [dialogFeedback, setDialogFeedback] = useState<Feedback>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] =
    useState<CompanyExpenseRow | null>(null);
  const [formState, setFormState] = useState<CompanyExpenseFormState>(() =>
    createEmptyCompanyExpenseForm(),
  );
  const [monthFilter, setMonthFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] =
    useState<CompanyExpenseCategory | "all">("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [submitPending, setSubmitPending] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const applyPageData = useCallback((pageData: CompanyExpensesPageData) => {
    setHasPermission(pageData.hasPermission);
    setExpenses(sortCompanyExpenses(pageData.expenses));
  }, []);

  const refreshCompanyExpenses = useCallback(
    async ({ isMounted }: { isMounted: () => boolean }) => {
      if (!supabase) {
        return;
      }

      try {
        const pageData = await getCompanyExpensesPageData(supabase);

        if (!isMounted()) {
          return;
        }

        applyPageData(pageData);
      } catch (error) {
        if (!isMounted()) {
          return;
        }

        setPageFeedback({
          tone: "error",
          message: toCompanyExpenseErrorMessage(error, copy),
        });
      }
    },
    [applyPageData, copy, supabase],
  );

  useWorkspaceSyncEffect(refreshCompanyExpenses);

  const monthOptions = useMemo(() => {
    return Array.from(new Set(expenses.map(getCompanyExpenseMonthValue))).sort(
      (left, right) => right.localeCompare(left),
    );
  }, [expenses]);

  const currencyOptions = useMemo(() => {
    return Array.from(new Set(expenses.map((row) => row.currency_code))).sort();
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);

    return expenses.filter((expense) => {
      const monthMatches =
        monthFilter === "all" ||
        getCompanyExpenseMonthValue(expense) === monthFilter;
      const categoryMatches =
        categoryFilter === "all" || expense.category === categoryFilter;
      const currencyMatches =
        currencyFilter === "all" || expense.currency_code === currencyFilter;
      const searchText = normalizeSearchText(
        [
          expense.title,
          expense.payee,
          expense.note,
          expense.currency_code,
          expense.category,
        ]
          .filter(Boolean)
          .join(" "),
      );
      const searchMatches =
        !normalizedQuery || searchText.includes(normalizedQuery);

      return (
        monthMatches &&
        categoryMatches &&
        currencyMatches &&
        searchMatches
      );
    });
  }, [categoryFilter, currencyFilter, expenses, monthFilter, searchQuery]);

  const resetFilters = useCallback(() => {
    setCategoryFilter("all");
    setCurrencyFilter("all");
    setMonthFilter("all");
    setSearchQuery("");
  }, []);

  const openCreateDialog = useCallback(() => {
    setEditingExpense(null);
    setFormState(createEmptyCompanyExpenseForm());
    setDialogFeedback(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((expense: CompanyExpenseRow) => {
    setEditingExpense(expense);
    setFormState(createCompanyExpenseFormFromRow(expense));
    setDialogFeedback(null);
    setDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);

    if (!open) {
      setDialogFeedback(null);
    }
  }, []);

  const updateFormField = useCallback(
    <Key extends keyof CompanyExpenseFormState>(
      field: Key,
      value: CompanyExpenseFormState[Key],
    ) => {
      setFormState((current) => ({
        ...current,
        [field]: value,
      }));
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    if (!supabase || submitPending) {
      return;
    }

    let input;

    try {
      input = toCompanyExpenseInput(formState, copy);
    } catch (error) {
      setDialogFeedback({
        tone: "error",
        message: toCompanyExpenseErrorMessage(error, copy),
      });
      return;
    }

    setSubmitPending(true);
    setDialogFeedback(null);

    try {
      const savedExpense = editingExpense
        ? await updateCompanyExpense(supabase, editingExpense.id, input)
        : await createCompanyExpense(supabase, input);

      markBrowserCloudSyncActivity();
      setExpenses((current) =>
        sortCompanyExpenses(
          editingExpense
            ? current.map((item) =>
                item.id === savedExpense.id ? savedExpense : item,
              )
            : [savedExpense, ...current],
        ),
      );
      setPageFeedback({
        tone: "success",
        message: editingExpense ? copy.updateSuccess : copy.createSuccess,
      });
      setDialogOpen(false);
      setEditingExpense(null);
      setFormState(createEmptyCompanyExpenseForm());
    } catch (error) {
      setDialogFeedback({
        tone: "error",
        message: toCompanyExpenseErrorMessage(error, copy),
      });
    } finally {
      setSubmitPending(false);
    }
  }, [copy, editingExpense, formState, submitPending, supabase]);

  const handleDelete = useCallback(
    async (expense: CompanyExpenseRow) => {
      if (!supabase || pendingAction) {
        return;
      }

      if (
        !(await confirm({
          description: copy.deleteConfirm(expense.title),
          title: confirmT("title"),
          tone: "danger",
        }))
      ) {
        return;
      }

      setPendingAction({ id: expense.id, type: "delete" });
      setPageFeedback(null);

      try {
        await deleteCompanyExpense(supabase, expense.id);

        markBrowserCloudSyncActivity();
        setExpenses((current) =>
          current.filter((item) => item.id !== expense.id),
        );
        setPageFeedback({ tone: "success", message: copy.deleteSuccess });
      } catch (error) {
        setPageFeedback({
          tone: "error",
          message: toCompanyExpenseErrorMessage(error, copy),
        });
      } finally {
        setPendingAction(null);
      }
    },
    [confirm, confirmT, copy, pendingAction, supabase],
  );

  return {
    categoryFilter,
    currencyFilter,
    currencyOptions,
    dialogFeedback,
    dialogOpen,
    editingExpense,
    filteredExpenses,
    formState,
    hasPermission,
    handleDelete,
    handleDialogOpenChange,
    handleSubmit,
    monthFilter,
    monthOptions,
    openCreateDialog,
    openEditDialog,
    pageFeedback,
    pendingAction,
    resetFilters,
    searchQuery,
    setCategoryFilter,
    setCurrencyFilter,
    setMonthFilter,
    setSearchQuery,
    submitPending,
    updateFormField,
  };
}
