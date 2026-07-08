"use client";

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
  onCreateRelease: (formData: FormData) => void | Promise<void>;
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
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [manualCustomerName, setManualCustomerName] = useState("");
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );

  return (
    <DashboardDialog
      description="发布今天或指定日期收到的客户结汇款，业务员认领后会匹配到一笔批发订单。"
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setSelectedCustomerId("");
          setManualCustomerName("");
        }

        onOpenChange(nextOpen);
      }}
      open
      title="发布结汇收款"
    >
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          void onCreateRelease(new FormData(event.currentTarget));
          onOpenChange(false);
        }}
      >
        <WholesaleSelect
          label="选择客户"
          name="customer_id"
          onChange={(event) => {
            setSelectedCustomerId(event.target.value);
            if (event.target.value) {
              setManualCustomerName("");
            }
          }}
          value={selectedCustomerId}
        >
          <option value="">先填写客户名</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.unique_name}
            </option>
          ))}
        </WholesaleSelect>

        <DashboardFilterField label="客户名称">
          <input
            className={dashboardFilterInputClassName}
            disabled={Boolean(selectedCustomer)}
            name="customer_name"
            onChange={(event) => setManualCustomerName(event.target.value)}
            placeholder="填写客户名称"
            required={!selectedCustomer}
            value={selectedCustomer?.unique_name ?? manualCustomerName}
          />
          <p className="mt-2 text-xs leading-5 text-[#7b8790]">
            选定现有客户后会自动带出名称；暂时找不到时可以先手填。
          </p>
        </DashboardFilterField>

        <DashboardFilterField label="结汇金额">
          <input
            className={dashboardFilterInputClassName}
            min={0.01}
            name="release_amount"
            placeholder="填写收到金额"
            required
            step="0.01"
            type="number"
          />
        </DashboardFilterField>

        <WholesaleSelect
          defaultValue={currencyOptions[0] ?? "USD"}
          label="币种"
          name="release_currency"
          required
        >
          {currencyOptions.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </WholesaleSelect>

        <DashboardFilterField label="收款日期">
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
            label="备注"
            name="note"
            placeholder="可填写付款截图编号、对账说明或其他备注"
          />
        </div>

        <div className="flex justify-end md:col-span-2">
          <WholesaleSubmitButton pending={pending}>发布收款</WholesaleSubmitButton>
        </div>
      </form>
    </DashboardDialog>
  );
}

type ClaimDialogProps = {
  customersById: Map<string, WholesaleCustomer>;
  onClaimRelease: (formData: FormData) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  orderSettlementsByOrderId: Map<string, WholesaleOrderSettlement[]>;
  orders: WholesaleOrder[];
  pending: boolean;
  release: WholesaleSettlementRelease;
};

export function WholesaleSettlementReleaseClaimDialog({
  customersById,
  onClaimRelease,
  onOpenChange,
  orderSettlementsByOrderId,
  orders,
  pending,
  release,
}: ClaimDialogProps) {
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
          getWholesaleOrderRemainingAmount(order, orderSettlementsByOrderId) + 0.005 >=
          Number(release.release_amount)
        );
      }),
    [orderSettlementsByOrderId, orders, release],
  );
  const [hasSelectableOrder, setHasSelectableOrder] = useState(
    baseCandidates.length > 0,
  );

  return (
    <DashboardDialog
      description="选择一笔批发订单后，这条收款会按收款日期登记为订单结汇记录。"
      onOpenChange={onOpenChange}
      open
      title="认领结汇收款"
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void onClaimRelease(new FormData(event.currentTarget));
          onOpenChange(false);
        }}
      >
        <input name="release_id" type="hidden" value={release.id} />
        <ReadOnlyField label="收款信息" value={formatSettlementReleaseSummary(release)} />
        <WholesaleSettlementReleaseOrderPicker
          baseCandidates={baseCandidates}
          customersById={customersById}
          onSelectableOrderChange={setHasSelectableOrder}
          orderSettlementsByOrderId={orderSettlementsByOrderId}
          release={release}
        />

        <div className="flex justify-end">
          <WholesaleSubmitButton pending={pending || !hasSelectableOrder}>
            确认匹配
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
