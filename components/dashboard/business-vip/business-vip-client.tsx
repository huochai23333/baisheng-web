"use client";

import { useMemo, useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useLocale } from "@/components/i18n/locale-provider";
import { PageBanner, type NoticeTone } from "@/components/dashboard/dashboard-shared-ui";
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
import {
  BusinessVipDialogs,
  type BusinessVipDialogState,
} from "./business-vip-dialogs";
import {
  BusinessVipWholesaleActionDialog,
  BusinessVipWholesaleRecordsDialog,
  type BusinessVipWholesaleDialogState,
} from "./business-vip-wholesale-dialogs";
import {
  BusinessVipDirectorySection,
  BusinessVipFiltersSection,
  BusinessVipHeaderSection,
} from "./business-vip-sections";

type BusinessVipFeedback = {
  message: string;
  tone: NoticeTone;
} | null;

type BusinessVipActiveDialogState =
  | BusinessVipDialogState
  | BusinessVipWholesaleDialogState;

type BusinessVipMutationPayload =
  | {
      business: BusinessVipPageData["business"];
      note: string;
      operation: "request";
      targetId: string;
    }
  | {
      action: BusinessVipReviewAction;
      business: BusinessVipPageData["business"];
      note: string;
      operation: "review";
      requestId: string;
    }
  | {
      action: BusinessVipAdjustmentAction;
      business: BusinessVipPageData["business"];
      nextExpiresAt: string | null;
      note: string;
      operation: "adjust";
      targetId: string;
    }
  | {
      action: BusinessVipMembershipAction;
      business: "wholesale";
      note: string;
      operation: "manageWholesale";
      targetId: string;
    };

export function BusinessVipClient({
  initialData,
}: {
  initialData: BusinessVipPageData;
}) {
  const t = useTranslations("BusinessVip");
  const router = useRouter();
  const { locale } = useLocale();
  const [isRefreshing, startRefreshing] = useTransition();
  const [dialog, setDialog] = useState<BusinessVipActiveDialogState>(null);
  const [dialogFeedback, setDialogFeedback] = useState<BusinessVipFeedback>(null);
  const [pageFeedback, setPageFeedback] = useState<BusinessVipFeedback>(null);
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<BusinessVipStatusFilter>("all");

  const summary = useMemo(
    () => getBusinessVipSummary(initialData.rows),
    [initialData.rows],
  );
  const filteredRows = useMemo(
    () =>
      initialData.rows.filter((row) =>
        businessVipRowMatchesFilters({ row, searchText, statusFilter }),
      ),
    [initialData.rows, searchText, statusFilter],
  );
  const mutationPending = Boolean(pendingActionKey) || isRefreshing;

  const openDialog = (nextDialog: BusinessVipActiveDialogState) => {
    setDialogFeedback(null);
    setPageFeedback(null);
    setDialog(nextDialog);
  };

  const closeDialog = () => {
    if (mutationPending) {
      return;
    }

    setDialogFeedback(null);
    setDialog(null);
  };

  const submitMutation = async (
    actionKey: string,
    payload: BusinessVipMutationPayload,
    successMessage: string,
  ) => {
    if (pendingActionKey) {
      return;
    }

    setPendingActionKey(actionKey);
    setDialogFeedback(null);
    setPageFeedback(null);

    try {
      const response = await fetch("/api/business-vip", {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const result = await readBusinessVipMutationResponse(response);

      if (!response.ok) {
        setDialogFeedback({
          tone: "error",
          message: t(`errors.${normalizeBusinessVipErrorCode(result.error)}`),
        });
        return;
      }

      setDialog(null);
      setPageFeedback({
        tone: "success",
        message: successMessage,
      });
      startRefreshing(() => router.refresh());
    } catch {
      setDialogFeedback({
        tone: "error",
        message: t("errors.serviceUnavailable"),
      });
    } finally {
      setPendingActionKey(null);
    }
  };

  const handleRequest = (row: BusinessVipRow, note: string) => {
    void submitMutation(
      `request:${row.targetId}`,
      {
        business: initialData.business,
        note,
        operation: "request",
        targetId: row.targetId,
      },
      t("feedback.requested"),
    );
  };

  const handleReview = (
    row: BusinessVipRow,
    request: BusinessVipRequest,
    action: BusinessVipReviewAction,
    note: string,
  ) => {
    void submitMutation(
      `review:${request.id}`,
      {
        action,
        business: initialData.business,
        note,
        operation: "review",
        requestId: request.id,
      },
      action === "approve"
        ? t("feedback.approved")
        : t("feedback.rejected"),
    );
  };

  const handleAdjust = (
    row: BusinessVipRow,
    action: BusinessVipAdjustmentAction,
    nextExpiresAt: string | null,
    note: string,
  ) => {
    void submitMutation(
      `adjust:${row.targetId}`,
      {
        action,
        business: initialData.business,
        nextExpiresAt,
        note,
        operation: "adjust",
        targetId: row.targetId,
      },
      t("feedback.adjusted"),
    );
  };

  const handleWholesaleAction = (
    row: BusinessVipRow,
    action: BusinessVipMembershipAction,
  ) => {
    void submitMutation(
      `wholesale:${action}:${row.targetId}`,
      {
        action,
        business: "wholesale",
        note: "",
        operation: "manageWholesale",
        targetId: row.targetId,
      },
      action === "open"
        ? t("feedback.wholesaleOpened")
        : t("feedback.wholesaleRenewed"),
    );
  };

  const wholesaleDialog = isBusinessVipWholesaleDialog(dialog) ? dialog : null;
  const standardDialog: BusinessVipDialogState = wholesaleDialog
    ? null
    : (dialog as BusinessVipDialogState);

  return (
    <section className="mx-auto flex w-full max-w-[1320px] flex-col gap-8">
      {pageFeedback ? (
        <PageBanner tone={pageFeedback.tone}>{pageFeedback.message}</PageBanner>
      ) : null}

      <BusinessVipHeaderSection data={initialData} summary={summary} />

      <BusinessVipFiltersSection
        onSearchTextChange={setSearchText}
        onStatusFilterChange={setStatusFilter}
        searchText={searchText}
        statusFilter={statusFilter}
      />

      <BusinessVipDirectorySection
        business={initialData.business}
        canAdmin={initialData.canAdmin}
        canRequest={initialData.canRequest}
        filteredRows={filteredRows}
        locale={locale}
        onOpenAdjust={(row) => openDialog({ kind: "adjust", row })}
        onOpenRequest={(row) => openDialog({ kind: "request", row })}
        onOpenReview={(row, request, action) =>
          openDialog({ action, kind: "review", request, row })
        }
        onOpenWholesaleAction={(row, action) =>
          openDialog({ action, kind: "wholesaleAction", row })
        }
        onOpenWholesaleRecords={(row) =>
          openDialog({ kind: "wholesaleRecords", row })
        }
        pendingActionKey={pendingActionKey}
      />

      <BusinessVipDialogs
        dialog={standardDialog}
        feedback={dialogFeedback}
        onAdjust={handleAdjust}
        onClose={closeDialog}
        onRequest={handleRequest}
        onReview={handleReview}
        pending={mutationPending}
      />
      {wholesaleDialog?.kind === "wholesaleAction" ? (
        <BusinessVipWholesaleActionDialog
          dialog={wholesaleDialog}
          feedback={dialogFeedback}
          onClose={closeDialog}
          onConfirm={handleWholesaleAction}
          pending={mutationPending}
        />
      ) : null}
      {wholesaleDialog?.kind === "wholesaleRecords" ? (
        <BusinessVipWholesaleRecordsDialog
          dialog={wholesaleDialog}
          locale={locale}
          onClose={closeDialog}
        />
      ) : null}
    </section>
  );
}

async function readBusinessVipMutationResponse(response: Response) {
  try {
    const value: unknown = await response.json();

    if (!isRecord(value)) {
      return {};
    }

    return {
      error: typeof value.error === "string" ? value.error : undefined,
      ok: value.ok === true,
    };
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

function isBusinessVipWholesaleDialog(
  dialog: BusinessVipActiveDialogState,
): dialog is NonNullable<BusinessVipWholesaleDialogState> {
  return dialog?.kind === "wholesaleAction" || dialog?.kind === "wholesaleRecords";
}
