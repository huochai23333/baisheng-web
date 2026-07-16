"use client";

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
      <div className="rounded-[18px] bg-[#f6f8f9] px-4 py-3 text-sm leading-6 text-[#61717e]">
        {uiText("selectionSummary", {
          count: purchaseOrderIds.length,
        })}
      </div>

      <div className="grid min-w-0 gap-2">
        <span className="text-sm font-medium text-[#40515c]">
          {uiText("purchaseOrdersLabel")}
        </span>
        <div className="flex max-h-40 min-w-0 flex-wrap gap-2 overflow-y-auto rounded-[18px] border border-[#dfe5ea] bg-white p-3">
          {initialPurchaseOrders
            .filter((purchaseOrder) =>
              purchaseOrderIds.includes(purchaseOrder.id),
            )
            .map((purchaseOrder) => (
              <span
                className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full bg-[#edf3f6] px-3 py-1.5 text-xs font-semibold text-[#486782]"
                key={purchaseOrder.id}
              >
                <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                  {purchaseOrder.external_order_number}
                </span>
                {target.kind === "edit" && purchaseOrderIds.length > 1 ? (
                  <button
                    aria-label={uiText("removePurchaseOrder", {
                      orderNumber: purchaseOrder.external_order_number,
                    })}
                    className="shrink-0 rounded-full p-0.5 hover:bg-white"
                    onClick={() =>
                      setPurchaseOrderIds((current) =>
                        current.filter((id) => id !== purchaseOrder.id),
                      )
                    }
                    type="button"
                  >
                    <X className="size-3.5" />
                  </button>
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
        <div className="rounded-[18px] border border-[#efcaca] bg-[#fff4f4] p-4 text-sm leading-6 text-[#8f3030]">
          <p>{uiText("cancelWarning")}</p>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button
              className="rounded-full"
              disabled={pending}
              onClick={() => setConfirmingCancel(false)}
              type="button"
              variant="outline"
            >
              {uiText("keepGroup")}
            </Button>
            <Button
              className="rounded-full bg-[#b13d3d] text-white hover:bg-[#962f2f]"
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
            className="rounded-full border-[#efcaca] text-[#a83b3b] hover:bg-[#fff1f1]"
            disabled={pending}
            onClick={() => setConfirmingCancel(true)}
            type="button"
            variant="outline"
          >
            {uiText("cancelGroup")}
          </Button>
        ) : (
          <span />
        )}
        <Button
          className="min-h-11 whitespace-normal rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79] disabled:opacity-60"
          disabled={
            pending ||
            purchaseOrderIds.length === 0 ||
            !claimTarget.canSubmit
          }
          type="submit"
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
