"use client";

import type { ReactNode } from "react";

import { RefreshCcw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "../ui/button";
import {
  DashboardFilterPanel,
  DashboardListHeader,
  DashboardSectionPanel,
} from "./dashboard-section-panel";

/**
 * 非订单和订单页面共同使用的筛选卡底座。
 * 日期快捷项等领域功能放进 footer，不需要再复制整个筛选卡。
 */
export function DashboardResourceFilterSection({
  children,
  description,
  footer,
  gridClassName,
  onReset,
  resetDisabled = true,
  resetLabel,
  summary,
  title,
}: {
  children: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  gridClassName?: string;
  onReset?: () => void;
  resetDisabled?: boolean;
  resetLabel?: ReactNode;
  summary?: ReactNode;
  title?: ReactNode;
}) {
  const t = useTranslations("DashboardFramework.filters");
  const resolvedFooter = summary || footer ? (
    <div className="flex flex-col gap-3">
      {summary ? (
        <div className="text-sm leading-6 text-[#69747d]">{summary}</div>
      ) : null}
      {footer}
    </div>
  ) : undefined;

  return (
    <DashboardSectionPanel className="p-4 sm:p-6">
      <DashboardListHeader
        actions={
          onReset ? (
            <Button
              className="min-h-10 whitespace-normal rounded-full"
              disabled={resetDisabled}
              onClick={onReset}
              type="button"
              variant="outline"
            >
              <RefreshCcw className="size-4 shrink-0" />
              {resetLabel ?? t("reset")}
            </Button>
          ) : undefined
        }
        description={description ?? t("description")}
        title={title ?? t("title")}
      />
      <DashboardFilterPanel
        className="mt-4 sm:mt-5"
        footer={resolvedFooter}
        gridClassName={gridClassName}
      >
        {children}
      </DashboardFilterPanel>
    </DashboardSectionPanel>
  );
}
