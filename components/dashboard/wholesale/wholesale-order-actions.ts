import { getBrowserSupabaseClient } from "@/lib/supabase";

import {
  getWholesaleOrderRpcPayload,
  optionalString,
  positiveNumber,
  requiredString,
} from "./wholesale-action-utils";
import type { RunWholesaleAction } from "./use-wholesale-action-runner";

/** 订单列表由客户端局部刷新，所以这些操作成功后不再额外刷新整页。 */
const ORDER_ACTION_OPTIONS = { refreshMode: "none" } as const;

/** 把订单创建、修改、结汇和修改审批集中在一个业务域内。 */
export function createWholesaleOrderActions(runAction: RunWholesaleAction) {
  const createOrder = (formData: FormData) =>
    runAction(
      "order:create",
      "批发订单已保存。",
      async () => {
        const supabase = getBrowserSupabaseClient();
        if (!supabase) throw new Error("client unavailable");

        const { error } = await supabase.rpc(
          "create_wholesale_order",
          getWholesaleOrderRpcPayload(formData),
        );
        if (error) throw error;
      },
      ORDER_ACTION_OPTIONS,
    );

  const updateOrder = (formData: FormData) => {
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
      ORDER_ACTION_OPTIONS,
    );
  };

  const requestOrderEdit = (formData: FormData) => {
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
      ORDER_ACTION_OPTIONS,
    );
  };

  const markOrderSettled = (formData: FormData) => {
    const orderId = requiredString(formData.get("order_id"));

    return runAction(
      `order:settle:${orderId}`,
      "结汇记录已保存。",
      async () => {
        const supabase = getBrowserSupabaseClient();
        if (!supabase) throw new Error("client unavailable");

        const { error } = await supabase.rpc("add_wholesale_order_settlement", {
          p_order_id: orderId,
          p_settlement_amount: positiveNumber(
            formData.get("settlement_amount"),
          ),
          p_settlement_date: requiredString(formData.get("settlement_date")),
        });
        if (error) throw error;
      },
      ORDER_ACTION_OPTIONS,
    );
  };

  const approveOrderEditRequest = (requestId: string) =>
    runAction(
      `order-edit:approve:${requestId}`,
      "修改申请已通过，订单已更新。",
      async () => {
        const supabase = getBrowserSupabaseClient();
        if (!supabase) throw new Error("client unavailable");

        const { error } = await supabase.rpc(
          "approve_wholesale_order_edit_request",
          { p_request_id: requestId, p_review_note: null },
        );
        if (error) throw error;
      },
      ORDER_ACTION_OPTIONS,
    );

  const rejectOrderEditRequest = (requestId: string) =>
    runAction(
      `order-edit:reject:${requestId}`,
      "修改申请已退回。",
      async () => {
        const supabase = getBrowserSupabaseClient();
        if (!supabase) throw new Error("client unavailable");

        const { error } = await supabase.rpc(
          "reject_wholesale_order_edit_request",
          { p_request_id: requestId, p_review_note: null },
        );
        if (error) throw error;
      },
      ORDER_ACTION_OPTIONS,
    );

  return {
    approveOrderEditRequest,
    createOrder,
    markOrderSettled,
    rejectOrderEditRequest,
    requestOrderEdit,
    updateOrder,
  };
}
