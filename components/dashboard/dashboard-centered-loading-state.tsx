"use client";

import { LoaderCircle } from "lucide-react";

type DashboardCenteredLoadingStateProps = {
  message: string;
};

export function DashboardCenteredLoadingState({
  message,
}: DashboardCenteredLoadingStateProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[1320px] items-center justify-center">
      <div className="motion-surface-enter flex items-center gap-3 rounded-surface-panel border border-surface-panel-border bg-surface-panel px-6 py-5 text-sm text-content-muted shadow-surface-interactive">
        <LoaderCircle className="size-4 animate-spin text-primary" />
        {message}
      </div>
    </div>
  );
}
