import type { AppRole } from "./auth-routing";
import type { WholesaleCustomer, WholesaleProfile } from "./wholesale-types";

export type CustomerInventoryPaymentStatus =
  "awaiting_payment" | "paid" | "cancelled";

export type CustomerInventoryCreditTier =
  "fixed_200_usd" | "single_order_50" | "all_orders_5";

export type CustomerInventoryCreditStatus =
  "pending" | "active" | "rejected" | "repaid";

export type CustomerInventoryExtensionStatus =
  "pending" | "approved" | "rejected";

export type CustomerInventoryOrder = {
  id: string;
  order_number: string;
  customer_id: string;
  sales_user_id: string;
  purchase_amount: number;
  credit_offset_amount: number;
  actual_payment_amount: number;
  remaining_amount: number;
  currency: string;
  payment_status: CustomerInventoryPaymentStatus;
  financial_locked: boolean;
  notes: string | null;
  revision: number;
  created_by_user_id: string;
  cancelled_by_user_id: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerInventoryCreditApplication = {
  id: string;
  order_id: string;
  customer_id: string;
  tier: CustomerInventoryCreditTier;
  status: CustomerInventoryCreditStatus;
  application_note: string | null;
  applied_by_user_id: string;
  approved_amount_usd: number | null;
  order_currency_credit_amount: number | null;
  usd_to_order_currency_rate: number | null;
  monthly_interest_rate: number | null;
  used_on: string | null;
  due_on: string | null;
  extended_due_on: string | null;
  reviewed_by_user_id: string | null;
  review_note: string | null;
  reviewed_at: string | null;
  repaid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerInventoryExtensionRequest = {
  id: string;
  credit_application_id: string;
  extension_months: number;
  status: CustomerInventoryExtensionStatus;
  request_note: string | null;
  requested_by_user_id: string;
  reviewed_by_user_id: string | null;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerInventoryRepayment = {
  id: string;
  credit_application_id: string;
  principal_amount_usd: number;
  interest_amount_usd: number;
  total_amount_usd: number;
  overdue_days: number;
  paid_on: string;
  note: string | null;
  recorded_by_user_id: string;
  created_at: string;
};

export type CustomerInventoryAttachment = {
  id: string;
  order_id: string;
  bucket_name: string;
  storage_path: string;
  original_name: string;
  mime_type: string;
  file_size_bytes: number;
  uploaded_by_user_id: string;
  created_at: string;
};

export type CustomerInventoryAuditLog = {
  id: string;
  order_id: string;
  credit_application_id: string | null;
  extension_request_id: string | null;
  repayment_id: string | null;
  action: string;
  actor_user_id: string;
  previous_data: Record<string, unknown> | null;
  next_data: Record<string, unknown> | null;
  note: string | null;
  created_at: string;
};

export type CustomerInventoryPageData = {
  attachments: CustomerInventoryAttachment[];
  auditLogs: CustomerInventoryAuditLog[];
  credits: CustomerInventoryCreditApplication[];
  currentBusinessDate: string;
  currentRole: AppRole | null;
  currentUserId: string | null;
  customers: WholesaleCustomer[];
  extensions: CustomerInventoryExtensionRequest[];
  orders: CustomerInventoryOrder[];
  profiles: WholesaleProfile[];
  repayments: CustomerInventoryRepayment[];
  usdToCurrencyRates: Record<string, number | null>;
};

export type CustomerInventoryDueState =
  | "not_started"
  | "more_than_7_days"
  | "due_within_7_days"
  | "due_today"
  | "overdue"
  | "repaid";

/**
 * 日期字段来自数据库的 date 类型，使用 UTC 做纯日历运算可以避免浏览器时区
 * 把“7月31日”误换算成前一天或后一天。
 */
export function getCustomerInventoryCalendarDayDifference(
  laterDate: string,
  earlierDate: string,
) {
  return Math.round(
    (Date.parse(`${laterDate}T00:00:00Z`) -
      Date.parse(`${earlierDate}T00:00:00Z`)) /
      86_400_000,
  );
}

export function getCustomerInventoryEffectiveDueDate(
  credit: CustomerInventoryCreditApplication,
) {
  return credit.extended_due_on ?? credit.due_on;
}

export function getCustomerInventoryOverdueDays(
  credit: CustomerInventoryCreditApplication,
  currentBusinessDate: string,
) {
  const dueDate = getCustomerInventoryEffectiveDueDate(credit);

  if (!dueDate || credit.status !== "active") {
    return 0;
  }

  return Math.max(
    getCustomerInventoryCalendarDayDifference(currentBusinessDate, dueDate),
    0,
  );
}

export function getCustomerInventoryInterest(
  credit: CustomerInventoryCreditApplication,
  currentBusinessDate: string,
) {
  const principal = Number(credit.approved_amount_usd ?? 0);
  const monthlyRate = Number(credit.monthly_interest_rate ?? 0);
  const overdueDays = getCustomerInventoryOverdueDays(
    credit,
    currentBusinessDate,
  );

  return Math.round((principal * monthlyRate * overdueDays * 100) / 30) / 100;
}

export function getCustomerInventoryDueState(
  credit: CustomerInventoryCreditApplication,
  currentBusinessDate: string,
): CustomerInventoryDueState {
  if (credit.status === "repaid") return "repaid";
  if (credit.status !== "active") return "not_started";

  const dueDate = getCustomerInventoryEffectiveDueDate(credit);
  if (!dueDate) return "not_started";

  const remainingDays = getCustomerInventoryCalendarDayDifference(
    dueDate,
    currentBusinessDate,
  );

  if (remainingDays < 0) return "overdue";
  if (remainingDays === 0) return "due_today";
  if (remainingDays <= 7) return "due_within_7_days";
  return "more_than_7_days";
}
