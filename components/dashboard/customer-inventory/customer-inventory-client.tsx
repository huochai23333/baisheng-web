"use client";

import { useState } from "react";

import { CreditCard, PackageCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { DashboardSegmentedTabs } from "@/components/dashboard/dashboard-segmented-tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import type {
  CustomerInventoryOrder,
  CustomerInventoryPageData,
} from "@/lib/customer-inventory-types";

import { CustomerInventoryAttachmentsDialog } from "./customer-inventory-attachments-dialog";
import {
  CustomerInventoryCreditDialogs,
  type InventoryCreditDialogState,
} from "./customer-inventory-credit-dialogs";
import { CustomerInventoryCreditSection } from "./customer-inventory-credit-section";
import { CustomerInventoryItemsDialog } from "./customer-inventory-items-dialog";
import {
  CustomerInventoryOrderDialogs,
  type InventoryOrderDialogState,
} from "./customer-inventory-order-dialogs";
import { CustomerInventoryOrdersSection } from "./customer-inventory-orders-section";
import { useCustomerInventoryActions } from "./use-customer-inventory-actions";
import { WholesalePageShell } from "../wholesale/wholesale-ui";

type InventoryTab = "orders" | "credit";

export function CustomerInventoryClient({
  initialData,
}: {
  initialData: CustomerInventoryPageData;
}) {
  const t = useTranslations("CustomerInventory");
  const isClient = initialData.currentRole === "client";
  const canManageOrders = ["administrator", "salesman"].includes(
    initialData.currentRole ?? "",
  );
  const canManageCredit = ["administrator", "finance", "salesman"].includes(
    initialData.currentRole ?? "",
  );
  const [tab, setTab] = useState<InventoryTab>(
    initialData.currentRole === "finance" ? "credit" : "orders",
  );
  const [orderDialog, setOrderDialog] =
    useState<InventoryOrderDialogState>(null);
  const [creditDialog, setCreditDialog] =
    useState<InventoryCreditDialogState>(null);
  const [attachmentOrder, setAttachmentOrder] =
    useState<CustomerInventoryOrder | null>(null);
  const [itemOrder, setItemOrder] =
    useState<CustomerInventoryOrder | null>(null);
  const { feedback, pendingKey, runAction } = useCustomerInventoryActions(
    t("feedback.connectionError"),
  );
  const pendingCreditCount = initialData.credits.filter(
    (credit) => credit.status === "pending",
  ).length;

  return (
    <WholesalePageShell
      meta={
        <StatusBadge tone="info">
          {t("header.orderCount", { count: initialData.orders.length })}
        </StatusBadge>
      }
      title={t("header.title")}
    >
      <div className="grid min-w-0 gap-4 sm:gap-6">
        <p className="max-w-4xl text-sm leading-7 text-content-muted">
          {isClient ? t("header.clientDescription") : t("header.description")}
        </p>

        {feedback ? (
          <div
            aria-live="polite"
            className={
              feedback.tone === "success"
                ? "rounded-record-card border border-status-success-border bg-status-success-soft px-4 py-3 text-sm text-status-success"
                : "rounded-record-card border border-status-danger-border bg-status-danger-soft px-4 py-3 text-sm text-status-danger"
            }
          >
            {feedback.message}
          </div>
        ) : null}

        <DashboardSegmentedTabs
          onChange={setTab}
          options={[
            {
              icon: <PackageCheck className="size-4" />,
              key: "orders",
              label: t("tabs.orders"),
            },
            {
              badge: canManageCredit ? pendingCreditCount : undefined,
              icon: <CreditCard className="size-4" />,
              key: "credit",
              label: t("tabs.credit"),
            },
          ]}
          value={tab}
        />

        {tab === "orders" ? (
          <CustomerInventoryOrdersSection
            canManageOrders={canManageOrders}
            data={initialData}
            onApplyCredit={(order) => setCreditDialog({ kind: "apply", order })}
            onAttachments={setAttachmentOrder}
            onItems={setItemOrder}
            onManageCredit={(order) =>
              setCreditDialog({
                credits: initialData.credits,
                kind: "manage",
                order,
              })
            }
            onOrderDialog={setOrderDialog}
          />
        ) : (
          <CustomerInventoryCreditSection
            canManageCredit={canManageCredit}
            data={initialData}
            isClient={isClient}
            onDialog={setCreditDialog}
          />
        )}
      </div>

      <CustomerInventoryOrderDialogs
        data={initialData}
        dialog={orderDialog}
        key={
          orderDialog
            ? `${orderDialog.kind}:${
                orderDialog.kind === "create"
                  ? "new"
                  : orderDialog.order.id
              }`
            : "closed"
        }
        onClose={() => setOrderDialog(null)}
        pendingKey={pendingKey}
        runAction={runAction}
      />
      <CustomerInventoryCreditDialogs
        credits={initialData.credits}
        currentBusinessDate={initialData.currentBusinessDate}
        dialog={creditDialog}
        key={
          creditDialog
            ? `${creditDialog.kind}:${
                creditDialog.kind === "apply" ||
                creditDialog.kind === "review" ||
                creditDialog.kind === "manage"
                  ? creditDialog.order.id
                  : creditDialog.credit.id
              }`
            : "closed"
        }
        onClose={() => setCreditDialog(null)}
        pendingKey={pendingKey}
        runAction={runAction}
        usdToCurrencyRates={initialData.usdToCurrencyRates}
      />
      <CustomerInventoryAttachmentsDialog
        attachments={initialData.attachments.filter(
          (attachment) => attachment.order_id === attachmentOrder?.id,
        )}
        canWrite={canManageOrders}
        currentUserId={initialData.currentUserId}
        onClose={() => setAttachmentOrder(null)}
        order={attachmentOrder}
        pendingKey={pendingKey}
        runAction={runAction}
      />
      <CustomerInventoryItemsDialog
        canWrite={canManageOrders}
        items={initialData.items.filter(
          (item) => item.order_id === itemOrder?.id,
        )}
        key={itemOrder?.id ?? "closed"}
        onClose={() => setItemOrder(null)}
        order={itemOrder}
        pendingKey={pendingKey}
        runAction={runAction}
      />
    </WholesalePageShell>
  );
}
