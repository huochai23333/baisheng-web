"use client";

import { CalendarClock, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  getCustomerInventoryDueState,
  getCustomerInventoryEffectiveDueDate,
  getCustomerInventoryInterest,
  getCustomerInventoryOverdueDays,
  type CustomerInventoryCreditApplication,
  type CustomerInventoryDueState,
  type CustomerInventoryPageData,
} from "@/lib/customer-inventory-types";

import type { InventoryCreditDialogState } from "./customer-inventory-credit-dialogs";
import {
  canRequestInventoryExtension,
  formatInventoryDate,
  formatInventoryMoney,
} from "./customer-inventory-display";

/**
 * 单笔信贷卡片同时用于桌面双列和移动端单列。
 * 卡片只关心一笔信贷如何展示及其操作入口，不承担列表筛选和汇总统计。
 */
export function CustomerInventoryCreditCard({
  canManageCredit,
  credit,
  data,
  isClient,
  onDialog,
}: {
  canManageCredit: boolean;
  credit: CustomerInventoryCreditApplication;
  data: CustomerInventoryPageData;
  isClient: boolean;
  onDialog: (dialog: InventoryCreditDialogState) => void;
}) {
  const t = useTranslations("CustomerInventory");
  const order = data.orders.find((item) => item.id === credit.order_id);
  const state = getCustomerInventoryDueState(credit, data.currentBusinessDate);
  const interest = getCustomerInventoryInterest(
    credit,
    data.currentBusinessDate,
  );
  const extension = data.extensions.find(
    (item) =>
      item.credit_application_id === credit.id && item.status === "pending",
  );
  const repayment = data.repayments.find(
    (item) => item.credit_application_id === credit.id,
  );

  return (
    <article className="min-w-0 rounded-record-card border border-border-subtle bg-surface-interactive p-4 sm:p-5">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-content-strong">
            {t(`tiers.${credit.tier}`)}
          </p>
          <p className="mt-1 break-all text-xs text-content-muted">
            {order?.order_number ?? "—"}
          </p>
        </div>
        <StatusBadge tone={getCreditTone(credit.status, state)}>
          {credit.status === "active"
            ? t(`dueStates.${state}`)
            : t(`creditStatus.${credit.status}`)}
        </StatusBadge>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
        <CreditField label={t("fields.principalUsd")}>
          {formatInventoryMoney(credit.approved_amount_usd, "USD")}
        </CreditField>
        <CreditField label={t("fields.currentInterest")}>
          {formatInventoryMoney(interest, "USD")}
        </CreditField>
        <CreditField label={t("fields.usedOn")}>
          {formatInventoryDate(credit.used_on)}
        </CreditField>
        <CreditField label={t("fields.dueOn")}>
          {formatInventoryDate(getCustomerInventoryEffectiveDueDate(credit))}
        </CreditField>
        {state === "overdue" ? (
          <CreditField label={t("fields.overdueDays")}>
            {t("credits.days", {
              count: getCustomerInventoryOverdueDays(
                credit,
                data.currentBusinessDate,
              ),
            })}
          </CreditField>
        ) : null}
        {repayment ? (
          <CreditField label={t("fields.repaymentTotal")}>
            {formatInventoryMoney(repayment.total_amount_usd, "USD")}
          </CreditField>
        ) : null}
      </dl>

      {(isClient || canManageCredit) && credit.status === "active" ? (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-border-subtle pt-4">
          {isClient &&
          canRequestInventoryExtension(
            credit,
            data.extensions,
            data.currentBusinessDate,
          ) ? (
            <Button
              onClick={() => onDialog({ credit, kind: "extend" })}
              type="button"
              variant="outline"
            >
              <CalendarClock className="size-4" />
              {t("credits.applyExtension")}
            </Button>
          ) : null}
          {extension ? (
            <StatusBadge tone="warning">
              {t("credits.extensionPending")}
            </StatusBadge>
          ) : null}
          {canManageCredit ? (
            <Button
              onClick={() => onDialog({ credit, kind: "repay" })}
              type="button"
            >
              <CheckCircle2 className="size-4" />
              {t("credits.recordRepayment")}
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function CreditField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-content-muted">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-content-strong">
        {children}
      </dd>
    </div>
  );
}

function getCreditTone(
  status: CustomerInventoryCreditApplication["status"],
  state: CustomerInventoryDueState,
) {
  if (status === "repaid") return "success" as const;
  if (status === "rejected") return "neutral" as const;
  if (state === "overdue") return "danger" as const;
  if (state === "due_today" || state === "due_within_7_days")
    return "warning" as const;
  if (status === "active") return "info" as const;
  return "warning" as const;
}
