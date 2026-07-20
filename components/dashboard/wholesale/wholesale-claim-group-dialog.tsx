"use client";

import { InteractiveButton as DesignButton } from "@/components/ui/button";

import { X } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { Button } from "@/components/ui/button";
import type { WholesaleCustomer } from "@/lib/wholesale";
import type {
  WholesaleClaimGroupRow,
  WholesaleClaimRow,
} from "@/lib/wholesale-claims-page";

import {
  WholesaleClaimTargetFields,
  useWholesaleClaimTarget,
} from "./wholesale-claim-target-fields";

export type WholesaleClaimGroupDialogTarget =
  | { kind: "create"; rows: WholesaleClaimRow[] }
  | { groupRow: WholesaleClaimGroupRow; kind: "edit" };

export function WholesaleClaimGroupDialog({
  customers,
  onCancelGroup,
  onCreateGroup,
  onOpenChange,
  onUpdateGroup,
  pendingKey,
  target,
}: {
  customers: WholesaleCustomer[];
  onCancelGroup: (claimGroupId: string) => Promise<boolean>;
  onCreateGroup: (
    purchaseOrderIds: string[],
    customerId: string,
    wholesaleOrderIds: string[],
  ) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  onUpdateGroup: (
    claimGroupId: string,
    purchaseOrderIds: string[],
    customerId: string,
    wholesaleOrderIds: string[],
  ) => Promise<boolean>;
  pendingKey: string | null;
  target: WholesaleClaimGroupDialogTarget | null;
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_claim_group_dialog",
  );
  const purchaseCount =
    target?.kind === "create"
      ? target.rows.length
      : (target?.groupRow.purchaseOrders.length ?? 0);

  return (
    <DashboardDialog
      description={
        target?.kind === "edit"
          ? uiText("editDescription")
          : uiText("createDescription", { count: purchaseCount })
      }
      onOpenChange={onOpenChange}
      open={Boolean(target)}
      title={
        target?.kind === "edit"
          ? uiText("editTitle")
          : uiText("createTitle", { count: purchaseCount })
      }
    >
      {target ? (
        <WholesaleClaimGroupDialogForm
          customers={customers}
          key={
            target.kind === "edit"
              ? target.groupRow.claimGroup.id
              : target.rows.map((row) => row.purchaseOrder.id).join(",")
          }
          onCancelGroup={onCancelGroup}
          onCreateGroup={onCreateGroup}
          onOpenChange={onOpenChange}
          onUpdateGroup={onUpdateGroup}
          pendingKey={pendingKey}
          target={target}
        />
      ) : null}
    </DashboardDialog>
  );
}

function WholesaleClaimGroupDialogForm({
  customers,
  onCancelGroup,
  onCreateGroup,
  onOpenChange,
  onUpdateGroup,
  pendingKey,
  target,
}: {
  customers: WholesaleCustomer[];
  onCancelGroup: (claimGroupId: string) => Promise<boolean>;
  onCreateGroup: (
    purchaseOrderIds: string[],
    customerId: string,
    wholesaleOrderIds: string[],
  ) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  onUpdateGroup: (
    claimGroupId: string,
    purchaseOrderIds: string[],
    customerId: string,
    wholesaleOrderIds: string[],
  ) => Promise<boolean>;
  pendingKey: string | null;
  target: WholesaleClaimGroupDialogTarget;
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_claim_group_dialog",
  );
  const initialPurchaseOrders =
    target.kind === "edit"
      ? target.groupRow.purchaseOrders
      : target.rows.map((row) => row.purchaseOrder);
  const [purchaseOrderIds, setPurchaseOrderIds] = useState(
    initialPurchaseOrders.map((purchaseOrder) => purchaseOrder.id),
  );
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const claimTarget = useWholesaleClaimTarget({
    initialCustomerId:
      target.kind === "edit"
        ? target.groupRow.claimGroup.customer_id
        : getSharedAssistedCustomerId(target.rows),
    initialOrderIds:
      target.kind === "edit"
        ? target.groupRow.wholesaleOrders.map((order) => order.id)
        : [],
    initialOrders:
      target.kind === "edit" ? target.groupRow.wholesaleOrders : [],
  });
  const pending = pendingKey?.startsWith("1688:") ?? false;

  return (
    <form
      className="grid min-w-0 gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const succeeded =
          target.kind === "edit"
            ? await onUpdateGroup(
                target.groupRow.claimGroup.id,
                purchaseOrderIds,
                claimTarget.selectedCustomerId,
                claimTarget.selectedOrderIds,
              )
            : await onCreateGroup(
                purchaseOrderIds,
                claimTarget.selectedCustomerId,
                claimTarget.selectedOrderIds,
              );

        // 保存失败时保留客户、采购订单和批发订单选择，方便用户直接检查后重试。
        if (succeeded) onOpenChange(false);
      }}
    >
      <div className="rounded-record-card bg-surface-inset px-4 py-3 text-sm leading-6 text-content-muted">
        {uiText("selectionSummary", {
          count: purchaseOrderIds.length,
        })}
      </div>

      <div className="grid min-w-0 gap-2">
        <span className="text-sm font-medium text-content-muted">
          {uiText("purchaseOrdersLabel")}
        </span>
        <div className="flex max-h-40 min-w-0 flex-wrap gap-2 overflow-y-auto rounded-record-card border border-border bg-surface-interactive p-3">
          {initialPurchaseOrders
            .filter((purchaseOrder) =>
              purchaseOrderIds.includes(purchaseOrder.id),
            )
            .map((purchaseOrder) => (
              <span
                className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full bg-status-info-soft px-3 py-1.5 text-xs font-semibold text-primary"
                key={purchaseOrder.id}
              >
                <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                  {purchaseOrder.external_order_number}
                </span>
                {target.kind === "edit" && purchaseOrderIds.length > 1 ? (
                  <DesignButton
                    aria-label={uiText("removePurchaseOrder", {
                      orderNumber: purchaseOrder.external_order_number,
                    })}
                    className="shrink-0 rounded-full p-0.5 hover:bg-surface-interactive"
                    onClick={() =>
                      setPurchaseOrderIds((current) =>
                        current.filter((id) => id !== purchaseOrder.id),
                      )
                    }
                    type="button"
                  >
                    <X className="size-3.5" />
                  </DesignButton>
                ) : null}
              </span>
            ))}
        </div>
      </div>

      <WholesaleClaimTargetFields
        candidateError={claimTarget.candidateError}
        candidateLoading={claimTarget.candidateLoading}
        candidateLoadingMore={claimTarget.candidateLoadingMore}
        customers={customers}
        exactSearchActive={claimTarget.exactSearchActive}
        hasMoreOrders={claimTarget.hasMoreOrders}
        matchingOrders={claimTarget.matchingOrders}
        onCustomerChange={claimTarget.setSelectedCustomerId}
        onExactSearch={claimTarget.activateExactOrderSearch}
        onExitExactSearch={claimTarget.exitExactOrderSearch}
        onLoadMoreOrders={claimTarget.loadMoreOrders}
        onOrderSearchChange={claimTarget.setOrderSearchText}
        onToggleOrder={claimTarget.toggleOrder}
        orderSearchText={claimTarget.orderSearchText}
        selectedCustomerId={claimTarget.selectedCustomerId}
        selectedOrderIds={claimTarget.selectedOrderIds}
        visibleOrders={claimTarget.visibleOrders}
      />

      {target.kind === "edit" && confirmingCancel ? (
        <div className="rounded-record-card border border-border-subtle bg-surface-inset p-4 text-sm leading-6 text-content-muted">
          <p>{uiText("cancelWarning")}</p>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button
              disabled={pending}
              onClick={() => setConfirmingCancel(false)}
              type="button"
              variant="outline"
              size="compact"
            >
              {uiText("keepGroup")}
            </Button>
            <Button
              variant="danger"
              size="default"
              disabled={pending}
              onClick={async () => {
                const succeeded = await onCancelGroup(
                  target.groupRow.claimGroup.id,
                );
                if (succeeded) onOpenChange(false);
              }}
              type="button"
            >
              {uiText("confirmCancel")}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap justify-between gap-3">
        {target.kind === "edit" && !confirmingCancel ? (
          <Button
            disabled={pending}
            onClick={() => setConfirmingCancel(true)}
            size="default"
            type="button"
            variant="outline"
          >
            {uiText("cancelGroup")}
          </Button>
        ) : (
          <span />
        )}
        <Button
          variant="primary"
          size="default"
          disabled={
            pending || purchaseOrderIds.length === 0 || !claimTarget.canSubmit
          }
          type="submit"
          wrap
        >
          {target.kind === "edit" ? uiText("save") : uiText("create")}
        </Button>
      </div>
    </form>
  );
}

function getSharedAssistedCustomerId(rows: WholesaleClaimRow[]) {
  const customerIds = new Set(
    rows
      .map((row) => row.purchaseOrder.assisted_customer_id)
      .filter((customerId): customerId is string => Boolean(customerId)),
  );

  return customerIds.size === 1 ? [...customerIds][0] : "";
}
