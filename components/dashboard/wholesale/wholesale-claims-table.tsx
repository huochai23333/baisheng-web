"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { CheckCircle2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "./wholesale-display";
import type { WholesaleClaimRow } from "./wholesale-claims-view-model";
import {
  WholesaleStatusBadge,
  WholesaleTable,
  WholesaleTd,
  WholesaleTh,
  wholesaleStickyFirstTdClassName,
  wholesaleStickyFirstThClassName,
} from "./wholesale-ui";
const wholesaleClaimStickyFirstThClassName = `${wholesaleStickyFirstThClassName} min-w-[220px] whitespace-nowrap`;
const wholesaleClaimStickyFirstTdClassName = `${wholesaleStickyFirstTdClassName} min-w-[220px] whitespace-nowrap`;
const wholesaleClaimSelectionThClassName =
  "sticky left-0 z-40 w-[56px] min-w-[56px] border-r border-[#efebe5] bg-[#f7f5f2] text-center";
const wholesaleClaimSelectionTdClassName =
  "sticky left-0 z-30 w-[56px] min-w-[56px] border-r border-[#efebe5] bg-white text-center group-hover:bg-[#fcfbf8]";

export type WholesaleClaimsTableSelection = {
  allSelected: boolean;
  hasPartialSelection: boolean;
  onToggleAll: () => void;
  onToggleOne: (purchaseOrderId: string) => void;
  selectedIds: Set<string>;
};

export function WholesaleClaimsTable({
  canAdmin,
  canEdit,
  canReassignClaims,
  onDelete,
  onOpenClaim,
  pendingKey,
  rows,
  selection,
}: {
  canAdmin: boolean;
  canEdit: boolean;
  canReassignClaims: boolean;
  onDelete: (purchaseOrderId: string) => void;
  onOpenClaim: (row: WholesaleClaimRow) => void;
  pendingKey: string | null;
  rows: WholesaleClaimRow[];
  selection?: WholesaleClaimsTableSelection;
}) {
  return (
    <WholesaleTable minWidth={selection ? 2096 : 2040}>
      <thead>
        <tr>
          {selection ? (
            <WholesaleTh className={wholesaleClaimSelectionThClassName}>
              <SelectionHeaderCheckbox selection={selection} />
            </WholesaleTh>
          ) : null}
          <WholesaleTh
            className={
              selection
                ? `${wholesaleClaimStickyFirstThClassName} left-[56px]`
                : wholesaleClaimStickyFirstThClassName
            }
          >
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text001" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text002" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text003" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text004" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text005" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text006" />
          </WholesaleTh>
          <WholesaleTh className="min-w-[260px] whitespace-normal">
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text007" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text008" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text009" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text010" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text011" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text012" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text013" />
          </WholesaleTh>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <WholesaleClaimTableRow
            canAdmin={canAdmin}
            canEdit={canEdit}
            canReassignClaims={canReassignClaims}
            key={row.purchaseOrder.id}
            onDelete={onDelete}
            onOpenClaim={onOpenClaim}
            pendingKey={pendingKey}
            row={row}
            selection={selection}
          />
        ))}
      </tbody>
    </WholesaleTable>
  );
}
function WholesaleClaimTableRow({
  canAdmin,
  canEdit,
  canReassignClaims,
  onDelete,
  onOpenClaim,
  pendingKey,
  row,
  selection,
}: {
  canAdmin: boolean;
  canEdit: boolean;
  canReassignClaims: boolean;
  onDelete: (purchaseOrderId: string) => void;
  onOpenClaim: (row: WholesaleClaimRow) => void;
  pendingKey: string | null;
  row: WholesaleClaimRow;
  selection?: WholesaleClaimsTableSelection;
}) {
  const { purchaseOrder } = row;
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_claims_table",
  );
  return (
    <tr className="group">
      {selection ? (
        <WholesaleTd className={wholesaleClaimSelectionTdClassName}>
          <input
            aria-label={uiText("selectOrder", {
              orderNumber: purchaseOrder.external_order_number,
            })}
            checked={selection.selectedIds.has(purchaseOrder.id)}
            className="size-4 cursor-pointer accent-[#486782]"
            onChange={() => selection.onToggleOne(purchaseOrder.id)}
            type="checkbox"
          />
        </WholesaleTd>
      ) : null}
      <WholesaleTd
        className={
          selection
            ? `${wholesaleClaimStickyFirstTdClassName} left-[56px]`
            : wholesaleClaimStickyFirstTdClassName
        }
      >
        <div className="font-semibold whitespace-nowrap">
          {purchaseOrder.external_order_number}
        </div>
        <div className="mt-2">
          <ClaimInlineSlot
            canEdit={canEdit}
            canReassignClaim={canReassignClaims}
            onOpenClaim={onOpenClaim}
            pending={pendingKey}
            row={row}
          />
        </div>
        <div className="mt-2 text-xs leading-5 text-[#71808d]">
          {purchaseOrder.order_status ?? "未记录状态"}
        </div>
      </WholesaleTd>
      <WholesaleTd className="min-w-[150px] whitespace-normal">
        {row.recipientName}
      </WholesaleTd>
      <WholesaleTd className="min-w-[170px] whitespace-normal">
        {purchaseOrder.assisted_customer_id ? (
          <div>
            <div className="font-semibold text-[#2b3942]">
              {row.assistedCustomerName}
            </div>
            <div className="mt-1 text-xs leading-5 text-[#71808d]">
              <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text014" />
            </div>
          </div>
        ) : (
          "未匹配"
        )}
      </WholesaleTd>
      <WholesaleTd className="min-w-[150px] whitespace-normal">
        {purchaseOrder.claimed_by_user_id ? row.claimerName : "未认领"}
      </WholesaleTd>
      <WholesaleTd className="min-w-[160px] whitespace-normal">
        {row.customerName}
      </WholesaleTd>
      <WholesaleTd className="min-w-[170px] whitespace-normal">
        {row.orderNumber}
      </WholesaleTd>
      <WholesaleTd className="min-w-[260px] whitespace-normal">
        <div>{purchaseOrder.item_summary ?? "未记录商品"}</div>
        {purchaseOrder.seller_name ? (
          <div className="mt-1 text-xs text-[#71808d]">
            <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text015" />
            {purchaseOrder.seller_name}
          </div>
        ) : null}
      </WholesaleTd>
      <WholesaleTd>{formatNumber(purchaseOrder.quantity)}</WholesaleTd>
      <WholesaleTd>{formatCurrency(purchaseOrder.purchase_amount)}</WholesaleTd>
      <WholesaleTd>{formatDateTime(purchaseOrder.purchased_at)}</WholesaleTd>
      <WholesaleTd>{formatDateTime(purchaseOrder.claimed_at)}</WholesaleTd>
      <WholesaleTd>{formatDateTime(purchaseOrder.created_at)}</WholesaleTd>
      <WholesaleTd>
        <ClaimActions
          canAdmin={canAdmin}
          canEdit={canEdit}
          onDelete={() => onDelete(purchaseOrder.id)}
          onOpenClaim={() => onOpenClaim(row)}
          pending={pendingKey}
          row={row}
        />
      </WholesaleTd>
    </tr>
  );
}

function SelectionHeaderCheckbox({
  selection,
}: {
  selection: WholesaleClaimsTableSelection;
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_claims_table",
  );
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = selection.hasPartialSelection;
    }
  }, [selection.hasPartialSelection]);

  return (
    <input
      aria-label={uiText("selectAll")}
      checked={selection.allSelected}
      className="size-4 cursor-pointer accent-[#486782]"
      onChange={selection.onToggleAll}
      ref={checkboxRef}
      type="checkbox"
    />
  );
}
function ClaimInlineSlot({
  canEdit,
  canReassignClaim,
  onOpenClaim,
  pending,
  row,
}: {
  canEdit: boolean;
  canReassignClaim: boolean;
  onOpenClaim: (row: WholesaleClaimRow) => void;
  pending: string | null;
  row: WholesaleClaimRow;
}) {
  if (row.board === "hall") {
    if (!canEdit) {
      return (
        <WholesaleStatusBadge tone="warning">
          <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text016" />
        </WholesaleStatusBadge>
      );
    }
    return (
      <Button
        className="h-8 rounded-full bg-[#486782] px-3 text-xs text-white hover:bg-[#3e5f79]"
        disabled={pending === "1688:claim"}
        onClick={() => onOpenClaim(row)}
        type="button"
      >
        <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text017" />
      </Button>
    );
  }
  if (row.board === "claimed") {
    if (canReassignClaim) {
      return (
        <Button
          className="h-8 rounded-full border border-[#d8e2e8] bg-white px-3 text-xs text-[#486782] hover:bg-[#eef3f6]"
          disabled={pending === "1688:claim"}
          onClick={() => onOpenClaim(row)}
          type="button"
          variant="outline"
        >
          <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text023" />
        </Button>
      );
    }
    return (
      <WholesaleStatusBadge tone="success">
        <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text018" />
      </WholesaleStatusBadge>
    );
  }
  return (
    <WholesaleStatusBadge tone="warning">
      <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text019" />
    </WholesaleStatusBadge>
  );
}
function ClaimActions({
  canAdmin,
  canEdit,
  onDelete,
  onOpenClaim,
  pending,
  row,
}: {
  canAdmin: boolean;
  canEdit: boolean;
  onDelete: () => void;
  onOpenClaim: () => void;
  pending: string | null;
  row: WholesaleClaimRow;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {row.board === "claimed" ? (
        <WholesaleStatusBadge tone="success">
          <CheckCircle2 className="mr-1 size-3.5" />
          {formatDateTime(row.purchaseOrder.claimed_at)}
        </WholesaleStatusBadge>
      ) : row.board === "assisted" && canEdit ? (
        <Button
          className="h-9 rounded-full bg-[#486782] px-3 text-xs text-white hover:bg-[#3e5f79]"
          disabled={pending === "1688:claim"}
          onClick={onOpenClaim}
          type="button"
        >
          <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text020" />
        </Button>
      ) : row.board === "assisted" ? (
        <WholesaleStatusBadge tone="warning">
          <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text021" />
        </WholesaleStatusBadge>
      ) : null}
      {canAdmin ? (
        <Button
          className="h-9 rounded-full bg-[#fbe6e6] px-3 text-xs font-semibold text-[#b13d3d] hover:bg-[#f7d4d4]"
          disabled={pending === "1688:delete"}
          onClick={onDelete}
          type="button"
        >
          <Trash2 className="size-3.5" />
          <UiMessage id="components_dashboard_wholesale_wholesale_claims_table.text022" />
        </Button>
      ) : null}
    </div>
  );
}
