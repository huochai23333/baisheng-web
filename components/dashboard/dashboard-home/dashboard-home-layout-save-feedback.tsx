"use client";

import { LoaderCircle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FeedbackNotice } from "@/components/ui/feedback-notice";
import { cn } from "@/lib/utils";

import type { HomeCustomizerCopy } from "./dashboard-home-customizer-copy";
import type { DashboardHomeLayoutSaveStatus } from "./use-dashboard-home-layout";

type DashboardHomeLayoutSaveFeedbackProps = {
  className?: string;
  copy: HomeCustomizerCopy;
  onRetry: () => void;
  status: DashboardHomeLayoutSaveStatus;
};

export function DashboardHomeLayoutSaveFeedback({
  className,
  copy,
  onRetry,
  status,
}: DashboardHomeLayoutSaveFeedbackProps) {
  if (status === "idle") {
    return null;
  }

  if (status === "error") {
    return (
      <div
        className={cn("min-w-0", className)}
        data-save-status={status}
        data-testid="home-layout-save-feedback"
      >
        <FeedbackNotice
          className="flex flex-wrap items-center justify-between gap-3"
          density="compact"
          tone="error"
        >
          <span>{copy.saveError}</span>
          <Button
            data-testid="home-layout-retry-save"
            onClick={onRetry}
            size="default"
            type="button"
            variant="outline"
          >
            <RefreshCcw className="size-4" />
            {copy.retrySave}
          </Button>
        </FeedbackNotice>
      </div>
    );
  }

  return (
    <div
      className={cn("min-w-0", className)}
      data-save-status={status}
      data-testid="home-layout-save-feedback"
    >
      <FeedbackNotice
        className="flex items-center gap-2"
        density="compact"
        tone={status === "saved" ? "success" : "info"}
      >
        {status === "saving" ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : null}
        <span>
          {status === "saving" ? copy.savePending : copy.saveSuccess}
        </span>
      </FeedbackNotice>
    </div>
  );
}
