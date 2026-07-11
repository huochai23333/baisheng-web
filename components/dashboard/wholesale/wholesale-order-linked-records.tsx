"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ShoppingCart, Truck } from "lucide-react";
import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { Button } from "@/components/ui/button";
import type {
  Wholesale1688Order,
  WholesaleLogisticsOrder,
  WholesaleProfile,
} from "@/lib/wholesale";
import type { WholesaleLogisticsStatus } from "@/lib/wholesale-logistics-statuses";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  getProfileName,
  WHOLESALE_LOGISTICS_STATUS_LABELS,
} from "./wholesale-display";
import {
  WholesaleDetailGrid,
  type WholesaleDetailGridRow,
} from "./wholesale-detail-grid";
type LinkedLogisticsRecord =
  | {
      id: string;
      label: string;
      record: WholesaleLogisticsStatus;
      type: "status";
    }
  | {
      id: string;
      label: string;
      record: WholesaleLogisticsOrder;
      type: "order";
    };
export function LinkedPurchaseOrders({
  profilesById,
  purchaseOrders,
}: {
  profilesById: Map<string, WholesaleProfile>;
  purchaseOrders: Wholesale1688Order[];
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_order_linked_records",
  );
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
    useState<Wholesale1688Order | null>(null);
  if (purchaseOrders.length === 0) {
    return (
      <span className="text-[#71808d]">
        <UiMessage id="components_dashboard_wholesale_wholesale_order_linked_records.text001" />
      </span>
    );
  }
  return (
    <>
      <div className="max-h-24 space-y-2 overflow-y-auto pr-1">
        {purchaseOrders.map((purchaseOrder) => (
          <Button
            className="h-auto w-full justify-start rounded-full border border-[#d8e2e8] bg-white px-3 py-1.5 text-left text-xs font-semibold text-[#486782] hover:bg-[#eef3f6]"
            key={purchaseOrder.id}
            onClick={() => setSelectedPurchaseOrder(purchaseOrder)}
            type="button"
            variant="outline"
          >
            <ShoppingCart className="size-3.5 shrink-0" />
            <span className="min-w-0 break-words [overflow-wrap:anywhere]">
              {purchaseOrder.external_order_number}
            </span>
          </Button>
        ))}
      </div>
      <DashboardDialog
        description={uiText("attribute001")}
        onOpenChange={(open) => {
          if (!open) setSelectedPurchaseOrder(null);
        }}
        open={selectedPurchaseOrder !== null}
        title={uiText("attribute002")}
      >
        {selectedPurchaseOrder ? (
          <WholesaleDetailGrid
            rows={getLinkedPurchaseOrderDetailRows(
              selectedPurchaseOrder,
              profilesById,
            )}
          />
        ) : null}
      </DashboardDialog>
    </>
  );
}
export function LinkedLogisticsOrders({
  logisticsOrders,
  logisticsStatuses,
}: {
  logisticsOrders: WholesaleLogisticsOrder[];
  logisticsStatuses: WholesaleLogisticsStatus[];
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_order_linked_records",
  );
  const [selectedRecord, setSelectedRecord] =
    useState<LinkedLogisticsRecord | null>(null);
  const logisticsRecords = useMemo(
    () => [
      ...logisticsStatuses.map((record) => ({
        id: record.id,
        label: record.tracking_number,
        record,
        type: "status" as const,
      })),
      ...logisticsOrders.map((record) => ({
        id: record.id,
        label:
          record.source_workflow_order_number ??
          record.international_tracking_number,
        record,
        type: "order" as const,
      })),
    ],
    [logisticsOrders, logisticsStatuses],
  );
  if (logisticsOrders.length === 0 && logisticsStatuses.length === 0) {
    return (
      <span className="text-[#71808d]">
        <UiMessage id="components_dashboard_wholesale_wholesale_order_linked_records.text002" />
      </span>
    );
  }
  return (
    <>
      <div className="max-h-24 space-y-2 overflow-y-auto pr-1">
        {logisticsRecords.map((logisticsRecord) => (
          <Button
            className="h-auto w-full justify-start rounded-full border border-[#d8e2e8] bg-white px-3 py-1.5 text-left text-xs font-semibold text-[#486782] hover:bg-[#eef3f6]"
            key={logisticsRecord.id}
            onClick={() => setSelectedRecord(logisticsRecord)}
            type="button"
            variant="outline"
          >
            <Truck className="size-3.5 shrink-0" />
            <span className="min-w-0 break-words [overflow-wrap:anywhere]">
              {logisticsRecord.label}
            </span>
          </Button>
        ))}
      </div>
      <DashboardDialog
        description={uiText("attribute003")}
        onOpenChange={(open) => {
          if (!open) setSelectedRecord(null);
        }}
        open={selectedRecord !== null}
        title={uiText("attribute004")}
      >
        {selectedRecord ? (
          <WholesaleDetailGrid
            rows={getLinkedLogisticsDetailRows(selectedRecord)}
          />
        ) : null}
      </DashboardDialog>
    </>
  );
}
function getLinkedLogisticsDetailRows(
  selectedRecord: LinkedLogisticsRecord,
): WholesaleDetailGridRow[] {
  if (selectedRecord.type === "status") {
    const logisticsStatus = selectedRecord.record;
    return [
      { label: "物流号", value: logisticsStatus.tracking_number },
      { label: "客户名称", value: logisticsStatus.customer_name },
      {
        label: "当前状态",
        value: WHOLESALE_LOGISTICS_STATUS_LABELS[logisticsStatus.status_kind],
      },
      { label: "状态说明", value: logisticsStatus.status_text },
      {
        label: "是否停止核对",
        value: logisticsStatus.is_terminal ? "已停止" : "继续核对",
      },
      {
        label: "最近核对时间",
        value: formatDateTime(logisticsStatus.last_checked_at),
      },
      {
        label: "下次核对时间",
        value: formatDateTime(logisticsStatus.next_check_at),
      },
      {
        label: "来源更新时间",
        value: logisticsStatus.source_updated_at
          ? formatDateTime(logisticsStatus.source_updated_at)
          : "未记录",
      },
      { label: "异常信息", value: logisticsStatus.last_error ?? "未记录" },
      { label: "创建时间", value: formatDateTime(logisticsStatus.created_at) },
    ];
  }
  const logisticsOrder = selectedRecord.record;
  return [
    {
      label: "物流订单号",
      value: logisticsOrder.source_workflow_order_number ?? "未记录",
    },
    {
      label: "国际物流号",
      value: logisticsOrder.international_tracking_number,
    },
    {
      label: "目的地物流号",
      value: logisticsOrder.destination_tracking_number ?? "未记录",
    },
    { label: "货代", value: logisticsOrder.freight_forwarder ?? "未记录" },
    { label: "当前进度", value: logisticsOrder.latest_status ?? "未记录" },
    {
      label: "最近物流时间",
      value: formatDateTime(
        logisticsOrder.latest_checkpoint_at ?? logisticsOrder.updated_at,
      ),
    },
    {
      label: "物流费用",
      value: formatCurrency(
        logisticsOrder.logistics_fee,
        logisticsOrder.currency,
      ),
    },
    { label: "创建时间", value: formatDateTime(logisticsOrder.created_at) },
    { label: "更新时间", value: formatDateTime(logisticsOrder.updated_at) },
  ];
}
function getLinkedPurchaseOrderDetailRows(
  purchaseOrder: Wholesale1688Order,
  profilesById: Map<string, WholesaleProfile>,
): WholesaleDetailGridRow[] {
  return [
    { label: "1688 订单号", value: purchaseOrder.external_order_number },
    { label: "供应商", value: purchaseOrder.seller_name ?? "未记录" },
    { label: "商品", value: purchaseOrder.item_summary ?? "未记录" },
    { label: "数量", value: formatNumber(purchaseOrder.quantity) },
    { label: "采购金额", value: formatCurrency(purchaseOrder.purchase_amount) },
    { label: "订单状态", value: purchaseOrder.order_status ?? "未记录" },
    { label: "采购时间", value: formatDateTime(purchaseOrder.purchased_at) },
    { label: "收件人", value: purchaseOrder.recipient_name ?? "未记录" },
    {
      label: "认领业务员",
      value: purchaseOrder.claimed_by_user_id
        ? getProfileName(profilesById, purchaseOrder.claimed_by_user_id)
        : "未认领",
    },
    { label: "认领时间", value: formatDateTime(purchaseOrder.claimed_at) },
    {
      label: "导入人",
      value: purchaseOrder.imported_by_user_id
        ? getProfileName(profilesById, purchaseOrder.imported_by_user_id)
        : "未记录",
    },
    { label: "创建时间", value: formatDateTime(purchaseOrder.created_at) },
  ];
}
