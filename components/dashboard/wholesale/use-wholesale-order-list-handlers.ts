"use client";

import { useCallback } from "react";

import type { AppRole } from "@/lib/auth-routing";
import type {
  WholesaleCustomer,
  WholesaleOrderListItem,
} from "@/lib/wholesale";
import type { WholesaleOrderListAttachment } from "@/lib/wholesale-order-list-attachments";
import { canCurrentUserManageWholesaleOrder } from "./wholesale-order-edit-rules";

type RefreshAfter = <Result>(
  action: () => Result | Promise<Result>,
) => Promise<Result>;

/**
 * 附件权限和上传参数集中在这里组装，订单 Section 只负责把结果交给桌面表格和手机列表。
 */
export function useWholesaleOrderListHandlers({
  attachmentsByOrderId,
  canEdit,
  canManageAllOrders,
  currentRole,
  currentUserId,
  customersById,
  onDelete,
  onDeleted,
  onUpload,
  refreshAfter,
}: {
  attachmentsByOrderId: Map<string, WholesaleOrderListAttachment[]>;
  canEdit: boolean;
  canManageAllOrders: boolean;
  currentRole: AppRole | null;
  currentUserId: string | null;
  customersById: Map<string, WholesaleCustomer>;
  onDelete: (attachment: WholesaleOrderListAttachment) => Promise<boolean>;
  onDeleted: (attachmentId: string) => void;
  onUpload: (options: {
    existingAttachments: WholesaleOrderListAttachment[];
    files: File[];
    orderId: string;
    uploadedByUserId: string;
  }) => Promise<boolean>;
  refreshAfter: RefreshAfter;
}) {
  const canManage = useCallback(
    (order: WholesaleOrderListItem) => {
      if (!currentUserId) return false;
      if (currentRole === "administrator" || currentRole === "finance") {
        return true;
      }

      return (
        currentRole === "salesman" &&
        canCurrentUserManageWholesaleOrder({
          canEdit,
          canManageAllOrders,
          currentUserId,
          customer: customersById.get(order.customer_id),
          order,
        })
      );
    },
    [
      canEdit,
      canManageAllOrders,
      currentRole,
      currentUserId,
      customersById,
    ],
  );

  const deleteAttachment = useCallback(
    async (attachment: WholesaleOrderListAttachment) => {
      const succeeded = await onDelete(attachment);

      if (succeeded) {
        onDeleted(attachment.id);
      }
    },
    [onDelete, onDeleted],
  );

  const uploadAttachments = useCallback(
    (order: WholesaleOrderListItem, files: File[]) => {
      if (!currentUserId) return Promise.resolve(false);

      return refreshAfter(() =>
        onUpload({
          existingAttachments: attachmentsByOrderId.get(order.id) ?? [],
          files,
          orderId: order.id,
          uploadedByUserId: currentUserId,
        }),
      );
    },
    [attachmentsByOrderId, currentUserId, onUpload, refreshAfter],
  );

  return {
    canManageOrderListAttachments: canManage,
    deleteOrderListAttachment: deleteAttachment,
    uploadOrderListAttachments: uploadAttachments,
  };
}
