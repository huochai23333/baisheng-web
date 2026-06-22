"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";

import { Ban, CalendarClock, Check, LoaderCircle, Send, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { PageBanner, type NoticeTone } from "@/components/dashboard/dashboard-shared-ui";
import { Button } from "@/components/ui/button";
import type {
  BusinessVipAdjustmentAction,
  BusinessVipRequest,
  BusinessVipReviewAction,
  BusinessVipRow,
} from "@/lib/business-vip-management";
import { cn } from "@/lib/utils";

import { getBusinessVipDateTimeInputValue } from "./business-vip-display";

export type BusinessVipDialogState =
  | { kind: "request"; row: BusinessVipRow }
  | {
      action: BusinessVipReviewAction;
      kind: "review";
      request: BusinessVipRequest;
      row: BusinessVipRow;
    }
  | { kind: "adjust"; row: BusinessVipRow }
  | null;

type BusinessVipDialogFeedback = {
  message: string;
  tone: NoticeTone;
} | null;

export function BusinessVipDialogs({
  dialog,
  feedback,
  onAdjust,
  onClose,
  onRequest,
  onReview,
  pending,
}: {
  dialog: BusinessVipDialogState;
  feedback: BusinessVipDialogFeedback;
  onAdjust: (
    row: BusinessVipRow,
    action: BusinessVipAdjustmentAction,
    nextExpiresAt: string | null,
    note: string,
  ) => void;
  onClose: () => void;
  onRequest: (row: BusinessVipRow, note: string) => void;
  onReview: (
    row: BusinessVipRow,
    request: BusinessVipRequest,
    action: BusinessVipReviewAction,
    note: string,
  ) => void;
  pending: boolean;
}) {
  if (!dialog) {
    return null;
  }

  if (dialog.kind === "request") {
    return (
      <BusinessVipRequestDialog
        feedback={feedback}
        key={`request:${dialog.row.targetId}`}
        onClose={onClose}
        onSubmit={(note) => onRequest(dialog.row, note)}
        pending={pending}
        row={dialog.row}
      />
    );
  }

  if (dialog.kind === "review") {
    return (
      <BusinessVipReviewDialog
        action={dialog.action}
        feedback={feedback}
        key={`review:${dialog.request.id}:${dialog.action}`}
        onClose={onClose}
        onSubmit={(note) =>
          onReview(dialog.row, dialog.request, dialog.action, note)
        }
        pending={pending}
        row={dialog.row}
      />
    );
  }

  return (
    <BusinessVipAdjustmentDialog
      feedback={feedback}
      key={`adjust:${dialog.row.targetId}:${dialog.row.expiresAt ?? ""}`}
      onClose={onClose}
      onSubmit={(action, nextExpiresAt, note) =>
        onAdjust(dialog.row, action, nextExpiresAt, note)
      }
      pending={pending}
      row={dialog.row}
    />
  );
}

function BusinessVipRequestDialog({
  feedback,
  onClose,
  onSubmit,
  pending,
  row,
}: {
  feedback: BusinessVipDialogFeedback;
  onClose: () => void;
  onSubmit: (note: string) => void;
  pending: boolean;
  row: BusinessVipRow;
}) {
  const t = useTranslations("BusinessVip");
  const [note, setNote] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(note);
  };

  return (
    <DashboardDialog
      description={t("dialogs.request.description", {
        name: row.customerLabel,
      })}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open
      title={t("dialogs.request.title")}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {feedback ? <PageBanner tone={feedback.tone}>{feedback.message}</PageBanner> : null}
        <BusinessVipNoteField
          disabled={pending}
          label={t("dialogs.noteLabel")}
          onChange={setNote}
          placeholder={t("dialogs.request.notePlaceholder")}
          value={note}
        />
        <DialogActions
          cancelLabel={t("dialogs.cancel")}
          icon={pending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
          cancelDisabled={pending}
          onCancel={onClose}
          submitDisabled={pending}
          submitLabel={t("dialogs.request.submit")}
        />
      </form>
    </DashboardDialog>
  );
}

function BusinessVipReviewDialog({
  action,
  feedback,
  onClose,
  onSubmit,
  pending,
  row,
}: {
  action: BusinessVipReviewAction;
  feedback: BusinessVipDialogFeedback;
  onClose: () => void;
  onSubmit: (note: string) => void;
  pending: boolean;
  row: BusinessVipRow;
}) {
  const t = useTranslations("BusinessVip");
  const [note, setNote] = useState("");
  const approving = action === "approve";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(note);
  };

  return (
    <DashboardDialog
      description={t(
        approving
          ? "dialogs.review.approveDescription"
          : "dialogs.review.rejectDescription",
        { name: row.customerLabel },
      )}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open
      title={t(
        approving ? "dialogs.review.approveTitle" : "dialogs.review.rejectTitle",
      )}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {feedback ? <PageBanner tone={feedback.tone}>{feedback.message}</PageBanner> : null}
        <BusinessVipNoteField
          disabled={pending}
          label={t("dialogs.review.noteLabel")}
          onChange={setNote}
          placeholder={t("dialogs.review.notePlaceholder")}
          value={note}
        />
        <DialogActions
          cancelLabel={t("dialogs.cancel")}
          className={approving ? "" : "bg-[#b13d3d] hover:bg-[#9f3535]"}
          icon={
            pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : approving ? (
              <Check className="size-4" />
            ) : (
              <X className="size-4" />
            )
          }
          cancelDisabled={pending}
          onCancel={onClose}
          submitDisabled={pending}
          submitLabel={t(
            approving ? "dialogs.review.approveSubmit" : "dialogs.review.rejectSubmit",
          )}
        />
      </form>
    </DashboardDialog>
  );
}

function BusinessVipAdjustmentDialog({
  feedback,
  onClose,
  onSubmit,
  pending,
  row,
}: {
  feedback: BusinessVipDialogFeedback;
  onClose: () => void;
  onSubmit: (
    action: BusinessVipAdjustmentAction,
    nextExpiresAt: string | null,
    note: string,
  ) => void;
  pending: boolean;
  row: BusinessVipRow;
}) {
  const t = useTranslations("BusinessVip");
  const [action, setAction] =
    useState<BusinessVipAdjustmentAction>("set_expires_at");
  const [nextExpiresAt, setNextExpiresAt] = useState(
    getBusinessVipDateTimeInputValue(row.expiresAt),
  );
  const [note, setNote] = useState("");
  const dateRequired = action === "set_expires_at";
  const canSubmit = !pending && (!dateRequired || Boolean(nextExpiresAt));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    onSubmit(action, action === "set_expires_at" ? nextExpiresAt : null, note);
  };

  return (
    <DashboardDialog
      description={t("dialogs.adjust.description", {
        name: row.customerLabel,
      })}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open
      title={t("dialogs.adjust.title")}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {feedback ? <PageBanner tone={feedback.tone}>{feedback.message}</PageBanner> : null}
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold tracking-[0.16em] text-[#88939b] uppercase">
            {t("dialogs.adjust.actionLabel")}
          </span>
          <select
            className="h-12 w-full rounded-[18px] border border-[#dfe5ea] bg-white px-4 text-sm text-[#23313a] outline-none focus:border-[#bfd2e1] focus:ring-4 focus:ring-[#bfd2e1]/30"
            disabled={pending}
            onChange={(event) =>
              setAction(event.target.value as BusinessVipAdjustmentAction)
            }
            value={action}
          >
            <option value="set_expires_at">
              {t("dialogs.adjust.setExpiresAt")}
            </option>
            <option value="cancel">{t("dialogs.adjust.cancelVip")}</option>
          </select>
        </label>

        {action === "set_expires_at" ? (
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold tracking-[0.16em] text-[#88939b] uppercase">
              {t("dialogs.adjust.dateLabel")}
            </span>
            <input
              className="h-12 w-full rounded-[18px] border border-[#dfe5ea] bg-white px-4 text-sm text-[#23313a] outline-none focus:border-[#bfd2e1] focus:ring-4 focus:ring-[#bfd2e1]/30"
              disabled={pending}
              onChange={(event) => setNextExpiresAt(event.target.value)}
              type="datetime-local"
              value={nextExpiresAt}
            />
          </label>
        ) : null}

        <BusinessVipNoteField
          disabled={pending}
          label={t("dialogs.noteLabel")}
          onChange={setNote}
          placeholder={t("dialogs.adjust.notePlaceholder")}
          value={note}
        />
        <DialogActions
          cancelLabel={t("dialogs.cancel")}
          className={action === "cancel" ? "bg-[#b13d3d] hover:bg-[#9f3535]" : ""}
          icon={
            pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : action === "cancel" ? (
              <Ban className="size-4" />
            ) : (
              <CalendarClock className="size-4" />
            )
          }
          cancelDisabled={pending}
          onCancel={onClose}
          submitDisabled={!canSubmit}
          submitLabel={t("dialogs.adjust.submit")}
        />
      </form>
    </DashboardDialog>
  );
}

function BusinessVipNoteField({
  disabled,
  label,
  onChange,
  placeholder,
  value,
}: {
  disabled: boolean;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold tracking-[0.16em] text-[#88939b] uppercase">
        {label}
      </span>
      <textarea
        className="min-h-28 w-full resize-y rounded-[18px] border border-[#dfe5ea] bg-white px-4 py-3 text-sm leading-6 text-[#23313a] outline-none placeholder:text-[#8a949c] focus:border-[#bfd2e1] focus:ring-4 focus:ring-[#bfd2e1]/30"
        disabled={disabled}
        maxLength={500}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function DialogActions({
  cancelLabel,
  className,
  cancelDisabled,
  icon,
  onCancel,
  submitDisabled,
  submitLabel,
}: {
  cancelLabel: string;
  className?: string;
  cancelDisabled: boolean;
  icon: ReactNode;
  onCancel: () => void;
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
        type="submit"
      >
        {icon}
        {submitLabel}
      </Button>
    </div>
  );
}
