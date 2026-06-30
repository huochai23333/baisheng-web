"use client";

import { useMemo } from "react";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { buildOrderCurrencyOptions } from "@/components/dashboard/admin-orders/admin-orders-utils";
import type { ExchangeRateRow } from "@/lib/exchange-rates";

import type {
  WholesaleCustomer,
  WholesaleProfile,
} from "@/lib/wholesale";

import {
  WholesaleField,
  WholesaleSelect,
  WholesaleSubmitButton,
  WholesaleTextarea,
} from "./wholesale-ui";
import {
  dedupeWholesaleCurrencyOptions,
  WHOLESALE_PAYMENT_PLATFORM_OPTIONS,
} from "./wholesale-order-form-options";

type WholesaleOrderFormDialogProps = {
  customers: WholesaleCustomer[];
  exchangeRates: ExchangeRateRow[];
  onCreateOrder: (formData: FormData) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pending: boolean;
  salesAccounts: WholesaleProfile[];
};

export function WholesaleOrderFormDialog({
  customers,
  exchangeRates,
  onCreateOrder,
  onOpenChange,
  open,
  pending,
  salesAccounts,
}: WholesaleOrderFormDialogProps) {
  const currencyOptions = useMemo(() => {
    const options = dedupeWholesaleCurrencyOptions(
      buildOrderCurrencyOptions(exchangeRates),
    );

    return options.some((option) => option.currency === "CNY")
      ? options
      : [
          ...options,
          {
            currency: "CNY",
            dailyExchangeRate: "1",
            transactionRate: "0.99",
          },
        ];
  }, [exchangeRates]);
  const defaultCurrency =
    currencyOptions.find((option) => option.currency === "USD")?.currency ??
    currencyOptions[0]?.currency ??
    "CNY";

  return (
    <DashboardDialog
      description="订单编号会自动生成。录入阶段只记录客户支付和成本，结汇时再确认汇率并计算人民币金额、毛利和提成。"
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
      }}
      open={open}
      title="新建批发订单"
    >
      <form
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          void onCreateOrder(new FormData(event.currentTarget));
          event.currentTarget.reset();
          onOpenChange(false);
        }}
      >
        <WholesaleSelect label="客户名" name="customer_id" required>
          <option value="">选择客户</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.unique_name}
            </option>
          ))}
        </WholesaleSelect>
        <WholesaleSelect label="关联业务员" name="sales_user_id">
          <option value="">暂不分配</option>
          {salesAccounts.map((profile) => (
            <option key={profile.user_id} value={profile.user_id}>
              {profile.name || profile.email}
            </option>
          ))}
        </WholesaleSelect>
        <WholesaleField
          label="小单数量"
          min={0}
          name="small_order_count"
          required
          type="number"
        />
        <WholesaleField
          label="产品采购金额"
          min={0}
          name="product_purchase_amount"
          required
          step="0.01"
          type="number"
        />
        <WholesaleField
          label="国际运费"
          min={0}
          name="international_shipping_fee"
          required
          step="0.01"
          type="number"
        />
        <WholesaleField
          label="其他费用"
          min={0}
          name="other_fee"
          step="0.01"
          type="number"
        />
        <WholesaleField
          label="推荐佣金费用"
          min={0}
          name="referral_commission_fee"
          step="0.01"
          type="number"
        />
        <WholesaleField label="快递公司" name="courier_company" />
        <WholesaleSelect
          label="客户支付币种"
          name="customer_payment_currency"
          required
          defaultValue={defaultCurrency}
        >
          <option value="">选择币种</option>
          {currencyOptions.map((option) => (
            <option key={option.currency} value={option.currency}>
              {option.currency}
            </option>
          ))}
        </WholesaleSelect>
        <WholesaleField
          label="客户支付金额"
          min={0}
          name="customer_payment_amount"
          required
          step="0.01"
          type="number"
        />
        <WholesaleSelect label="收款平台" name="payment_platform">
          <option value="">选择收款平台</option>
          {WHOLESALE_PAYMENT_PLATFORM_OPTIONS.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </WholesaleSelect>
        <WholesaleField label="订单计入月份" name="order_month" required type="month" />
        <div className="md:col-span-2 xl:col-span-4">
          <WholesaleTextarea label="备注" name="notes" />
        </div>
        <div className="flex justify-end md:col-span-2 xl:col-span-4">
          <WholesaleSubmitButton pending={pending}>保存订单</WholesaleSubmitButton>
        </div>
      </form>
    </DashboardDialog>
  );
}
