"use client";

import {
  CreditCard,
  MoreHorizontal,
  PackageSearch,
  Pencil,
  ReceiptText,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type {
  CustomerInventoryOrder,
  CustomerInventoryPageData,
} from "@/lib/customer-inventory-types";

import {
  canEditInventoryFinancials,
  formatInventoryMoney,
  hasPendingInventoryCredit,
} from "./customer-inventory-display";
import type { InventoryOrderDialogState } from "./customer-inventory-order-dialogs";

export function InventoryOrderAmountSummary({
  order,
}: {
  order: CustomerInventoryOrder;
}) {
  const t = useTranslations("CustomerInventory");
  return (
    <div className="grid min-w-44 gap-1 text-xs">
      <span className="font-semibold text-content-strong">
        {t("amounts.purchase")}:{" "}
        {formatInventoryMoney(order.purchase_amount, order.currency)}
      </span>
      <span className="text-content-muted">
        {t("amounts.credit")}:{" "}
        {formatInventoryMoney(order.credit_offset_amount, order.currency)}
      </span>
      <span className="text-content-muted">
        {t("amounts.paid")}:{" "}
        {formatInventoryMoney(order.actual_payment_amount, order.currency)}
      </span>
      <span className="text-content-muted">
        {t("amounts.remaining")}:{" "}
        {formatInventoryMoney(order.remaining_amount, order.currency)}
      </span>
    </div>
  );
}

export function InventoryOrderItemsButton({
  canManageOrders,
  count,
  onClick,
}: {
  canManageOrders: boolean;
  count: number;
  onClick: () => void;
}) {
  const t = useTranslations("CustomerInventory");
  return (
    <Button onClick={onClick} size="compact" type="button" variant="outline">
      <PackageSearch aria-hidden="true" className="size-4" />
      {canManageOrders
        ? t("orders.manageItemCount", { count })
        : t("orders.itemCount", { count })}
    </Button>
  );
}

export function InventoryOrderActions({
  canManageOrders,
  credits,
  onApplyCredit,
  onManageCredit,
  onOrderDialog,
  order,
}: {
  canManageOrders: boolean;
  credits: CustomerInventoryPageData["credits"];
  onApplyCredit: (order: CustomerInventoryOrder) => void;
  onManageCredit: (order: CustomerInventoryOrder) => void;
  onOrderDialog: (dialog: InventoryOrderDialogState) => void;
  order: CustomerInventoryOrder;
}) {
  const t = useTranslations("CustomerInventory");
  const financialEditable = canEditInventoryFinancials(order, credits);
  const pendingCredit = hasPendingInventoryCredit(order.id, credits);

  if (canManageOrders) {
    return (
      <div className="flex flex-wrap gap-2">
        {order.payment_status === "awaiting_payment" &&
        !order.financial_locked ? (
          <Button
            onClick={() => onManageCredit(order)}
            size="compact"
            type="button"
          >
            <CreditCard aria-hidden="true" className="size-4" />
            {t("orders.manageCredit")}
          </Button>
        ) : null}
        {financialEditable ? (
          <>
            <Button
              onClick={() => onOrderDialog({ kind: "edit", order })}
              size="compact"
              type="button"
              variant="outline"
            >
              <Pencil aria-hidden="true" className="size-4" />
              {t("orders.edit")}
            </Button>
            <Button
              onClick={() => onOrderDialog({ kind: "pay", order })}
              size="compact"
              type="button"
              variant="outline"
            >
              <ReceiptText aria-hidden="true" className="size-4" />
              {t("orders.pay")}
            </Button>
            <Button
              onClick={() => onOrderDialog({ kind: "cancel", order })}
              size="compact"
              type="button"
              variant="danger"
            >
              <XCircle aria-hidden="true" className="size-4" />
              {t("orders.cancel")}
            </Button>
          </>
        ) : null}
        {order.payment_status !== "cancelled" ? (
          <Button
            onClick={() => onOrderDialog({ kind: "notes", order })}
            size="compact"
            type="button"
            variant="ghost"
          >
            <MoreHorizontal aria-hidden="true" className="size-4" />
            {t("orders.notes")}
          </Button>
        ) : null}
      </div>
    );
  }

  return order.payment_status === "awaiting_payment" && !pendingCredit ? (
    <Button onClick={() => onApplyCredit(order)} type="button">
      <CreditCard aria-hidden="true" className="size-4" />
      {t("orders.applyCredit")}
    </Button>
  ) : null;
}

export function InventoryOrderMobileField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold tracking-wide text-content-subtle">
        {label}
      </p>
      <p className="mt-1 break-words text-sm text-content-strong">{children}</p>
    </div>
  );
}
