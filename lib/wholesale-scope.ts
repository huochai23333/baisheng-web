import type { AppRole } from "./auth-routing";
import type {
  Wholesale1688Order,
  WholesaleCommission,
  WholesaleCustomer,
  WholesaleLogisticsOrder,
  WholesaleOrderChangeLog,
  WholesaleOrderEditRequest,
  WholesaleOrder,
  WholesaleOrderSettlement,
  WholesaleProfile,
  WholesaleReferral,
} from "./wholesale";
import type { WholesaleLogisticsStatus } from "./wholesale-logistics-statuses";
import {
  scopeWholesaleCommissions,
  scopeWholesaleOrderChangeLogs,
  scopeWholesaleOrderEditRequests,
  scopeWholesaleOrderSettlements,
  scopeWholesaleProfiles,
  scopeWholesaleReferrals,
} from "./wholesale-scope-related";
import {
  canReadFullWholesaleBackoffice,
  canReadFullWholesaleDirectory,
  canUseWholesaleSalesScope,
} from "./wholesale-scope-role-rules";

type ScopeWholesaleRowsInput = {
  commissions: WholesaleCommission[];
  currentRole: AppRole | null;
  currentUserId: string | null;
  customers: WholesaleCustomer[];
  logisticsOrders: WholesaleLogisticsOrder[];
  logisticsStatuses: WholesaleLogisticsStatus[];
  orderChangeLogs: WholesaleOrderChangeLog[];
  orderEditRequests: WholesaleOrderEditRequest[];
  orderSettlements: WholesaleOrderSettlement[];
  orders: WholesaleOrder[];
  profiles: WholesaleProfile[];
  purchaseOrders: Wholesale1688Order[];
  referrals: WholesaleReferral[];
  registeredCandidates: WholesaleProfile[];
};

export function scopeWholesaleRows({
  commissions,
  currentRole,
  currentUserId,
  customers,
  logisticsOrders,
  logisticsStatuses,
  orderChangeLogs,
  orderEditRequests,
  orderSettlements,
  orders,
  profiles,
  purchaseOrders,
  referrals,
  registeredCandidates,
}: ScopeWholesaleRowsInput) {
  const scopedCustomers = scopeWholesaleCustomers({
    currentRole,
    currentUserId,
    customers,
  });
  const customerIds = new Set(scopedCustomers.map((customer) => customer.id));
  const scopedOrders = scopeWholesaleOrders({
    currentRole,
    currentUserId,
    customerIds,
    orders,
  });
  const orderIds = new Set(scopedOrders.map((order) => order.id));
  const scopedPurchaseOrders = scopeWholesalePurchaseOrders({
    currentRole,
    currentUserId,
    customerIds,
    orderIds,
    purchaseOrders,
  });
  const scopedLogisticsOrders = scopeWholesaleLogisticsOrders({
    currentRole,
    currentUserId,
    customerIds,
    logisticsOrders,
    orderIds,
  });
  const scopedLogisticsStatuses = scopeWholesaleLogisticsStatuses({
    currentRole,
    currentUserId,
    customerIds,
    logisticsStatuses,
    orderIds,
  });
  const scopedCommissions = scopeWholesaleCommissions({
    currentRole,
    currentUserId,
    commissions,
    customerIds,
    orderIds,
  });
  const scopedReferrals = scopeWholesaleReferrals({
    currentRole,
    currentUserId,
    customerIds,
    referrals,
  });
  const scopedOrderEditRequests = scopeWholesaleOrderEditRequests({
    currentRole,
    currentUserId,
    orderEditRequests,
    orderIds,
  });
  const scopedOrderChangeLogs = scopeWholesaleOrderChangeLogs({
    currentRole,
    currentUserId,
    orderChangeLogs,
    orderIds,
  });
  const scopedOrderSettlements = scopeWholesaleOrderSettlements({
    currentRole,
    currentUserId,
    orderIds,
    orderSettlements,
  });
  const scopedProfiles = scopeWholesaleProfiles({
    currentRole,
    currentUserId,
    customers: scopedCustomers,
    logisticsOrders: scopedLogisticsOrders,
    logisticsStatuses: scopedLogisticsStatuses,
    orderChangeLogs: scopedOrderChangeLogs,
    orderEditRequests: scopedOrderEditRequests,
    orders: scopedOrders,
    profiles,
    purchaseOrders: scopedPurchaseOrders,
    registeredCandidates,
  });

  return {
    commissions: scopedCommissions,
    customers: scopedCustomers,
    logisticsOrders: scopedLogisticsOrders,
    logisticsStatuses: scopedLogisticsStatuses,
    orderChangeLogs: scopedOrderChangeLogs,
    orderEditRequests: scopedOrderEditRequests,
    orderSettlements: scopedOrderSettlements,
    orders: scopedOrders,
    profiles: scopedProfiles,
    purchaseOrders: scopedPurchaseOrders,
    referrals: scopedReferrals,
    registeredCandidates,
  };
}

function scopeWholesaleLogisticsStatuses({
  currentRole,
  currentUserId,
  customerIds,
  logisticsStatuses,
  orderIds,
}: {
  currentRole: AppRole | null;
  currentUserId: string | null;
  customerIds: Set<string>;
  logisticsStatuses: WholesaleLogisticsStatus[];
  orderIds: Set<string>;
}) {
  if (
    currentRole === "administrator" ||
    currentRole === "finance" ||
    currentRole === "salesman"
  ) {
    return logisticsStatuses;
  }

  if (!currentUserId) {
    return [];
  }

  if (currentRole === "client") {
    // 客户物流状态必须明确关联到自己可见的批发订单，不能只靠客户名称或创建人兜底。
    return logisticsStatuses.filter(
      (status) =>
        status.wholesale_order_id !== null &&
        orderIds.has(status.wholesale_order_id),
    );
  }

  return logisticsStatuses.filter(
    (status) =>
      (status.customer_id ? customerIds.has(status.customer_id) : false) ||
      (status.wholesale_order_id
        ? orderIds.has(status.wholesale_order_id)
        : false) ||
      status.created_by_user_id === currentUserId,
  );
}

function scopeWholesaleCustomers({
  currentRole,
  currentUserId,
  customers,
}: {
  currentRole: AppRole | null;
  currentUserId: string | null;
  customers: WholesaleCustomer[];
}) {
  if (canReadFullWholesaleDirectory(currentRole)) {
    return customers;
  }

  if (!currentUserId) {
    return [];
  }

  return customers.filter((customer) => {
    if (canUseWholesaleSalesScope(currentRole)) {
      return (
        customer.assigned_sales_user_id === currentUserId ||
        customer.created_by_user_id === currentUserId
      );
    }

    if (currentRole === "client") {
      return customer.registered_user_id === currentUserId;
    }

    return false;
  });
}

function scopeWholesaleOrders({
  currentRole,
  currentUserId,
  customerIds,
  orders,
}: {
  currentRole: AppRole | null;
  currentUserId: string | null;
  customerIds: Set<string>;
  orders: WholesaleOrder[];
}) {
  if (canReadFullWholesaleBackoffice(currentRole)) {
    return orders;
  }

  if (!currentUserId) {
    return [];
  }

  if (currentRole === "client") {
    return orders.filter((order) => customerIds.has(order.customer_id));
  }

  return orders.filter(
    (order) =>
      customerIds.has(order.customer_id) ||
      order.sales_user_id === currentUserId ||
      order.created_by_user_id === currentUserId,
  );
}

function scopeWholesalePurchaseOrders({
  currentRole,
  currentUserId,
  customerIds,
  orderIds,
  purchaseOrders,
}: {
  currentRole: AppRole | null;
  currentUserId: string | null;
  customerIds: Set<string>;
  orderIds: Set<string>;
  purchaseOrders: Wholesale1688Order[];
}) {
  if (canReadFullWholesaleBackoffice(currentRole)) {
    return purchaseOrders;
  }

  if (!currentUserId) {
    return [];
  }

  return purchaseOrders.filter((order) => {
    const isUnclaimedHallOrder =
      !order.customer_id && !order.wholesale_order_id;

    return (
      (order.customer_id ? customerIds.has(order.customer_id) : false) ||
      (order.wholesale_order_id
        ? orderIds.has(order.wholesale_order_id)
        : false) ||
      order.claimed_by_user_id === currentUserId ||
      order.imported_by_user_id === currentUserId ||
      (canUseWholesaleSalesScope(currentRole) && isUnclaimedHallOrder)
    );
  });
}

function scopeWholesaleLogisticsOrders({
  currentRole,
  currentUserId,
  customerIds,
  logisticsOrders,
  orderIds,
}: {
  currentRole: AppRole | null;
  currentUserId: string | null;
  customerIds: Set<string>;
  logisticsOrders: WholesaleLogisticsOrder[];
  orderIds: Set<string>;
}) {
  if (canReadFullWholesaleBackoffice(currentRole)) {
    return logisticsOrders;
  }

  if (!currentUserId) {
    return [];
  }

  if (currentRole === "client") {
    // 客户只能查看已经绑定到自己批发订单的物流费用记录。
    return logisticsOrders.filter(
      (order) =>
        order.wholesale_order_id !== null &&
        orderIds.has(order.wholesale_order_id),
    );
  }

  return logisticsOrders.filter(
    (order) =>
      (order.customer_id ? customerIds.has(order.customer_id) : false) ||
      (order.wholesale_order_id
        ? orderIds.has(order.wholesale_order_id)
        : false) ||
      order.created_by_user_id === currentUserId,
  );
}
