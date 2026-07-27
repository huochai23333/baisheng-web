"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { getBrowserSupabaseClient } from "@/lib/supabase";

export type InventoryActionFeedback = {
  message: string;
  tone: "error" | "success";
} | null;

export type RunInventoryAction = (
  key: string,
  successMessage: string,
  action: (
    supabase: NonNullable<ReturnType<typeof getBrowserSupabaseClient>>,
  ) => Promise<void>,
) => Promise<boolean>;

/**
 * 页面里的所有写操作都经过同一个执行器。
 * 它负责防止重复点击、显示结果并刷新服务端数据，具体弹窗只关心自己的表单内容。
 */
export function useCustomerInventoryActions(connectionError: string) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<InventoryActionFeedback>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const runAction = useCallback<RunInventoryAction>(
    async (key, successMessage, action) => {
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        setFeedback({ message: connectionError, tone: "error" });
        return false;
      }

      setFeedback(null);
      setPendingKey(key);

      try {
        await action(supabase);
        setFeedback({ message: successMessage, tone: "success" });
        router.refresh();
        return true;
      } catch (error) {
        setFeedback({
          message: getInventoryErrorMessage(error),
          tone: "error",
        });
        return false;
      } finally {
        setPendingKey(null);
      }
    },
    [connectionError, router],
  );

  return { feedback, pendingKey, runAction };
}

function getInventoryErrorMessage(error: unknown) {
  const raw =
    error instanceof Error
      ? `${error.message} ${String(error.cause ?? "")}`
      : String(error);
  const mappings: Array<[string, string]> = [
    [
      "registered_customer_required",
      "只能为已经绑定登录账号的客户创建库存订单。",
    ],
    ["sales_user_forbidden", "只能选择有权负责这位客户的业务员。"],
    ["revision_conflict", "这笔记录刚被其他人更新，请刷新后再操作。"],
    ["financial_locked", "这笔订单的金额已经锁定，不能再修改。"],
    ["credit_balance_mismatch", "信贷抵消金额和实付金额必须正好等于购买金额。"],
    ["exchange_rate_missing", "当天汇率尚未准备好，暂时不能批准这笔信贷。"],
    ["credit_tier_already_open", "该客户的这个信贷档位仍在处理中或尚未归还。"],
    ["extension_already_pending", "这笔信贷已有一份延期申请在等待审核。"],
    ["extension_not_available", "这笔信贷当前不能申请延期。"],
    ["repayment_date_invalid", "还款日期必须在使用日到今天之间。"],
    ["forbidden", "当前账号没有执行这项操作的权限。"],
  ];

  return (
    mappings.find(([code]) => raw.includes(code))?.[1] ??
    "这次操作没有完成，请检查填写内容后重试。"
  );
}
