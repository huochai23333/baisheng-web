import { getBrowserSupabaseClient } from "@/lib/supabase";
import {
  deleteWholesaleOrderListAttachment,
  uploadWholesaleOrderListFiles,
  type WholesaleOrderListAttachment,
} from "@/lib/wholesale-order-list-attachments";

import type { RunWholesaleAction } from "./use-wholesale-action-runner";

/** Order List 附件在当前订单页局部更新，不触发整页刷新。 */
export function createWholesaleOrderListActions(
  runAction: RunWholesaleAction,
) {
  const uploadOrderListAttachments = ({
    existingAttachments,
    files,
    orderId,
    uploadedByUserId,
  }: {
    existingAttachments: WholesaleOrderListAttachment[];
    files: File[];
    orderId: string;
    uploadedByUserId: string;
  }) =>
    runAction(
      `order-list:upload:${orderId}`,
      "Order List 附件已上传。",
      async () => {
        const supabase = getBrowserSupabaseClient();
        if (!supabase) throw new Error("client unavailable");

        await uploadWholesaleOrderListFiles(supabase, {
          existingAttachments,
          files,
          orderId,
          uploadedByUserId,
        });
      },
      { refreshMode: "none" },
    );

  const deleteOrderListAttachment = (
    attachment: WholesaleOrderListAttachment,
  ) =>
    runAction(
      `order-list:delete:${attachment.id}`,
      "Order List 附件已删除。",
      async () => {
        const supabase = getBrowserSupabaseClient();
        if (!supabase) throw new Error("client unavailable");

        await deleteWholesaleOrderListAttachment(supabase, attachment);
      },
      { refreshMode: "none" },
    );

  return {
    deleteOrderListAttachment,
    uploadOrderListAttachments,
  };
}
