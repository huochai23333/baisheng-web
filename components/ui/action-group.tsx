import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * 表单操作在移动端先显示主操作、桌面端恢复“取消在左、提交在右”。
 * 业务弹窗只提供按钮，不再分别维护按钮顺序和换行规则。
 */
export function ActionGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}
