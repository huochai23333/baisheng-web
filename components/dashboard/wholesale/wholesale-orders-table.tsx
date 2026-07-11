"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { CheckCircle2, LoaderCircle, PencilLine, Send } from "lucide-react";
import { useTranslations } from "next-intl";
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
} from "./wholesale-display";
import {
  LinkedLogisticsOrders,
  LinkedPurchaseOrders,
} from "./wholesale-order-linked-records";
import {
  WholesaleTable,
  WholesaleTd,
  WholesaleTh,
  wholesaleStickyFirstTdClassName,
  wholesaleStickyFirstThClassName,
} from "./wholesale-ui";
export type WholesaleOrderEditAction = {
  label: string;
  tone: "direct" | "request";
};
type WholesaleOrdersTableProps = {
  canMarkOrderSettled: (order: WholesaleOrder) => boolean;
  customersById: Map<string, WholesaleCustomer>;
  getOrderEditAction: (
    order: WholesaleOrder,
  ) => WholesaleOrderEditAction | null;
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
  const t = useTranslations("WholesaleBusiness.ordersUi");
  return (
    <WholesaleTable minWidth={3660}>
      <thead>
        <tr>
          <WholesaleTh className={wholesaleStickyFirstThClassName}>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text001" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text002" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text003" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text004" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text005" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text006" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text007" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text008" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text009" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text010" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text011" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text012" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text013" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text014" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text015" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text016" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text017" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text018" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text019" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text020" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text021" />
          </WholesaleTh>
          <WholesaleTh>
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text022" />
          </WholesaleTh>
          <WholesaleTh className="min-w-[300px] whitespace-normal">
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text023" />
          </WholesaleTh>
          <WholesaleTh className="min-w-[320px] whitespace-normal">
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text024" />
          </WholesaleTh>
          <WholesaleTh className="min-w-[320px] whitespace-normal">
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text025" />
          </WholesaleTh>
          <WholesaleTh className="min-w-[240px] whitespace-normal">
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text026" />
          </WholesaleTh>
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
              <WholesaleTd
                className={`${wholesaleStickyFirstTdClassName} min-w-[230px] px-4 py-3`}
              >
                <div className="space-y-2">
                  <div className="font-semibold [overflow-wrap:anywhere]">
                    {order.order_number}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editAction ? (
                      <Button
                        className={
                          editAction.tone === "direct"
                            ? "h-8 rounded-full border border-[#d8e2e8] bg-white px-2.5 text-xs text-[#486782] hover:bg-[#eef3f6]"
                            : "h-8 rounded-full border border-[#f0dfaf] bg-[#fff8e6] px-2.5 text-xs text-[#75520c] hover:bg-[#fbf0cf]"
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
                        className="h-8 rounded-full bg-[#486782] px-2.5 text-xs text-white hover:bg-[#3e5f79]"
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
                        <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text027" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </WholesaleTd>
              <WholesaleTd className="min-w-[160px] whitespace-normal">
                {getCustomerName(customersById, order.customer_id)}
              </WholesaleTd>
              <WholesaleTd className="min-w-[150px] whitespace-normal">
                {getProfileName(profilesById, order.sales_user_id)}
              </WholesaleTd>
              <WholesaleTd>{formatNumber(order.small_order_count)}</WholesaleTd>
              <WholesaleTd>
                {formatCurrency(order.product_purchase_amount)}
              </WholesaleTd>
              <WholesaleTd>{formatCurrency(order.packing_fee)}</WholesaleTd>
              <WholesaleTd>
                {formatCurrency(order.international_shipping_fee)}
              </WholesaleTd>
              <WholesaleTd>{formatCurrency(order.other_fee)}</WholesaleTd>
              <WholesaleTd>
                {formatCurrency(order.referral_commission_fee)}
              </WholesaleTd>
              <WholesaleTd className="min-w-[140px] whitespace-normal">
                {order.courier_company ?? t("fallbacks.notRecorded")}
              </WholesaleTd>
              <WholesaleTd className="min-w-[160px] whitespace-normal">
                <div>
                  <p>
                    <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text028" />
                    {formatCurrency(
                      settledAmount,
                      order.customer_payment_currency,
                    )}
                  </p>
                  <p className="mt-1 text-xs text-[#7b8790]">
                    <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text029" />
                    {formatCurrency(
                      remainingAmount,
                      order.customer_payment_currency,
                    )}
                  </p>
                </div>
              </WholesaleTd>
              <WholesaleTd>
                {order.settlement_exchange_rate === null ||
                order.settlement_exchange_rate === undefined
                  ? t("fallbacks.unsettled")
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
                {formatOptionalCurrency(
                  order.customer_payment_rmb_amount,
                  t("fallbacks.afterSettlement"),
                )}
              </WholesaleTd>
              <WholesaleTd className="min-w-[140px] whitespace-normal">
                {order.payment_platform ?? t("fallbacks.notRecorded")}
              </WholesaleTd>
              <WholesaleTd>
                {formatOptionalCurrency(
                  order.gross_profit,
                  t("fallbacks.afterSettlement"),
                )}
              </WholesaleTd>
              <WholesaleTd>
                {formatPercent(order.gross_margin, t("fallbacks.notGenerated"))}
              </WholesaleTd>
              <WholesaleTd>
                {formatOptionalCurrency(
                  order.unit_gross_profit,
                  t("fallbacks.afterSettlement"),
                )}
              </WholesaleTd>
              <WholesaleTd>{formatDate(order.order_month)}</WholesaleTd>
              <WholesaleTd>{formatDateTime(order.ordered_at)}</WholesaleTd>
              <WholesaleTd>
                {order.settled_at
                  ? formatDateTime(order.settled_at)
                  : t("fallbacks.unsettled")}
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
                  logisticsStatuses={
                    logisticsStatusesByOrderId.get(order.id) ?? []
                  }
                />
              </WholesaleTd>
              <WholesaleTd className="min-w-[240px] whitespace-normal">
                {order.notes ?? t("fallbacks.notRecorded")}
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
    return (
      <span className="text-[#7b8790]">
        <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text030" />
      </span>
    );
  }
  return (
    <div className="grid max-h-24 gap-2 overflow-y-auto pr-1">
      {settlements.map((settlement) => (
        <div
          className="rounded-[10px] bg-[#f7fafb] p-2 text-xs leading-5 text-[#4f606b]"
          key={settlement.id}
        >
          <p className="font-semibold text-[#2f3f4a]">
            {formatDate(settlement.settled_on)}
          </p>
          <p>
            {formatCurrency(settlement.settlement_amount, currency)}
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_table.text031" />{" "}
            {formatRate(settlement.settlement_exchange_rate)}
          </p>
          <p>{formatCurrency(settlement.settlement_rmb_amount)}</p>
        </div>
      ))}
    </div>
  );
}
