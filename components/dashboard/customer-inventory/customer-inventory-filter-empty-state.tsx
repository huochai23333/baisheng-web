"use client";

import { SearchX } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * 有数据但筛选后无结果时，必须给用户一个明确的恢复入口。
 * 这和“系统里一条数据都没有”不是同一种状态；清空入口由上方统一筛选区提供，
 * 避免桌面端在同一屏出现两个用途完全相同的按钮。
 */
export function CustomerInventoryFilterEmptyState({
  description,
}: {
  description: string;
}) {
  const t = useTranslations("CustomerInventory");

  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-record-card border border-dashed border-border-subtle bg-surface-inset px-4 py-8 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-surface-interactive text-content-muted">
        <SearchX className="size-5" />
      </span>
      <p className="mt-4 font-semibold text-content-strong">
        {t("filters.noResultsTitle")}
      </p>
      <p className="mt-2 max-w-lg text-sm leading-6 text-content-muted">
        {description}
      </p>
    </div>
  );
}
