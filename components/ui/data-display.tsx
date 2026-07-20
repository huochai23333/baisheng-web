import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Surface } from "@/components/ui/surface";

export function RecordCard({
  className,
  surface = "interactive",
  ...props
}: ComponentProps<"article"> & { surface?: "interactive" | "inset" }) {
  return (
    <Surface
      as="article"
      className={cn("rounded-record-card", className)}
      padding="regular"
      variant={surface}
      {...props}
    />
  );
}

export function MetaGrid({ className, ...props }: ComponentProps<"dl">) {
  return (
    <dl
      className={cn(
        "grid min-w-0 gap-3 text-sm text-content-muted md:grid-cols-2 xl:grid-cols-4",
        className,
      )}
      {...props}
    />
  );
}

export function MetaItem({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-xs font-semibold text-content-strong">{label}</dt>
      <dd className="mt-1 flex min-w-0 items-center gap-1.5 break-words [overflow-wrap:anywhere]">
        {children}
      </dd>
    </div>
  );
}

export function MetricCard({
  className,
  description,
  icon,
  label,
  labelClassName,
  presentation = "summary",
  tone = "info",
  value,
}: {
  className?: string;
  description?: ReactNode;
  icon?: ReactNode;
  label: ReactNode;
  labelClassName?: string;
  presentation?: "header" | "summary" | "value-panel";
  tone?: "info" | "success" | "warning";
  value: ReactNode;
}) {
  const isHeader = presentation === "header";
  const isValuePanel = presentation === "value-panel";

  return (
    <section
      className={cn(
        "h-full min-w-0 rounded-metric-card border shadow-surface-interactive",
        isHeader ? "p-3 sm:px-5 sm:py-4" : "p-4 sm:p-5",
        !isValuePanel &&
          tone === "info" &&
          "border-metric-info-border bg-metric-info-surface",
        !isValuePanel &&
          tone === "success" &&
          "border-metric-success-border bg-metric-success-surface",
        !isValuePanel &&
          tone === "warning" &&
          "border-metric-warning-border bg-metric-warning-surface",
        isValuePanel && "border-border-subtle bg-surface-interactive",
        className,
      )}
      data-slot="metric-card"
      data-presentation={presentation}
      data-tone={tone}
    >
      <div
        className={cn(
          "flex min-w-0 items-center gap-3",
          !isHeader && "text-primary",
        )}
      >
        {icon ? (
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full text-white sm:size-11",
              tone === "info" && "bg-status-info",
              tone === "success" && "bg-status-success",
              tone === "warning" && "bg-status-warning",
            )}
          >
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <p
            className={cn(
              "font-label break-words text-[10px] font-semibold text-content-muted uppercase sm:text-[11px]",
              labelClassName,
            )}
          >
            {label}
          </p>
          {description && !isValuePanel ? (
            <p className="mt-1 text-sm text-content-muted">{description}</p>
          ) : null}
          {isHeader ? (
            <div className="mt-1 truncate text-xl font-bold text-content-strong sm:text-2xl">
              {value}
            </div>
          ) : null}
        </div>
      </div>
      {!isHeader ? (
        isValuePanel ? (
          <div className="mt-4 rounded-surface-inset bg-surface-inset px-4 py-3 text-right text-2xl font-bold text-content-strong [overflow-wrap:anywhere]">
            {value}
          </div>
        ) : (
          <div className="mt-4 break-words text-2xl font-bold text-content-strong [overflow-wrap:anywhere]">
            {value}
          </div>
        )
      ) : null}
      {description && isValuePanel ? (
        <p className="mt-3 break-words text-xs leading-5 text-content-muted [overflow-wrap:anywhere]">
          {description}
        </p>
      ) : null}
    </section>
  );
}

/**
 * 指标卡网格只暴露经过验证的三种布局，避免业务页面各自发明断点。
 * 每个子项都获得最小宽度约束，长金额或长标题不会把页面撑出横向滚动。
 */
export function MetricGrid({
  className,
  layout,
  ...props
}: ComponentProps<"div"> & {
  layout: "header" | "three-column" | "four-column";
}) {
  return (
    <div
      className={cn(
        "grid min-w-0 [&>*]:min-w-0",
        layout === "header" &&
          "w-full grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3",
        layout === "three-column" && "gap-3 md:grid-cols-3",
        layout === "four-column" && "gap-4 sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
      data-layout={layout}
      data-slot="metric-grid"
      {...props}
    />
  );
}
