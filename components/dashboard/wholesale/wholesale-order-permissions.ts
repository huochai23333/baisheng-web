import type {
  WholesaleCustomer,
  WholesaleOrderListItem,
} from "@/lib/wholesale";

/**
 * 判断当前账号能否管理这一笔订单。
 * 页面用它隐藏无效操作，数据库 RPC 仍会再次执行最终权限校验。
 */
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

  // 普通非协作角色仍只能处理本人负责、本人创建或本人客户名下的订单。
  return (
    order.sales_user_id === currentUserId ||
    order.created_by_user_id === currentUserId ||
    customer?.assigned_sales_user_id === currentUserId ||
    customer?.created_by_user_id === currentUserId
  );
}
