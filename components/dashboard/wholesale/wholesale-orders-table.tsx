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
  WholesaleProfile,
} from "@/lib/wholesale";

import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
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
  onMarkOrderSettled: (orderId: string) => void | Promise<void>;
  onOpenOrderEdit: (order: WholesaleOrder) => void;
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
  onMarkOrderSettled,
  onOpenOrderEdit,
  orders,
  pendingKey,
  profilesById,
  purchaseOrdersByOrderId,
}: WholesaleOrdersTableProps) {
  return (
    <WholesaleTable minWidth={3260}>
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
          <WholesaleTh>结汇汇率</WholesaleTh>
          <WholesaleTh>支付币种</WholesaleTh>
          <WholesaleTh>客户支付金额</WholesaleTh>
          <WholesaleTh>人民币金额</WholesaleTh>
          <WholesaleTh>收款平台</WholesaleTh>
          <WholesaleTh>毛利</WholesaleTh>
          <WholesaleTh>毛利率</WholesaleTh>
          <WholesaleTh>单位毛利</WholesaleTh>
          <WholesaleTh>订单计入月份</WholesaleTh>
          <WholesaleTh>下单时间</WholesaleTh>
          <WholesaleTh>结汇时间</WholesaleTh>
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

          return (
            <tr className="group" key={order.id}>
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
                    disabled={pendingKey === `order:settle:${order.id}`}
                    onClick={() => void onMarkOrderSettled(order.id)}
                    type="button"
                  >
                    {pendingKey === `order:settle:${order.id}` ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-3.5" />
                    )}
                    标记已结汇
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
              <WholesaleTd>{formatNumber(order.settlement_exchange_rate)}</WholesaleTd>
              <WholesaleTd>{order.customer_payment_currency}</WholesaleTd>
              <WholesaleTd>
                {formatCurrency(
                  order.customer_payment_amount,
                  order.customer_payment_currency,
                )}
              </WholesaleTd>
              <WholesaleTd>{formatCurrency(order.customer_payment_rmb_amount)}</WholesaleTd>
              <WholesaleTd className="min-w-[140px] whitespace-normal">
                {order.payment_platform ?? "未记录"}
              </WholesaleTd>
              <WholesaleTd>{formatCurrency(order.gross_profit)}</WholesaleTd>
              <WholesaleTd>{formatPercent(order.gross_margin)}</WholesaleTd>
              <WholesaleTd>{formatCurrency(order.unit_gross_profit)}</WholesaleTd>
              <WholesaleTd>{formatDate(order.order_month)}</WholesaleTd>
              <WholesaleTd>{formatDateTime(order.ordered_at)}</WholesaleTd>
              <WholesaleTd>
                {order.settled_at ? formatDateTime(order.settled_at) : "未结汇"}
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
