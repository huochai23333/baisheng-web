import type { SupabaseClient } from "@supabase/supabase-js";

import type { UserStatus } from "./auth-metadata";
import type { AppRole } from "./auth-routing";
import {
  getCommissionRuleSettings,
  type CommissionRuleSetting,
} from "./commission-settings";
import { getCurrentSessionContext } from "./current-session-context";
import {
  getBeijingDateString,
  getExchangeRates,
  type ExchangeRateRow,
} from "./exchange-rates";
import {
  getWholesaleLogisticsStatuses,
  type WholesaleLogisticsStatus,
} from "./wholesale-logistics-statuses";
import { scopeWholesaleRows } from "./wholesale-scope";
import {
  getWholesaleOrderPage,
  type WholesaleOrderFilters,
  type WholesaleOrderPage,
} from "./wholesale-order-page";
import {
  getWholesaleOrderEditSettings,
  type WholesaleOrderEditSettings,
} from "./wholesale-order-edit-settings";
import {
  getWholesaleProfiles,
  getWholesaleProfilesWithCandidates,
} from "./wholesale-profiles";
import type { WorkspaceWholesaleSectionKey } from "./workspace-config";

export type WholesaleCustomer = {
  id: string;
  registered_user_id: string | null;
  assigned_sales_user_id: string | null;
  created_by_user_id: string | null;
  customer_kind: "registered_account" | "sales_created";
  unique_name: string;
  other_names: string[];
  contact_details: string | null;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type WholesaleOrder = {
  id: string;
  order_number: string;
  customer_id: string;
  sales_user_id: string | null;
  small_order_count: number;
  product_purchase_amount: number;
  packing_fee: number;
  international_shipping_fee: number;
  other_fee: number;
  referral_commission_fee: number;
  courier_company: string | null;
  settlement_exchange_rate: number | null;
  customer_payment_currency: string;
  customer_payment_amount: number;
  customer_payment_rmb_amount: number | null;
  payment_platform: string | null;
  gross_profit: number | null;
  gross_margin: number | null;
  unit_gross_profit: number | null;
  commission_rate: number;
  notes: string | null;
  order_month: string;
  status: "unsettled" | "partial_settled" | "settled";
  ordered_at: string;
  settled_at: string | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type WholesaleOrderSettlement = {
  id: string;
  order_id: string;
  settlement_amount: number;
  settlement_exchange_rate: number;
  settlement_rmb_amount: number;
  source_settlement_release_id: string | null;
  settled_on: string;
  settled_at: string;
  created_by_user_id: string | null;
  created_at: string;
};

export type WholesaleOrderEditRequestStatus =
  "approved" | "pending" | "rejected";

export type WholesaleOrderEditRequest = {
  id: string;
  order_id: string;
  requested_by_user_id: string;
  requested_changes: Record<string, unknown>;
  current_snapshot: Record<string, unknown>;
  request_note: string | null;
  status: WholesaleOrderEditRequestStatus;
  reviewer_user_id: string | null;
  review_note: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WholesaleOrderChangeLog = {
  id: string;
  order_id: string;
  request_id: string | null;
  actor_user_id: string | null;
  action:
    | "approved_update"
    | "direct_update"
    | "settlement_rate_batch_update"
    | "settlement_rate_update";
  previous_data: Record<string, unknown>;
  next_data: Record<string, unknown>;
  note: string | null;
  created_at: string;
};

export type Wholesale1688Order = {
  id: string;
  batch_id: string | null;
  external_order_number: string;
  seller_name: string | null;
  item_summary: string | null;
  quantity: number | null;
  purchase_amount: number | null;
  order_status: string | null;
  purchased_at: string | null;
  recipient_name: string | null;
  raw_payload: Record<string, unknown>;
  assisted_customer_id: string | null;
  assisted_at: string | null;
  customer_id: string | null;
  wholesale_order_id: string | null;
  claimed_by_user_id: string | null;
  claimed_at: string | null;
  imported_by_user_id: string | null;
  created_at: string;
};

export type WholesaleLogisticsOrder = {
  id: string;
  batch_id: string | null;
  customer_id: string | null;
  wholesale_order_id: string | null;
  source_workflow_order_number: string | null;
  international_tracking_number: string;
  destination_tracking_number: string | null;
  freight_forwarder: string | null;
  latest_status: string | null;
  latest_checkpoint_at: string | null;
  logistics_fee: number;
  currency: string;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type WholesaleCommission = {
  id: string;
  order_id: string;
  beneficiary_user_id: string | null;
  customer_id: string | null;
  order_payment_rmb_amount: number;
  gross_profit_rmb: number;
  commission_rate: number;
  commission_amount_rmb: number;
  status: "pending" | "settled" | "cancelled";
  calculated_at: string;
  settled_at: string | null;
  settled_by_user_id: string | null;
};

export type WholesaleReferral = {
  id: string;
  referrer_customer_id: string;
  referred_customer_id: string;
  created_by_user_id: string | null;
  created_at: string;
};

export type WholesaleProfile = {
  user_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: UserStatus | null;
  city: string | null;
  role: AppRole | null;
};

export type WholesalePageData = {
  currentUserId: string | null;
  currentRole: AppRole | null;
  commissionRuleSettings: CommissionRuleSetting[];
  customers: WholesaleCustomer[];
  exchangeRates: ExchangeRateRow[];
  orderChangeLogs: WholesaleOrderChangeLog[];
  orderEditRequests: WholesaleOrderEditRequest[];
  orderEditSettings: WholesaleOrderEditSettings;
  orderPage: WholesaleOrderPage | null;
  orderPageError: string | null;
  orders: WholesaleOrder[];
  orderSettlements: WholesaleOrderSettlement[];
  purchaseOrders: Wholesale1688Order[];
  logisticsOrders: WholesaleLogisticsOrder[];
  logisticsStatuses: WholesaleLogisticsStatus[];
  commissions: WholesaleCommission[];
  referrals: WholesaleReferral[];
  profiles: WholesaleProfile[];
  registeredCandidates: WholesaleProfile[];
  section: WorkspaceWholesaleSectionKey;
};

type QueryResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

export async function getWholesalePageData(
  supabase: SupabaseClient,
  section: WorkspaceWholesaleSectionKey,
  options?: {
    orderFilters?: WholesaleOrderFilters;
    orderLimit?: number;
  },
): Promise<WholesalePageData> {
  const sessionContext = await getCurrentSessionContext(supabase);
  const currentRole = sessionContext.role;
  const currentUserId = sessionContext.user?.id ?? null;
  const baseData = createEmptyWholesalePageData({
    currentRole,
    currentUserId,
    section,
  });

  if (section === "orders") {
    const filters = options?.orderFilters ?? getInitialWholesaleOrderFilters();
    const [
      customers,
      profiles,
      exchangeRates,
      orderEditSettings,
      orderPageResult,
    ] = await Promise.all([
      getWholesaleCustomers(supabase),
      getWholesaleProfiles(supabase, false),
      getExchangeRates(supabase),
      getWholesaleOrderEditSettings(supabase),
      getWholesaleOrderPage(supabase, filters, null, options?.orderLimit)
        .then((page) => ({ error: null, page }))
        .catch((error: unknown) => ({
          error:
            error instanceof Error
              ? error.message
              : "批发订单暂时没有加载成功，请稍后重试。",
          page: null,
        })),
    ]);

    const orderPage = orderPageResult.page;

    return {
      ...baseData,
      customers,
      exchangeRates,
      logisticsOrders: orderPage?.logisticsOrders ?? [],
      logisticsStatuses: orderPage?.logisticsStatuses ?? [],
      orderChangeLogs: orderPage?.orderChangeLogs ?? [],
      orderEditRequests: orderPage?.orderEditRequests ?? [],
      orderEditSettings,
      orderPage,
      orderPageError: orderPageResult.error,
      orders: orderPage?.orders ?? [],
      orderSettlements: orderPage?.orderSettlements ?? [],
      profiles,
      purchaseOrders: orderPage?.purchaseOrders ?? [],
    };
  }

  const rows = await getWholesaleSectionRows(supabase, section);
  const scopedRows = scopeWholesaleRows({
    ...rows,
    currentRole,
    currentUserId,
  });

  return {
    ...baseData,
    commissionRuleSettings: rows.commissionRuleSettings,
    exchangeRates: rows.exchangeRates,
    orderEditSettings: rows.orderEditSettings,
    ...scopedRows,
  };
}

type WholesaleSectionRows = {
  commissionRuleSettings: CommissionRuleSetting[];
  commissions: WholesaleCommission[];
  customers: WholesaleCustomer[];
  exchangeRates: ExchangeRateRow[];
  logisticsOrders: WholesaleLogisticsOrder[];
  logisticsStatuses: WholesaleLogisticsStatus[];
  orderChangeLogs: WholesaleOrderChangeLog[];
  orderEditRequests: WholesaleOrderEditRequest[];
  orderEditSettings: WholesaleOrderEditSettings;
  orderSettlements: WholesaleOrderSettlement[];
  orders: WholesaleOrder[];
  profiles: WholesaleProfile[];
  purchaseOrders: Wholesale1688Order[];
  referrals: WholesaleReferral[];
  registeredCandidates: WholesaleProfile[];
};

async function getWholesaleSectionRows(
  supabase: SupabaseClient,
  section: WorkspaceWholesaleSectionKey,
): Promise<WholesaleSectionRows> {
  const rows = createEmptyWholesaleSectionRows();

  if (section === "order-claims") {
    const [customers, orders, purchaseOrders, profileResult] =
      await Promise.all([
        getWholesaleCustomers(supabase),
        getAllWholesaleOrders(supabase),
        queryRows<Wholesale1688Order>(
          supabase
            .from("wholesale_1688_orders")
            .select("*")
            .order("created_at", { ascending: false }),
          "1688 采购订单",
        ),
        getWholesaleProfilesWithCandidates(supabase, false),
      ]);

    return { ...rows, customers, orders, purchaseOrders, ...profileResult };
  }

  if (section === "logistics") {
    const [customers, orders, logisticsOrders, logisticsStatuses] =
      await Promise.all([
        getWholesaleCustomers(supabase),
        getAllWholesaleOrders(supabase),
        queryRows<WholesaleLogisticsOrder>(
          supabase
            .from("wholesale_logistics_orders")
            .select("*")
            .order("updated_at", { ascending: false }),
          "批发物流记录",
        ),
        queryRows<WholesaleLogisticsStatus>(
          getWholesaleLogisticsStatuses(supabase),
          "物流状态",
        ),
      ]);

    return { ...rows, customers, logisticsOrders, logisticsStatuses, orders };
  }

  if (section === "customers") {
    const [customers, profileResult] = await Promise.all([
      getWholesaleCustomers(supabase),
      getWholesaleProfilesWithCandidates(supabase, true),
    ]);

    return { ...rows, customers, ...profileResult };
  }

  if (section === "people") {
    return { ...rows, profiles: await getWholesaleProfiles(supabase, false) };
  }

  if (section === "referrals") {
    const [customers, referrals] = await Promise.all([
      getWholesaleCustomers(supabase),
      queryRows<WholesaleReferral>(
        supabase
          .from("wholesale_referrals")
          .select("*")
          .order("created_at", { ascending: false }),
        "批发推荐关系",
      ),
    ]);

    return { ...rows, customers, referrals };
  }

  if (section === "commission" || section === "incentives") {
    const [
      customers,
      orders,
      logisticsOrders,
      logisticsStatuses,
      commissions,
      referrals,
      profiles,
      exchangeRates,
      commissionRuleSettings,
    ] = await Promise.all([
      getWholesaleCustomers(supabase),
      getAllWholesaleOrders(supabase),
      queryRows<WholesaleLogisticsOrder>(
        supabase
          .from("wholesale_logistics_orders")
          .select("*")
          .order("updated_at", { ascending: false }),
        "批发物流记录",
      ),
      queryRows<WholesaleLogisticsStatus>(
        getWholesaleLogisticsStatuses(supabase),
        "物流状态",
      ),
      queryRows<WholesaleCommission>(
        supabase
          .from("wholesale_commissions")
          .select("*")
          .order("calculated_at", { ascending: false }),
        "批发提成",
      ),
      queryRows<WholesaleReferral>(
        supabase
          .from("wholesale_referrals")
          .select("*")
          .order("created_at", { ascending: false }),
        "批发推荐关系",
      ),
      getWholesaleProfiles(supabase, false),
      getExchangeRates(supabase),
      getCommissionRuleSettings(supabase),
    ]);

    return {
      ...rows,
      commissionRuleSettings,
      commissions,
      customers,
      exchangeRates,
      logisticsOrders,
      logisticsStatuses,
      orders,
      profiles,
      referrals,
    };
  }

  return rows;
}

function createEmptyWholesalePageData({
  currentRole,
  currentUserId,
  section,
}: {
  currentRole: AppRole | null;
  currentUserId: string | null;
  section: WorkspaceWholesaleSectionKey;
}): WholesalePageData {
  return {
    ...createEmptyWholesaleSectionRows(),
    currentRole,
    currentUserId,
    orderPage: null,
    orderPageError: null,
    section,
  };
}

function createEmptyWholesaleSectionRows(): WholesaleSectionRows {
  return {
    commissionRuleSettings: [],
    commissions: [],
    customers: [],
    exchangeRates: [],
    logisticsOrders: [],
    logisticsStatuses: [],
    orderChangeLogs: [],
    orderEditRequests: [],
    orderEditSettings: {
      directEditWindowDays: 30,
      updatedAt: null,
      updatedByUserId: null,
    },
    orderSettlements: [],
    orders: [],
    profiles: [],
    purchaseOrders: [],
    referrals: [],
    registeredCandidates: [],
  };
}

async function getWholesaleCustomers(supabase: SupabaseClient) {
  return queryRows<WholesaleCustomer>(
    supabase
      .from("wholesale_customers")
      .select("*")
      .order("created_at", { ascending: false }),
    "批发客户",
  );
}

async function getAllWholesaleOrders(supabase: SupabaseClient) {
  return queryRows<WholesaleOrder>(
    supabase
      .from("wholesale_orders")
      .select("*")
      .order("ordered_at", { ascending: false })
      .order("id", { ascending: false }),
    "批发订单",
  );
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

function getInitialWholesaleOrderFilters(): WholesaleOrderFilters {
  const today = getBeijingDateString();
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthText = String(month).padStart(2, "0");

  return {
    customerId: "",
    orderedFromDate: `${year}-${monthText}-01`,
    orderedToDate: `${year}-${monthText}-${String(lastDay).padStart(2, "0")}`,
    salesUserId: "",
    searchText: "",
    status: "all",
  };
}
