"use client";

import { LoaderCircle, ReceiptText } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import {
  DashboardOrderListSection,
  DashboardOrderLoadMoreButton,
} from "@/components/dashboard/dashboard-order-list-section";
import { PageBanner } from "@/components/dashboard/dashboard-shared-ui";
import { UiMessage } from "@/components/i18n/ui-message";
import { Button } from "@/components/ui/button";
import type { WholesaleOrderPage } from "@/lib/wholesale-order-page";

import { WholesaleOrdersMobileList } from "./wholesale-orders-mobile-list";
import {
  WholesaleOrdersTable,
  type WholesaleOrdersTableProps,
} from "./wholesale-orders-table";
import { WholesaleEmptyState } from "./wholesale-ui";

type WholesaleOrderRenderProps = Omit<
  WholesaleOrdersTableProps,
  "canViewInternalFields" | "orders"
>;

/**
 * 批发订单列表独立处理加载、空状态、桌面表格、移动卡片和统一底栏。
 * 页面协调组件只负责准备权限与事件，不再直接承载完整列表渲染。
 */
export function WholesaleOrdersListSection({
  assessmentPanel,
  loadError,
  loading,
  loadingMore,
  onLoadMore,
  onRetry,
  page,
  renderProps,
}: {
  assessmentPanel?: ReactNode;
  loadError: string | null;
  loading: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  page: WholesaleOrderPage | null;
  renderProps: WholesaleOrderRenderProps;
}) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_orders_section",
  );
  const frameworkT = useTranslations("OrderListFramework");

  return (
    <DashboardOrderListSection
      controls={
        page?.nextCursor ? (
          <DashboardOrderLoadMoreButton
            loading={loadingMore}
            onClick={onLoadMore}
          />
        ) : undefined
      }
      description={frameworkT("list.description")}
      progress={
        page && page.orders.length > 0
          ? {
              kind: "loaded",
              shown: page.orders.length,
              total: page.totalCount,
              unit: "orders",
            }
          : null
      }
      title={uiText("attribute004")}
    >
      {assessmentPanel ? <div className="mb-5">{assessmentPanel}</div> : null}

      {loadError ? (
        <div className="mb-4 space-y-3">
          <PageBanner tone="error">{loadError}</PageBanner>
          <Button
            className="rounded-full border border-[#d8dde2] bg-white text-[#486782]"
            onClick={onRetry}
            type="button"
            variant="outline"
          >
            <UiMessage id="components_dashboard_wholesale_wholesale_orders_section.text002" />
          </Button>
        </div>
      ) : null}

      {page?.warnings.map((warning) => (
        <PageBanner key={`${warning.area}:${warning.message}`} tone="info">
          {warning.message}
        </PageBanner>
      ))}

      {loading ? (
        <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-[#71808d]">
          <LoaderCircle className="size-4 animate-spin" />
          <UiMessage id="components_dashboard_wholesale_wholesale_orders_section.text003" />
        </div>
      ) : page && page.orders.length === 0 ? (
        <WholesaleEmptyState
          description={uiText("attribute005")}
          icon={<ReceiptText className="size-5" />}
          title={uiText("attribute006")}
        />
      ) : page ? (
        <>
          <div className="hidden md:block">
            <WholesaleOrdersTable
              {...renderProps}
              canViewInternalFields={page.canViewInternalFields}
              orders={page.orders}
            />
          </div>
          <WholesaleOrdersMobileList
            {...renderProps}
            canViewInternalFields={page.canViewInternalFields}
            orders={page.orders}
          />
        </>
      ) : null}
    </DashboardOrderListSection>
  );
}
