import type {
  WholesaleOrder,
  WholesaleOrderSettlement,
  WholesaleProfile,
} from "@/lib/wholesale";
import type {
  WholesaleSettlementRelease,
  WholesaleSettlementReleaseStatus,
} from "@/lib/wholesale-settlement-releases";

import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getProfileName,
} from "./wholesale-display";

export const WHOLESALE_SETTLEMENT_RELEASE_STATUS_LABELS: Record<
  WholesaleSettlementReleaseStatus,
  string
> = {
  cancelled: "已取消",
  claimed: "已匹配",
  pending: "待认领",
};

export function getSettlementReleaseStatusTone(
  status: WholesaleSettlementReleaseStatus,
): "danger" | "success" | "warning" {
  if (status === "claimed") return "success";
  if (status === "cancelled") return "danger";
  return "warning";
}

export function getWholesaleOrderSettledAmount(
  orderId: string,
  orderSettlementsByOrderId: Map<string, WholesaleOrderSettlement[]>,
) {
  return (orderSettlementsByOrderId.get(orderId) ?? []).reduce(
    (sum, settlement) => sum + Number(settlement.settlement_amount ?? 0),
    0,
  );
}

export function getWholesaleOrderRemainingAmount(
  order: WholesaleOrder,
  orderSettlementsByOrderId: Map<string, WholesaleOrderSettlement[]>,
) {
  return Math.max(
    Number(order.customer_payment_amount ?? 0) -
      getWholesaleOrderSettledAmount(order.id, orderSettlementsByOrderId),
    0,
  );
}

export function getSettlementReleaseSearchText({
  ordersById,
  profilesById,
  release,
}: {
  ordersById: Map<string, WholesaleOrder>;
  profilesById: Map<string, WholesaleProfile>;
  release: WholesaleSettlementRelease;
}) {
  const matchedOrder = release.matched_order_id
    ? ordersById.get(release.matched_order_id)
    : null;

  return [
    release.customer_name,
    release.release_currency,
    release.note ?? "",
    WHOLESALE_SETTLEMENT_RELEASE_STATUS_LABELS[release.status],
    matchedOrder?.order_number ?? "",
    getProfileName(profilesById, release.published_by_user_id),
    getProfileName(profilesById, release.claimed_by_user_id),
  ].join(" ");
}

export function formatSettlementReleaseSummary(
  release: WholesaleSettlementRelease,
) {
  return `${release.customer_name} / ${formatCurrency(
    release.release_amount,
    release.release_currency,
  )} / ${formatDate(release.received_on)}`;
}

export function formatSettlementReleaseHandledAt(
  release: WholesaleSettlementRelease,
) {
  if (release.status === "claimed") {
    return formatDateTime(release.claimed_at);
  }

  if (release.status === "cancelled") {
    return formatDateTime(release.cancelled_at);
  }

  return "等待处理";
}
