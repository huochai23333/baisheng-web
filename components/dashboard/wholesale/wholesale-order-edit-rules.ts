import type { WholesaleCustomer, WholesaleOrder } from "@/lib/wholesale";

export type WholesaleOrderEditMode = "direct" | "request";

export function getWholesaleOrderEditMode({
  canManageAllOrders,
  editWindowDays,
  order,
}: {
  canManageAllOrders: boolean;
  editWindowDays: number;
  order: WholesaleOrder;
}): WholesaleOrderEditMode {
  if (canManageAllOrders) {
    return "direct";
  }

  return isWithinWholesaleOrderEditWindow(order.created_at, editWindowDays)
    ? "direct"
    : "request";
}

export function isWithinWholesaleOrderEditWindow(
  createdAt: string | null | undefined,
  editWindowDays: number,
) {
  const createdTime = createdAt ? new Date(createdAt).getTime() : Number.NaN;

  if (!Number.isFinite(createdTime)) {
    return false;
  }

  const windowMs = Math.max(0, editWindowDays) * 24 * 60 * 60 * 1000;

  return Date.now() - createdTime <= windowMs;
}

export function canCurrentUserManageWholesaleOrder({
  canEdit,
  canManageAllOrders,
  currentUserId,
  customer,
  order,
}: {
  canEdit: boolean;
  canManageAllOrders: boolean;
  currentUserId: string | null;
  customer: WholesaleCustomer | undefined;
  order: WholesaleOrder;
}) {
  if (!canEdit) {
    return false;
  }

  if (canManageAllOrders) {
    return true;
  }

  if (!currentUserId) {
    return false;
  }

  // This mirrors the database manage-scope rule for the visible order row.
  return (
    order.sales_user_id === currentUserId ||
    order.created_by_user_id === currentUserId ||
    customer?.assigned_sales_user_id === currentUserId ||
    customer?.created_by_user_id === currentUserId
  );
}
