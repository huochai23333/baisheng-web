"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import type { FeedbackTone } from "@/components/dashboard/dashboard-shared-ui";
import type {
  BusinessVipAdjustmentAction,
  BusinessVipMembershipAction,
  BusinessVipPageData,
  BusinessVipRequest,
  BusinessVipReviewAction,
  BusinessVipRow,
} from "@/lib/business-vip-management";
import {
  businessVipRowMatchesFilters,
  getBusinessVipSummary,
  type BusinessVipStatusFilter,
} from "./business-vip-display";
import type { BusinessVipDialogState } from "./business-vip-dialogs";
import type { BusinessVipWholesaleDialogState } from "./business-vip-wholesale-dialogs";

type BusinessVipFeedback = { message: string; tone: FeedbackTone } | null;
type BusinessVipActiveDialogState = BusinessVipDialogState | BusinessVipWholesaleDialogState;
type BusinessVipMutationPayload =
  | { business: BusinessVipPageData["business"]; note: string; operation: "request"; targetId: string }
  | { action: BusinessVipReviewAction; business: BusinessVipPageData["business"]; note: string; operation: "review"; requestId: string }
  | { action: BusinessVipAdjustmentAction; business: BusinessVipPageData["business"]; nextExpiresAt: string | null; note: string; operation: "adjust"; targetId: string }
  | { action: BusinessVipMembershipAction; business: "wholesale"; note: string; operation: "manageWholesale"; targetId: string };

/**
 * VIP 页面所有筛选、弹窗和写入状态集中在 view-model。
 * 页面 Client 只连接区块与事件，网络响应或错误代码不会进入渲染层。
 */
export function useBusinessVipViewModel(initialData: BusinessVipPageData) {
  const t = useTranslations("BusinessVip");
  const router = useRouter();
  const [isRefreshing, startRefreshing] = useTransition();
  const [dialog, setDialog] = useState<BusinessVipActiveDialogState>(null);
  const [dialogFeedback, setDialogFeedback] = useState<BusinessVipFeedback>(null);
  const [pageFeedback, setPageFeedback] = useState<BusinessVipFeedback>(null);
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<BusinessVipStatusFilter>("all");

  const summary = useMemo(() => getBusinessVipSummary(initialData.rows), [initialData.rows]);
  const filteredRows = useMemo(
    () => initialData.rows.filter((row) => businessVipRowMatchesFilters({ row, searchText, statusFilter })),
    [initialData.rows, searchText, statusFilter],
  );
  const mutationPending = Boolean(pendingActionKey) || isRefreshing;

  function openDialog(nextDialog: BusinessVipActiveDialogState) {
    setDialogFeedback(null);
    setPageFeedback(null);
    setDialog(nextDialog);
  }

  function closeDialog() {
    if (mutationPending) return;
    setDialogFeedback(null);
    setDialog(null);
  }

  async function submitMutation(actionKey: string, payload: BusinessVipMutationPayload, successMessage: string) {
    if (pendingActionKey) return;
    setPendingActionKey(actionKey);
    setDialogFeedback(null);
    setPageFeedback(null);

    try {
      const response = await fetch("/api/business-vip", {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = await readBusinessVipMutationResponse(response);
      if (!response.ok) {
        setDialogFeedback({ tone: "error", message: t(`errors.${normalizeBusinessVipErrorCode(result.error)}`) });
        return;
      }

      setDialog(null);
      setPageFeedback({ tone: "success", message: successMessage });
      startRefreshing(() => router.refresh());
    } catch {
      setDialogFeedback({ tone: "error", message: t("errors.serviceUnavailable") });
    } finally {
      setPendingActionKey(null);
    }
  }

  function handleRequest(row: BusinessVipRow, note: string) {
    void submitMutation(`request:${row.targetId}`, { business: initialData.business, note, operation: "request", targetId: row.targetId }, t("feedback.requested"));
  }

  function handleReview(row: BusinessVipRow, request: BusinessVipRequest, action: BusinessVipReviewAction, note: string) {
    void submitMutation(
      `review:${request.id}`,
      { action, business: initialData.business, note, operation: "review", requestId: request.id },
      action === "approve" ? t("feedback.approved") : t("feedback.rejected"),
    );
  }

  function handleAdjust(row: BusinessVipRow, action: BusinessVipAdjustmentAction, nextExpiresAt: string | null, note: string) {
    void submitMutation(`adjust:${row.targetId}`, { action, business: initialData.business, nextExpiresAt, note, operation: "adjust", targetId: row.targetId }, t("feedback.adjusted"));
  }

  function handleWholesaleAction(row: BusinessVipRow, action: BusinessVipMembershipAction) {
    void submitMutation(
      `wholesale:${action}:${row.targetId}`,
      { action, business: "wholesale", note: "", operation: "manageWholesale", targetId: row.targetId },
      action === "open" ? t("feedback.wholesaleOpened") : t("feedback.wholesaleRenewed"),
    );
  }

  const wholesaleDialog = isBusinessVipWholesaleDialog(dialog) ? dialog : null;
  const standardDialog: BusinessVipDialogState = wholesaleDialog ? null : (dialog as BusinessVipDialogState);

  return {
    closeDialog,
    dialogFeedback,
    filteredRows,
    handleAdjust,
    handleRequest,
    handleReview,
    handleWholesaleAction,
    mutationPending,
    openAdjust: (row: BusinessVipRow) => openDialog({ kind: "adjust", row }),
    openRequest: (row: BusinessVipRow) => openDialog({ kind: "request", row }),
    openReview: (row: BusinessVipRow, request: BusinessVipRequest, action: BusinessVipReviewAction) => openDialog({ action, kind: "review", request, row }),
    openWholesaleAction: (row: BusinessVipRow, action: BusinessVipMembershipAction) => openDialog({ action, kind: "wholesaleAction", row }),
    openWholesaleRecords: (row: BusinessVipRow) => openDialog({ kind: "wholesaleRecords", row }),
    pageFeedback,
    pendingActionKey,
    searchText,
    setSearchText,
    setStatusFilter,
    standardDialog,
    statusFilter,
    summary,
    wholesaleDialog,
  };
}

async function readBusinessVipMutationResponse(response: Response) {
  try {
    const value: unknown = await response.json();
    if (!isRecord(value)) return {};
    return { error: typeof value.error === "string" ? value.error : undefined, ok: value.ok === true };
  } catch {
    return {};
  }
}

function normalizeBusinessVipErrorCode(value: string | undefined) {
  switch (value) {
    case "forbidden":
    case "invalidInput":
    case "notFound":
    case "processed":
    case "serviceUnavailable":
      return value;
    default:
      return "unknown";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBusinessVipWholesaleDialog(dialog: BusinessVipActiveDialogState): dialog is NonNullable<BusinessVipWholesaleDialogState> {
  return dialog?.kind === "wholesaleAction" || dialog?.kind === "wholesaleRecords";
}
