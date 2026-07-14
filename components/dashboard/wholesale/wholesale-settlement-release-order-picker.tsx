"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  WholesaleCustomer,
  WholesaleOrder,
} from "@/lib/wholesale";
import type { WholesaleSettlementRelease } from "@/lib/wholesale-settlement-releases";
import {
  formatWholesaleOrderLinkOption,
  getWholesaleOrderLinkOptionsForCustomer,
} from "./wholesale-order-link-options";
import { WholesaleSelect } from "./wholesale-ui";
type WholesaleSettlementReleaseOrderPickerProps = {
  baseCandidates: WholesaleOrder[];
  customers: WholesaleCustomer[];
  onSelectableOrderChange: (hasSelectableOrder: boolean) => void;
  release: WholesaleSettlementRelease;
};
export function WholesaleSettlementReleaseOrderPicker({
  baseCandidates,
  customers,
  onSelectableOrderChange,
  release,
}: WholesaleSettlementReleaseOrderPickerProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_settlement_release_order_picker",
  );
  const fixedCustomerId = release.customer_id ?? "";
  const [selectedCustomerId, setSelectedCustomerId] = useState(fixedCustomerId);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const eligibleCustomerIds = useMemo(
    () => new Set(baseCandidates.map((order) => order.customer_id)),
    [baseCandidates],
  );
  const availableCustomers = useMemo(
    () =>
      customers.filter((customer) =>
        fixedCustomerId
          ? customer.id === fixedCustomerId
          : eligibleCustomerIds.has(customer.id),
      ),
    [customers, eligibleCustomerIds, fixedCustomerId],
  );
  const matchingOrders = useMemo(
    () =>
      getWholesaleOrderLinkOptionsForCustomer(
        baseCandidates,
        selectedCustomerId,
      ),
    [baseCandidates, selectedCustomerId],
  );
  useEffect(() => {
    if (!matchingOrders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId("");
    }
  }, [matchingOrders, selectedOrderId]);
  const hasSelectedOrder = Boolean(
    selectedOrderId &&
      matchingOrders.some((order) => order.id === selectedOrderId),
  );
  useEffect(() => {
    onSelectableOrderChange(hasSelectedOrder);
  }, [hasSelectedOrder, onSelectableOrderChange]);

  return (
    <div className="grid gap-4">
      <WholesaleSelect
        disabled={Boolean(fixedCustomerId)}
        label={uiText("customerLabel")}
        name="customer_id"
        onChange={(event) => {
          setSelectedCustomerId(event.target.value);
          // 改选客户后必须重新确认订单，不能保留上一位客户的选择。
          setSelectedOrderId("");
        }}
        required
        value={selectedCustomerId}
      >
        <option value="">{uiText("selectCustomer")}</option>
        {availableCustomers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.unique_name}
          </option>
        ))}
      </WholesaleSelect>

      <WholesaleSelect
        disabled={!selectedCustomerId || matchingOrders.length === 0}
        label={uiText("orderLabel")}
        name="order_id"
        onChange={(event) => setSelectedOrderId(event.target.value)}
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

      {baseCandidates.length === 0 ? (
        <OrderPickerNotice>
          <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_order_picker.text002" />
        </OrderPickerNotice>
      ) : selectedCustomerId && matchingOrders.length === 0 ? (
        <OrderPickerNotice>
          <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_order_picker.text001" />
        </OrderPickerNotice>
      ) : null}
    </div>
  );
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
