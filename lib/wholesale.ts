import type { SupabaseClient } from "@supabase/supabase-js";

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
  getDefaultWholesaleLogisticsFilters,
  getInitialWholesaleLogisticsData,
  getWholesaleReferralWaybillCounts,
  type WholesaleReferralWaybillCount,
} from "./wholesale-logistics-page";
import { scopeWholesaleRows } from "./wholesale-scope";
import {
  getWholesaleOrderPage,
  type WholesaleOrderFilters,
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
import type {
  Wholesale1688Order,
  WholesaleCommission,
  WholesaleCustomer,
  WholesaleOrder,
  WholesaleOrderChangeLog,
  WholesaleOrderEditRequest,
  WholesaleOrderSettlement,
  WholesalePageData,
  WholesaleProfile,
  WholesaleReferral,
} from "./wholesale-types";

export * from "./wholesale-types";

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
      orderChangeLogs: orderPage?.orderChangeLogs ?? [],
      orderEditRequests: orderPage?.orderEditRequests ?? [],
      orderEditSettings,
      orderPage,
      orderPageError: orderPageResult.error,
      // 订单列表会按当前角色裁剪内部字段；只有具备内部查看权限时，其他批发板块才接收完整订单。
      orders: orderPage?.canViewInternalFields
        ? (orderPage.orders as WholesaleOrder[])
        : [],
      orderSettlements: orderPage?.orderSettlements ?? [],
      profiles,
      purchaseOrders: orderPage?.purchaseOrders ?? [],
    };
  }

  if (section === "logistics") {
    const logisticsFilters = getDefaultWholesaleLogisticsFilters(
      currentRole,
      currentUserId,
    );
    const [customers, profiles, logisticsData] = await Promise.all([
      getWholesaleCustomers(supabase),
      getWholesaleProfiles(supabase, false),
      getInitialWholesaleLogisticsData(supabase, logisticsFilters),
    ]);

    return {
      ...baseData,
      ...logisticsData,
      customers,
      logisticsFilters,
      profiles,
    };
  }

  const rows = await getWholesaleSectionRows(supabase, section, currentRole);
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
  referralWaybillCounts: WholesaleReferralWaybillCount[];
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
  currentRole: AppRole | null,
): Promise<WholesaleSectionRows> {
  const rows = createEmptyWholesaleSectionRows();
  const canViewInternalFields = currentRole !== "client";

  if (section === "order-claims") {
    const [customers, orders, purchaseOrders, profileResult] =
      await Promise.all([
        getWholesaleCustomers(supabase),
        getAllWholesaleOrders(supabase, canViewInternalFields),
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
      referralWaybillCounts,
      commissions,
      referrals,
      profiles,
      exchangeRates,
      commissionRuleSettings,
    ] = await Promise.all([
      getWholesaleCustomers(supabase),
      getAllWholesaleOrders(supabase, canViewInternalFields),
      getWholesaleReferralWaybillCounts(supabase),
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
      referralWaybillCounts,
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
    logisticsAssignments: [],
    logisticsFilters: null,
    logisticsPage: null,
    logisticsStoreOptions: [],
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
    referralWaybillCounts: [],
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

async function getAllWholesaleOrders(
  supabase: SupabaseClient,
  canViewInternalFields: boolean,
) {
  const columns = canViewInternalFields
    ? "*"
    : "id,order_number,customer_id,sales_user_id,small_order_count,packing_fee,courier_company,settlement_exchange_rate,customer_payment_currency,customer_payment_amount,customer_payment_rmb_amount,gross_profit,gross_margin,unit_gross_profit,commission_rate,notes,order_month,status,ordered_at,settled_at,created_by_user_id,created_at,updated_at";

  return queryRows<WholesaleOrder>(
    supabase
      .from("wholesale_orders")
      .select(columns as "*")
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
