import type { WholesaleOrder } from "@/lib/wholesale";

export function buildSettlementRateFormData(formData: FormData) {
  const nextFormData = new FormData();

  nextFormData.set("order_id", getTrimmedFormValue(formData, "order_id"));
  nextFormData.set(
    "settlement_exchange_rate",
    getTrimmedFormValue(formData, "settlement_exchange_rate"),
  );

  return nextFormData;
}

export function getTrimmedFormValue(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

export function hasWholesaleOrderFieldChanges(
  formData: FormData,
  order: WholesaleOrder,
) {
  // 只判断普通订单字段，结汇汇率由单独的纠错 RPC 处理。
  return (
    getTrimmedFormValue(formData, "customer_id") !== order.customer_id ||
    normalizeNullableText(getTrimmedFormValue(formData, "sales_user_id")) !==
      normalizeNullableText(order.sales_user_id) ||
    hasNumberChanged(
      getTrimmedFormValue(formData, "small_order_count"),
      order.small_order_count,
      0,
    ) ||
    hasNumberChanged(
      getTrimmedFormValue(formData, "product_purchase_amount"),
      order.product_purchase_amount,
      2,
    ) ||
    hasNumberChanged(
      getTrimmedFormValue(formData, "international_shipping_fee"),
      order.international_shipping_fee,
      2,
    ) ||
    hasNumberChanged(getTrimmedFormValue(formData, "other_fee"), order.other_fee, 2) ||
    hasNumberChanged(
      getTrimmedFormValue(formData, "referral_commission_fee"),
      order.referral_commission_fee,
      2,
    ) ||
    normalizeNullableText(getTrimmedFormValue(formData, "courier_company")) !==
      normalizeNullableText(order.courier_company) ||
    getTrimmedFormValue(formData, "customer_payment_currency") !==
      order.customer_payment_currency ||
    hasNumberChanged(
      getTrimmedFormValue(formData, "customer_payment_amount"),
      order.customer_payment_amount,
      2,
    ) ||
    normalizeNullableText(getTrimmedFormValue(formData, "payment_platform")) !==
      normalizeNullableText(order.payment_platform) ||
    getTrimmedFormValue(formData, "order_month") !==
      toMonthInputValue(order.order_month) ||
    normalizeNullableText(getTrimmedFormValue(formData, "notes")) !==
      normalizeNullableText(order.notes)
  );
}

export function hasSettlementRateChange(formData: FormData, order: WholesaleOrder) {
  return hasNumberChanged(
    getTrimmedFormValue(formData, "settlement_exchange_rate"),
    order.settlement_exchange_rate,
    6,
  );
}

export function toMonthInputValue(value: string) {
  return value.slice(0, 7);
}

function normalizeNullableText(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";

  return normalized.length > 0 ? normalized : null;
}

function hasNumberChanged(value: string, current: number | null, scale: number) {
  const nextNumber = Number(value || 0);
  const currentNumber = Number(current ?? 0);

  if (!Number.isFinite(nextNumber) || !Number.isFinite(currentNumber)) {
    return true;
  }

  return nextNumber.toFixed(scale) !== currentNumber.toFixed(scale);
}
