"use client";
import { UiMessage } from "@/components/i18n/ui-message";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import {
  DashboardFilterField,
  dashboardFilterInputClassName,
} from "@/components/dashboard/dashboard-section-panel";
import {
  buildOrderCurrencyOptions,
  formatEditableNumericValue,
} from "@/components/dashboard/admin-orders/admin-orders-utils";
import type { ExchangeRateRow } from "@/lib/exchange-rates";
import type {
  WholesaleCustomer,
  WholesaleOrder,
  WholesaleProfile,
} from "@/lib/wholesale";
import {
  dedupeWholesaleCurrencyOptions,
  WHOLESALE_PAYMENT_PLATFORM_OPTIONS,
} from "./wholesale-order-form-options";
import type { WholesaleOrderEditMode } from "./wholesale-order-edit-rules";
import {
  getTrimmedFormValue,
  hasWholesaleOrderFieldChanges,
  toMonthInputValue,
} from "./wholesale-order-edit-form-utils";
import {
  WholesaleField,
  WholesaleSelect,
  WholesaleSubmitButton,
} from "./wholesale-ui";
type WholesaleOrderEditDialogProps = {
  canReassignOrder: boolean;
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
  canReassignOrder,
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
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_order_edit_dialog",
  );
  const [requestNoteError, setRequestNoteError] = useState("");
  const currencyOptions = useWholesaleCurrencyOptions(exchangeRates, order);
  const defaultCurrency =
    order?.customer_payment_currency ??
    currencyOptions.find((option) => option.currency === "USD")?.currency ??
    currencyOptions[0]?.currency ??
    "CNY";
  if (!order) {
    return null;
  }
  const isRequestMode = mode === "request";
  const description = isRequestMode
    ? `这笔订单已超过 ${editWindowDays} 天，修改提交后由管理员确认。`
    : "保存后会记录本次修改。结汇请回到订单列表登记每一笔结汇记录。";
  return (
    <DashboardDialog
      description={description}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setRequestNoteError("");
        }
        onOpenChange(nextOpen);
      }}
      open={open}
      title={isRequestMode ? "申请修改批发订单" : "修改批发订单"}
    >
      <form
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        key={`${order.id}-${mode}`}
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const hasOrderChanges = hasWholesaleOrderFieldChanges(
            formData,
            order,
          );
          if (isRequestMode) {
            if (
              hasOrderChanges &&
              !getTrimmedFormValue(formData, "request_note")
            ) {
              setRequestNoteError("请填写申请说明，方便管理员处理。");
              return;
            }
            if (hasOrderChanges) {
              void onRequestOrderEdit(formData);
            }
          } else {
            if (hasOrderChanges) {
              void onUpdateOrder(formData);
            }
          }
          setRequestNoteError("");
          onOpenChange(false);
        }}
      >
        <input name="order_id" type="hidden" value={order.id} />
        {!canReassignOrder ? (
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
          disabled={!canReassignOrder}
          label={uiText("attribute001")}
          name="customer_id"
          required
        >
          <option value="">
            <UiMessage id="components_dashboard_wholesale_wholesale_order_edit_dialog.text001" />
          </option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.unique_name}
            </option>
          ))}
        </WholesaleSelect>
        <WholesaleSelect
          defaultValue={order.sales_user_id ?? ""}
          disabled={!canReassignOrder}
          label={uiText("attribute002")}
          name="sales_user_id"
        >
          <option value="">
            <UiMessage id="components_dashboard_wholesale_wholesale_order_edit_dialog.text002" />
          </option>
          {salesAccounts.map((profile) => (
            <option key={profile.user_id} value={profile.user_id}>
              {profile.name || profile.email}
            </option>
          ))}
        </WholesaleSelect>
        <WholesaleField
          defaultValue={order.small_order_count}
          label={uiText("attribute003")}
          min={0}
          name="small_order_count"
          required
          type="number"
        />
        <WholesaleField
          defaultValue={formatEditableNumericValue(
            order.product_purchase_amount,
          )}
          label={uiText("attribute004")}
          min={0}
          name="product_purchase_amount"
          required
          step="0.01"
          type="number"
        />
        <WholesaleField
          defaultValue={formatEditableNumericValue(
            order.international_shipping_fee,
          )}
          label={uiText("attribute005")}
          min={0}
          name="international_shipping_fee"
          required
          step="0.01"
          type="number"
        />
        <WholesaleField
          defaultValue={formatEditableNumericValue(order.other_fee)}
          label={uiText("attribute006")}
          min={0}
          name="other_fee"
          step="0.01"
          type="number"
        />
        <WholesaleField
          defaultValue={formatEditableNumericValue(
            order.referral_commission_fee,
          )}
          label={uiText("attribute007")}
          min={0}
          name="referral_commission_fee"
          step="0.01"
          type="number"
        />
        <WholesaleField
          defaultValue={order.courier_company ?? ""}
          label={uiText("attribute008")}
          name="courier_company"
        />
        <WholesaleSelect
          defaultValue={defaultCurrency}
          label={uiText("attribute009")}
          name="customer_payment_currency"
          required
        >
          <option value="">
            <UiMessage id="components_dashboard_wholesale_wholesale_order_edit_dialog.text003" />
          </option>
          {currencyOptions.map((option) => (
            <option key={option.currency} value={option.currency}>
              {option.currency}
            </option>
          ))}
        </WholesaleSelect>
        <WholesaleField
          defaultValue={formatEditableNumericValue(
            order.customer_payment_amount,
          )}
          label={uiText("attribute010")}
          min={0}
          name="customer_payment_amount"
          required
          step="0.01"
          type="number"
        />
        <WholesaleSelect
          defaultValue={order.payment_platform ?? ""}
          label={uiText("attribute011")}
          name="payment_platform"
        >
          <option value="">
            <UiMessage id="components_dashboard_wholesale_wholesale_order_edit_dialog.text004" />
          </option>
          {WHOLESALE_PAYMENT_PLATFORM_OPTIONS.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </WholesaleSelect>
        <WholesaleField
          defaultValue={toMonthInputValue(order.order_month)}
          label={uiText("attribute012")}
          name="order_month"
          required
          type="month"
        />
        <div className="md:col-span-2 xl:col-span-4">
          <DashboardFilterField label={uiText("attribute013")}>
            <textarea
              className={`${dashboardFilterInputClassName} h-auto min-h-24 py-3 sm:h-auto`}
              defaultValue={order.notes ?? ""}
              name="notes"
            />
          </DashboardFilterField>
        </div>
        {isRequestMode ? (
          <div className="md:col-span-2 xl:col-span-4">
            <DashboardFilterField label={uiText("attribute014")}>
              <textarea
                className={`${dashboardFilterInputClassName} h-auto min-h-24 py-3 sm:h-auto`}
                name="request_note"
                placeholder={uiText("attribute015")}
              />
              {requestNoteError ? (
                <p className="mt-2 text-sm leading-6 text-[#b13d3d]">
                  {requestNoteError}
                </p>
              ) : null}
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
