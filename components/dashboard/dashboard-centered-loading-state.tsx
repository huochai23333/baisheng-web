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
      <div className="motion-surface-enter flex items-center gap-3 rounded-[28px] border border-white/85 bg-white/72 px-6 py-5 text-sm text-[#60707d] shadow-[0_18px_45px_rgba(96,113,128,0.06)]">
        <LoaderCircle className="size-4 animate-spin text-[#486782]" />
        {message}
      </div>
    </div>
  );
}
