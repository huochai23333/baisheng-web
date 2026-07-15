"use client";

import { useMemo, useState } from "react";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";

import type { WholesaleCustomer, WholesaleOrder } from "@/lib/wholesale";

import {
  formatWholesaleOrderLinkOption,
  getWholesaleOrderLinkOptionsForCustomer,
} from "./wholesale-order-link-options";
import { WholesaleSelect } from "./wholesale-ui";

/**
 * 单条认领和批量认领共用同一份客户、订单联动状态。
 * 客户改变后立即清空订单，防止旧客户的订单编号被错误提交给新客户。
 */
export function useWholesaleClaimTarget({
  initialCustomerId = "",
  initialOrderId = "",
  orders,
}: {
  initialCustomerId?: string;
  initialOrderId?: string;
  orders: WholesaleOrder[];
}) {
  const [selectedCustomerId, setSelectedCustomerId] =
    useState(initialCustomerId);
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId);
  const matchingOrders = useMemo(
    () => getWholesaleOrderLinkOptionsForCustomer(orders, selectedCustomerId),
    [orders, selectedCustomerId],
  );

  return {
    canSubmit: Boolean(selectedCustomerId && selectedOrderId),
    matchingOrders,
    selectedCustomerId,
    selectedOrderId,
    setSelectedCustomerId: (customerId: string) => {
      setSelectedCustomerId(customerId);
      setSelectedOrderId("");
    },
    setSelectedOrderId,
  };
}

export function WholesaleClaimTargetFields({
  customers,
  matchingOrders,
  onCustomerChange,
  onOrderChange,
  selectedCustomerId,
  selectedOrderId,
}: {
  customers: WholesaleCustomer[];
  matchingOrders: WholesaleOrder[];
  onCustomerChange: (customerId: string) => void;
  onOrderChange: (orderId: string) => void;
  selectedCustomerId: string;
  selectedOrderId: string;
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_claims_dialogs",
  );

  return (
    <>
      <WholesaleSelect
        label={uiText("attribute005")}
        name="customer_id"
        onChange={(event) => onCustomerChange(event.target.value)}
        required
        value={selectedCustomerId}
      >
        <option value="">
          <UiMessage id="components_dashboard_wholesale_wholesale_claims_dialogs.text009" />
        </option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.unique_name}
          </option>
        ))}
      </WholesaleSelect>
      <WholesaleSelect
        disabled={!selectedCustomerId || matchingOrders.length === 0}
        label={uiText("attribute006")}
        name="wholesale_order_id"
        onChange={(event) => onOrderChange(event.target.value)}
        required
        value={selectedOrderId}
      >
        <option value="">
          {selectedCustomerId
            ? uiText("selectOrder")
            : uiText("selectCustomerFirst")}
        </option>
        {matchingOrders.map((order) => (
          <option key={order.id} value={order.id}>
            {formatWholesaleOrderLinkOption(order)}
          </option>
        ))}
      </WholesaleSelect>
      {selectedCustomerId && matchingOrders.length === 0 ? (
        <p className="text-sm leading-6 text-[#9a6a07]">
          <UiMessage id="components_dashboard_wholesale_wholesale_claims_dialogs.text010" />
        </p>
      ) : null}
    </>
  );
}
