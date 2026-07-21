import type { ReactNode } from "react";

import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

export type DashboardOperationalSummaryItem = {
  icon?: ReactNode;
  id: string;
  label: ReactNode;
  tone?: "info" | "success" | "warning";
  value: ReactNode;
};

export type DashboardOperationalSummaryMeta = {
  icon?: ReactNode;
  label: ReactNode;
  value: ReactNode;
};

type DashboardOperationalSummaryProps = {
  className?: string;
  meta?: DashboardOperationalSummaryMeta;
  primaryItems: readonly DashboardOperationalSummaryItem[];
  secondaryItems?: readonly DashboardOperationalSummaryItem[];
  secondaryTitle?: ReactNode;
};

/**
 * 运营摘要把“马上需要关注的数字”和“用于核对的补充数字”分成两层。
 * 组件有意只使用一个外层面板，避免每个数字各占一张大卡，同时让长金额和长标签都能完整换行。
 */
export function DashboardOperationalSummary({
  className,
  meta,
  primaryItems,
  secondaryItems = [],
  secondaryTitle,
}: DashboardOperationalSummaryProps) {
  return (
    <Surface
      className={cn("motion-surface-enter shadow-none", className)}
      padding="compact"
      variant="inset"
      data-slot="dashboard-operational-summary"
    >
      <dl
        className={cn(
          "grid min-w-0 gap-2",
          primaryItems.length === 1 && "grid-cols-1",
          primaryItems.length === 2 && "grid-cols-2",
          primaryItems.length === 3 && "grid-cols-3",
          primaryItems.length >= 4 && "grid-cols-2 sm:grid-cols-4",
        )}
        data-summary-tier="primary"
      >
        {primaryItems.map((item) => (
          <DashboardPrimarySummaryItem item={item} key={item.id} />
        ))}
      </dl>

      {meta ? (
        <div
          className="mt-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 border-t border-border-subtle pt-3 text-xs leading-5 text-content-muted"
          data-summary-tier="meta"
        >
          {meta.icon ? (
            <span className="shrink-0 text-primary">{meta.icon}</span>
          ) : null}
          <span className="font-semibold text-content-muted">{meta.label}</span>
          <span className="min-w-0 break-words text-content-strong [overflow-wrap:anywhere]">
            {meta.value}
          </span>
        </div>
      ) : null}

      {secondaryItems.length > 0 ? (
        <div
          className="mt-3 border-t border-border-subtle pt-3"
          data-summary-tier="secondary"
        >
          {secondaryTitle ? (
            <h3 className="font-label text-[11px] font-semibold tracking-[0.12em] text-content-muted uppercase">
              {secondaryTitle}
            </h3>
          ) : null}
          <dl
            className={cn(
              "grid min-w-0 gap-x-5 gap-y-1",
              secondaryTitle && "mt-2",
              "sm:grid-cols-2 xl:grid-cols-3",
            )}
          >
            {secondaryItems.map((item) => (
              <div
                className="flex min-w-0 items-start justify-between gap-3 py-1.5"
                key={item.id}
              >
                <dt className="flex min-w-0 items-center gap-1.5 break-words text-xs font-semibold text-content-muted [overflow-wrap:anywhere]">
                  {item.icon ? (
                    <span
                      className={cn(
                        "shrink-0",
                        getSummaryAccentClassName(item.tone),
                      )}
                    >
                      {item.icon}
                    </span>
                  ) : null}
                  {item.label}
                </dt>
                <dd className="min-w-0 break-words text-right text-sm font-bold leading-5 text-content-strong [overflow-wrap:anywhere]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </Surface>
  );
}

function DashboardPrimarySummaryItem({
  item,
}: {
  item: DashboardOperationalSummaryItem;
}) {
  return (
    <div className="min-w-0 rounded-surface-inset bg-surface-panel px-2.5 py-2 sm:px-3">
      <dt className="flex min-w-0 items-start gap-1.5 break-words text-[11px] font-semibold leading-4 text-content-muted [overflow-wrap:anywhere] sm:text-xs">
        {item.icon ? (
          <span
            className={cn(
              "mt-px shrink-0",
              getSummaryAccentClassName(item.tone),
            )}
          >
            {item.icon}
          </span>
        ) : null}
        {item.label}
      </dt>
      <dd
        className={cn(
          "mt-1 min-w-0 break-words text-xl font-bold leading-tight [overflow-wrap:anywhere] sm:text-2xl",
          item.tone === "warning"
            ? "text-status-warning"
            : "text-content-strong",
        )}
      >
        {item.value}
      </dd>
    </div>
  );
}

function getSummaryAccentClassName(
  tone: DashboardOperationalSummaryItem["tone"] = "info",
) {
  if (tone === "success") return "text-status-success";
  if (tone === "warning") return "text-status-warning";
  return "text-primary";
}
