"use client";

import { useMemo, useState } from "react";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import {
  DashboardFilterField,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import {
  buildOrderCurrencyOptions,
  deriveRmbAmountValue,
  formatEditableNumericValue,
} from "@/components/dashboard/admin-orders/admin-orders-utils";
import {
  findLatestCnyExchangeRate,
  type ExchangeRateRow,
} from "@/lib/exchange-rates";
import type {
  WholesaleCustomer,
  WholesaleOrder,
  WholesaleProfile,
} from "@/lib/wholesale";

import { formatCurrency } from "./wholesale-display";
import {
  dedupeWholesaleCurrencyOptions,
  WHOLESALE_PAYMENT_PLATFORM_OPTIONS,
} from "./wholesale-order-form-options";
import type { WholesaleOrderEditMode } from "./wholesale-order-edit-rules";
import {
  WholesaleField,
  WholesaleSelect,
  WholesaleSubmitButton,
} from "./wholesale-ui";

type WholesaleOrderEditDialogProps = {
  canManageAllOrders: boolean;
  editWindowDays: number;
  customers: WholesaleCustomer[];
  exchangeRates: ExchangeRateRow[];
  mode: WholesaleOrderEditMode;
  onOpenChange: (open: boolean) => void;
  onRequestOrderEdit: (formData: FormData) => void | Promise<void>;
  onUpdateOrder: (formData: FormData) => void | Promise<void>;
  open: boolean;
  order: WholesaleOrder | null;
  pending: boolean;
  salesAccounts: WholesaleProfile[];
};

export function WholesaleOrderEditDialog({
  canManageAllOrders,
  editWindowDays,
  customers,
  exchangeRates,
  mode,
  onOpenChange,
  onRequestOrderEdit,
  onUpdateOrder,
  open,
  order,
  pending,
  salesAccounts,
}: WholesaleOrderEditDialogProps) {
  const currencyOptions = useWholesaleCurrencyOptions(exchangeRates, order);
  const defaultCurrency =
    order?.customer_payment_currency ??
    currencyOptions.find((option) => option.currency === "USD")?.currency ??
    currencyOptions[0]?.currency ??
    "CNY";
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);
  const [paymentAmount, setPaymentAmount] = useState(
    formatEditableNumericValue(order?.customer_payment_amount),
  );
  const selectedRate = useMemo(
    () => findLatestCnyExchangeRate(exchangeRates, selectedCurrency),
    [selectedCurrency, exchangeRates],
  );
  const settlementExchangeRate =
    formatEditableNumericValue(selectedRate?.daily_exchange_rate) ||
    (selectedCurrency === order?.customer_payment_currency
      ? formatEditableNumericValue(order?.settlement_exchange_rate)
      : "") ||
    (selectedCurrency === "CNY" ? "1" : "");
  const rmbAmountPreview = deriveRmbAmountValue(
    paymentAmount,
    settlementExchangeRate,
  );

  if (!order) {
    return null;
  }

  const isRequestMode = mode === "request";
  const description = isRequestMode
    ? `这笔订单已超过 ${editWindowDays} 天，提交后由管理员确认并更新。`
    : "保存后会记录本次修改，金额和汇率相关结果会重新计算。";

  return (
    <DashboardDialog
      description={description}
      onOpenChange={onOpenChange}
      open={open}
      title={isRequestMode ? "申请修改批发订单" : "修改批发订单"}
    >
      <form
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        key={`${order.id}-${mode}`}
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);

          if (isRequestMode) {
            void onRequestOrderEdit(formData);
          } else {
            void onUpdateOrder(formData);
          }

          onOpenChange(false);
        }}
      >
        <input name="order_id" type="hidden" value={order.id} />
        {!canManageAllOrders ? (
          <>
            <input name="customer_id" type="hidden" value={order.customer_id} />
            <input
              name="sales_user_id"
              type="hidden"
              value={order.sales_user_id ?? ""}
            />
          </>
        ) : null}

        <WholesaleSelect
          defaultValue={order.customer_id}
          disabled={!canManageAllOrders}
          label="客户名"
          name="customer_id"
          required
        >
          <option value="">选择客户</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.unique_name}
            </option>
          ))}
        </WholesaleSelect>
        <WholesaleSelect
          defaultValue={order.sales_user_id ?? ""}
          disabled={!canManageAllOrders}
          label="关联业务员"
          name="sales_user_id"
        >
          <option value="">暂不分配</option>
          {salesAccounts.map((profile) => (
            <option key={profile.user_id} value={profile.user_id}>
              {profile.name || profile.email}
            </option>
          ))}
        </WholesaleSelect>
        <WholesaleField
          defaultValue={order.small_order_count}
          label="小单数量"
          min={0}
          name="small_order_count"
          required
          type="number"
        />
        <WholesaleField
          defaultValue={formatEditableNumericValue(order.product_purchase_amount)}
          label="产品采购金额"
          min={0}
          name="product_purchase_amount"
          required
          step="0.01"
          type="number"
        />
        <WholesaleField
          defaultValue={formatEditableNumericValue(order.international_shipping_fee)}
          label="国际运费"
          min={0}
          name="international_shipping_fee"
          required
          step="0.01"
          type="number"
        />
        <WholesaleField
          defaultValue={formatEditableNumericValue(order.other_fee)}
          label="其他费用"
          min={0}
          name="other_fee"
          step="0.01"
          type="number"
        />
        <WholesaleField
          defaultValue={formatEditableNumericValue(order.referral_commission_fee)}
          label="推荐佣金费用"
          min={0}
          name="referral_commission_fee"
          step="0.01"
          type="number"
        />
        <WholesaleField
          defaultValue={order.courier_company ?? ""}
          label="快递公司"
          name="courier_company"
        />
        <WholesaleSelect
          label="客户支付币种"
          name="customer_payment_currency"
          onChange={(event) => setSelectedCurrency(event.target.value)}
          required
          value={selectedCurrency}
        >
          <option value="">选择币种</option>
          {currencyOptions.map((option) => (
            <option key={option.currency} value={option.currency}>
              {option.currency}
            </option>
          ))}
        </WholesaleSelect>
        <DashboardFilterField label="结汇汇率">
          <input
            className={dashboardFilterInputClassName}
            min={0}
            name="settlement_exchange_rate"
            readOnly
            required
            step="0.000001"
            type="number"
            value={settlementExchangeRate}
          />
          <p className="mt-2 text-xs leading-5 text-[#7b8790]">
            保存时会按当前币种汇率重新确认。
          </p>
        </DashboardFilterField>
        <DashboardFilterField label="客户支付金额">
          <input
            className={dashboardFilterInputClassName}
            min={0}
            name="customer_payment_amount"
            onChange={(event) => setPaymentAmount(event.target.value)}
            required
            step="0.01"
            type="number"
            value={paymentAmount}
          />
          {rmbAmountPreview ? (
            <p className="mt-2 text-xs leading-5 text-[#7b8790]">
              预计人民币金额 {formatCurrency(Number(rmbAmountPreview))}
            </p>
          ) : null}
        </DashboardFilterField>
        <WholesaleSelect
          defaultValue={order.payment_platform ?? ""}
          label="收款平台"
          name="payment_platform"
        >
          <option value="">选择收款平台</option>
          {WHOLESALE_PAYMENT_PLATFORM_OPTIONS.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </WholesaleSelect>
        <WholesaleField
          defaultValue={toMonthInputValue(order.order_month)}
          label="订单计入月份"
          name="order_month"
          required
          type="month"
        />
        <div className="md:col-span-2 xl:col-span-4">
          <DashboardFilterField label="备注">
            <textarea
              className={`${dashboardFilterInputClassName} h-auto min-h-24 py-3 sm:h-auto`}
              defaultValue={order.notes ?? ""}
              name="notes"
            />
          </DashboardFilterField>
        </div>
        {isRequestMode ? (
          <div className="md:col-span-2 xl:col-span-4">
            <DashboardFilterField label="申请说明">
              <textarea
                className={`${dashboardFilterInputClassName} h-auto min-h-24 py-3 sm:h-auto`}
                name="request_note"
                placeholder="简单说明为什么需要修改，方便管理员处理。"
                required
              />
            </DashboardFilterField>
          </div>
        ) : null}
        <div className="flex justify-end md:col-span-2 xl:col-span-4">
          <WholesaleSubmitButton pending={pending}>
            {isRequestMode ? "提交申请" : "保存修改"}
          </WholesaleSubmitButton>
        </div>
      </form>
    </DashboardDialog>
  );
}

function useWholesaleCurrencyOptions(
  exchangeRates: ExchangeRateRow[],
  order: WholesaleOrder | null,
) {
  return useMemo(() => {
    const options = dedupeWholesaleCurrencyOptions(
      buildOrderCurrencyOptions(exchangeRates),
    );
    const orderCurrency = order?.customer_payment_currency;
    const hasCny = options.some((option) => option.currency === "CNY");
    const nextOptions = hasCny
      ? [...options]
      : [
          ...options,
          {
            currency: "CNY",
            dailyExchangeRate: "1",
            transactionRate: "0.99",
          },
        ];
    const hasOrderCurrency =
      !orderCurrency ||
      nextOptions.some((option) => option.currency === orderCurrency);

    if (!hasOrderCurrency && orderCurrency) {
      nextOptions.push({
        currency: orderCurrency,
        dailyExchangeRate: formatEditableNumericValue(
          order?.settlement_exchange_rate,
        ),
        transactionRate: "",
      });
    }

    return nextOptions;
  }, [exchangeRates, order]);
}

function toMonthInputValue(value: string) {
  return value.slice(0, 7);
}
