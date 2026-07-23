"use client";

import type { ReactNode } from "react";

import { MetricCard, MetricGrid } from "@/components/ui/data-display";
import { cn } from "@/lib/utils";

export type DashboardSectionHeaderMetric = {
  accent: "blue" | "gold" | "green";
  icon: ReactNode;
  key?: string;
  label: string;
  labelClassName?: string;
  value: ReactNode;
};

type DashboardSectionHeaderBaseProps = {
  actions?: ReactNode;
  actionsClassName?: string;
  className?: string;
  title: ReactNode;
  titleClassName?: string;
};

/**
 * 高频工作页只保留任务标题、当前状态和主要操作。
 * 将不允许的属性明确写成 `never`，可以在开发阶段直接阻止大徽标、介绍文字或指标卡重新回到工作页头。
 */
type DashboardWorkSectionHeaderProps = DashboardSectionHeaderBaseProps & {
  presentation: "work";
  meta?: ReactNode;
  asideClassName?: never;
  asideFooter?: never;
  badge?: never;
  badgeClassName?: never;
  badgeIcon?: never;
  contentClassName?: never;
  density?: never;
  description?: never;
  descriptionClassName?: never;
  layoutClassName?: never;
  metrics?: never;
  metricsClassName?: never;
  metricsPlacement?: never;
};

/**
 * 首页、统计概览和设置页仍可使用带说明与指标的舒展页头。
 * `presentation` 必须显式传入，新增页面时必须先判断它是工作页还是概览页。
 */
type DashboardOverviewSectionHeaderProps =
  DashboardSectionHeaderBaseProps & {
    presentation: "overview";
    asideClassName?: string;
    asideFooter?: ReactNode;
    badge: ReactNode;
    badgeClassName?: string;
    badgeIcon?: ReactNode;
    contentClassName?: string;
    density?: "compact" | "comfortable";
    description?: ReactNode;
    descriptionClassName?: string;
    layoutClassName?: string;
    meta?: never;
    metrics?: readonly DashboardSectionHeaderMetric[];
    metricsClassName?: string;
    metricsPlacement?: "aside" | "below";
  };

export type DashboardSectionHeaderProps =
  | DashboardOverviewSectionHeaderProps
  | DashboardWorkSectionHeaderProps;

export function DashboardSectionHeader(props: DashboardSectionHeaderProps) {
  if (props.presentation === "work") {
    return <DashboardWorkSectionHeader {...props} />;
  }

  return <DashboardOverviewSectionHeader {...props} />;
}

function DashboardWorkSectionHeader({
  actions,
  actionsClassName,
  className,
  meta,
  title,
  titleClassName,
}: DashboardWorkSectionHeaderProps) {
  return (
    <section
      className={cn(
        "motion-surface-enter flex min-w-0 flex-col gap-3 border-b border-border-subtle pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-4",
        className,
      )}
      data-presentation="work"
      data-slot="dashboard-section-header"
    >
      <div className="min-w-0">
        <h2
          className={cn(
            "break-words text-2xl font-bold leading-tight tracking-tight text-content-strong [overflow-wrap:anywhere] sm:text-3xl",
            titleClassName,
          )}
        >
          {title}
        </h2>
        {meta ? (
          <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-6 text-content-muted">
            {meta}
          </div>
        ) : null}
      </div>

      {actions ? (
        <div
          className={cn(
            "flex min-w-0 flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end",
            actionsClassName,
          )}
        >
          {actions}
        </div>
      ) : null}
    </section>
  );
}

function DashboardOverviewSectionHeader({
  actions,
  actionsClassName,
  asideClassName,
  asideFooter,
  badge,
  badgeClassName,
  badgeIcon,
  className,
  contentClassName,
  description,
  descriptionClassName,
  density = "compact",
  layoutClassName,
  metrics = [],
  metricsClassName,
  metricsPlacement = "aside",
  title,
  titleClassName,
}: DashboardOverviewSectionHeaderProps) {
  const asideMetrics = metricsPlacement === "aside" ? metrics : [];
  const belowMetrics = metricsPlacement === "below" ? metrics : [];
  const hasAside =
    asideMetrics.length > 0 || Boolean(actions) || Boolean(asideFooter);

  return (
    <section
      className={cn(
        "motion-surface-enter rounded-surface-panel border border-surface-panel-border bg-surface-chrome/80 shadow-surface-header backdrop-blur sm:rounded-surface-panel",
        density === "compact" ? "p-4 sm:p-5 xl:p-6" : "p-5 sm:p-6 xl:p-8",
        className,
      )}
      data-density={density}
      data-presentation="overview"
      data-slot="dashboard-section-header"
    >
      <div
        className={cn(
          "flex flex-col min-[1360px]:flex-row min-[1360px]:items-end min-[1360px]:justify-between",
          density === "compact" ? "gap-4 sm:gap-5" : "gap-5 sm:gap-6",
          layoutClassName,
        )}
      >
        <div className={cn("max-w-3xl", contentClassName)}>
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full bg-surface-brand-soft px-2.5 py-1 text-[11px] font-semibold text-primary sm:px-3 sm:text-xs",
              badgeClassName,
            )}
          >
            {badgeIcon}
            {badge}
          </span>
          <h2
            className={cn(
              "font-bold leading-tight tracking-tight text-content-strong",
              density === "compact"
                ? "mt-2.5 text-2xl sm:text-3xl"
                : "mt-3 text-3xl sm:mt-4 sm:text-4xl",
              titleClassName,
            )}
          >
            {title}
          </h2>
          {description ? (
            <p
              className={cn(
                "text-sm text-content-muted",
                density === "compact"
                  ? "mt-2 leading-6"
                  : "mt-2 leading-7 sm:mt-3 sm:text-[15px] sm:leading-8",
                descriptionClassName,
              )}
            >
              {description}
            </p>
          ) : null}
        </div>

        {hasAside ? (
          <div
            className={cn(
              "flex w-full flex-col gap-4 min-[1360px]:w-auto min-[1360px]:items-end",
              asideClassName,
            )}
          >
            {asideMetrics.length > 0 ? (
              <HeaderMetricGrid
                className={metricsClassName}
                compact={density === "compact"}
                metrics={asideMetrics}
              />
            ) : null}
            {actions ? (
              <div
                className={cn(
                  "flex flex-wrap items-center gap-3",
                  actionsClassName,
                )}
              >
                {actions}
              </div>
            ) : null}
            {asideFooter}
          </div>
        ) : null}
      </div>

      {belowMetrics.length > 0 ? (
        <HeaderMetricGrid
          className={cn("mt-5 sm:mt-6", metricsClassName)}
          compact={density === "compact"}
          metrics={belowMetrics}
        />
      ) : null}
    </section>
  );
}

function HeaderMetricGrid({
  className,
  compact,
  metrics,
}: {
  className?: string;
  compact: boolean;
  metrics: readonly DashboardSectionHeaderMetric[];
}) {
  return (
    <MetricGrid
      className={className}
      layout={compact ? "summary-strip" : "header"}
    >
      {metrics.map((metric, index) => (
        <MetricCard
          icon={metric.icon}
          key={metric.key ?? `${metric.label}-${index}`}
          label={metric.label}
          labelClassName={metric.labelClassName}
          presentation={compact ? "compact" : "header"}
          tone={
            metric.accent === "blue"
              ? "info"
              : metric.accent === "green"
                ? "success"
                : "warning"
          }
          value={metric.value}
        />
      ))}
    </MetricGrid>
  );
}
