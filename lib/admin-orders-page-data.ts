import type { SupabaseClient } from "@supabase/supabase-js";

import {
  filterOrderTypeOptionsForBusinessScope,
  getAdminOrderBusinessScope,
  getOrderTypeIdsForBusinessScope,
} from "./admin-orders-business-scope";
import { getAdminOrderCount, queryAdminOrders, type AdminOrderOverviewFilters } from "./admin-orders-query";
import {
  getAdminOrderCosts,
  mergeAdminOrdersWithCosts,
} from "./admin-orders-costs";
import {
  getOrderDiscountTypeOptions,
  getOrderTypeOptions,
  getOrderUserOptions,
  getPurchaseOrderTypeOptions,
  getServiceFeeTypeOptions,
  getServiceOrderPriceOptions,
  getServiceOrderTypeOptions,
} from "./admin-orders-options";
import {
  getAdminOrderServiceFees,
  mergeAdminOrdersWithServiceFees,
} from "./admin-orders-service-fees";
import {
  canReadOrderByRole,
  canReadOrderCostByRole,
  getCurrentOrderViewerContext,
} from "./admin-orders-viewer";
import {
  DEFAULT_DASHBOARD_PAGE_SIZE,
  getDashboardPaginationState,
  getDashboardQueryRangeForPage,
} from "./dashboard-pagination";
import { getLatestCnyExchangeRates } from "./exchange-rates";
import {
  getShanghaiOrderDateBounds,
} from "./order-date-range";
import { normalizePositiveInteger } from "./value-normalizers";
import type { AdminOrdersFilters, AdminOrdersPageData } from "./admin-orders-types";
import type { AppRole, UserStatus } from "./user-self-service";
import {
  normalizeAdminOrdersFilters,
  resolveAdminOrderUserFilter,
} from "./admin-orders-page-filters";

export {
  normalizeAdminOrdersFilters,
  parseAdminOrdersSearchParams,
} from "./admin-orders-page-filters";

export async function getAdminOrdersPageData(
  supabase: SupabaseClient,
  options: {
    filters?: Partial<AdminOrdersFilters> | null;
    includeOrderCosts?: boolean;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<AdminOrdersPageData> {
  const filters = normalizeAdminOrdersFilters(options.filters);
  const pageSize = normalizePositiveInteger(options.pageSize, DEFAULT_DASHBOARD_PAGE_SIZE);
  const requestedPage = normalizePositiveInteger(options.page, 1);
  const viewer = await getCurrentOrderViewerContext(supabase);

  if (!viewer) {
    return createEmptyAdminOrdersPageData({
      filters,
      page: requestedPage,
      pageSize,
    });
  }

  const businessScope = await getAdminOrderBusinessScope(supabase, viewer.role);
  const canViewOrders =
    canReadOrderByRole(viewer.role, viewer.status) &&
    businessScope.canViewAssignedBoards;
  const canViewOrderCosts =
    options.includeOrderCosts === true && canReadOrderCostByRole(viewer.role, viewer.status);

  if (!canViewOrders) {
    return {
      ...createEmptyAdminOrdersPageData({
        currentViewerId: viewer.user.id,
        currentViewerRole: viewer.role,
        currentViewerStatus: viewer.status,
        filters,
        page: requestedPage,
        pageSize,
      }),
      canViewOrders: false,
    };
  }

  const [
    userOptions,
    allOrderTypeOptions,
    purchaseOrderTypeOptions,
    serviceOrderTypeOptions,
    orderDiscountOptions,
    serviceFeeTypeOptions,
    serviceOrderPriceOptions,
    orderCurrencyRates,
  ] = await Promise.all([
    getOrderUserOptions(supabase),
    getOrderTypeOptions(supabase),
    getPurchaseOrderTypeOptions(supabase),
    getServiceOrderTypeOptions(supabase),
    getOrderDiscountTypeOptions(supabase),
    getServiceFeeTypeOptions(supabase),
    getServiceOrderPriceOptions(supabase),
    getLatestCnyExchangeRates(supabase),
  ]);
  const orderTypeOptions = filterOrderTypeOptionsForBusinessScope(
    allOrderTypeOptions,
    businessScope,
  );
  const businessOrderTypeIds = getOrderTypeIdsForBusinessScope(
    orderTypeOptions,
    businessScope,
  );

  if (businessOrderTypeIds !== null && businessOrderTypeIds.length === 0) {
    return {
      canViewOrderCosts,
      canViewOrders,
      currentViewerId: viewer.user.id,
      currentViewerRole: viewer.role,
      currentViewerStatus: viewer.status,
      filters,
      matchedOrdersCount: 0,
      orderDiscountOptions,
      orderTypeOptions,
      orders: [],
      pagination: getDashboardPaginationState(0, requestedPage, pageSize),
      purchaseOrderTypeOptions,
      serviceFeeTypeOptions,
      serviceOrderPriceOptions,
      serviceOrderTypeOptions,
      summary: {
        completed: 0,
        pending: 0,
        total: 0,
      },
      orderCurrencyRates,
      totalOrdersCount: 0,
      userOptions,
    };
  }

  const businessOrderFilter: Pick<AdminOrderOverviewFilters, "orderTypeIds"> =
    businessOrderTypeIds !== null
      ? {
          orderTypeIds: businessOrderTypeIds,
        }
      : {};
  const dateBounds = getShanghaiOrderDateBounds({
    fromDate: filters.createdFromDate,
    toDate: filters.createdToDate,
  });
  const dateRangeFilter: Pick<
    AdminOrderOverviewFilters,
    "createdFrom" | "createdToExclusive"
  > = {
    createdFrom: dateBounds.fromInclusive,
    createdToExclusive: dateBounds.toExclusive,
  };
  const [
    totalOrdersCount,
    pendingOrdersCount,
    completedOrdersCount,
  ] = await Promise.all([
    getAdminOrderCount(supabase, {
      ...businessOrderFilter,
      ...dateRangeFilter,
    }),
    getAdminOrderCount(supabase, {
      ...businessOrderFilter,
      ...dateRangeFilter,
      orderStatus: "pending",
    }),
    getAdminOrderCount(supabase, {
      ...businessOrderFilter,
      ...dateRangeFilter,
      orderStatus: "completed",
    }),
  ]);

  const orderEntryUserFilter = resolveAdminOrderUserFilter(
    userOptions,
    filters.orderEntryUser,
  );
  const orderingUserFilter = resolveAdminOrderUserFilter(
    userOptions,
    filters.orderingUser,
  );

  const filterHasNoMatches =
    filters.searchMode === "date_range" &&
    (orderEntryUserFilter.hasNoMatches || orderingUserFilter.hasNoMatches);
  const orderFilters: AdminOrderOverviewFilters = {
    ...businessOrderFilter,
    ...(filters.searchMode === "date_range" ? dateRangeFilter : {}),
    ...(filters.searchMode === "exact_all_time"
      ? { orderNumberExact: filters.orderNumber }
      : {
          orderEntryUserIds: orderEntryUserFilter.userIds,
          orderNumber: filters.orderNumber,
          orderingUserIds: orderingUserFilter.userIds,
        }),
  };
  const matchedOrdersCount = filterHasNoMatches
    ? 0
    : await getAdminOrderCount(supabase, orderFilters);
  const pagination = getDashboardPaginationState(
    matchedOrdersCount,
    requestedPage,
    pageSize,
  );

  if (matchedOrdersCount === 0) {
    return {
      canViewOrderCosts,
      canViewOrders,
      currentViewerId: viewer.user.id,
      currentViewerRole: viewer.role,
      currentViewerStatus: viewer.status,
      filters,
      matchedOrdersCount,
      orderDiscountOptions,
      orderTypeOptions,
      orders: [],
      pagination,
      purchaseOrderTypeOptions,
      serviceFeeTypeOptions,
      serviceOrderPriceOptions,
      serviceOrderTypeOptions,
      summary: {
        completed: completedOrdersCount,
        pending: pendingOrdersCount,
        total: totalOrdersCount,
      },
      orderCurrencyRates,
      totalOrdersCount,
      userOptions,
    };
  }

  const orders = await queryAdminOrders(supabase, {
    filters: orderFilters,
    range: getDashboardQueryRangeForPage(pagination.page, pagination.pageSize),
  });
  const orderIds = orders.map((order) => order.id);
  const [orderCosts, orderServiceFees] = await Promise.all([
    canViewOrderCosts && orderIds.length > 0
      ? getAdminOrderCosts(supabase, orderIds)
      : Promise.resolve([]),
    getAdminOrderServiceFees(supabase, orderIds),
  ]);
  const ordersWithServiceFees = mergeAdminOrdersWithServiceFees(
    orders,
    orderServiceFees,
  );

  return {
    canViewOrderCosts,
    canViewOrders,
    currentViewerId: viewer.user.id,
    currentViewerRole: viewer.role,
    currentViewerStatus: viewer.status,
    filters,
    matchedOrdersCount,
    orderDiscountOptions,
    orderTypeOptions,
    orders: canViewOrderCosts
      ? mergeAdminOrdersWithCosts(ordersWithServiceFees, orderCosts)
      : ordersWithServiceFees,
    pagination,
    purchaseOrderTypeOptions,
    serviceFeeTypeOptions,
    serviceOrderPriceOptions,
    serviceOrderTypeOptions,
    summary: {
      completed: completedOrdersCount,
      pending: pendingOrdersCount,
      total: totalOrdersCount,
    },
    orderCurrencyRates,
    totalOrdersCount,
    userOptions,
  };
}

function createEmptyAdminOrdersPageData(options: {
  currentViewerId?: string | null;
  currentViewerRole?: AppRole | null;
  currentViewerStatus?: UserStatus | null;
  filters: AdminOrdersFilters;
  page: number;
  pageSize: number;
}): AdminOrdersPageData {
  return {
    canViewOrderCosts: false,
    canViewOrders: false,
    currentViewerId: options.currentViewerId ?? null,
    currentViewerRole: options.currentViewerRole ?? null,
    currentViewerStatus: options.currentViewerStatus ?? null,
    filters: options.filters,
    matchedOrdersCount: 0,
    orderDiscountOptions: [],
    orderTypeOptions: [],
    orders: [],
    pagination: getDashboardPaginationState(0, options.page, options.pageSize),
    purchaseOrderTypeOptions: [],
    serviceFeeTypeOptions: [],
    serviceOrderPriceOptions: [],
    serviceOrderTypeOptions: [],
    summary: {
      completed: 0,
      pending: 0,
      total: 0,
    },
    orderCurrencyRates: [],
    totalOrdersCount: 0,
    userOptions: [],
  };
}
