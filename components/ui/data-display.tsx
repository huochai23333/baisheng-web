import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function RecordCard({ className, ...props }: ComponentProps<"article">) {
  return (
    <article
      className={cn(
        "min-w-0 rounded-[18px] border border-border-subtle bg-surface-interactive p-4 shadow-[var(--surface-shadow-interactive)] sm:rounded-[20px] sm:p-5",
        className,
      )}
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
  compact = false,
  description,
  icon,
  label,
  labelClassName,
  tone = "info",
  value,
}: {
  className?: string;
  compact?: boolean;
  description?: ReactNode;
  icon?: ReactNode;
  label: ReactNode;
  labelClassName?: string;
  tone?: "info" | "success" | "warning";
  value: ReactNode;
}) {
  return (
    <section
      className={cn(
        "h-full min-w-0 rounded-[20px] border p-4 shadow-[var(--surface-shadow-interactive)] sm:rounded-[24px] sm:p-5",
        compact && "p-3 sm:px-5 sm:py-4",
        tone === "info" &&
          "border-metric-info-border bg-metric-info-surface",
        tone === "success" &&
          "border-metric-success-border bg-metric-success-surface",
        tone === "warning" &&
          "border-metric-warning-border bg-metric-warning-surface",
        className,
      )}
      data-slot="metric-card"
      data-tone={tone}
    >
      <div
        className={cn(
          "flex min-w-0 items-center gap-3",
          !compact && "text-primary",
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
          {description ? (
            <p className="mt-1 text-sm text-content-muted">{description}</p>
          ) : null}
          {compact ? (
            <div className="mt-1 truncate text-xl font-bold text-content-strong sm:text-2xl">
              {value}
            </div>
          ) : null}
        </div>
      </div>
      {!compact ? (
        <div className="mt-4 break-words text-2xl font-bold text-content-strong [overflow-wrap:anywhere]">
          {value}
        </div>
      ) : null}
    </section>
  );
}
