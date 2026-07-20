"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import {
  getOrderDatePresetRange,
  type OrderDatePreset,
  type OrderDateRange,
} from "@/lib/order-date-range";

import { Button } from "../ui/button";
import { DashboardResourceFilterSection } from "./dashboard-resource-filter-section";

type QuickOrderDatePreset = Exclude<OrderDatePreset, "custom">;

const ORDER_DATE_PRESETS: readonly QuickOrderDatePreset[] = [
  "last_30_days",
  "current_month",
  "previous_month",
  "last_3_months",
];

const ORDER_DATE_PRESET_MESSAGE_KEYS = {
  current_month: "datePresets.currentMonth",
  last_30_days: "datePresets.last30Days",
  last_3_months: "datePresets.last3Months",
  previous_month: "datePresets.previousMonth",
} as const;

/**
 * 四类订单页面共用的筛选卡。
 * 页面只传入自己的字段，标题、恢复按钮、日期快捷范围和精确查询提示由这里统一排版。
 */
export function DashboardOrderFilterSection({
  children,
  customInputId,
  dateRange,
  description,
  exactOrderNumber,
  gridClassName,
  onExitExactSearch,
  onPresetChange,
  onReset,
  resetDisabled,
  title,
}: {
  children: ReactNode;
  customInputId: string;
  dateRange: OrderDateRange;
  description?: ReactNode;
  exactOrderNumber?: string | null;
  gridClassName?: string;
  onExitExactSearch?: () => void;
  onPresetChange: (preset: QuickOrderDatePreset) => void;
  onReset: () => void;
  resetDisabled: boolean;
  title?: ReactNode;
}) {
  const t = useTranslations("OrderListFramework");

  return (
    <DashboardResourceFilterSection
      description={description ?? t("filters.description")}
      footer={
        <>
          <DashboardOrderDateToolbar
            customInputId={customInputId}
            onSelect={onPresetChange}
            range={dateRange}
          />
          {exactOrderNumber && onExitExactSearch ? (
            <div className="flex flex-col gap-2 rounded-control-default border border-border-subtle bg-surface-inset px-3 py-2 text-sm text-content-muted sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0 break-all font-medium">
                {t("exactSearch.active", { orderNumber: exactOrderNumber })}
              </span>
              <Button
                className="w-full shrink-0 sm:w-auto"
                onClick={onExitExactSearch}
                type="button"
                variant="ghost"
                size="compact"
              >
                <X className="size-4" />
                {t("exactSearch.exit")}
              </Button>
            </div>
          ) : null}
        </>
      }
      gridClassName={gridClassName}
      onReset={onReset}
      resetDisabled={resetDisabled}
      resetLabel={t("filters.reset")}
      title={title ?? t("filters.title")}
    >
      {children}
    </DashboardResourceFilterSection>
  );
}

/**
 * 日期快捷按钮始终按相同顺序展示，并根据完整日期范围计算当前高亮项。
 * “自定义”不会改写日期，只把键盘焦点移到开始日期输入框。
 */
export function DashboardOrderDateToolbar({
  customInputId,
  onSelect,
  range,
}: {
  customInputId: string;
  onSelect: (preset: QuickOrderDatePreset) => void;
  range: OrderDateRange;
}) {
  const t = useTranslations("OrderListFramework");
  const activePreset = getActiveOrderDatePreset(range);

  return (
    <div
      aria-label={t("datePresets.label")}
      className="flex flex-wrap gap-2"
      role="group"
    >
      {ORDER_DATE_PRESETS.map((preset) => (
        <Button
          aria-pressed={activePreset === preset}
          key={preset}
          onClick={() => onSelect(preset)}
          type="button"
          variant={activePreset === preset ? "primary" : "outline"}
          size="compact"
        >
          {t(ORDER_DATE_PRESET_MESSAGE_KEYS[preset])}
        </Button>
      ))}
      <Button
        aria-pressed={activePreset === "custom"}
        onClick={() => document.getElementById(customInputId)?.focus()}
        type="button"
        variant={activePreset === "custom" ? "primary" : "outline"}
        size="compact"
      >
        {t("datePresets.custom")}
      </Button>
    </div>
  );
}

function getActiveOrderDatePreset(range: OrderDateRange): OrderDatePreset {
  for (const preset of ORDER_DATE_PRESETS) {
    const candidate = getOrderDatePresetRange(preset);
    if (
      candidate.fromDate === range.fromDate &&
      candidate.toDate === range.toDate
    ) {
      return preset;
    }
  }

  return "custom";
}
