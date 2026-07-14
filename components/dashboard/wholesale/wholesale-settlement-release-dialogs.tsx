"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
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
import { getBeijingDateString } from "@/lib/exchange-rates";
import {
  formatSettlementReleaseSummary,
  getWholesaleOrderRemainingAmount,
} from "./wholesale-settlement-release-display";
import { WholesaleSettlementReleaseOrderPicker } from "./wholesale-settlement-release-order-picker";
import {
  WholesaleSelect,
  WholesaleSubmitButton,
  WholesaleTextarea,
} from "./wholesale-ui";
type CreateDialogProps = {
  currencyOptions: string[];
  customers: WholesaleCustomer[];
  onCreateRelease: (formData: FormData) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
};
export function WholesaleSettlementReleaseCreateDialog({
  currencyOptions,
  customers,
  onCreateRelease,
  onOpenChange,
  pending,
}: CreateDialogProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_settlement_release_dialogs",
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [manualCustomerName, setManualCustomerName] = useState("");
  const selectedCustomer = useMemo(
    () =>
      customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );
  return (
    <DashboardDialog
      description={uiText("attribute001")}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setSelectedCustomerId("");
          setManualCustomerName("");
        }
        onOpenChange(nextOpen);
      }}
      open
      title={uiText("attribute002")}
    >
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const succeeded = await onCreateRelease(
            new FormData(event.currentTarget),
          );
          // 发布失败时保留客户、金额、币种和备注，用户无需重新填写。
          if (!succeeded) return;
          onOpenChange(false);
        }}
      >
        <WholesaleSelect
          label={uiText("attribute003")}
          name="customer_id"
          onChange={(event) => {
            setSelectedCustomerId(event.target.value);
            if (event.target.value) {
              setManualCustomerName("");
            }
          }}
          value={selectedCustomerId}
        >
          <option value="">
            <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_dialogs.text001" />
          </option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.unique_name}
            </option>
          ))}
        </WholesaleSelect>

        <DashboardFilterField label={uiText("attribute004")}>
          <input
            className={dashboardFilterInputClassName}
            disabled={Boolean(selectedCustomer)}
            name="customer_name"
            onChange={(event) => setManualCustomerName(event.target.value)}
            placeholder={uiText("attribute005")}
            required={!selectedCustomer}
            value={selectedCustomer?.unique_name ?? manualCustomerName}
          />
          <p className="mt-2 text-xs leading-5 text-[#7b8790]">
            <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_dialogs.text002" />
          </p>
        </DashboardFilterField>

        <DashboardFilterField label={uiText("attribute006")}>
          <input
            className={dashboardFilterInputClassName}
            min={0.01}
            name="release_amount"
            placeholder={uiText("attribute007")}
            required
            step="0.01"
            type="number"
          />
        </DashboardFilterField>

        <WholesaleSelect
          defaultValue={currencyOptions[0] ?? "USD"}
          label={uiText("attribute008")}
          name="release_currency"
          required
        >
          {currencyOptions.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </WholesaleSelect>

        <DashboardFilterField label={uiText("attribute009")}>
          <input
            className={dashboardFilterInputClassName}
            defaultValue={getBeijingDateString()}
            name="received_on"
            required
            type="date"
          />
        </DashboardFilterField>

        <div className="md:col-span-2">
          <WholesaleTextarea
            label={uiText("attribute010")}
            name="note"
            placeholder={uiText("attribute011")}
          />
        </div>

        <div className="flex justify-end md:col-span-2">
          <WholesaleSubmitButton pending={pending}>
            <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_dialogs.text003" />
          </WholesaleSubmitButton>
        </div>
      </form>
    </DashboardDialog>
  );
}
type ClaimDialogProps = {
  customers: WholesaleCustomer[];
  onClaimRelease: (formData: FormData) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  orderSettlementsByOrderId: Map<string, WholesaleOrderSettlement[]>;
  orders: WholesaleOrder[];
  pending: boolean;
  release: WholesaleSettlementRelease;
};
export function WholesaleSettlementReleaseClaimDialog({
  customers,
  onClaimRelease,
  onOpenChange,
  orderSettlementsByOrderId,
  orders,
  pending,
  release,
}: ClaimDialogProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_settlement_release_dialogs",
  );
  const baseCandidates = useMemo(
    () =>
      orders.filter((order) => {
        // 认领只能选择一笔还能继续结汇、币种一致、并且当前账号可见的批发订单。
        if (order.status === "settled") return false;
        if (order.customer_payment_currency !== release.release_currency) {
          return false;
        }
        if (release.customer_id && order.customer_id !== release.customer_id) {
          return false;
        }
        return (
          getWholesaleOrderRemainingAmount(order, orderSettlementsByOrderId) +
            0.005 >=
          Number(release.release_amount)
        );
      }),
    [orderSettlementsByOrderId, orders, release],
  );
  const [hasSelectableOrder, setHasSelectableOrder] = useState(false);
  return (
    <DashboardDialog
      description={uiText("attribute012")}
      onOpenChange={onOpenChange}
      open
      title={uiText("attribute013")}
    >
      <form
        className="grid gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const succeeded = await onClaimRelease(
            new FormData(event.currentTarget),
          );
          // 匹配失败时继续显示当前候选订单，便于用户调整选择。
          if (!succeeded) return;
          onOpenChange(false);
        }}
      >
        <input name="release_id" type="hidden" value={release.id} />
        <ReadOnlyField
          label={uiText("attribute014")}
          value={formatSettlementReleaseSummary(release)}
        />
        <WholesaleSettlementReleaseOrderPicker
          baseCandidates={baseCandidates}
          customers={customers}
          onSelectableOrderChange={setHasSelectableOrder}
          release={release}
        />

        <div className="flex justify-end">
          <WholesaleSubmitButton
            disabled={!hasSelectableOrder}
            pending={pending}
          >
            <UiMessage id="components_dashboard_wholesale_wholesale_settlement_release_dialogs.text004" />
          </WholesaleSubmitButton>
        </div>
      </form>
    </DashboardDialog>
  );
}
function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <DashboardFilterField label={label}>
      <div className="min-h-11 rounded-[16px] border border-[#d9e2e8] bg-white px-4 py-3 text-sm leading-6 text-[#2b3942] [overflow-wrap:anywhere]">
        {value}
      </div>
    </DashboardFilterField>
  );
}
