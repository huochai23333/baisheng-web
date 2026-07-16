"use client";

import type { ReactNode } from "react";

import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "../ui/button";
import { DashboardListSection } from "./dashboard-section-panel";

/** 列表卡和加载进度底栏的通用组合。 */
export function DashboardCollectionSection({
  actions,
  children,
  controls,
  count,
  description,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  controls?: ReactNode;
  count?: ReactNode;
  description?: ReactNode;
  title?: ReactNode;
}) {
  return (
    <DashboardListSection
      actions={actions}
      description={description}
      title={title}
    >
      {children}
      {count ? (
        <DashboardCollectionFooter controls={controls} count={count} />
      ) : null}
    </DashboardListSection>
  );
}

/** 桌面端左右排列，移动端上下排列，列表数量只在这里渲染一次。 */
export function DashboardCollectionFooter({
  controls,
  count,
}: {
  controls?: ReactNode;
  count: ReactNode;
}) {
  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-[#e7e3dc] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="min-w-0 break-words text-sm text-[#6d7780]">{count}</p>
      {controls ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          {controls}
        </div>
      ) : null}
    </div>
  );
}

/** 页码分页只负责按钮，范围数量由统一列表底栏负责。 */
export function DashboardPaginationActions({
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  page,
  pageCount,
}: {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  page: number;
  pageCount: number;
}) {
  const t = useTranslations("DashboardPagination");

  return (
    <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
      <Button
        className="h-9 rounded-full px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
        disabled={!hasPreviousPage}
        onClick={onPreviousPage}
        type="button"
        variant="outline"
      >
        <ChevronLeft className="size-4" />
        {t("previous")}
      </Button>
      <p className="min-w-[84px] text-center text-xs font-medium text-[#486782] sm:min-w-[120px] sm:text-sm">
        {t("page", { page, pageCount })}
      </p>
      <Button
        className="h-9 rounded-full px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
        disabled={!hasNextPage}
        onClick={onNextPage}
        type="button"
        variant="outline"
      >
        {t("next")}
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

/**
 * 页码列表的范围文案与操作栏必须成对出现，因此由一个组件统一组装。
 * 领域列表只传分页数据，不再自行复制“已显示多少条”的位置和样式。
 */
export function DashboardPaginationFooter({
  endIndex,
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  page,
  pageCount,
  startIndex,
  totalItems,
}: {
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  page: number;
  pageCount: number;
  startIndex: number;
  totalItems: number;
}) {
  const t = useTranslations("DashboardPagination");

  if (totalItems === 0) return null;

  return (
    <DashboardCollectionFooter
      controls={
        <DashboardPaginationActions
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onNextPage={onNextPage}
          onPreviousPage={onPreviousPage}
          page={page}
          pageCount={pageCount}
        />
      }
      count={t("range", { end: endIndex, start: startIndex, total: totalItems })}
    />
  );
}

export function DashboardLoadMoreButton({
  label,
  loading,
  loadingLabel,
  onClick,
}: {
  label: string;
  loading: boolean;
  loadingLabel: string;
  onClick: () => void;
}) {
  return (
    <Button
      className="min-h-10 w-full rounded-full px-5 sm:w-auto"
      disabled={loading}
      onClick={onClick}
      type="button"
      variant="outline"
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {loading ? loadingLabel : label}
    </Button>
  );
}

/** 所有双形态列表共用同一个断点和外层间距。 */
export function DashboardResponsiveCollection({
  desktop,
  mobile,
}: {
  desktop: ReactNode;
  mobile: ReactNode;
}) {
  return (
    <>
      <div className="hidden md:block">{desktop}</div>
      <div className="grid gap-3 md:hidden">{mobile}</div>
    </>
  );
}
