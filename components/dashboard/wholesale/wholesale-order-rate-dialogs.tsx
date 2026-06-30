"use client";

import { useMemo, useState } from "react";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import {
  DashboardFilterField,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import {
  deriveRmbAmountValue,
  formatEditableNumericValue,
} from "@/components/dashboard/admin-orders/admin-orders-utils";
import {
  findTodayCnyExchangeRate,
  type ExchangeRateRow,
} from "@/lib/exchange-rates";
import type { WholesaleOrder } from "@/lib/wholesale";

import { formatCurrency, formatNumber } from "./wholesale-display";
import { WholesaleSubmitButton } from "./wholesale-ui";

type WholesaleOrderSettlementDialogProps = {
  exchangeRates: ExchangeRateRow[];
  onOpenChange: (open: boolean) => void;
  onSettleOrder: (formData: FormData) => void | Promise<void>;
  order: WholesaleOrder;
  pending: boolean;
};

export function WholesaleOrderSettlementDialog({
  exchangeRates,
  onOpenChange,
  onSettleOrder,
  order,
  pending,
}: WholesaleOrderSettlementDialogProps) {
  const [manualRate, setManualRate] = useState("");
  const todayRate = useMemo(
    () => findTodayCnyExchangeRate(exchangeRates, order.customer_payment_currency),
    [exchangeRates, order.customer_payment_currency],
  );
  const automaticRateValue = formatEditableNumericValue(
    todayRate?.daily_exchange_rate,
  );
  const usesManualRate = !automaticRateValue;
  const activeRateValue = usesManualRate ? manualRate : automaticRateValue;
  const rmbPreview = deriveRmbAmountValue(
    order.customer_payment_amount,
    activeRateValue,
  );

  return (
    <DashboardDialog
      description={
        usesManualRate
          ? "今天还没有这个币种的汇率，请填写这笔订单实际使用的结汇汇率。"
          : "系统会使用今天的汇率完成结汇，并计算人民币金额、毛利和提成。"
      }
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setManualRate("");
        }

        onOpenChange(nextOpen);
      }}
      open
      title="确认结汇"
    >
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          void onSettleOrder(new FormData(event.currentTarget));
          setManualRate("");
          onOpenChange(false);
        }}
      >
        <input name="order_id" type="hidden" value={order.id} />
        <ReadOnlyRateField label="订单编号" value={order.order_number} />
        <ReadOnlyRateField
          label="客户支付"
          value={formatCurrency(
            order.customer_payment_amount,
            order.customer_payment_currency,
          )}
        />
        <ReadOnlyRateField
          label="客户支付币种"
          value={order.customer_payment_currency}
        />
        <DashboardFilterField label="结汇汇率">
          <input
            className={dashboardFilterInputClassName}
            min={0.000001}
            name={usesManualRate ? "manual_exchange_rate" : undefined}
            onChange={(event) => setManualRate(event.target.value)}
            readOnly={!usesManualRate}
            required={usesManualRate}
            step="0.000001"
            type="number"
            value={activeRateValue}
          />
          <p className="mt-2 text-xs leading-5 text-[#7b8790]">
            {usesManualRate ? "填写本次实际使用的汇率。" : "已匹配今天的汇率。"}
          </p>
        </DashboardFilterField>
        <ReadOnlyRateField
          label="结汇后人民币金额"
          value={rmbPreview ? formatCurrency(Number(rmbPreview)) : "填写汇率后显示"}
        />
        <div className="flex flex-wrap justify-end gap-3 md:col-span-2">
          <WholesaleSubmitButton pending={pending}>确认结汇</WholesaleSubmitButton>
        </div>
      </form>
    </DashboardDialog>
  );
}

type WholesaleOrderRateDialogProps = {
  onOpenChange: (open: boolean) => void;
  onUpdateRate: (formData: FormData) => void | Promise<void>;
  open: boolean;
  orders: WholesaleOrder[];
  pending: boolean;
};

export function WholesaleOrderRateDialog({
  onOpenChange,
  onUpdateRate,
  open,
  orders,
  pending,
}: WholesaleOrderRateDialogProps) {
  const [rateValue, setRateValue] = useState("");
  const firstOrder = orders[0] ?? null;
  const isBulk = orders.length > 1;
  const rmbPreview =
    firstOrder && orders.length === 1
      ? deriveRmbAmountValue(firstOrder.customer_payment_amount, rateValue)
      : "";

  return (
    <DashboardDialog
      description={
        isBulk
          ? `本次会把 ${orders.length} 笔订单改成同一个结汇汇率。`
          : "修改后，订单人民币金额、毛利和提成会按新的汇率重新计算。"
      }
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setRateValue("");
        }

        onOpenChange(nextOpen);
      }}
      open={open}
      title={isBulk ? "批量修改结汇汇率" : "修改结汇汇率"}
    >
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          void onUpdateRate(new FormData(event.currentTarget));
          setRateValue("");
          onOpenChange(false);
        }}
      >
        {orders.map((order) => (
          <input key={order.id} name="order_id" type="hidden" value={order.id} />
        ))}
        <ReadOnlyRateField label="订单" value={getOrderSummary(orders)} />
        <ReadOnlyRateField label="支付币种" value={getCurrencySummary(orders)} />
        <DashboardFilterField label="新的结汇汇率">
          <input
            className={dashboardFilterInputClassName}
            min={0.000001}
            name="settlement_exchange_rate"
            onChange={(event) => setRateValue(event.target.value)}
            required
            step="0.000001"
            type="number"
            value={rateValue}
          />
          <p className="mt-2 text-xs leading-5 text-[#7b8790]">
            填写确认后的正确汇率。
          </p>
        </DashboardFilterField>
        <ReadOnlyRateField
          label={isBulk ? "已选订单" : "修改后人民币金额"}
          value={
            isBulk
              ? `${formatNumber(orders.length)} 笔`
              : rmbPreview
                ? formatCurrency(Number(rmbPreview))
                : "填写汇率后显示"
          }
        />
        <div className="flex flex-wrap justify-end gap-3 md:col-span-2">
          <WholesaleSubmitButton pending={pending}>保存汇率</WholesaleSubmitButton>
        </div>
      </form>
    </DashboardDialog>
  );
}

function ReadOnlyRateField({ label, value }: { label: string; value: string }) {
  return (
    <DashboardFilterField label={label}>
      <div className="min-h-11 rounded-[16px] border border-[#d9e2e8] bg-white px-4 py-3 text-sm leading-5 text-[#2b3942] [overflow-wrap:anywhere]">
        {value}
      </div>
    </DashboardFilterField>
  );
}

function getOrderSummary(orders: WholesaleOrder[]) {
  if (orders.length === 0) {
    return "未选择订单";
  }

  if (orders.length === 1) {
    return orders[0].order_number;
  }

  const preview = orders
    .slice(0, 3)
    .map((order) => order.order_number)
    .join("、");

  return orders.length > 3 ? `${preview} 等 ${orders.length} 笔` : preview;
}

function getCurrencySummary(orders: WholesaleOrder[]) {
  const currencies = Array.from(
    new Set(orders.map((order) => order.customer_payment_currency)),
  );

  return currencies.length > 0 ? currencies.join("、") : "未记录";
}
