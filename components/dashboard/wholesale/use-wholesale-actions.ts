"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { getBrowserSupabaseClient } from "@/lib/supabase";
import {
  deleteWholesaleOrderListAttachment,
  uploadWholesaleOrderListFiles,
  type WholesaleOrderListAttachment,
} from "@/lib/wholesale-order-list-attachments";

import {
  getWholesaleOrderRpcPayload,
  optionalString,
  positiveNumber,
  requiredString,
  toWholesaleActionErrorMessage,
} from "./wholesale-action-utils";
import { createWholesaleCustomerActions } from "./wholesale-customer-actions";
import { createWholesaleLogisticsStatus } from "./wholesale-logistics-mutations";

type ActionFeedback = {
  tone: "error" | "success";
  message: string;
} | null;

type Imported1688Row = {
  external_order_number: string;
  seller_name?: string | null;
  item_summary?: string | null;
  quantity?: number | null;
  purchase_amount?: number | null;
  order_status?: string | null;
  purchased_at?: string | null;
  recipient_name?: string | null;
  customer_id?: string | null;
  wholesale_order_id?: string | null;
  raw_payload: Record<string, unknown>;
};

export function useWholesaleActions() {
  const router = useRouter();
  const accessT = useTranslations("ClientBusinessAccess");
  const [feedback, setFeedback] = useState<ActionFeedback>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const runActionResult = useCallback(
    async (
      key: string,
      successMessage: string,
      action: () => Promise<void>,
    ) => {
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        setFeedback({
          tone: "error",
          message: "当前无法连接系统，请刷新页面后再试。",
        });
        return false;
      }

      setPendingKey(key);
      setFeedback(null);

      try {
        await action();
        setFeedback({ tone: "success", message: successMessage });
        router.refresh();
        return true;
      } catch (error) {
        setFeedback({
          tone: "error",
          message: toWholesaleActionErrorMessage(error),
        });
        return false;
      } finally {
        setPendingKey(null);
      }
    },
    [router],
  );

  const runAction = useCallback(
    async (
      key: string,
      successMessage: string,
      action: () => Promise<void>,
    ) => {
      await runActionResult(key, successMessage, action);
    },
    [runActionResult],
  );

  const customerActions = useMemo(
    () =>
      createWholesaleCustomerActions({
        addRegisteredCustomerSuccessMessage: accessT("success", {
          business: accessT("businesses.wholesale"),
        }),
        runAction,
        runActionResult,
      }),
    [accessT, runAction, runActionResult],
  );

  const createOrder = useCallback(
    (formData: FormData) =>
      runAction("order:create", "批发订单已保存。", async () => {
        const supabase = getBrowserSupabaseClient();
        if (!supabase) throw new Error("client unavailable");

        const { error } = await supabase.rpc(
          "create_wholesale_order",
          getWholesaleOrderRpcPayload(formData),
        );
        if (error) throw error;
      }),
    [runAction],
  );

  const updateOrder = useCallback(
    (formData: FormData) => {
      const orderId = requiredString(formData.get("order_id"));

      return runAction(
        `order:update:${orderId}`,
        "批发订单已更新。",
        async () => {
          const supabase = getBrowserSupabaseClient();
          if (!supabase) throw new Error("client unavailable");

          const { error } = await supabase.rpc("update_wholesale_order", {
            p_order_id: orderId,
            ...getWholesaleOrderRpcPayload(formData),
          });

          if (error) throw error;
        },
      );
    },
    [runAction],
  );

  const requestOrderEdit = useCallback(
    (formData: FormData) => {
      const orderId = requiredString(formData.get("order_id"));

      return runAction(
        `order:edit-request:${orderId}`,
        "修改申请已提交，等待管理员处理。",
        async () => {
          const supabase = getBrowserSupabaseClient();
          if (!supabase) throw new Error("client unavailable");

          const { error } = await supabase.rpc("request_wholesale_order_edit", {
            p_order_id: orderId,
            p_request_note: optionalString(formData.get("request_note")),
            ...getWholesaleOrderRpcPayload(formData),
          });

          if (error) throw error;
        },
      );
    },
    [runAction],
  );

  const markOrderSettled = useCallback(
    (formData: FormData) => {
      const orderId = requiredString(formData.get("order_id"));

      return runAction(
        `order:settle:${orderId}`,
        "结汇记录已保存。",
        async () => {
          const supabase = getBrowserSupabaseClient();
          if (!supabase) throw new Error("client unavailable");

          const { error } = await supabase.rpc(
            "add_wholesale_order_settlement",
            {
              p_order_id: orderId,
              p_settlement_amount: positiveNumber(
                formData.get("settlement_amount"),
              ),
              p_settlement_date: requiredString(
                formData.get("settlement_date"),
              ),
            },
          );

          if (error) throw error;
        },
      );
    },
    [runAction],
  );

  const uploadOrderListAttachments = useCallback(
    ({
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
      runActionResult(
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
      ),
    [runActionResult],
  );

  const deleteOrderListAttachment = useCallback(
    (attachment: WholesaleOrderListAttachment) =>
      runActionResult(
        `order-list:delete:${attachment.id}`,
        "Order List 附件已删除。",
        async () => {
          const supabase = getBrowserSupabaseClient();
          if (!supabase) throw new Error("client unavailable");

          await deleteWholesaleOrderListAttachment(supabase, attachment);
        },
      ),
    [runActionResult],
  );

  const approveOrderEditRequest = useCallback(
    (requestId: string) =>
      runAction(
        `order-edit:approve:${requestId}`,
        "修改申请已通过，订单已更新。",
        async () => {
          const supabase = getBrowserSupabaseClient();
          if (!supabase) throw new Error("client unavailable");

          const { error } = await supabase.rpc(
            "approve_wholesale_order_edit_request",
            {
              p_request_id: requestId,
              p_review_note: null,
            },
          );

          if (error) throw error;
        },
      ),
    [runAction],
  );

  const rejectOrderEditRequest = useCallback(
    (requestId: string) =>
      runAction(
        `order-edit:reject:${requestId}`,
        "修改申请已退回。",
        async () => {
          const supabase = getBrowserSupabaseClient();
          if (!supabase) throw new Error("client unavailable");

          const { error } = await supabase.rpc(
            "reject_wholesale_order_edit_request",
            {
              p_request_id: requestId,
              p_review_note: null,
            },
          );

          if (error) throw error;
        },
      ),
    [runAction],
  );

  const import1688Rows = useCallback(
    (fileName: string, rows: Imported1688Row[]) =>
      runAction("1688:import", "1688 采购订单已接收。", async () => {
        if (rows.length === 0) {
          throw new Error("empty import");
        }

        const supabase = getBrowserSupabaseClient();
        if (!supabase) throw new Error("client unavailable");

        const { data: batch, error: batchError } = await supabase
          .from("wholesale_1688_import_batches")
          .insert({
            file_name: fileName,
            row_count: rows.length,
            source: "csv",
          })
          .select("id")
          .single();

        if (batchError || !batch) throw batchError ?? new Error("batch failed");

        const { error } = await supabase.from("wholesale_1688_orders").upsert(
          rows.map((row) => ({
            ...row,
            batch_id: batch.id,
            customer_id: null,
            wholesale_order_id: null,
          })),
          { ignoreDuplicates: true, onConflict: "external_order_number" },
        );

        if (error) throw error;
      }),
    [runAction],
  );

  const claim1688Order = useCallback(
    (formData: FormData) =>
      runAction("1688:claim", "采购订单已归属客户。", async () => {
        const supabase = getBrowserSupabaseClient();
        if (!supabase) throw new Error("client unavailable");

        const { error } = await supabase.rpc("claim_wholesale_1688_order", {
          p_1688_order_id: requiredString(formData.get("purchase_order_id")),
          p_customer_id: requiredString(formData.get("customer_id")),
          p_wholesale_order_id: optionalString(
            formData.get("wholesale_order_id"),
          ),
        });

        if (error) throw error;
      }),
    [runAction],
  );

  const delete1688Order = useCallback(
    (purchaseOrderId: string) =>
      runAction("1688:delete", "采购订单已移出当前认领列表。", async () => {
        const supabase = getBrowserSupabaseClient();
        if (!supabase) throw new Error("client unavailable");

        const { error } = await supabase.rpc("delete_wholesale_1688_order", {
          p_1688_order_id: purchaseOrderId,
        });

        if (error) throw error;
      }),
    [runAction],
  );

  const createLogisticsStatus = useCallback(
    (formData: FormData) =>
      runAction(
        "logistics-status:create",
        "物流号已加入每日核对。",
        async () => {
          const supabase = getBrowserSupabaseClient();
          if (!supabase) throw new Error("client unavailable");

          await createWholesaleLogisticsStatus(supabase, formData);
        },
      ),
    [runAction],
  );

  const createReferral = useCallback(
    (formData: FormData) =>
      runAction("referral:create", "批发推荐关系已保存。", async () => {
        const supabase = getBrowserSupabaseClient();
        if (!supabase) throw new Error("client unavailable");

        const { error } = await supabase.from("wholesale_referrals").insert({
          referred_customer_id: requiredString(
            formData.get("referred_customer_id"),
          ),
          referrer_customer_id: requiredString(
            formData.get("referrer_customer_id"),
          ),
        });

        if (error) throw error;
      }),
    [runAction],
  );

  const settleCommission = useCallback(
    (commissionId: string) =>
      runAction("commission:settle", "提成已标记为已结算。", async () => {
        const supabase = getBrowserSupabaseClient();
        if (!supabase) throw new Error("client unavailable");

        const { error } = await supabase
          .from("wholesale_commissions")
          .update({
            settled_at: new Date().toISOString(),
            status: "settled",
          })
          .eq("id", commissionId);

        if (error) throw error;
      }),
    [runAction],
  );

  return {
    ...customerActions,
    approveOrderEditRequest,
    claim1688Order,
    createLogisticsStatus,
    createOrder,
    createReferral,
    delete1688Order,
    deleteOrderListAttachment,
    feedback,
    import1688Rows,
    markOrderSettled,
    pendingKey,
    rejectOrderEditRequest,
    requestOrderEdit,
    settleCommission,
    updateOrder,
    uploadOrderListAttachments,
  };
}
