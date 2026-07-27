import type { SupabaseClient } from "@supabase/supabase-js";

import { getCurrentSessionContext } from "./current-session-context";
import type {
  CustomerInventoryAttachment,
  CustomerInventoryAuditLog,
  CustomerInventoryCreditApplication,
  CustomerInventoryExtensionRequest,
  CustomerInventoryOrder,
  CustomerInventoryPageData,
  CustomerInventoryRepayment,
} from "./customer-inventory-types";
import { getWholesaleProfiles } from "./wholesale-profiles";
import type { WholesaleCustomer } from "./wholesale-types";

export * from "./customer-inventory-types";

type QueryResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

/**
 * 库存订单拥有独立的数据装载入口。
 * 页面只负责组装展示，不把订单、信贷、延期和还款查询继续塞进原批发聚合文件。
 */
export async function getCustomerInventoryPageData(
  supabase: SupabaseClient,
): Promise<CustomerInventoryPageData> {
  const session = await getCurrentSessionContext(supabase);
  const [
    orders,
    credits,
    extensions,
    repayments,
    attachments,
    auditLogs,
    customers,
    profiles,
  ] = await Promise.all([
    queryRows<CustomerInventoryOrder>(
      supabase
        .from("customer_inventory_orders")
        .select("*")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(200),
      "库存订单",
    ),
    queryRows<CustomerInventoryCreditApplication>(
      supabase
        .from("customer_inventory_credit_applications")
        .select("*")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(600),
      "库存信贷",
    ),
    queryRows<CustomerInventoryExtensionRequest>(
      supabase
        .from("customer_inventory_credit_extension_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(600),
      "信贷延期",
    ),
    queryRows<CustomerInventoryRepayment>(
      supabase
        .from("customer_inventory_credit_repayments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(600),
      "信贷还款",
    ),
    queryRows<CustomerInventoryAttachment>(
      supabase
        .from("customer_inventory_order_list_attachments")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(2_000),
      "库存订单附件",
    ),
    queryRows<CustomerInventoryAuditLog>(
      supabase
        .from("customer_inventory_order_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1_000),
      "库存订单操作记录",
    ),
    queryRows<WholesaleCustomer>(
      supabase
        .from("wholesale_customers")
        .select("*")
        .not("registered_user_id", "is", null)
        .order("created_at", { ascending: false }),
      "已注册批发客户",
    ),
    getWholesaleProfiles(supabase, false),
  ]);
  const usdToCurrencyRates = await loadUsdToCurrencyRates(supabase, orders);

  return {
    attachments,
    auditLogs,
    credits,
    currentBusinessDate: getShanghaiDateValue(new Date()),
    currentRole: session.role,
    currentUserId: session.user?.id ?? null,
    customers,
    extensions,
    orders,
    profiles,
    repayments,
    usdToCurrencyRates,
  };
}

async function loadUsdToCurrencyRates(
  supabase: SupabaseClient,
  orders: CustomerInventoryOrder[],
) {
  const currencies = Array.from(
    new Set(
      orders
        .filter((order) => order.payment_status === "awaiting_payment")
        .map((order) => order.currency),
    ),
  );
  const entries = await Promise.all(
    currencies.map(async (currency) => {
      const { data, error } = await supabase.rpc(
        "get_customer_inventory_usd_to_currency_rate",
        { p_currency: currency },
      );

      // 缺少汇率时页面仍可查看申请；审核弹窗会明确显示尚不能批准，而不是让整页加载失败。
      return [currency, error ? null : Number(data)] as const;
    }),
  );

  return Object.fromEntries(entries);
}

async function queryRows<T>(
  query: PromiseLike<QueryResult<T>>,
  label: string,
): Promise<T[]> {
  const result = await query;

  if (result.error) {
    throw new Error(`${label}暂时没有加载成功，请稍后重试。`, {
      cause: result.error,
    });
  }

  return result.data ?? [];
}

function getShanghaiDateValue(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Shanghai",
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}
