import type { AppRole } from "./auth-routing";
import type {
  Wholesale1688ClaimGroup,
  Wholesale1688ClaimGroupOrder,
  Wholesale1688ClaimGroupPurchase,
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
  purchaseClaimGroups: Wholesale1688ClaimGroup[];
  purchaseClaimGroupOrders: Wholesale1688ClaimGroupOrder[];
  purchaseClaimGroupPurchases: Wholesale1688ClaimGroupPurchase[];
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
  purchaseClaimGroups,
  purchaseClaimGroupOrders,
  purchaseClaimGroupPurchases,
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
  // 采购订单和认领组已经由数据库 RLS 按角色裁剪，这里只处理未登录的空状态。
  const scopedPurchaseOrders = currentUserId ? purchaseOrders : [];
  const scopedPurchaseClaimGroups = currentUserId ? purchaseClaimGroups : [];
  const scopedPurchaseClaimGroupOrders = currentUserId
    ? purchaseClaimGroupOrders
    : [];
  const scopedPurchaseClaimGroupPurchases = currentUserId
    ? purchaseClaimGroupPurchases
    : [];
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
    purchaseClaimGroups: scopedPurchaseClaimGroups,
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
    purchaseClaimGroups: scopedPurchaseClaimGroups,
    purchaseClaimGroupOrders: scopedPurchaseClaimGroupOrders,
    purchaseClaimGroupPurchases: scopedPurchaseClaimGroupPurchases,
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
