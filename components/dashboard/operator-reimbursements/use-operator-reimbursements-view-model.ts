"use client";

import { useCallback, useMemo, useState } from "react";

import { markBrowserCloudSyncActivity } from "@/lib/browser-sync-recovery";
import {
  createOperatorReimbursement,
  deleteOperatorReimbursement,
  getOperatorReimbursementsPageData,
  reimburseCurrentOperatorPeriod,
  sortOperatorReimbursements,
  type OperatorReimbursementPeriod,
  type OperatorReimbursementsPageData,
  type OperatorReimbursementRow,
  type OperatorReimbursementStatus,
} from "@/lib/operator-reimbursements";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { normalizeSearchText } from "@/lib/value-normalizers";

import type { NoticeTone } from "../dashboard-shared-ui";
import { useWorkspaceSyncEffect } from "../workspace-session-provider";
import {
  createEmptyOperatorReimbursementForm,
  getOperatorReimbursementPeriodValue,
  isOperatorReimbursementInPeriod,
  toOperatorReimbursementErrorMessage,
  toOperatorReimbursementInput,
  type OperatorReimbursementFormState,
} from "./operator-reimbursements-display";

type Feedback = { tone: NoticeTone; message: string } | null;
type PendingAction = { id: string; type: "delete" } | null;

type OperatorReimbursementsViewModelCopy = {
  createSuccess: string;
  deleteConfirm: (content: string) => string;
  deleteSuccess: string;
  deleteLockedError: string;
  invalidAmount: string;
  invalidDate: string;
  missingAmount: string;
  missingContent: string;
  notFoundError: string;
  permissionError: string;
  reimburseEmpty: string;
  reimburseSuccess: (count: number) => string;
  unknownError: string;
};

type UseOperatorReimbursementsViewModelOptions = {
  copy: OperatorReimbursementsViewModelCopy;
  initialData: OperatorReimbursementsPageData;
};

export function useOperatorReimbursementsViewModel({
  copy,
  initialData,
}: UseOperatorReimbursementsViewModelOptions) {
  const supabase = getBrowserSupabaseClient();
  const [reimbursements, setReimbursements] = useState(
    initialData.reimbursements,
  );
  const [currentPeriod, setCurrentPeriod] = useState(initialData.currentPeriod);
  const [hasPermission, setHasPermission] = useState(initialData.hasPermission);
  const [pageFeedback, setPageFeedback] = useState<Feedback>(null);
  const [dialogFeedback, setDialogFeedback] = useState<Feedback>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<OperatorReimbursementFormState>(
    () => createEmptyOperatorReimbursementForm(),
  );
  const [periodFilter, setPeriodFilter] = useState("all");
  const [statusFilter, setStatusFilter] =
    useState<OperatorReimbursementStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [submitPending, setSubmitPending] = useState(false);
  const [reimbursePending, setReimbursePending] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const applyPageData = useCallback((pageData: OperatorReimbursementsPageData) => {
    // 服务端返回的周期和记录是可信状态；刷新时统一覆盖本地列表，避免批量报销后出现旧状态。
    setCurrentPeriod(pageData.currentPeriod);
    setHasPermission(pageData.hasPermission);
    setReimbursements(sortOperatorReimbursements(pageData.reimbursements));
  }, []);

  const refreshOperatorReimbursements = useCallback(
    async ({ isMounted }: { isMounted: () => boolean }) => {
      if (!supabase) {
        return;
      }

      try {
        const pageData = await getOperatorReimbursementsPageData(supabase);

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
          message: toOperatorReimbursementErrorMessage(error, copy),
        });
      }
    },
    [applyPageData, copy, supabase],
  );

  useWorkspaceSyncEffect(refreshOperatorReimbursements);

  const periodOptions = useMemo(() => {
    // 页面筛选只从已有记录提取周期，不额外生成空周期，减少用户需要排查的空列表。
    const periodByStart = new Map<string, OperatorReimbursementPeriod>();

    reimbursements.forEach((row) => {
      periodByStart.set(row.reimbursement_period_start, {
        end: row.reimbursement_period_end,
        start: row.reimbursement_period_start,
      });
    });

    return Array.from(periodByStart.values()).sort((left, right) =>
      right.start.localeCompare(left.start),
    );
  }, [reimbursements]);

  const filteredReimbursements = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);

    return reimbursements.filter((reimbursement) => {
      const periodMatches =
        periodFilter === "all" ||
        getOperatorReimbursementPeriodValue(reimbursement) === periodFilter;
      const statusMatches =
        statusFilter === "all" || reimbursement.status === statusFilter;
      const searchText = normalizeSearchText(
        [
          reimbursement.content,
          reimbursement.amount.toFixed(2),
          reimbursement.spent_at,
          reimbursement.reimbursement_period_start,
          reimbursement.reimbursement_period_end,
        ].join(" "),
      );
      const searchMatches =
        !normalizedQuery || searchText.includes(normalizedQuery);

      return periodMatches && statusMatches && searchMatches;
    });
  }, [periodFilter, reimbursements, searchQuery, statusFilter]);

  const currentUnreimbursedCount = useMemo(
    () =>
      reimbursements.filter(
        (row) =>
          row.status === "unreimbursed" &&
          isOperatorReimbursementInPeriod(row, currentPeriod),
      ).length,
    [currentPeriod, reimbursements],
  );

  const openCreateDialog = useCallback(() => {
    setFormState(createEmptyOperatorReimbursementForm());
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
    <Key extends keyof OperatorReimbursementFormState>(
      field: Key,
      value: OperatorReimbursementFormState[Key],
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
      input = toOperatorReimbursementInput(formState, copy);
    } catch (error) {
      setDialogFeedback({
        tone: "error",
        message: toOperatorReimbursementErrorMessage(error, copy),
      });
      return;
    }

    setSubmitPending(true);
    setDialogFeedback(null);

    try {
      const savedReimbursement = await createOperatorReimbursement(
        supabase,
        input,
      );

      markBrowserCloudSyncActivity();
      setReimbursements((current) =>
        sortOperatorReimbursements([savedReimbursement, ...current]),
      );
      setPageFeedback({ tone: "success", message: copy.createSuccess });
      setDialogOpen(false);
      setFormState(createEmptyOperatorReimbursementForm());
    } catch (error) {
      setDialogFeedback({
        tone: "error",
        message: toOperatorReimbursementErrorMessage(error, copy),
      });
    } finally {
      setSubmitPending(false);
    }
  }, [copy, formState, submitPending, supabase]);

  const handleDelete = useCallback(
    async (reimbursement: OperatorReimbursementRow) => {
      if (!supabase || pendingAction) {
        return;
      }

      if (!window.confirm(copy.deleteConfirm(reimbursement.content))) {
        return;
      }

      setPendingAction({ id: reimbursement.id, type: "delete" });
      setPageFeedback(null);

      try {
        await deleteOperatorReimbursement(supabase, reimbursement.id);

        markBrowserCloudSyncActivity();
        setReimbursements((current) =>
          current.filter((item) => item.id !== reimbursement.id),
        );
        setPageFeedback({ tone: "success", message: copy.deleteSuccess });
      } catch (error) {
        setPageFeedback({
          tone: "error",
          message: toOperatorReimbursementErrorMessage(error, copy),
        });
      } finally {
        setPendingAction(null);
      }
    },
    [copy, pendingAction, supabase],
  );

  const handleReimburseCurrent = useCallback(async () => {
    if (!supabase || reimbursePending || currentUnreimbursedCount === 0) {
      return;
    }

    setReimbursePending(true);
    setPageFeedback(null);

    try {
      const result = await reimburseCurrentOperatorPeriod(supabase);
      const pageData = await getOperatorReimbursementsPageData(supabase);

      // 批量报销完成后立即重新读取列表，让所有记录的状态和报销时间都来自数据库。
      markBrowserCloudSyncActivity();
      applyPageData(pageData);
      setPageFeedback({
        tone: "success",
        message:
          result.updatedCount > 0
            ? copy.reimburseSuccess(result.updatedCount)
            : copy.reimburseEmpty,
      });
    } catch (error) {
      setPageFeedback({
        tone: "error",
        message: toOperatorReimbursementErrorMessage(error, copy),
      });
    } finally {
      setReimbursePending(false);
    }
  }, [
    applyPageData,
    copy,
    currentUnreimbursedCount,
    reimbursePending,
    supabase,
  ]);

  return {
    currentPeriod,
    currentUnreimbursedCount,
    dialogFeedback,
    dialogOpen,
    filteredReimbursements,
    formState,
    hasPermission,
    handleDelete,
    handleDialogOpenChange,
    handleReimburseCurrent,
    handleSubmit,
    pageFeedback,
    pendingAction,
    periodFilter,
    periodOptions,
    reimbursePending,
    reimbursements,
    searchQuery,
    setPeriodFilter,
    setSearchQuery,
    setStatusFilter,
    statusFilter,
    submitPending,
    openCreateDialog,
    updateFormField,
  };
}
