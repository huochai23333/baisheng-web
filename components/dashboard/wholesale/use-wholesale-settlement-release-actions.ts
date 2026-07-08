"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { getBrowserSupabaseClient } from "@/lib/supabase";

import {
  optionalString,
  positiveNumber,
  requiredString,
  toWholesaleActionErrorMessage,
} from "./wholesale-action-utils";

type ActionFeedback = {
  tone: "error" | "success";
  message: string;
} | null;

export function useWholesaleSettlementReleaseActions() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<ActionFeedback>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const runAction = useCallback(
    async (key: string, successMessage: string, action: () => Promise<void>) => {
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        setFeedback({
          tone: "error",
          message: "当前无法连接系统，请刷新页面后再试。",
        });
        return;
      }

      setPendingKey(key);
      setFeedback(null);

      try {
        await action();
        setFeedback({ tone: "success", message: successMessage });
        // RPC 会在数据库里完成校验和写入，刷新页面可以重新读取最新的 RLS 过滤结果。
        router.refresh();
      } catch (error) {
        setFeedback({
          tone: "error",
          message: toWholesaleActionErrorMessage(error),
        });
      } finally {
        setPendingKey(null);
      }
    },
    [router],
  );

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
