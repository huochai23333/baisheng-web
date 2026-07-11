"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DashboardFilterField,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import type {
  WholesaleCustomer,
  WholesaleOrder,
  WholesaleOrderSettlement,
} from "@/lib/wholesale";
import type { WholesaleSettlementRelease } from "@/lib/wholesale-settlement-releases";
import { normalizeSearchText } from "@/lib/value-normalizers";
import {
  formatCurrency,
  formatDate,
  getCustomerName,
} from "./wholesale-display";
import { getWholesaleOrderRemainingAmount } from "./wholesale-settlement-release-display";
import { WholesaleSelect } from "./wholesale-ui";
type WholesaleSettlementReleaseOrderPickerProps = {
  baseCandidates: WholesaleOrder[];
  customersById: Map<string, WholesaleCustomer>;
  onSelectableOrderChange: (hasSelectableOrder: boolean) => void;
  orderSettlementsByOrderId: Map<string, WholesaleOrderSettlement[]>;
  release: WholesaleSettlementRelease;
};
export function WholesaleSettlementReleaseOrderPicker({
  baseCandidates,
  customersById,
  onSelectableOrderChange,
  orderSettlementsByOrderId,
  release,
}: WholesaleSettlementReleaseOrderPickerProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_settlement_release_order_picker",
  );
  const [searchText, setSearchText] = useState("");
  const [orderedFrom, setOrderedFrom] = useState("");
  const [orderedTo, setOrderedTo] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(
    baseCandidates[0]?.id ?? "",
  );
  const isManualCustomerRelease = !release.customer_id;
  const filteredCandidates = useMemo(() => {
    if (!isManualCustomerRelease) return baseCandidates;
    const searchValue = normalizeSearchText(searchText);
    return baseCandidates.filter((order) => {
      const orderedDate = getOrderDateInputValue(order);
      if (orderedFrom && orderedDate < orderedFrom) return false;
      if (orderedTo && orderedDate > orderedTo) return false;
      if (!searchValue) return true;
      return normalizeSearchText(
        getOrderSearchText({
          customersById,
          order,
          orderSettlementsByOrderId,
        }),
      ).includes(searchValue);
    });
  }, [
    baseCandidates,
    customersById,
    isManualCustomerRelease,
    orderSettlementsByOrderId,
    orderedFrom,
    orderedTo,
    searchText,
  ]);
  useEffect(() => {
    if (filteredCandidates.length === 0) {
      setSelectedOrderId("");
      return;
    }
    if (!filteredCandidates.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(filteredCandidates[0].id);
    }
  }, [filteredCandidates, selectedOrderId]);
  useEffect(() => {
    onSelectableOrderChange(filteredCandidates.length > 0);
  }, [filteredCandidates.length, onSelectableOrderChange]);
  if (baseCandidates.length === 0) {
    return (
      <OrderPickerNotice>
        {isManualCustomerRelease
          ? "当前没有金额和币种都匹配的可结汇订单。"
          : "当前没有金额、币种和客户都匹配的可结汇订单。"}
      </OrderPickerNotice>
    );
  }
  return (
    <div className="grid gap-4">
      {isManualCustomerRelease ? (
        <div className="grid gap-3 rounded-[16px] border border-[#d9e2e8] bg-[#f8fafb] p-3 md:grid-cols-[minmax(0,1fr)_160px_160px]">
          <DashboardFilterField label={uiText("attribute001")}>
            <input
              aria-label={uiText("attribute002")}
              className={dashboardFilterInputClassName}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={uiText("attribute003")}
              value={searchText}
            />
          </DashboardFilterField>
          <DashboardFilterField label={uiText("attribute004")}>
            <input
              aria-label={uiText("attribute005")}
              className={dashboardFilterInputClassName}
              onChange={(event) => setOrderedFrom(event.target.value)}
              type="date"
              value={orderedFrom}
            />
          </DashboardFilterField>
          <DashboardFilterField label={uiText("attribute006")}>
            <input
              aria-label={uiText("attribute007")}
              className={dashboardFilterInputClassName}
              onChange={(event) => setOrderedTo(event.target.value)}
              type="date"
              value={orderedTo}
            />
          </DashboardFilterField>
        </div>
      ) : null}

      {filteredCandidates.length > 0 ? (
        <WholesaleSelect
          label={uiText("attribute008")}
          name="order_id"
          onChange={(event) => setSelectedOrderId(event.target.value)}
          required
          value={selectedOrderId}
        >
          {filteredCandidates.map((order) => {
            const remainingAmount = getWholesaleOrderRemainingAmount(
              order,
              orderSettlementsByOrderId,
            );
            return (
              <option key={order.id} value={order.id}>
                {order.order_number} /{" "}
                {getCustomerName(customersById, order.customer_id)}
                {uiText("orderedLabel")}
                {formatDate(order.ordered_at)}
                {uiText("paymentLabel")}
                {formatCurrency(
                  order.customer_payment_amount,
                  order.customer_payment_currency,
                )}
                {uiText("remainingLabel")}
                {formatCurrency(
                  remainingAmount,
                  order.customer_payment_currency,
                )}
              </option>
            );
          })}
        </WholesaleSelect>
      ) : (
        <OrderPickerNotice>
          <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_order_picker.text001" />
        </OrderPickerNotice>
      )}
    </div>
  );
}
function getOrderSearchText({
  customersById,
  order,
  orderSettlementsByOrderId,
}: {
  customersById: Map<string, WholesaleCustomer>;
  order: WholesaleOrder;
  orderSettlementsByOrderId: Map<string, WholesaleOrderSettlement[]>;
}) {
  const remainingAmount = getWholesaleOrderRemainingAmount(
    order,
    orderSettlementsByOrderId,
  );
  // 手填客户名没有客户 ID 可锁定，所以把用户最常用的查找信息合并成一个搜索文本。
  return [
    order.order_number,
    getCustomerName(customersById, order.customer_id),
    order.customer_payment_currency,
    String(order.customer_payment_amount),
    formatCurrency(
      order.customer_payment_amount,
      order.customer_payment_currency,
    ),
    String(remainingAmount),
    formatCurrency(remainingAmount, order.customer_payment_currency),
    getOrderDateInputValue(order),
    formatDate(order.ordered_at),
  ].join(" ");
}
function getOrderDateInputValue(order: WholesaleOrder) {
  return order.ordered_at.slice(0, 10);
}
function OrderPickerNotice({
  children,
}: {
  // 空状态文字由双语消息组件提供，因此允许传入 ReactNode。
  children: ReactNode;
}) {
  return (
    <div className="rounded-[16px] border border-[#eadbbf] bg-[#fff8ec] px-4 py-3 text-sm leading-6 text-[#856225]">
      {children}
    </div>
  );
}
