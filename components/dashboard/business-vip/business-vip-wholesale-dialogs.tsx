"use client";

import type { ReactNode } from "react";

import { BadgePlus, FileClock, LoaderCircle, RotateCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { PageBanner, type NoticeTone } from "@/components/dashboard/dashboard-shared-ui";
import { Button } from "@/components/ui/button";
import type {
  BusinessVipMembershipAction,
  BusinessVipRow,
} from "@/lib/business-vip-management";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import {
  formatBusinessVipAmount,
  formatBusinessVipDate,
  getBusinessVipMembershipRecords,
  type BusinessVipMembershipRecord,
} from "./business-vip-display";

export type BusinessVipWholesaleDialogState =
  | {
      action: BusinessVipMembershipAction;
      kind: "wholesaleAction";
      row: BusinessVipRow;
    }
  | {
      kind: "wholesaleRecords";
      row: BusinessVipRow;
    }
  | null;

type BusinessVipWholesaleDialogFeedback = {
  message: string;
  tone: NoticeTone;
} | null;

export function BusinessVipWholesaleActionDialog({
  dialog,
  feedback,
  onClose,
  onConfirm,
  pending,
}: {
  dialog: Extract<
    NonNullable<BusinessVipWholesaleDialogState>,
    { kind: "wholesaleAction" }
  >;
  feedback: BusinessVipWholesaleDialogFeedback;
  onClose: () => void;
  onConfirm: (
    row: BusinessVipRow,
    action: BusinessVipMembershipAction,
  ) => void;
  pending: boolean;
}) {
  const t = useTranslations("BusinessVip");
  const opening = dialog.action === "open";

  return (
    <DashboardDialog
      description={t(
        opening
          ? "dialogs.wholesale.openDescription"
          : "dialogs.wholesale.renewDescription",
        { name: dialog.row.customerLabel },
      )}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open
      title={t(
        opening ? "dialogs.wholesale.openTitle" : "dialogs.wholesale.renewTitle",
      )}
    >
      <div className="space-y-5">
        {feedback ? <PageBanner tone={feedback.tone}>{feedback.message}</PageBanner> : null}
        <div className="rounded-[18px] border border-[#ebe7e1] bg-[#fbfaf8] px-4 py-3">
          <p className="break-words text-sm font-semibold text-[#23313a] [overflow-wrap:anywhere]">
            {dialog.row.customerLabel}
          </p>
          <p className="mt-1 text-sm leading-6 text-[#6f7b85]">
            {t(
              opening
                ? "dialogs.wholesale.openRule"
                : "dialogs.wholesale.renewRule",
            )}
          </p>
          <p className="mt-2 text-sm font-semibold text-[#486782]">
            {t("dialogs.wholesale.annualFee")}
          </p>
          <p className="mt-1 text-xs leading-5 text-[#7b858d]">
            {t("dialogs.wholesale.commissionRule")}
          </p>
        </div>
        <DialogActions
          cancelLabel={t("dialogs.cancel")}
          cancelDisabled={pending}
          icon={
            pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : opening ? (
              <BadgePlus className="size-4" />
            ) : (
              <RotateCw className="size-4" />
            )
          }
          onCancel={onClose}
          onSubmit={() => onConfirm(dialog.row, dialog.action)}
          submitDisabled={pending}
          submitLabel={t(
            opening
              ? "dialogs.wholesale.openSubmit"
              : "dialogs.wholesale.renewSubmit",
          )}
        />
      </div>
    </DashboardDialog>
  );
}

export function BusinessVipWholesaleRecordsDialog({
  dialog,
  locale,
  onClose,
}: {
  dialog: Extract<
    NonNullable<BusinessVipWholesaleDialogState>,
    { kind: "wholesaleRecords" }
  >;
  locale: Locale;
  onClose: () => void;
}) {
  const t = useTranslations("BusinessVip");
  const records = getBusinessVipMembershipRecords(dialog.row);

  return (
    <DashboardDialog
      description={t("dialogs.wholesale.recordsDescription", {
        name: dialog.row.customerLabel,
      })}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open
      title={t("dialogs.wholesale.recordsTitle")}
    >
      {records.length === 0 ? (
        <div className="rounded-[20px] border border-[#ebe7e1] bg-white px-5 py-6 text-center">
          <FileClock className="mx-auto size-5 text-[#486782]" />
          <p className="mt-3 text-sm font-semibold text-[#23313a]">
            {t("dialogs.wholesale.recordsEmptyTitle")}
          </p>
          <p className="mt-1 text-sm leading-6 text-[#7b858d]">
            {t("dialogs.wholesale.recordsEmptyDescription")}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {records.map((record) => (
            <WholesaleMembershipRecordCard
              key={record.id}
              locale={locale}
              record={record}
            />
          ))}
        </div>
      )}
    </DashboardDialog>
  );
}

function WholesaleMembershipRecordCard({
  locale,
  record,
}: {
  locale: Locale;
  record: BusinessVipMembershipRecord;
}) {
  const t = useTranslations("BusinessVip");
  const fallback = t("fallback.noRecord");

  return (
    <article className="rounded-[18px] border border-[#ebe7e1] bg-white px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-[#486782]">
            {t(`operationRecords.types.${record.kind}`)}
          </p>
          <p className="mt-1 break-words text-xs leading-5 text-[#6f7b85] [overflow-wrap:anywhere]">
            {t("operationRecords.expiresChange", {
              next: formatBusinessVipDate(record.nextExpiresAt, locale, fallback),
              previous: formatBusinessVipDate(
                record.previousExpiresAt,
                locale,
                fallback,
              ),
            })}
          </p>
          <p className="mt-1 break-words text-xs leading-5 text-[#6f7b85] [overflow-wrap:anywhere]">
            {t("operationRecords.annualFee", {
              amount: formatBusinessVipAmount(
                record.amount,
                record.currency,
                fallback,
              ),
            })}
          </p>
        </div>
        <span className="shrink-0 text-xs text-[#7b858d]">
          {formatBusinessVipDate(record.createdAt, locale, fallback)}
        </span>
      </div>
      <p className="mt-2 text-sm text-[#53616d]">
        {record.actorName ?? t("operationRecords.actorFallback")}
      </p>
      {record.note ? (
        <p className="mt-1 break-words text-xs leading-5 text-[#8a949c] [overflow-wrap:anywhere]">
          {record.note}
        </p>
      ) : null}
    </article>
  );
}

function DialogActions({
  cancelDisabled,
  cancelLabel,
  className,
  icon,
  onCancel,
  onSubmit,
  submitDisabled,
  submitLabel,
}: {
  cancelDisabled: boolean;
  cancelLabel: string;
  className?: string;
  icon: ReactNode;
  onCancel: () => void;
  onSubmit: () => void;
  submitDisabled: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button
        className="h-11 rounded-full border border-[#d9e0e5] bg-white px-5 text-[#486782] hover:bg-[#f3f6f8]"
        disabled={cancelDisabled}
        onClick={onCancel}
        type="button"
        variant="outline"
      >
        {cancelLabel}
      </Button>
      <Button
        className={cn(
          "h-11 rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79]",
          className,
        )}
        disabled={submitDisabled}
        onClick={onSubmit}
        type="button"
      >
        {icon}
        {submitLabel}
      </Button>
    </div>
  );
}
