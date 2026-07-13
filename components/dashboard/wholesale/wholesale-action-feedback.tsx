"use client";

import { PageBanner } from "@/components/dashboard/dashboard-shared-ui";

import type { WholesaleActionFeedback } from "./use-wholesale-action-runner";

/**
 * 写操作反馈要显示在弹窗遮罩上方，否则“保留弹窗”后用户反而看不到失败原因。
 * 手机端保留左右安全距离，桌面端限制最大宽度，避免长文案压住整个页面。
 */
export function WholesaleActionFeedbackNotice({
  feedback,
}: {
  feedback: WholesaleActionFeedback;
}) {
  if (!feedback) return null;

  return (
    <div
      aria-live="polite"
      className="fixed inset-x-4 top-4 z-[70] mx-auto max-w-2xl"
      role="alert"
    >
      <PageBanner tone={feedback.tone}>{feedback.message}</PageBanner>
    </div>
  );
}
