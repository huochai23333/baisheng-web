"use client";

import {
  CreditCard,
  FileSpreadsheet,
  MoreHorizontal,
  PackageOpen,
  Pencil,
  Plus,
  ReceiptText,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import type {
  CustomerInventoryOrder,
  CustomerInventoryPageData,
} from "@/lib/customer-inventory-types";

import {
  canEditInventoryFinancials,
  formatInventoryDateTime,
  formatInventoryMoney,
  getInventoryCustomerName,
  getInventoryProfileName,
  getPaymentStatusTone,
  hasPendingInventoryCredit,
} from "./customer-inventory-display";
import { CustomerInventoryFilterEmptyState } from "./customer-inventory-filter-empty-state";
import { CustomerInventoryOrderFilters } from "./customer-inventory-order-filters";
import type { InventoryOrderDialogState } from "./customer-inventory-order-dialogs";
import { useCustomerInventoryOrderFilters } from "./use-customer-inventory-order-filters";
import {
  WholesaleEmptyState,
  WholesalePanel,
  WholesaleTable,
  WholesaleTd,
  WholesaleTh,
} from "../wholesale/wholesale-ui";

export function CustomerInventoryOrdersSection({
  canManageOrders,
  data,
  onApplyCredit,
  onAttachments,
  onOrderDialog,
}: {
  canManageOrders: boolean;
  data: CustomerInventoryPageData;
  onApplyCredit: (order: CustomerInventoryOrder) => void;
  onAttachments: (order: CustomerInventoryOrder) => void;
  onOrderDialog: (dialog: InventoryOrderDialogState) => void;
}) {
  const t = useTranslations("CustomerInventory");
  const customerNames = new Map(
    data.customers.map((customer) => [customer.id, customer.unique_name]),
  );
  const profileNames = new Map(
    data.profiles.map((profile) => [
      profile.user_id,
      profile.name ?? profile.email ?? profile.user_id,
    ]),
  );
  const {
    activeFilterCount,
    clearFilters,
    filteredOrders,
    filters,
    setFilter,
  } = useCustomerInventoryOrderFilters(data);

  return (
    <WholesalePanel
      description={t("orders.description")}
      title={t("orders.title")}
    >
      {canManageOrders ? (
        <div className="mb-4 flex justify-end">
          <Button
            onClick={() => onOrderDialog({ kind: "create" })}
            type="button"
          >
            <Plus className="size-4" />
            {t("orders.create")}
          </Button>
        </div>
      ) : null}

      {data.orders.length > 0 ? (
        <CustomerInventoryOrderFilters
          activeFilterCount={activeFilterCount}
          data={data}
          filters={filters}
          isClient={data.currentRole === "client"}
          onClear={clearFilters}
          onFilterChange={setFilter}
          visibleCount={filteredOrders.length}
        />
      ) : null}

      {data.orders.length === 0 ? (
        <WholesaleEmptyState
          description={t("orders.emptyDescription")}
          icon={<PackageOpen className="size-5" />}
          title={t("orders.emptyTitle")}
        />
      ) : filteredOrders.length === 0 ? (
        <CustomerInventoryFilterEmptyState
          description={t("filters.noOrderResultsDescription")}
        />
      ) : (
        <ResponsiveDataView
          desktop={
            <WholesaleTable minWidth={1120}>
              <thead>
                <tr>
                  <WholesaleTh>{t("fields.orderNumber")}</WholesaleTh>
                  <WholesaleTh>{t("fields.customer")}</WholesaleTh>
                  <WholesaleTh>{t("fields.salesman")}</WholesaleTh>
                  <WholesaleTh>{t("fields.amounts")}</WholesaleTh>
                  <WholesaleTh>{t("fields.status")}</WholesaleTh>
                  <WholesaleTh>{t("fields.createdAt")}</WholesaleTh>
                  <WholesaleTh>{t("fields.attachments")}</WholesaleTh>
                  <WholesaleTh>{t("fields.actions")}</WholesaleTh>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr className="group" key={order.id}>
                    <WholesaleTd className="font-semibold">
                      {order.order_number}
                    </WholesaleTd>
                    <WholesaleTd className="max-w-48 whitespace-normal">
                      {getInventoryCustomerName(order, customerNames)}
                    </WholesaleTd>
                    <WholesaleTd className="max-w-40 whitespace-normal">
                      {getInventoryProfileName(
                        order.sales_user_id,
                        profileNames,
                      )}
                    </WholesaleTd>
                    <WholesaleTd>
                      <OrderAmountSummary order={order} />
                    </WholesaleTd>
                    <WholesaleTd>
                      <StatusBadge
                        tone={getPaymentStatusTone(order.payment_status)}
                      >
                        {t(`paymentStatus.${order.payment_status}`)}
                      </StatusBadge>
                    </WholesaleTd>
                    <WholesaleTd>
                      {formatInventoryDateTime(order.created_at)}
                    </WholesaleTd>
                    <WholesaleTd>
                      <Button
                        onClick={() => onAttachments(order)}
                        size="compact"
                        type="button"
                        variant="outline"
                      >
                        <FileSpreadsheet className="size-4" />
                        {t("orders.attachmentCount", {
                          count: data.attachments.filter(
                            (attachment) => attachment.order_id === order.id,
                          ).length,
                        })}
                      </Button>
                    </WholesaleTd>
                    <WholesaleTd className="whitespace-normal">
                      <OrderActions
                        canManageOrders={canManageOrders}
                        credits={data.credits}
                        onApplyCredit={onApplyCredit}
                        onOrderDialog={onOrderDialog}
                        order={order}
                      />
                    </WholesaleTd>
                  </tr>
                ))}
              </tbody>
            </WholesaleTable>
          }
          mobile={
            <>
              {filteredOrders.map((order) => (
                <article
                  className="min-w-0 rounded-record-card border border-border-subtle bg-surface-interactive p-4"
                  key={order.id}
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-all font-semibold text-content-strong">
                        {order.order_number}
                      </p>
                      <p className="mt-1 break-words text-sm text-content-muted">
                        {getInventoryCustomerName(order, customerNames)}
                      </p>
                    </div>
                    <StatusBadge
                      tone={getPaymentStatusTone(order.payment_status)}
                    >
                      {t(`paymentStatus.${order.payment_status}`)}
                    </StatusBadge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4">
                    <MobileField label={t("fields.salesman")}>
                      {getInventoryProfileName(
                        order.sales_user_id,
                        profileNames,
                      )}
                    </MobileField>
                    <MobileField label={t("fields.createdAt")}>
                      {formatInventoryDateTime(order.created_at)}
                    </MobileField>
                    <div className="col-span-2">
                      <OrderAmountSummary order={order} />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border-subtle pt-4">
                    <Button
                      onClick={() => onAttachments(order)}
                      type="button"
                      variant="outline"
                    >
                      <FileSpreadsheet className="size-4" />
                      {t("orders.attachments")}
                    </Button>
                    <OrderActions
                      canManageOrders={canManageOrders}
                      credits={data.credits}
                      onApplyCredit={onApplyCredit}
                      onOrderDialog={onOrderDialog}
                      order={order}
                    />
                  </div>
                </article>
              ))}
            </>
          }
        />
      )}
    </WholesalePanel>
  );
}

function OrderAmountSummary({ order }: { order: CustomerInventoryOrder }) {
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

function OrderActions({
  canManageOrders,
  credits,
  onApplyCredit,
  onOrderDialog,
  order,
}: {
  canManageOrders: boolean;
  credits: CustomerInventoryPageData["credits"];
  onApplyCredit: (order: CustomerInventoryOrder) => void;
  onOrderDialog: (dialog: InventoryOrderDialogState) => void;
  order: CustomerInventoryOrder;
}) {
  const t = useTranslations("CustomerInventory");
  const financialEditable = canEditInventoryFinancials(order, credits);
  const pendingCredit = hasPendingInventoryCredit(order.id, credits);

  if (canManageOrders) {
    return (
      <div className="flex flex-wrap gap-2">
        {financialEditable ? (
          <>
            <Button
              onClick={() => onOrderDialog({ kind: "edit", order })}
              size="compact"
              type="button"
              variant="outline"
            >
              <Pencil className="size-4" />
              {t("orders.edit")}
            </Button>
            <Button
              onClick={() => onOrderDialog({ kind: "pay", order })}
              size="compact"
              type="button"
              variant="outline"
            >
              <ReceiptText className="size-4" />
              {t("orders.pay")}
            </Button>
            <Button
              onClick={() => onOrderDialog({ kind: "cancel", order })}
              size="compact"
              type="button"
              variant="danger"
            >
              <XCircle className="size-4" />
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
            <MoreHorizontal className="size-4" />
            {t("orders.notes")}
          </Button>
        ) : null}
      </div>
    );
  }

  return order.payment_status === "awaiting_payment" && !pendingCredit ? (
    <Button onClick={() => onApplyCredit(order)} type="button">
      <CreditCard className="size-4" />
      {t("orders.applyCredit")}
    </Button>
  ) : null;
}

function MobileField({
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
