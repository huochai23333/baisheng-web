"use client";

import { FeedbackNotice } from "@/components/ui/feedback-notice";

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
    // 外层只负责把反馈放到弹窗之上；播报角色由 FeedbackNotice 统一提供。
    // 如果两层都声明 role="alert"，屏幕阅读器会把同一条错误重复朗读两次。
    <div className="fixed inset-x-4 top-4 z-[70] mx-auto max-w-2xl">
      <FeedbackNotice tone={feedback.tone}>{feedback.message}</FeedbackNotice>
    </div>
  );
}
