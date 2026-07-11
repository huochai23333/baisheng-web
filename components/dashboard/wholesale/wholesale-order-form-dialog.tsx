"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { buildOrderCurrencyOptions } from "@/components/dashboard/admin-orders/admin-orders-utils";
import type { ExchangeRateRow } from "@/lib/exchange-rates";
import type { WholesaleCustomer, WholesaleProfile } from "@/lib/wholesale";
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
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_order_form_dialog",
  );
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
      description={uiText("attribute001")}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
      }}
      open={open}
      title={uiText("attribute002")}
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
        <WholesaleSelect
          label={uiText("attribute003")}
          name="customer_id"
          required
        >
          <option value="">
            <UiMessage id="components_dashboard_wholesale_wholesale_order_form_dialog.text001" />
          </option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.unique_name}
            </option>
          ))}
        </WholesaleSelect>
        <WholesaleSelect label={uiText("attribute004")} name="sales_user_id">
          <option value="">
            <UiMessage id="components_dashboard_wholesale_wholesale_order_form_dialog.text002" />
          </option>
          {salesAccounts.map((profile) => (
            <option key={profile.user_id} value={profile.user_id}>
              {profile.name || profile.email}
            </option>
          ))}
        </WholesaleSelect>
        <WholesaleField
          label={uiText("attribute005")}
          min={0}
          name="small_order_count"
          required
          type="number"
        />
        <WholesaleField
          label={uiText("attribute006")}
          min={0}
          name="product_purchase_amount"
          required
          step="0.01"
          type="number"
        />
        <WholesaleField
          label={uiText("attribute007")}
          min={0}
          name="international_shipping_fee"
          required
          step="0.01"
          type="number"
        />
        <WholesaleField
          label={uiText("attribute008")}
          min={0}
          name="other_fee"
          step="0.01"
          type="number"
        />
        <WholesaleField
          label={uiText("attribute009")}
          min={0}
          name="referral_commission_fee"
          step="0.01"
          type="number"
        />
        <WholesaleField label={uiText("attribute010")} name="courier_company" />
        <WholesaleSelect
          label={uiText("attribute011")}
          name="customer_payment_currency"
          required
          defaultValue={defaultCurrency}
        >
          <option value="">
            <UiMessage id="components_dashboard_wholesale_wholesale_order_form_dialog.text003" />
          </option>
          {currencyOptions.map((option) => (
            <option key={option.currency} value={option.currency}>
              {option.currency}
            </option>
          ))}
        </WholesaleSelect>
        <WholesaleField
          label={uiText("attribute012")}
          min={0}
          name="customer_payment_amount"
          required
          step="0.01"
          type="number"
        />
        <WholesaleSelect label={uiText("attribute013")} name="payment_platform">
          <option value="">
            <UiMessage id="components_dashboard_wholesale_wholesale_order_form_dialog.text004" />
          </option>
          {WHOLESALE_PAYMENT_PLATFORM_OPTIONS.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </WholesaleSelect>
        <WholesaleField
          label={uiText("attribute014")}
          name="order_month"
          required
          type="month"
        />
        <div className="md:col-span-2 xl:col-span-4">
          <WholesaleTextarea label={uiText("attribute015")} name="notes" />
        </div>
        <div className="flex justify-end md:col-span-2 xl:col-span-4">
          <WholesaleSubmitButton pending={pending}>
            <UiMessage id="components_dashboard_wholesale_wholesale_order_form_dialog.text005" />
          </WholesaleSubmitButton>
        </div>
      </form>
    </DashboardDialog>
  );
}
