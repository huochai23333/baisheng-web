"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { MetricCard, MetricGrid } from "@/components/ui/data-display";

export type DashboardSectionHeaderMetric = {
  accent: "blue" | "gold" | "green";
  icon: ReactNode;
  key?: string;
  label: string;
  labelClassName?: string;
  value: ReactNode;
};

type DashboardSectionHeaderProps = {
  actions?: ReactNode;
  actionsClassName?: string;
  asideClassName?: string;
  asideFooter?: ReactNode;
  badge: ReactNode;
  badgeClassName?: string;
  badgeIcon?: ReactNode;
  className?: string;
  contentClassName?: string;
  description?: ReactNode;
  descriptionClassName?: string;
  density?: "compact" | "comfortable";
  layoutClassName?: string;
  metrics?: readonly DashboardSectionHeaderMetric[];
  metricsClassName?: string;
  metricsPlacement?: "aside" | "below";
  title: ReactNode;
  titleClassName?: string;
};

export function DashboardSectionHeader({
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
}: DashboardSectionHeaderProps) {
  const asideMetrics = metricsPlacement === "aside" ? metrics : [];
  const belowMetrics = metricsPlacement === "below" ? metrics : [];
  const hasAside =
    asideMetrics.length > 0 || Boolean(actions) || Boolean(asideFooter);

  return (
    <section
      className={cn(
        "motion-surface-enter rounded-surface-panel border border-surface-panel-border bg-surface-chrome/92 shadow-surface-header sm:rounded-surface-panel",
        density === "compact" ? "p-4 sm:p-5 xl:p-6" : "p-5 sm:p-6 xl:p-8",
        className,
      )}
      data-density={density}
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
