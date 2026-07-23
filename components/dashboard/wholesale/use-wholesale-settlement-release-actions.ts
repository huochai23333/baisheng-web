"use client";

import { useCallback } from "react";

import { getBrowserSupabaseClient } from "@/lib/supabase";

import {
  optionalString,
  positiveNumber,
  requiredString,
} from "./wholesale-action-utils";
import { useWholesaleActionRunner } from "./use-wholesale-action-runner";

export type SettlementReleaseAllocationSubmission = {
  allocations: Array<{ amount: number; order_id: string }>;
  customerId: string;
  expectedRevision: number;
  releaseId: string;
};

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

  const saveAllocations = useCallback(
    (submission: SettlementReleaseAllocationSubmission) => {
      return runAction(
        `settlement-release:allocate:${submission.releaseId}`,
        "结汇收款分配已保存。",
        async () => {
          const supabase = getBrowserSupabaseClient();
          if (!supabase) throw new Error("client unavailable");

          const { error } = await supabase.rpc(
            "replace_wholesale_settlement_release_allocations",
            {
              p_allocations: submission.allocations,
              p_customer_id: submission.customerId,
              p_expected_revision: submission.expectedRevision,
              p_release_id: submission.releaseId,
            },
          );

          if (error) throw error;
        },
      );
    },
    [runAction],
  );

  const clearAllocations = useCallback(
    (releaseId: string, expectedRevision: number) =>
      runAction(
        `settlement-release:clear:${releaseId}`,
        "这笔收款的订单分配已清空。",
        async () => {
          const supabase = getBrowserSupabaseClient();
          if (!supabase) throw new Error("client unavailable");

          const { error } = await supabase.rpc(
            "clear_wholesale_settlement_release_allocations",
            {
              p_expected_revision: expectedRevision,
              p_release_id: releaseId,
            },
          );

          if (error) throw error;
        },
      ),
    [runAction],
  );

  return {
    cancelRelease,
    clearAllocations,
    createRelease,
    feedback,
    pendingKey,
    saveAllocations,
  };
}
