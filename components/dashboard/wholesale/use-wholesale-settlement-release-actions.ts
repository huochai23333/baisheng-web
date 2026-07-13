"use client";

import { useCallback } from "react";

import { getBrowserSupabaseClient } from "@/lib/supabase";

import {
  optionalString,
  positiveNumber,
  requiredString,
} from "./wholesale-action-utils";
import { useWholesaleActionRunner } from "./use-wholesale-action-runner";

export function useWholesaleSettlementReleaseActions() {
  // 结汇发布与批发页面使用同一个成功契约，避免这里再次维护一套容易走偏的反馈逻辑。
  const { feedback, pendingKey, runAction } = useWholesaleActionRunner();

  const createRelease = useCallback(
    (formData: FormData) =>
      runAction("settlement-release:create", "结汇收款已发布。", async () => {
        const supabase = getBrowserSupabaseClient();
        if (!supabase) throw new Error("client unavailable");

        const { error } = await supabase.rpc(
          "create_wholesale_settlement_release",
          {
            p_customer_id: optionalString(formData.get("customer_id")),
            p_customer_name: optionalString(formData.get("customer_name")),
            p_note: optionalString(formData.get("note")),
            p_received_on: requiredString(formData.get("received_on")),
            p_release_amount: positiveNumber(formData.get("release_amount")),
            p_release_currency: requiredString(formData.get("release_currency")),
          },
        );

        if (error) throw error;
      }),
    [runAction],
  );

  const cancelRelease = useCallback(
    (releaseId: string) =>
      runAction(
        `settlement-release:cancel:${releaseId}`,
        "这条结汇收款已取消。",
        async () => {
          const supabase = getBrowserSupabaseClient();
          if (!supabase) throw new Error("client unavailable");

          const { error } = await supabase.rpc(
            "cancel_wholesale_settlement_release",
            {
              p_release_id: releaseId,
            },
          );

          if (error) throw error;
        },
      ),
    [runAction],
  );

  const claimRelease = useCallback(
    (formData: FormData) => {
      const releaseId = requiredString(formData.get("release_id"));

      return runAction(
        `settlement-release:claim:${releaseId}`,
        "结汇收款已匹配到订单。",
        async () => {
          const supabase = getBrowserSupabaseClient();
          if (!supabase) throw new Error("client unavailable");

          const { error } = await supabase.rpc(
            "claim_wholesale_settlement_release",
            {
              p_order_id: requiredString(formData.get("order_id")),
              p_release_id: releaseId,
            },
          );

          if (error) throw error;
        },
      );
    },
    [runAction],
  );

  return {
    cancelRelease,
    claimRelease,
    createRelease,
    feedback,
    pendingKey,
  };
}
