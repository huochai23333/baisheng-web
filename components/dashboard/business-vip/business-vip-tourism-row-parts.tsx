"use client";

import {
  CalendarClock,
  Check,
  Clock3,
  History,
  Send,
  Settings2,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type {
  BusinessVipRequest,
  BusinessVipReviewAction,
  BusinessVipRow,
} from "@/lib/business-vip-management";
import type { Locale } from "@/lib/locale";

import {
  formatBusinessVipDate,
  formatBusinessVipMoney,
  getBusinessVipRequestTone,
} from "./business-vip-display";

export function BusinessVipRequestList({
  canAdmin,
  locale,
  onOpenReview,
  pendingActionKey,
  row,
}: {
  canAdmin: boolean;
  locale: Locale;
  onOpenReview: (
    row: BusinessVipRow,
    request: BusinessVipRequest,
    action: BusinessVipReviewAction,
  ) => void;
  pendingActionKey: string | null;
  row: BusinessVipRow;
}) {
  const t = useTranslations("BusinessVip");
  const fallback = t("fallback.noRecord");
  const visibleRequests = row.requests.slice(0, 3);

  if (visibleRequests.length === 0) {
    return <p className="text-sm text-content-subtle">{t("requests.empty")}</p>;
  }

  return (
    <div className="space-y-2">
      {visibleRequests.map((request) => {
        const requestPendingKey = `review:${request.id}`;
        const pending = pendingActionKey === requestPendingKey;

        return (
          <div
            className="rounded-[16px] border border-border-subtle bg-surface-inset px-3 py-2.5"
            key={request.id}
          >
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={getBusinessVipRequestTone(request.status)}>
                {t(`requests.status.${request.status}`)}
              </StatusBadge>
              <span className="text-xs text-content-muted">
                {formatBusinessVipDate(request.createdAt, locale, fallback)}
              </span>
            </div>
            <p className="mt-1 break-words text-xs leading-5 text-content-muted [overflow-wrap:anywhere]">
              {request.requestedByName ??
                request.requestedByEmail ??
                t("requests.unknownRequester")}
            </p>
            {request.note ? (
              <p className="mt-1 break-words text-xs leading-5 text-content-muted [overflow-wrap:anywhere]">
                {request.note}
              </p>
            ) : null}
            {request.reviewNote ? (
              <p className="mt-1 break-words text-xs leading-5 text-content-muted [overflow-wrap:anywhere]">
                {request.reviewNote}
              </p>
            ) : null}
            {canAdmin && request.status === "pending" ? (
              <div className="mt-2 flex flex-wrap gap-2">
                <ReviewButton
                  action="approve"
                  disabled={Boolean(pendingActionKey)}
                  loading={pending}
                  onClick={() => onOpenReview(row, request, "approve")}
                />
                <ReviewButton
                  action="reject"
                  disabled={Boolean(pendingActionKey)}
                  loading={false}
                  onClick={() => onOpenReview(row, request, "reject")}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function BusinessVipHistoryList({
  locale,
  row,
}: {
  locale: Locale;
  row: BusinessVipRow;
}) {
  const t = useTranslations("BusinessVip");
  const fallback = t("fallback.noRecord");
  const latestRecharge = row.rechargeRecords[0] ?? null;
  const latestAdjustment = row.adjustments[0] ?? null;

  if (!latestRecharge && !latestAdjustment) {
    return <p className="text-sm text-content-subtle">{t("history.empty")}</p>;
  }

  return (
    <div className="space-y-2">
      {latestRecharge ? (
        <div className="rounded-[16px] border border-border-subtle bg-white px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <History className="size-3.5" />
            {t("history.latestRecharge")}
          </div>
          <p className="mt-1 text-xs leading-5 text-content-muted">
            {formatBusinessVipMoney(latestRecharge, fallback)}
          </p>
          <p className="text-xs leading-5 text-content-muted">
            {formatBusinessVipDate(
              latestRecharge.confirmedAt,
              locale,
              fallback,
            )}
          </p>
          {latestRecharge.orderNumber ? (
            <p className="break-all text-xs leading-5 text-content-subtle">
              {latestRecharge.orderNumber}
            </p>
          ) : null}
        </div>
      ) : null}
      {latestAdjustment ? (
        <div className="rounded-[16px] border border-border-subtle bg-white px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Settings2 className="size-3.5" />
            {t("history.latestAdjustment")}
          </div>
          <p className="mt-1 text-xs leading-5 text-content-muted">
            {t(`adjustments.action.${latestAdjustment.action}`)}
          </p>
          <p className="text-xs leading-5 text-content-muted">
            {formatBusinessVipDate(
              latestAdjustment.createdAt,
              locale,
              fallback,
            )}
          </p>
          {latestAdjustment.note ? (
            <p className="break-words text-xs leading-5 text-content-subtle [overflow-wrap:anywhere]">
              {latestAdjustment.note}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function BusinessVipActionButtons({
  canAdmin,
  canRequest,
  onOpenAdjust,
  onOpenRequest,
  pendingActionKey,
  row,
}: {
  canAdmin: boolean;
  canRequest: boolean;
  onOpenAdjust: (row: BusinessVipRow) => void;
  onOpenRequest: (row: BusinessVipRow) => void;
  pendingActionKey: string | null;
  row: BusinessVipRow;
}) {
  const t = useTranslations("BusinessVip");
  const hasPendingRequest = row.requests.some(
    (request) => request.status === "pending",
  );
  const requestActionKey = `request:${row.targetId}`;
  const adjustActionKey = `adjust:${row.targetId}`;
  const requestPending = pendingActionKey === requestActionKey;
  const adjustPending = pendingActionKey === adjustActionKey;

  return (
    <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:flex-wrap lg:flex-col">
      {canRequest ? (
        <Button
          variant="primary"
          size="compact"
          disabled={hasPendingRequest || Boolean(pendingActionKey)}
          onClick={() => onOpenRequest(row)}
          type="button"
        >
          {requestPending ? (
            <Clock3 className="size-4" />
          ) : (
            <Send className="size-4" />
          )}
          {hasPendingRequest
            ? t("actions.pending")
            : row.status === "active"
              ? t("actions.renew")
              : t("actions.request")}
        </Button>
      ) : null}
      {canAdmin ? (
        <Button
          size="compact"
          disabled={row.status === "none" || Boolean(pendingActionKey)}
          onClick={() => onOpenAdjust(row)}
          type="button"
          variant="outline"
        >
          {adjustPending ? (
            <Clock3 className="size-4" />
          ) : (
            <CalendarClock className="size-4" />
          )}
          {t("actions.adjust")}
        </Button>
      ) : null}
    </div>
  );
}

function ReviewButton({
  action,
  disabled,
  loading,
  onClick,
}: {
  action: BusinessVipReviewAction;
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  const t = useTranslations("BusinessVip");
  const approving = action === "approve";

  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      size="compact"
      type="button"
      variant={approving ? "success" : "danger"}
    >
      {loading ? (
        <Clock3 className="size-3.5" />
      ) : approving ? (
        <Check className="size-3.5" />
      ) : (
        <X className="size-3.5" />
      )}
      {t(`requests.actions.${action}`)}
    </Button>
  );
}
