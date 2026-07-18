import type { ReactNode } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export type FeedbackTone = "error" | "info" | "success";

const feedbackNoticeVariants = cva(
  "motion-surface-enter border text-sm leading-7",
  {
    variants: {
      density: {
        compact: "rounded-[22px] px-4 py-3",
        default: "rounded-[24px] px-5 py-4",
      },
      tone: {
        error:
          "border-status-danger-border bg-status-danger-soft text-status-danger",
        info: "border-status-info-border bg-status-info-soft text-status-info",
        success:
          "border-status-success-border bg-status-success-soft text-status-success",
      },
    },
    defaultVariants: {
      density: "default",
      tone: "info",
    },
  },
);

type FeedbackNoticeProps = {
  children: ReactNode;
  className?: string;
  tone: FeedbackTone;
} & Pick<VariantProps<typeof feedbackNoticeVariants>, "density">;

/**
 * 全站反馈条只描述结果语义，不承载领域判断。
 * 错误使用即时播报，成功和提示使用礼貌播报，避免页面只靠颜色传达结果。
 */
export function FeedbackNotice({
  children,
  className,
  density,
  tone,
}: FeedbackNoticeProps) {
  const isError = tone === "error";

  return (
    <div
      aria-live={isError ? "assertive" : "polite"}
      className={cn(feedbackNoticeVariants({ density, tone }), className)}
      data-density={density ?? "default"}
      data-slot="feedback-notice"
      data-tone={tone}
      role={isError ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
