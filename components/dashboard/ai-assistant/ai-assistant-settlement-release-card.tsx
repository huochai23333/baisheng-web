"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  ReceiptText,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";

import type {
  AiAssistantSettlementReleaseCopy,
  AiAssistantUiMessage,
} from "./ai-assistant-ui-types";

type SettlementReleaseMessage = NonNullable<
  AiAssistantUiMessage["settlementRelease"]
>;

type AiAssistantSettlementReleaseCardProps = {
  copy: AiAssistantSettlementReleaseCopy;
  locale: "en" | "zh";
  messageId: string;
  onCancel: (messageId: string) => void;
  onConfirm: (messageId: string) => void;
  settlementRelease: SettlementReleaseMessage;
};

export function AiAssistantSettlementReleaseCard({
  copy,
  locale,
  messageId,
  onCancel,
  onConfirm,
  settlementRelease,
}: AiAssistantSettlementReleaseCardProps) {
  const { action, errorCode, state } = settlementRelease;
  const canSubmit = state === "ready" || state === "failed";

  return (
    <section
      aria-label={copy.title}
      className="mt-3 overflow-hidden rounded-record-card border border-border-subtle bg-surface-panel"
      data-testid="ai-settlement-release-card"
    >
      <div className="flex items-start gap-3 border-b border-border-subtle px-3 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-status-info-soft text-primary">
          <ReceiptText className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-content-strong">
            {copy.title}
          </h3>
          <p className="mt-1 text-xs leading-5 text-content-muted">
            {action.customerKind === "existing"
              ? copy.existingCustomer
              : copy.temporaryCustomer}
          </p>
        </div>
        <SettlementReleaseStateBadge copy={copy} state={state} />
      </div>

      <dl className="grid min-w-0 gap-2 px-3 py-3 text-xs leading-5">
        <SettlementReleaseDetail
          label={copy.inputCustomerLabel}
          value={action.inputCustomerName}
        />
        <SettlementReleaseDetail
          label={copy.customerLabel}
          value={action.customerName}
        />
        <SettlementReleaseDetail
          label={copy.amountLabel}
          value={`${formatAmount(action.amount, locale)} ${action.currency}`}
        />
        <SettlementReleaseDetail
          label={copy.dateLabel}
          value={action.receivedOn}
        />
        <SettlementReleaseDetail
          label={copy.noteLabel}
          value={action.note ?? copy.noNote}
        />
      </dl>

      {state === "failed" && errorCode ? (
        <p
          className="mx-3 mb-3 rounded-control-default bg-status-danger-soft px-3 py-2 text-xs leading-5 text-status-danger"
          role="alert"
        >
          {copy.errorMessages[errorCode]}
        </p>
      ) : null}

      {canSubmit ? (
        <div className="grid gap-2 border-t border-border-subtle p-3 sm:grid-cols-2">
          <Button
            className="w-full"
            onClick={() => onCancel(messageId)}
            type="button"
            variant="outline"
            wrap
          >
            {copy.cancel}
          </Button>
          <Button
            className="w-full"
            onClick={() => onConfirm(messageId)}
            type="button"
            wrap
          >
            {state === "failed" ? copy.retry : copy.confirm}
          </Button>
        </div>
      ) : null}

      <span aria-live="polite" className="sr-only">
        {getStateText(copy, state)}
      </span>
    </section>
  );
}

function SettlementReleaseDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[5.25rem_minmax(0,1fr)] gap-2">
      <dt className="text-content-muted">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-content-strong [overflow-wrap:anywhere]">
        {value}
      </dd>
    </div>
  );
}

function SettlementReleaseStateBadge({
  copy,
  state,
}: {
  copy: AiAssistantSettlementReleaseCopy;
  state: SettlementReleaseMessage["state"];
}) {
  const Icon =
    state === "published"
      ? CheckCircle2
      : state === "cancelled"
        ? XCircle
        : state === "failed"
          ? AlertCircle
          : Clock3;
  const tone: StatusTone =
    state === "published"
      ? "success"
      : state === "cancelled"
        ? "neutral"
        : state === "failed"
          ? "danger"
          : "warning";

  return (
    <StatusBadge className="shrink-0" tone={tone}>
      <Icon
        className={state === "publishing" ? "size-3 animate-spin" : "size-3"}
      />
      {getStateText(copy, state)}
    </StatusBadge>
  );
}

function getStateText(
  copy: AiAssistantSettlementReleaseCopy,
  state: SettlementReleaseMessage["state"],
) {
  if (state === "published") return copy.published;
  if (state === "cancelled") return copy.cancelled;
  if (state === "publishing") return copy.publishing;
  return state === "failed" ? copy.retry : copy.confirm;
}

function formatAmount(amount: number, locale: "en" | "zh") {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "zh-CN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}
