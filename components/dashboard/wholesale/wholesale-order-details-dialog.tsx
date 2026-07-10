"use client";

import { CheckCircle2, PencilLine, Send } from "lucide-react";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { Button } from "@/components/ui/button";
import type {
  Wholesale1688Order,
  WholesaleLogisticsOrder,
  WholesaleOrder,
  WholesaleOrderSettlement,
} from "@/lib/wholesale";
import type { WholesaleLogisticsStatus } from "@/lib/wholesale-logistics-statuses";

import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatOptionalCurrency,
  formatPercent,
  formatRate,
  WHOLESALE_ORDER_STATUS_LABELS,
} from "./wholesale-display";
import { WholesaleDetailGrid } from "./wholesale-detail-grid";
import type { WholesaleOrderEditAction } from "./wholesale-orders-table";

type WholesaleOrderDetailsDialogProps = {
  canMarkOrderSettled: boolean;
  customerName: string;
  editAction: WholesaleOrderEditAction | null;
  logisticsOrders: WholesaleLogisticsOrder[];
  logisticsStatuses: WholesaleLogisticsStatus[];
  onClose: () => void;
  onOpenOrderEdit: () => void;
  onOpenOrderSettlement: () => void;
  open: boolean;
  order: WholesaleOrder;
  purchaseOrders: Wholesale1688Order[];
  salesName: string;
  settlements: WholesaleOrderSettlement[];
};

export function WholesaleOrderDetailsDialog({
  canMarkOrderSettled,
  customerName,
  editAction,
  logisticsOrders,
  logisticsStatuses,
  onClose,
  onOpenOrderEdit,
  onOpenOrderSettlement,
  open,
  order,
  purchaseOrders,
  salesName,
  settlements,
}: WholesaleOrderDetailsDialogProps) {
  const settledAmount = settlements.reduce(
    (sum, settlement) => sum + Number(settlement.settlement_amount),
    0,
  );

  return (
    <DashboardDialog
      actions={
        editAction || canMarkOrderSettled ? (
          <div className="flex flex-wrap gap-2">
            {editAction ? (
              <Button
                className="rounded-full border border-[#d8e2e8] bg-white text-[#486782] hover:bg-[#eef3f6]"
                onClick={onOpenOrderEdit}
                type="button"
                variant="outline"
              >
                {editAction.tone === "direct" ? (
                  <PencilLine className="size-4" />
                ) : (
                  <Send className="size-4" />
                )}
                {editAction.label}
              </Button>
            ) : null}
            {canMarkOrderSettled ? (
              <Button
                className="rounded-full bg-[#486782] text-white hover:bg-[#3e5f79]"
                onClick={onOpenOrderSettlement}
                type="button"
              >
                <CheckCircle2 className="size-4" />
                登记结汇
              </Button>
            ) : null}
          </div>
        ) : null
      }
      description="分组查看费用、利润、结汇、关联采购物流和备注。"
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      open={open}
      title={`订单 ${order.order_number}`}
    >
      <div className="space-y-6">
        <DetailGroup title="订单信息">
          <WholesaleDetailGrid
            rows={[
              { label: "客户", value: customerName },
              { label: "业务员", value: salesName },
              { label: "状态", value: WHOLESALE_ORDER_STATUS_LABELS[order.status] },
              { label: "下单时间", value: formatDateTime(order.ordered_at) },
              {
                label: "客户支付",
                value: formatCurrency(
                  order.customer_payment_amount,
                  order.customer_payment_currency,
                ),
              },
              { label: "收款平台", value: order.payment_platform ?? "未记录" },
            ]}
          />
        </DetailGroup>

        <DetailGroup title="费用和利润">
          <WholesaleDetailGrid
            rows={[
              { label: "小单数量", value: formatNumber(order.small_order_count) },
              {
                label: "产品采购金额",
                value: formatCurrency(order.product_purchase_amount),
              },
              { label: "打包费", value: formatCurrency(order.packing_fee) },
              {
                label: "国际运费",
                value: formatCurrency(order.international_shipping_fee),
              },
              { label: "其他费用", value: formatCurrency(order.other_fee) },
              {
                label: "推荐佣金费用",
                value: formatCurrency(order.referral_commission_fee),
              },
              { label: "毛利", value: formatOptionalCurrency(order.gross_profit) },
              { label: "毛利率", value: formatPercent(order.gross_margin) },
              {
                label: "单位毛利",
                value: formatOptionalCurrency(order.unit_gross_profit),
              },
            ]}
          />
        </DetailGroup>

        <DetailGroup title="结汇记录">
          <p className="mb-3 text-sm text-[#65737d]">
            已结 {formatCurrency(settledAmount, order.customer_payment_currency)}，
            剩余{" "}
            {formatCurrency(
              Math.max(order.customer_payment_amount - settledAmount, 0),
              order.customer_payment_currency,
            )}
          </p>
          {settlements.length > 0 ? (
            <div className="grid gap-2">
              {settlements.map((settlement) => (
                <div
                  className="rounded-[16px] bg-[#f7f9fa] p-3 text-sm text-[#4f606b]"
                  key={settlement.id}
                >
                  <p className="font-semibold text-[#2f3f4a]">
                    {formatDate(settlement.settled_on)}
                  </p>
                  <p className="mt-1">
                    {formatCurrency(
                      settlement.settlement_amount,
                      order.customer_payment_currency,
                    )}{" "}
                    · 汇率 {formatRate(settlement.settlement_exchange_rate)} ·{" "}
                    {formatCurrency(settlement.settlement_rmb_amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#71808d]">尚未登记结汇记录。</p>
          )}
        </DetailGroup>

        <DetailGroup title="关联采购和物流">
          <RecordLabels
            emptyText="尚未关联 1688 采购订单。"
            labels={purchaseOrders.map((item) => item.external_order_number)}
          />
          <div className="mt-3">
            <RecordLabels
              emptyText="尚未关联物流记录。"
              labels={[
                ...logisticsStatuses.map((item) => item.tracking_number),
                ...logisticsOrders.map(
                  (item) =>
                    item.source_workflow_order_number ??
                    item.international_tracking_number,
                ),
              ]}
            />
          </div>
        </DetailGroup>

        <DetailGroup title="备注">
          <p className="break-words text-sm leading-6 text-[#4f606b] [overflow-wrap:anywhere]">
            {order.notes ?? "未记录备注。"}
          </p>
        </DetailGroup>
      </div>
    </DashboardDialog>
  );
}

function DetailGroup({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-[#2f3f4a]">{title}</h3>
      {children}
    </section>
  );
}

function RecordLabels({
  emptyText,
  labels,
}: {
  emptyText: string;
  labels: string[];
}) {
  if (labels.length === 0) {
    return <p className="text-sm text-[#71808d]">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => (
        <span
          className="max-w-full break-words rounded-full bg-[#eef3f6] px-3 py-1.5 text-xs font-semibold text-[#486782] [overflow-wrap:anywhere]"
          key={label}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
