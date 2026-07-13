"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { getBrowserSupabaseClient } from "@/lib/supabase";

import { toWholesaleActionErrorMessage } from "./wholesale-action-utils";

export type WholesaleActionFeedback = {
  tone: "error" | "success";
  message: string;
} | null;

export type WholesaleActionRefreshMode = "none" | "router";

export type RunWholesaleAction = (
  key: string,
  successMessage: string,
  action: () => Promise<void>,
  options?: { refreshMode?: WholesaleActionRefreshMode },
) => Promise<boolean>;

/**
 * 批发模块所有写操作共用的执行器。
 *
 * 返回布尔值的目的，是让弹窗知道请求是否真的成功：只有成功时才能清空表单或关闭弹窗。
 * 订单列表拥有自己的局部刷新逻辑，因此可以传入 `none`，避免同时触发整页刷新和列表刷新。
 */
export function useWholesaleActionRunner() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<WholesaleActionFeedback>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const runAction = useCallback<RunWholesaleAction>(
    async (key, successMessage, action, options) => {
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

        if ((options?.refreshMode ?? "router") === "router") {
          router.refresh();
        }

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

  return {
    feedback,
    pendingKey,
    runAction,
  };
}
