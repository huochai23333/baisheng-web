"use client";

import type { ReactNode } from "react";

import { LoaderCircle, ShieldAlert, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import { DashboardSectionPanel } from "./dashboard-section-panel";
import { EmptyState, FeedbackNotice, type FeedbackTone } from "./dashboard-shared-ui";

export type DashboardActionFeedback = {
  message: string;
  tone: FeedbackTone;
} | null;

/**
 * 全工作台页面共用的最外层骨架。
 * 页面头、反馈和业务内容的顺序在这里固定，业务页面只需要传入对应内容。
 */
export function DashboardPageShell({
  children,
  className,
  feedback,
  header,
}: {
  children: ReactNode;
  className?: string;
  feedback?: DashboardActionFeedback;
  header?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-[1320px] flex-col gap-8",
        className,
      )}
      data-dashboard-page-shell="true"
    >
      {header}
      {feedback ? (
        <FeedbackNotice tone={feedback.tone}>{feedback.message}</FeedbackNotice>
      ) : null}
      {children}
    </section>
  );
}

/**
 * 无权限、加载和核心错误使用同一个卡片结构，避免各页面自行复制图标、边框和重试按钮。
 */
export function DashboardAccessState({
  actionLabel,
  description,
  kind,
  onAction,
  title,
}: {
  actionLabel?: string;
  description: string;
  kind: "error" | "loading" | "permission";
  onAction?: () => void;
  title: string;
}) {
  const icon =
    kind === "loading" ? (
      <LoaderCircle className="size-6 animate-spin" />
    ) : kind === "permission" ? (
      <ShieldAlert className="size-6" />
    ) : (
      <TriangleAlert className="size-6" />
    );

  return (
    <DashboardSectionPanel>
      <EmptyState description={description} icon={icon} title={title} />
      {actionLabel && onAction ? (
        <div className="mt-4 flex justify-center">
          <Button
            className="min-h-10 w-full rounded-full sm:w-auto"
            onClick={onAction}
            type="button"
            variant="outline"
          >
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </DashboardSectionPanel>
  );
}
