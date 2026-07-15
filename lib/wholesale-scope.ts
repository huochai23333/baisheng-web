import type { AppRole } from "./auth-routing";
import type {
  Wholesale1688Order,
  WholesaleCommission,
  WholesaleCustomer,
  WholesaleOrderChangeLog,
  WholesaleOrderEditRequest,
  WholesaleOrder,
  WholesaleOrderSettlement,
  WholesaleProfile,
  WholesaleReferral,
} from "./wholesale";
import type { WholesaleReferralWaybillCount } from "./wholesale-logistics-page";
import {
  scopeWholesaleCommissions,
  scopeWholesaleOrderChangeLogs,
  scopeWholesaleOrderEditRequests,
  scopeWholesaleOrderSettlements,
  scopeWholesaleProfiles,
  scopeWholesaleReferrals,
} from "./wholesale-scope-related";
import {
  canCollaborateAcrossWholesale,
  canReadFullWholesaleBackoffice,
  canReadFullWholesaleDirectory,
  canUseWholesaleSalesScope,
} from "./wholesale-role-permissions";

type ScopeWholesaleRowsInput = {
  commissions: WholesaleCommission[];
  currentRole: AppRole | null;
  currentUserId: string | null;
  customers: WholesaleCustomer[];
  referralWaybillCounts: WholesaleReferralWaybillCount[];
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
  referralWaybillCounts,
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
    referralWaybillCounts,
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
  if (
    canReadFullWholesaleBackoffice(currentRole) ||
    canCollaborateAcrossWholesale(currentRole)
  ) {
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
  if (
    canReadFullWholesaleBackoffice(currentRole) ||
    canCollaborateAcrossWholesale(currentRole)
  ) {
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
