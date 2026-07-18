"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { normalizeOptionalString } from "../dashboard-shared-ui";
import { DashboardCenteredLoadingState } from "../dashboard-centered-loading-state";
import {
  createOrdersUiCopy,
  getOrderTypeMetaFromCategory,
  getStatusLabel,
} from "./admin-orders-utils";
import { getOrderStatusOptions } from "./admin-orders-status-options";
import { OrderDetailsDialog } from "./admin-orders-details-dialog";
import { OrderFormDialog } from "./admin-orders-form-dialog";

function OrdersLoadingState() {
  const t = useTranslations("OrdersUI");

  return <DashboardCenteredLoadingState message={t("loading")} />;
}

function OrderHeaderCell({ children }: { children: ReactNode }) {
  return (
    <th className="px-5 py-4 text-left font-label text-[11px] font-semibold tracking-[0.18em] text-content-muted uppercase">
      {children}
    </th>
  );
}

function OrderValueCell({
  value,
  strong,
}: {
  value: ReactNode;
  strong?: boolean;
}) {
  const title = typeof value === "string" ? value : undefined;

  return (
    <td
      className={cn(
        "max-w-[220px] px-5 py-4 text-sm text-content-strong",
        strong ? "font-semibold text-content-muted" : "font-medium",
      )}
      title={title}
    >
      <div className="truncate">{value}</div>
    </td>
  );
}

function OrderStatusChip({ status }: { status: string | null }) {
  const t = useTranslations("OrdersUI");
  const orderUiCopy = useMemo(() => createOrdersUiCopy(t), [t]);
  const normalizedStatus = normalizeOptionalString(status);
  const orderStatusOptions = getOrderStatusOptions(t);

  if (!normalizedStatus) {
    return <StatusTag tone="default">{t("status.notProvided")}</StatusTag>;
  }

  const matchedStatus = orderStatusOptions.find(
    (option) => option.value === normalizedStatus,
  );

  if (!matchedStatus) {
    return <StatusTag tone="default">{normalizedStatus}</StatusTag>;
  }

  return (
    <StatusTag
      tone={
        normalizedStatus === "pending"
          ? "gold"
          : normalizedStatus === "completed"
            ? "green"
            : normalizedStatus === "cancelled" ||
                normalizedStatus === "refunding"
              ? "red"
              : "blue"
      }
    >
      {matchedStatus.label ?? getStatusLabel(normalizedStatus, orderUiCopy)}
    </StatusTag>
  );
}

function OrderTypeChip({
  meta,
}: {
  meta: ReturnType<typeof getOrderTypeMetaFromCategory>;
}) {
  return <StatusTag tone={meta.tone}>{meta.label}</StatusTag>;
}

function StatusTag({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "blue" | "default" | "gold" | "green" | "red";
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap",
        tone === "blue" && "bg-surface-inset text-primary",
        tone === "default" && "bg-surface-inset text-content-muted",
        tone === "gold" && "bg-status-warning-soft text-status-warning",
        tone === "green" && "bg-status-success-soft text-status-success",
        tone === "red" && "bg-status-danger-soft text-status-danger",
      )}
    >
      {children}
    </span>
  );
}

export {
  OrderDetailsDialog,
  OrderFormDialog,
  OrderHeaderCell,
  OrdersLoadingState,
  OrderStatusChip,
  OrderTypeChip,
  OrderValueCell,
};
