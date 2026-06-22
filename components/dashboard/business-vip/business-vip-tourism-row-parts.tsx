"use client";

import { CalendarClock, Check, Clock3, History, Send, Settings2, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type {
  BusinessVipRequest,
  BusinessVipReviewAction,
  BusinessVipRow,
} from "@/lib/business-vip-management";
import type { Locale } from "@/lib/locale";

import {
  formatBusinessVipDate,
  formatBusinessVipMoney,
  getBusinessVipRequestChipClass,
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
    return <p className="text-sm text-[#8a949c]">{t("requests.empty")}</p>;
  }

  return (
    <div className="space-y-2">
      {visibleRequests.map((request) => {
        const requestPendingKey = `review:${request.id}`;
        const pending = pendingActionKey === requestPendingKey;

        return (
          <div
            className="rounded-[16px] border border-[#ebe7e1] bg-[#fbfaf8] px-3 py-2.5"
            key={request.id}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className={getBusinessVipRequestChipClass(request.status)}>
                {t(`requests.status.${request.status}`)}
              </span>
              <span className="text-xs text-[#7b858d]">
                {formatBusinessVipDate(request.createdAt, locale, fallback)}
              </span>
            </div>
            <p className="mt-1 break-words text-xs leading-5 text-[#53616d] [overflow-wrap:anywhere]">
              {request.requestedByName ??
                request.requestedByEmail ??
                t("requests.unknownRequester")}
            </p>
            {request.note ? (
              <p className="mt-1 break-words text-xs leading-5 text-[#7b858d] [overflow-wrap:anywhere]">
                {request.note}
              </p>
            ) : null}
            {request.reviewNote ? (
              <p className="mt-1 break-words text-xs leading-5 text-[#7b858d] [overflow-wrap:anywhere]">
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
    return <p className="text-sm text-[#8a949c]">{t("history.empty")}</p>;
  }

  return (
    <div className="space-y-2">
      {latestRecharge ? (
        <div className="rounded-[16px] border border-[#ebe7e1] bg-white px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#486782]">
            <History className="size-3.5" />
            {t("history.latestRecharge")}
          </div>
          <p className="mt-1 text-xs leading-5 text-[#53616d]">
            {formatBusinessVipMoney(latestRecharge, fallback)}
          </p>
          <p className="text-xs leading-5 text-[#7b858d]">
            {formatBusinessVipDate(latestRecharge.confirmedAt, locale, fallback)}
          </p>
          {latestRecharge.orderNumber ? (
            <p className="break-all text-xs leading-5 text-[#8a949c]">
              {latestRecharge.orderNumber}
            </p>
          ) : null}
        </div>
      ) : null}
      {latestAdjustment ? (
        <div className="rounded-[16px] border border-[#ebe7e1] bg-white px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#486782]">
            <Settings2 className="size-3.5" />
            {t("history.latestAdjustment")}
          </div>
          <p className="mt-1 text-xs leading-5 text-[#53616d]">
            {t(`adjustments.action.${latestAdjustment.action}`)}
          </p>
          <p className="text-xs leading-5 text-[#7b858d]">
            {formatBusinessVipDate(latestAdjustment.createdAt, locale, fallback)}
          </p>
          {latestAdjustment.note ? (
            <p className="break-words text-xs leading-5 text-[#8a949c] [overflow-wrap:anywhere]">
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
          className="h-9 rounded-full bg-[#486782] px-3 text-white hover:bg-[#3e5f79] disabled:bg-[#d9dee2] disabled:text-[#7c8790]"
          disabled={hasPendingRequest || Boolean(pendingActionKey)}
          onClick={() => onOpenRequest(row)}
          type="button"
        >
          {requestPending ? <Clock3 className="size-4" /> : <Send className="size-4" />}
          {hasPendingRequest
            ? t("actions.pending")
            : row.status === "active"
              ? t("actions.renew")
              : t("actions.request")}
        </Button>
      ) : null}
      {canAdmin ? (
        <Button
          className="h-9 rounded-full border border-[#d9e0e5] bg-white px-3 text-[#486782] hover:bg-[#f3f6f8] disabled:bg-[#f4f3f1] disabled:text-[#9aa4ab]"
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
      className={
        approving
          ? "h-8 rounded-full bg-[#4c7259] px-2.5 text-xs text-white hover:bg-[#42654d]"
          : "h-8 rounded-full border-[#efd6d6] bg-white px-2.5 text-xs text-[#b13d3d] hover:bg-[#fff4f4]"
      }
      disabled={disabled}
      onClick={onClick}
      type="button"
      variant={approving ? "default" : "outline"}
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
