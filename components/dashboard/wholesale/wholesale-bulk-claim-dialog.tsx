"use client";

import { useTranslations } from "next-intl";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { Button } from "@/components/ui/button";
import type { WholesaleCustomer, WholesaleOrder } from "@/lib/wholesale";

import {
  WholesaleClaimTargetFields,
  useWholesaleClaimTarget,
} from "./wholesale-claim-target-fields";

export function WholesaleBulkClaimDialog({
  customers,
  onClaim,
  onOpenChange,
  onSuccess,
  open,
  orders,
  pending,
  purchaseOrderIds,
}: {
  customers: WholesaleCustomer[];
  onClaim: (
    purchaseOrderIds: string[],
    customerId: string,
    wholesaleOrderId: string,
  ) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  open: boolean;
  orders: WholesaleOrder[];
  pending: boolean;
  purchaseOrderIds: string[];
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_bulk_claim_dialog",
  );

  return (
    <DashboardDialog
      description={uiText("description", { count: purchaseOrderIds.length })}
      onOpenChange={onOpenChange}
      open={open}
      title={uiText("title")}
    >
      {open ? (
        <WholesaleBulkClaimDialogForm
          customers={customers}
          key={purchaseOrderIds.join(",")}
          onClaim={onClaim}
          onSuccess={onSuccess}
          orders={orders}
          pending={pending}
          purchaseOrderIds={purchaseOrderIds}
        />
      ) : null}
    </DashboardDialog>
  );
}

function WholesaleBulkClaimDialogForm({
  customers,
  onClaim,
  onSuccess,
  orders,
  pending,
  purchaseOrderIds,
}: {
  customers: WholesaleCustomer[];
  onClaim: (
    purchaseOrderIds: string[],
    customerId: string,
    wholesaleOrderId: string,
  ) => Promise<boolean>;
  onSuccess: () => void;
  orders: WholesaleOrder[];
  pending: boolean;
  purchaseOrderIds: string[];
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_bulk_claim_dialog",
  );
  const target = useWholesaleClaimTarget({ orders });

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const succeeded = await onClaim(
          purchaseOrderIds,
          target.selectedCustomerId,
          target.selectedOrderId,
        );

        // 请求失败时不清空任何选择，让用户可以直接检查后再次提交。
        if (!succeeded) return;
        onSuccess();
      }}
    >
      <div className="rounded-[18px] bg-[#f6f8f9] px-4 py-3 text-sm leading-6 text-[#61717e]">
        {uiText("selectionSummary", { count: purchaseOrderIds.length })}
      </div>
      <WholesaleClaimTargetFields
        customers={customers}
        matchingOrders={target.matchingOrders}
        onCustomerChange={target.setSelectedCustomerId}
        onOrderChange={target.setSelectedOrderId}
        selectedCustomerId={target.selectedCustomerId}
        selectedOrderId={target.selectedOrderId}
      />
      <div className="flex justify-end">
        <Button
          className="min-h-11 whitespace-normal rounded-full bg-[#486782] px-5 text-white hover:bg-[#3e5f79] disabled:opacity-60"
          disabled={pending || !target.canSubmit || purchaseOrderIds.length === 0}
          type="submit"
        >
          {uiText("submit")}
        </Button>
      </div>
    </form>
  );
}
