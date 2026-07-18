"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DashboardFilterField } from "@/components/dashboard/dashboard-section-panel";
import { Select } from "@/components/ui/select";
import type { WholesaleCustomer, WholesaleOrder } from "@/lib/wholesale";
import type { WholesaleSettlementRelease } from "@/lib/wholesale-settlement-releases";
import {
  formatWholesaleOrderLinkOption,
  getWholesaleOrderLinkOptionsForCustomer,
} from "./wholesale-order-link-options";
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
      <DashboardFilterField label={uiText("customerLabel")}>
        <Select
          aria-label={uiText("customerLabel")}
          disabled={Boolean(fixedCustomerId)}
          name="customer_id"
          onValueChange={(value) => {
            setSelectedCustomerId(value);
            // 改选客户后必须重新确认订单，不能保留上一位客户的选择。
            setSelectedOrderId("");
          }}
          options={[
            { label: uiText("selectCustomer"), value: "" },
            ...availableCustomers.map((customer) => ({
              label: customer.unique_name,
              value: customer.id,
            })),
          ]}
          required
          value={selectedCustomerId}
        />
      </DashboardFilterField>

      <DashboardFilterField label={uiText("orderLabel")}>
        <Select
          aria-label={uiText("orderLabel")}
          disabled={!selectedCustomerId || matchingOrders.length === 0}
          name="order_id"
          onValueChange={setSelectedOrderId}
          options={[
            {
              label: selectedCustomerId
                ? uiText("selectOrder")
                : uiText("selectCustomerFirst"),
              value: "",
            },
            ...matchingOrders.map((order) => ({
              label: formatWholesaleOrderLinkOption(order),
              value: order.id,
            })),
          ]}
          required
          value={selectedOrderId}
        />
      </DashboardFilterField>

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
    <div className="rounded-[16px] border border-border-subtle bg-surface-inset px-4 py-3 text-sm leading-6 text-content-muted">
      {children}
    </div>
  );
}
