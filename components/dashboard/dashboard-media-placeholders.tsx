"use client";

import { Play, Video } from "lucide-react";
import { useTranslations } from "next-intl";

import { createDashboardSharedCopy } from "./dashboard-shared-copy";

/** 这些组件只绘制无真实媒体时的占位画面，不读取隐私或任务领域数据。 */
export function IdPreview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-surface-inset p-5">
      <div className="h-[72%] w-[78%] rounded-[18px] border border-border bg-surface-panel shadow-[var(--surface-shadow-panel)]" />
    </div>
  );
}

export function PassportPreview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-surface-inset p-5">
      <div className="relative h-[74%] w-[62%] rounded-[18px] border border-content-strong bg-content-strong shadow-[var(--surface-shadow-panel)]">
        <div className="absolute top-[28%] left-1/2 h-14 w-14 -translate-x-1/2 rounded-full border border-white/20" />
      </div>
    </div>
  );
}

export function VideoPreview({
  count,
  title,
}: {
  count: number;
  title?: string;
}) {
  const t = useTranslations("DashboardShared");
  const copy = createDashboardSharedCopy(t);
  return (
    <div className="absolute inset-0 flex flex-col justify-between bg-primary p-4 text-primary-foreground">
      <div className="flex items-center justify-between text-primary-foreground/75">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] tracking-[0.16em] uppercase">
          <Video className="size-3.5" />
          {copy.video.badge}
        </span>
        {count ? (
          <span className="text-xs">{copy.video.count(count)}</span>
        ) : null}
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-interactive text-primary">
          <Play className="ml-0.5 size-5 fill-current" />
        </div>
      </div>
      <p className="truncate text-sm font-semibold">
        {title ?? copy.video.defaultTitle}
      </p>
    </div>
  );
}
