"use client";

import {
  CheckCircle2,
  LoaderCircle,
  PencilLine,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  Wholesale1688Order,
  WholesaleCustomer,
  WholesaleLogisticsOrder,
  WholesaleOrder,
  WholesaleOrderSettlement,
  WholesaleProfile,
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
  getCustomerName,
  getProfileName,
  WHOLESALE_ORDER_STATUS_LABELS,
} from "./wholesale-display";
import {
  LinkedLogisticsOrders,
  LinkedPurchaseOrders,
} from "./wholesale-order-linked-records";
import {
  WholesaleStatusBadge,
  WholesaleTable,
  WholesaleTd,
  WholesaleTh,
  wholesaleStickyFirstTdClassName,
  wholesaleStickyFirstThClassName,
} from "./wholesale-ui";

export type WholesaleOrderEditAction = {
  label: "修改订单" | "申请修改";
  tone: "direct" | "request";
};

type WholesaleOrdersTableProps = {
  canMarkOrderSettled: (order: WholesaleOrder) => boolean;
  customersById: Map<string, WholesaleCustomer>;
  getOrderEditAction: (order: WholesaleOrder) => WholesaleOrderEditAction | null;
  logisticsOrdersByOrderId: Map<string, WholesaleLogisticsOrder[]>;
  logisticsStatusesByOrderId: Map<string, WholesaleLogisticsStatus[]>;
  orderSettlementsByOrderId: Map<string, WholesaleOrderSettlement[]>;
  onOpenOrderEdit: (order: WholesaleOrder) => void;
  onOpenOrderSettlement: (order: WholesaleOrder) => void;
  orders: WholesaleOrder[];
  pendingKey: string | null;
  profilesById: Map<string, WholesaleProfile>;
  purchaseOrdersByOrderId: Map<string, Wholesale1688Order[]>;
};

export function WholesaleOrdersTable({
  canMarkOrderSettled,
  customersById,
  getOrderEditAction,
  logisticsOrdersByOrderId,
  logisticsStatusesByOrderId,
  orderSettlementsByOrderId,
  onOpenOrderEdit,
  onOpenOrderSettlement,
  orders,
  pendingKey,
  profilesById,
  purchaseOrdersByOrderId,
}: WholesaleOrdersTableProps) {
  return (
    <WholesaleTable minWidth={3660}>
      <thead>
        <tr>
          <WholesaleTh className={wholesaleStickyFirstThClassName}>
            订单编号
          </WholesaleTh>
          <WholesaleTh>客户</WholesaleTh>
          <WholesaleTh>业务员</WholesaleTh>
          <WholesaleTh>小单数量</WholesaleTh>
          <WholesaleTh>产品采购金额</WholesaleTh>
          <WholesaleTh>打包费</WholesaleTh>
          <WholesaleTh>国际运费</WholesaleTh>
          <WholesaleTh>其他费用</WholesaleTh>
          <WholesaleTh>推荐佣金费用</WholesaleTh>
          <WholesaleTh>快递公司</WholesaleTh>
          <WholesaleTh>结汇进度</WholesaleTh>
          <WholesaleTh>平均结汇汇率</WholesaleTh>
          <WholesaleTh>支付币种</WholesaleTh>
          <WholesaleTh>客户支付金额</WholesaleTh>
          <WholesaleTh>人民币金额</WholesaleTh>
          <WholesaleTh>收款平台</WholesaleTh>
          <WholesaleTh>毛利</WholesaleTh>
          <WholesaleTh>毛利率</WholesaleTh>
          <WholesaleTh>单位毛利</WholesaleTh>
          <WholesaleTh>订单计入月份</WholesaleTh>
          <WholesaleTh>下单时间</WholesaleTh>
          <WholesaleTh>最近结汇时间</WholesaleTh>
          <WholesaleTh className="min-w-[300px] whitespace-normal">
            结汇记录
          </WholesaleTh>
          <WholesaleTh className="min-w-[320px] whitespace-normal">
            关联 1688 采购订单
          </WholesaleTh>
          <WholesaleTh className="min-w-[320px] whitespace-normal">
            关联物流订单
          </WholesaleTh>
          <WholesaleTh className="min-w-[240px] whitespace-normal">备注</WholesaleTh>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => {
          const editAction = getOrderEditAction(order);
          const settlements = orderSettlementsByOrderId.get(order.id) ?? [];
          const settledAmount = settlements.reduce(
            (sum, settlement) => sum + Number(settlement.settlement_amount),
            0,
          );
          const remainingAmount = Math.max(
            Number(order.customer_payment_amount) - settledAmount,
            0,
          );

          return (
            <tr
              className="group"
              data-testid={`wholesale-order-row-${order.id}`}
              key={order.id}
            >
              <WholesaleTd className={wholesaleStickyFirstTdClassName}>
                <div className="font-semibold [overflow-wrap:anywhere]">
                  {order.order_number}
                </div>
                <div className="mt-2">
                  <WholesaleStatusBadge
                    tone={order.status === "settled" ? "success" : "warning"}
                  >
                    {WHOLESALE_ORDER_STATUS_LABELS[order.status]}
                  </WholesaleStatusBadge>
                </div>
                {editAction ? (
                  <Button
                    className={
                      editAction.tone === "direct"
                        ? "mt-3 h-9 rounded-full border border-[#d8e2e8] bg-white px-3 text-xs text-[#486782] hover:bg-[#eef3f6]"
                        : "mt-3 h-9 rounded-full border border-[#f0dfaf] bg-[#fff8e6] px-3 text-xs text-[#75520c] hover:bg-[#fbf0cf]"
                    }
                    onClick={() => onOpenOrderEdit(order)}
                    type="button"
                    variant="outline"
                  >
                    {editAction.tone === "direct" ? (
                      <PencilLine className="size-3.5" />
                    ) : (
                      <Send className="size-3.5" />
                    )}
                    {editAction.label}
                  </Button>
                ) : null}
                {canMarkOrderSettled(order) ? (
                  <Button
                    className="mt-3 h-9 rounded-full bg-[#486782] px-3 text-xs text-white hover:bg-[#3e5f79]"
                    data-testid={`wholesale-order-settle-${order.id}`}
                    disabled={pendingKey === `order:settle:${order.id}`}
                    onClick={() => onOpenOrderSettlement(order)}
                    type="button"
                  >
                    {pendingKey === `order:settle:${order.id}` ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-3.5" />
                    )}
                    登记结汇
                  </Button>
                ) : null}
              </WholesaleTd>
              <WholesaleTd className="min-w-[160px] whitespace-normal">
                {getCustomerName(customersById, order.customer_id)}
              </WholesaleTd>
              <WholesaleTd className="min-w-[150px] whitespace-normal">
                {getProfileName(profilesById, order.sales_user_id)}
              </WholesaleTd>
              <WholesaleTd>{formatNumber(order.small_order_count)}</WholesaleTd>
              <WholesaleTd>{formatCurrency(order.product_purchase_amount)}</WholesaleTd>
              <WholesaleTd>{formatCurrency(order.packing_fee)}</WholesaleTd>
              <WholesaleTd>{formatCurrency(order.international_shipping_fee)}</WholesaleTd>
              <WholesaleTd>{formatCurrency(order.other_fee)}</WholesaleTd>
              <WholesaleTd>{formatCurrency(order.referral_commission_fee)}</WholesaleTd>
              <WholesaleTd className="min-w-[140px] whitespace-normal">
                {order.courier_company ?? "未记录"}
              </WholesaleTd>
              <WholesaleTd className="min-w-[160px] whitespace-normal">
                <div>
                  <p>
                    已结 {formatCurrency(settledAmount, order.customer_payment_currency)}
                  </p>
                  <p className="mt-1 text-xs text-[#7b8790]">
                    剩余 {formatCurrency(remainingAmount, order.customer_payment_currency)}
                  </p>
                </div>
              </WholesaleTd>
              <WholesaleTd>
                {order.settlement_exchange_rate === null ||
                order.settlement_exchange_rate === undefined
                  ? "未结汇"
                  : formatRate(order.settlement_exchange_rate)}
              </WholesaleTd>
              <WholesaleTd>{order.customer_payment_currency}</WholesaleTd>
              <WholesaleTd>
                {formatCurrency(
                  order.customer_payment_amount,
                  order.customer_payment_currency,
                )}
              </WholesaleTd>
              <WholesaleTd>
                {formatOptionalCurrency(order.customer_payment_rmb_amount)}
              </WholesaleTd>
              <WholesaleTd className="min-w-[140px] whitespace-normal">
                {order.payment_platform ?? "未记录"}
              </WholesaleTd>
              <WholesaleTd>{formatOptionalCurrency(order.gross_profit)}</WholesaleTd>
              <WholesaleTd>{formatPercent(order.gross_margin)}</WholesaleTd>
              <WholesaleTd>
                {formatOptionalCurrency(order.unit_gross_profit)}
              </WholesaleTd>
              <WholesaleTd>{formatDate(order.order_month)}</WholesaleTd>
              <WholesaleTd>{formatDateTime(order.ordered_at)}</WholesaleTd>
              <WholesaleTd>
                {order.settled_at ? formatDateTime(order.settled_at) : "未结汇"}
              </WholesaleTd>
              <WholesaleTd className="min-w-[300px] whitespace-normal">
                <SettlementRecordsCell
                  currency={order.customer_payment_currency}
                  settlements={settlements}
                />
              </WholesaleTd>
              <WholesaleTd className="min-w-[320px] whitespace-normal">
                <LinkedPurchaseOrders
                  profilesById={profilesById}
                  purchaseOrders={purchaseOrdersByOrderId.get(order.id) ?? []}
                />
              </WholesaleTd>
              <WholesaleTd className="min-w-[320px] whitespace-normal">
                <LinkedLogisticsOrders
                  logisticsOrders={logisticsOrdersByOrderId.get(order.id) ?? []}
                  logisticsStatuses={logisticsStatusesByOrderId.get(order.id) ?? []}
                />
              </WholesaleTd>
              <WholesaleTd className="min-w-[240px] whitespace-normal">
                {order.notes ?? "未记录"}
              </WholesaleTd>
            </tr>
          );
        })}
      </tbody>
    </WholesaleTable>
  );
}

function SettlementRecordsCell({
  currency,
  settlements,
}: {
  currency: string;
  settlements: WholesaleOrderSettlement[];
}) {
  if (settlements.length === 0) {
    return <span className="text-[#7b8790]">暂无记录</span>;
  }

  return (
    <div className="grid gap-2">
      {settlements.map((settlement) => (
        <div
          className="rounded-[12px] bg-[#f7fafb] p-2 text-xs leading-5 text-[#4f606b]"
          key={settlement.id}
        >
          <p className="font-semibold text-[#2f3f4a]">
            {formatDate(settlement.settled_on)}
          </p>
          <p>
            {formatCurrency(settlement.settlement_amount, currency)} / 汇率{" "}
            {formatRate(settlement.settlement_exchange_rate)}
          </p>
          <p>{formatCurrency(settlement.settlement_rmb_amount)}</p>
        </div>
      ))}
    </div>
  );
}
