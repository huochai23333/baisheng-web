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
  findCnyExchangeRateByDate,
  getBeijingDateString,
  type ExchangeRateRow,
} from "@/lib/exchange-rates";
import type { WholesaleOrder, WholesaleOrderSettlement } from "@/lib/wholesale";

import { formatCurrency, formatDate, formatRate } from "./wholesale-display";
import { WholesaleSubmitButton } from "./wholesale-ui";

type WholesaleOrderSettlementDialogProps = {
  exchangeRates: ExchangeRateRow[];
  onOpenChange: (open: boolean) => void;
  onSettleOrder: (formData: FormData) => void | Promise<void>;
  order: WholesaleOrder;
  pending: boolean;
  settlements: WholesaleOrderSettlement[];
};

export function WholesaleOrderSettlementDialog({
  exchangeRates,
  onOpenChange,
  onSettleOrder,
  order,
  pending,
  settlements,
}: WholesaleOrderSettlementDialogProps) {
  const [settlementAmount, setSettlementAmount] = useState("");
  const [settlementDate, setSettlementDate] = useState(getBeijingDateString());
  const settledAmount = useMemo(
    () =>
      settlements.reduce(
        (sum, settlement) => sum + Number(settlement.settlement_amount),
        0,
      ),
    [settlements],
  );
  const remainingAmount = Math.max(
    Number(order.customer_payment_amount) - settledAmount,
    0,
  );
  const selectedRate = useMemo(
    () =>
      findCnyExchangeRateByDate(
        exchangeRates,
        order.customer_payment_currency,
        settlementDate,
      ),
    [exchangeRates, order.customer_payment_currency, settlementDate],
  );
  const activeRateValue = formatEditableNumericValue(
    selectedRate?.daily_exchange_rate,
  );
  const rmbPreview = deriveRmbAmountValue(
    Number(settlementAmount || 0),
    activeRateValue,
  );

  return (
    <DashboardDialog
      description={
        "登记每一次实际结汇的金额和日期。系统会使用所选日期的汇率，累计结汇金额达到订单金额后自动变为已结汇。"
      }
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setSettlementAmount("");
          setSettlementDate(getBeijingDateString());
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
          setSettlementAmount("");
          setSettlementDate(getBeijingDateString());
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
          label="剩余可结汇"
          value={formatCurrency(remainingAmount, order.customer_payment_currency)}
        />
        <DashboardFilterField label="本次结汇金额">
          <input
            className={dashboardFilterInputClassName}
            max={remainingAmount}
            min={0.01}
            name="settlement_amount"
            onChange={(event) => setSettlementAmount(event.target.value)}
            placeholder="填写本次结汇金额"
            required
            step="0.01"
            type="number"
            value={settlementAmount}
          />
          <p className="mt-2 text-xs leading-5 text-[#7b8790]">
            金额使用订单客户支付币种，不能超过剩余可结汇金额。
          </p>
        </DashboardFilterField>
        <DashboardFilterField label="结汇日期">
          <input
            className={dashboardFilterInputClassName}
            name="settlement_date"
            onChange={(event) => setSettlementDate(event.target.value)}
            required
            type="date"
            value={settlementDate}
          />
          <p className="mt-2 text-xs leading-5 text-[#7b8790]">
            保存时会使用这个日期的汇率。
          </p>
        </DashboardFilterField>
        <ReadOnlyRateField
          label="匹配汇率"
          value={activeRateValue || "这个日期暂无汇率"}
        />
        <ReadOnlyRateField
          label="本次人民币金额"
          value={
            rmbPreview
              ? formatCurrency(Number(rmbPreview))
              : "填写金额且匹配到汇率后显示"
          }
        />
        <div className="md:col-span-2">
          <SettlementRecordList
            currency={order.customer_payment_currency}
            settlements={settlements}
          />
        </div>
        <div className="flex flex-wrap justify-end gap-3 md:col-span-2">
          <WholesaleSubmitButton pending={pending}>保存结汇记录</WholesaleSubmitButton>
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

function SettlementRecordList({
  currency,
  settlements,
}: {
  currency: string;
  settlements: WholesaleOrderSettlement[];
}) {
  if (settlements.length === 0) {
    return (
      <div className="rounded-[16px] border border-[#d9e2e8] bg-white px-4 py-3 text-sm leading-6 text-[#6d7881]">
        暂无结汇记录。
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-[#d9e2e8] bg-white p-3">
      <p className="mb-2 text-xs font-semibold text-[#6d7881]">已登记记录</p>
      <div className="grid gap-2">
        {settlements.map((settlement) => (
          <div
            className="grid gap-1 rounded-[12px] bg-[#f7fafb] p-3 text-xs leading-5 text-[#4f606b] sm:grid-cols-4"
            key={settlement.id}
          >
            <span>{formatDate(settlement.settled_on)}</span>
            <span>
              {formatCurrency(settlement.settlement_amount, currency)}
            </span>
            <span>汇率 {formatRate(settlement.settlement_exchange_rate)}</span>
            <span>{formatCurrency(settlement.settlement_rmb_amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
