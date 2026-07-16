import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Wholesale1688ClaimGroup,
  Wholesale1688ClaimGroupOrder,
  Wholesale1688ClaimGroupPurchase,
  Wholesale1688Order,
  WholesaleLinked1688Order,
  WholesaleOrder,
  WholesaleOrderListItem,
  WholesaleOrderChangeLog,
  WholesaleOrderEditRequest,
  WholesaleOrderSettlement,
} from "./wholesale";
import type { WholesaleOrderListAttachment } from "./wholesale-order-list-attachments";
import {
  normalizeOrderDateRange,
  type OrderSearchMode,
} from "./order-date-range";

export type WholesaleOrderFilters = {
  customerId: string;
  orderedFromDate: string;
  orderedToDate: string;
  salesUserId: string;
  searchText: string;
  searchMode: OrderSearchMode;
  status: "all" | WholesaleOrder["status"];
};

export type WholesaleOrderCursor = {
  id: string;
  orderedAt: string;
};

export type WholesaleOrderPageWarning = {
  area: "attachments" | "changes" | "purchases" | "settlements";
  message: string;
};

export type WholesaleOrderPageSummary = {
  averageMargin: number | null;
  customerPaymentRmbAmount: number;
  grossProfitAmount: number;
  internationalShippingFeeAmount?: number;
  orderCount: number;
  otherFeeAmount?: number;
  packingFeeAmount: number;
  partialSettledCount: number;
  productPurchaseAmount?: number;
  referralCommissionFeeAmount?: number;
  settledCount: number;
  unsettledCount: number;
};

export type WholesaleOrderPage = {
  canViewInternalFields: boolean;
  nextCursor: WholesaleOrderCursor | null;
  orderChangeLogs: WholesaleOrderChangeLog[];
  orderEditRequests: WholesaleOrderEditRequest[];
  orderListAttachments: WholesaleOrderListAttachment[];
  orders: WholesaleOrderListItem[];
  orderSettlements: WholesaleOrderSettlement[];
  purchaseOrders: WholesaleLinked1688Order[];
  summary: WholesaleOrderPageSummary;
  totalCount: number;
  warnings: WholesaleOrderPageWarning[];
};

export const WHOLESALE_ORDER_PAGE_SIZE = 20;

/**
 * 核心订单、总数和汇总由一个 RPC 返回；关联记录只按这一批订单 ID 查询。
 * 核心查询失败会直接抛错，关联查询失败则留下局部警告，避免伪装成“暂无记录”。
 */
export async function getWholesaleOrderPage(
  supabase: SupabaseClient,
  filters: WholesaleOrderFilters,
  cursor: WholesaleOrderCursor | null = null,
  limit = WHOLESALE_ORDER_PAGE_SIZE,
): Promise<WholesaleOrderPage> {
  const dateRange = normalizeOrderDateRange({
    fromDate: filters.orderedFromDate,
    toDate: filters.orderedToDate,
  });
  const { data, error } = await supabase.rpc("get_wholesale_order_page", {
    p_cursor: cursor,
    p_filters: {
      ...filters,
      orderedFromDate: dateRange.fromDate,
      orderedToDate: dateRange.toDate,
      searchText: filters.searchText.trim(),
    },
    p_limit: limit,
  });

  if (error) {
    throw new Error("批发订单暂时没有加载成功，请稍后重试。", {
      cause: error,
    });
  }

  const core = readRecord(data);
  const canViewInternalFields = core?.canViewInternalFields === true;
  const orders = readArray(core?.orders) as WholesaleOrderListItem[];

  if (!core || !Array.isArray(core.orders)) {
    throw new Error("批发订单暂时没有加载成功，请稍后重试。");
  }

  const orderIds = orders.map((order) => order.id);
  const warnings: WholesaleOrderPageWarning[] = [];

  if (orderIds.length === 0) {
    return {
      canViewInternalFields,
      nextCursor: readCursor(core.nextCursor),
      orderChangeLogs: [],
      orderEditRequests: [],
      orderListAttachments: [],
      orders,
      orderSettlements: [],
      purchaseOrders: [],
      summary: readSummary(core.summary),
      totalCount: readNumber(core.totalCount),
      warnings,
    };
  }

  const [
    settlementsResult,
    purchaseOrdersResult,
    editRequestsResult,
    changeLogsResult,
    attachmentsResult,
  ] = await Promise.all([
    supabase
      .from("wholesale_order_settlements")
      .select("*")
      .in("order_id", orderIds)
      .order("settled_on", { ascending: false })
      .order("created_at", { ascending: false }),
    getLinkedPurchaseOrders(supabase, orderIds, canViewInternalFields),
    canViewInternalFields
      ? supabase
          .from("wholesale_order_edit_requests")
          .select("*")
          .in("order_id", orderIds)
          .order("created_at", { ascending: false })
      : emptyRelatedQuery(),
    canViewInternalFields
      ? supabase
          .from("wholesale_order_change_logs")
          .select("*")
          .in("order_id", orderIds)
          .order("created_at", { ascending: false })
      : emptyRelatedQuery(),
    supabase
      .from("wholesale_order_list_attachments")
      .select("*")
      .in("order_id", orderIds)
      .order("created_at", { ascending: true }),
  ]);

  return {
    canViewInternalFields,
    nextCursor: readCursor(core.nextCursor),
    orderChangeLogs: readRelatedRows<WholesaleOrderChangeLog>(
      changeLogsResult,
      warnings,
      "changes",
      "部分订单修改记录暂时没有加载成功。",
    ),
    orderEditRequests: readRelatedRows<WholesaleOrderEditRequest>(
      editRequestsResult,
      warnings,
      "changes",
      "部分订单修改申请暂时没有加载成功。",
    ),
    orderListAttachments: readRelatedRows<WholesaleOrderListAttachment>(
      attachmentsResult,
      warnings,
      "attachments",
      "部分 Order List 附件暂时没有加载成功。",
    ),
    orders,
    orderSettlements: readRelatedRows<WholesaleOrderSettlement>(
      settlementsResult,
      warnings,
      "settlements",
      "部分结汇记录暂时没有加载成功。",
    ),
    purchaseOrders: readRelatedRows<WholesaleLinked1688Order>(
      purchaseOrdersResult,
      warnings,
      "purchases",
      "部分关联采购订单暂时没有加载成功。",
    ),
    summary: readSummary(core.summary),
    totalCount: readNumber(core.totalCount),
    warnings: deduplicateWarnings(warnings),
  };
}

type RelatedQueryResult = {
  data: unknown[] | null;
  error: { message?: string } | null;
};

/**
 * 批发订单和 1688 订单之间现在需要经过认领组查找。
 * 这里把三段关系整理成页面原来易于消费的扁平记录，但不会把同一采购订单重复挂到同一批发订单下。
 */
async function getLinkedPurchaseOrders(
  supabase: SupabaseClient,
  orderIds: string[],
  canViewInternalFields: boolean,
): Promise<RelatedQueryResult> {
  const groupOrdersResult = await supabase
    .from("wholesale_1688_claim_group_orders")
    .select("claim_group_id,wholesale_order_id")
    .in("wholesale_order_id", orderIds);

  if (groupOrdersResult.error) return groupOrdersResult;

  const groupOrders = (groupOrdersResult.data ?? []) as Wholesale1688ClaimGroupOrder[];
  const groupIds = [...new Set(groupOrders.map((row) => row.claim_group_id))];
  if (groupIds.length === 0) return { data: [], error: null };

  const [groupsResult, groupPurchasesResult] = await Promise.all([
    supabase
      .from("wholesale_1688_claim_groups")
      .select("*")
      .in("id", groupIds),
    supabase
      .from("wholesale_1688_claim_group_purchases")
      .select("claim_group_id,purchase_order_id")
      .in("claim_group_id", groupIds),
  ]);

  if (groupsResult.error) return groupsResult;
  if (groupPurchasesResult.error) return groupPurchasesResult;

  const groups = (groupsResult.data ?? []) as Wholesale1688ClaimGroup[];
  const groupPurchases = (groupPurchasesResult.data ?? []) as Wholesale1688ClaimGroupPurchase[];
  const purchaseOrderIds = [
    ...new Set(groupPurchases.map((row) => row.purchase_order_id)),
  ];
  if (purchaseOrderIds.length === 0) return { data: [], error: null };

  // 客户页面不读取采购金额和导入原文，避免把内部采购信息带到浏览器。
  const purchaseOrdersResult = canViewInternalFields
    ? await supabase
        .from("wholesale_1688_orders")
        .select("*")
        .in("id", purchaseOrderIds)
        .order("created_at", { ascending: false })
    : await supabase
        .from("wholesale_1688_orders")
        .select(
          "id,batch_id,external_order_number,seller_name,item_summary,quantity,order_status,purchased_at,recipient_name,assisted_customer_id,assisted_at,imported_by_user_id,created_at",
        )
        .in("id", purchaseOrderIds)
        .order("created_at", { ascending: false });

  if (purchaseOrdersResult.error) return purchaseOrdersResult;

  const groupsById = new Map(groups.map((group) => [group.id, group]));
  const purchaseOrdersById = new Map(
    ((purchaseOrdersResult.data ?? []) as Wholesale1688Order[]).map((order) => [
      order.id,
      order,
    ]),
  );
  const groupOrdersByGroupId = groupByClaimGroup(groupOrders);
  const linkedOrders: WholesaleLinked1688Order[] = [];
  const seenLinks = new Set<string>();

  for (const purchaseLink of groupPurchases) {
    const claimGroup = groupsById.get(purchaseLink.claim_group_id);
    const purchaseOrder = purchaseOrdersById.get(purchaseLink.purchase_order_id);
    if (!claimGroup || !purchaseOrder) continue;

    for (const orderLink of groupOrdersByGroupId.get(claimGroup.id) ?? []) {
      const linkKey = `${orderLink.wholesale_order_id}:${purchaseOrder.id}`;
      if (seenLinks.has(linkKey)) continue;
      seenLinks.add(linkKey);
      linkedOrders.push({
        ...purchaseOrder,
        claim_group_id: claimGroup.id,
        wholesale_order_id: orderLink.wholesale_order_id,
        claimed_by_user_id: claimGroup.claimed_by_user_id,
        claimed_at: claimGroup.claimed_at,
        updated_by_user_id: claimGroup.updated_by_user_id,
        updated_at: claimGroup.updated_at,
      });
    }
  }

  return { data: linkedOrders, error: null };
}

function groupByClaimGroup(rows: Wholesale1688ClaimGroupOrder[]) {
  const grouped = new Map<string, Wholesale1688ClaimGroupOrder[]>();

  for (const row of rows) {
    grouped.set(row.claim_group_id, [
      ...(grouped.get(row.claim_group_id) ?? []),
      row,
    ]);
  }

  return grouped;
}

function emptyRelatedQuery(): Promise<RelatedQueryResult> {
  return Promise.resolve({ data: [], error: null });
}

function readRelatedRows<T>(
  result: RelatedQueryResult,
  warnings: WholesaleOrderPageWarning[],
  area: WholesaleOrderPageWarning["area"],
  message: string,
) {
  if (result.error) {
    warnings.push({ area, message });
    return [] as T[];
  }

  return (result.data ?? []) as T[];
}

function readSummary(value: unknown): WholesaleOrderPageSummary {
  const summary = readRecord(value);

  return {
    averageMargin:
      summary?.averageMargin === null || summary?.averageMargin === undefined
        ? null
        : readNumber(summary.averageMargin),
    customerPaymentRmbAmount: readNumber(summary?.customerPaymentRmbAmount),
    grossProfitAmount: readNumber(summary?.grossProfitAmount),
    orderCount: readNumber(summary?.orderCount),
    packingFeeAmount: readNumber(summary?.packingFeeAmount),
    partialSettledCount: readNumber(summary?.partialSettledCount),
    ...(summary?.internationalShippingFeeAmount === undefined
      ? {}
      : {
          internationalShippingFeeAmount: readNumber(
            summary.internationalShippingFeeAmount,
          ),
        }),
    ...(summary?.otherFeeAmount === undefined
      ? {}
      : { otherFeeAmount: readNumber(summary.otherFeeAmount) }),
    ...(summary?.productPurchaseAmount === undefined
      ? {}
      : { productPurchaseAmount: readNumber(summary.productPurchaseAmount) }),
    ...(summary?.referralCommissionFeeAmount === undefined
      ? {}
      : {
          referralCommissionFeeAmount: readNumber(
            summary.referralCommissionFeeAmount,
          ),
        }),
    settledCount: readNumber(summary?.settledCount),
    unsettledCount: readNumber(summary?.unsettledCount),
  };
}

function readCursor(value: unknown): WholesaleOrderCursor | null {
  const cursor = readRecord(value);

  return cursor && typeof cursor.id === "string" && typeof cursor.orderedAt === "string"
    ? { id: cursor.id, orderedAt: cursor.orderedAt }
    : null;
}

function deduplicateWarnings(warnings: WholesaleOrderPageWarning[]) {
  return Array.from(
    new Map(
      warnings.map((warning) => [`${warning.area}:${warning.message}`, warning]),
    ).values(),
  );
}

function readArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function readNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}
