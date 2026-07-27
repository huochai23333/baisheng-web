import type {
  CustomerInventoryCreditApplication,
  CustomerInventoryCreditTier,
  CustomerInventoryExtensionRequest,
  CustomerInventoryOrder,
  CustomerInventoryPaymentStatus,
} from "@/lib/customer-inventory-types";

export function formatInventoryMoney(amount: number | null, currency = "USD") {
  return new Intl.NumberFormat("zh-CN", {
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(Number(amount ?? 0));
}

export function formatInventoryDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Shanghai",
    year: "numeric",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00+08:00`));
}

export function formatInventoryDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Shanghai",
    year: "numeric",
  }).format(new Date(value));
}

/**
 * 筛选使用和界面展示相同的上海业务日期。
 * 若直接截取 timestamptz 字符串会得到 UTC 日期，午夜前后的记录可能被分到错误的一天。
 */
export function getInventoryShanghaiDateKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Shanghai",
    year: "numeric",
  }).formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  const year = values.get("year");
  const month = values.get("month");
  const day = values.get("day");

  return year && month && day ? `${year}-${month}-${day}` : "";
}

export function getInventoryCustomerName(
  order: CustomerInventoryOrder,
  customerNames: Map<string, string>,
) {
  return customerNames.get(order.customer_id) ?? "—";
}

export function getInventoryProfileName(
  userId: string,
  profileNames: Map<string, string>,
) {
  return profileNames.get(userId) ?? "—";
}

export function getPaymentStatusTone(status: CustomerInventoryPaymentStatus) {
  if (status === "paid") return "success" as const;
  if (status === "cancelled") return "neutral" as const;
  return "warning" as const;
}

export function canEditInventoryFinancials(
  order: CustomerInventoryOrder,
  credits: CustomerInventoryCreditApplication[],
) {
  return (
    order.payment_status === "awaiting_payment" &&
    !order.financial_locked &&
    !credits.some(
      (credit) =>
        credit.order_id === order.id &&
        ["active", "pending", "repaid"].includes(credit.status),
    )
  );
}

export function hasPendingInventoryCredit(
  orderId: string,
  credits: CustomerInventoryCreditApplication[],
) {
  return credits.some(
    (credit) => credit.order_id === orderId && credit.status === "pending",
  );
}

export function canRequestInventoryExtension(
  credit: CustomerInventoryCreditApplication,
  extensions: CustomerInventoryExtensionRequest[],
  currentBusinessDate: string,
) {
  return (
    credit.status === "active" &&
    Boolean(credit.due_on) &&
    currentBusinessDate <= (credit.due_on ?? "") &&
    !credit.extended_due_on &&
    !extensions.some(
      (extension) =>
        extension.credit_application_id === credit.id &&
        extension.status === "pending",
    )
  );
}

export const inventoryTierOrder: CustomerInventoryCreditTier[] = [
  "fixed_200_usd",
  "single_order_50",
  "all_orders_5",
];
