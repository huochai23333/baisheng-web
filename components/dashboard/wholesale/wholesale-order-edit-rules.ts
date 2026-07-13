import type {
  WholesaleCustomer,
  WholesaleOrderListItem,
} from "@/lib/wholesale";

export type WholesaleOrderEditMode = "direct" | "request";

export function getWholesaleOrderEditMode({
  canBypassEditWindow,
  editWindowDays,
  order,
}: {
  canBypassEditWindow: boolean;
  editWindowDays: number;
  order: WholesaleOrderListItem;
}): WholesaleOrderEditMode {
  if (canBypassEditWindow) {
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
  canManageEveryOrder,
  currentUserId,
  customer,
  order,
}: {
  canEdit: boolean;
  canManageEveryOrder: boolean;
  currentUserId: string | null;
  customer: WholesaleCustomer | undefined;
  order: WholesaleOrderListItem;
}) {
  if (!canEdit) {
    return false;
  }

  if (canManageEveryOrder) {
    return true;
  }

  if (!currentUserId) {
    return false;
  }

  // 这里与数据库的订单管理范围保持一致，普通非协作角色仍只能处理自己负责的订单。
  return (
    order.sales_user_id === currentUserId ||
    order.created_by_user_id === currentUserId ||
    customer?.assigned_sales_user_id === currentUserId ||
    customer?.created_by_user_id === currentUserId
  );
}
