"use client";

import type { ComponentProps, ReactNode } from "react";

import { Search } from "lucide-react";

import { controlVariants, Field, Input } from "@/components/ui/form-controls";
import { Surface, surfaceVariants } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

type DashboardSectionPanelProps = {
  children: ReactNode;
  className?: string;
};

type DashboardFilterPanelProps = DashboardSectionPanelProps & {
  gridClassName?: string;
  footer?: ReactNode;
  variant?: "inset" | "standalone";
};

type DashboardListHeaderProps = {
  actions?: ReactNode;
  className?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
};

type DashboardListSectionProps = DashboardSectionPanelProps & {
  actions?: ReactNode;
  bodyClassName?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  headerClassName?: string;
  title?: ReactNode;
};

type DashboardTableFrameProps = DashboardSectionPanelProps & {
  footer?: ReactNode;
  innerClassName?: string;
};

type DashboardSearchInputProps = {
  ariaLabel?: string;
  className?: string;
  onChange: (value: string) => void;
  onKeyDown?: ComponentProps<"input">["onKeyDown"];
  placeholder: string;
  value: string;
};

export function DashboardSectionPanel({
  children,
  className,
}: DashboardSectionPanelProps) {
  return (
    <Surface
      className={cn("motion-surface-enter", className)}
      padding="spacious"
    >
      {children}
    </Surface>
  );
}

export function DashboardFilterPanel({
  children,
  className,
  footer,
  gridClassName,
  variant = "inset",
}: DashboardFilterPanelProps) {
  return (
    <div
      className={cn(
        variant === "inset" &&
          cn(
            surfaceVariants({ padding: "compact", variant: "inset" }),
            "motion-surface-enter",
          ),
        variant === "standalone" &&
          cn(
            surfaceVariants({ padding: "regular", variant: "panel" }),
            "motion-surface-enter",
          ),
        className,
      )}
    >
      <div className={cn("grid gap-3 sm:gap-4", gridClassName)}>{children}</div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}

export function DashboardListHeader({
  actions,
  className,
  description,
  eyebrow,
  title,
}: DashboardListHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="font-label text-[11px] font-semibold tracking-[0.18em] text-content-muted uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h3
          className={cn(
            "text-xl font-bold tracking-tight text-content-strong sm:text-2xl",
            eyebrow ? "mt-2" : "",
          )}
        >
          {title}
        </h3>
        {description ? (
          <p className="mt-1.5 text-sm leading-6 text-content-muted sm:mt-2 sm:leading-7">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap gap-2 sm:justify-end">{actions}</div>
      ) : null}
    </div>
  );
}

export function DashboardListSection({
  actions,
  bodyClassName,
  children,
  className,
  description,
  eyebrow,
  headerClassName,
  title,
}: DashboardListSectionProps) {
  const hasHeader = title || description || eyebrow || actions;

  return (
    <DashboardSectionPanel className={className}>
      {hasHeader ? (
        <DashboardListHeader
          actions={actions}
          className={headerClassName}
          description={description}
          eyebrow={eyebrow}
          title={title}
        />
      ) : null}
      <div
        className={cn(hasHeader ? "mt-4 sm:mt-6" : "", bodyClassName)}
        data-motion-collection="true"
      >
        {children}
      </div>
    </DashboardSectionPanel>
  );
}

export function DashboardTableFrame({
  children,
  className,
  footer,
  innerClassName,
}: DashboardTableFrameProps) {
  return (
    <div
      className={cn(
        surfaceVariants({ padding: null, variant: "interactive" }),
        "motion-surface-enter overflow-hidden hover:border-border-subtle sm:rounded-surface-panel",
        className,
      )}
    >
      <div
        className={cn("overflow-x-auto", innerClassName)}
        data-motion-collection="true"
      >
        {children}
      </div>
      {footer ? (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">{footer}</div>
      ) : null}
    </div>
  );
}

/**
 * 筛选控件使用较浅的静止边界，避免一排选项同时抢夺注意力。
 * 悬停和键盘聚焦仍会加深，因此浅色不是通过牺牲交互反馈实现的。
 */
export const dashboardFilterInputClassName = cn(
  controlVariants({ controlSize: "default", density: "filter" }),
);

export function DashboardFilterField({
  children,
  controlId,
  label,
}: {
  children: ReactNode;
  controlId?: string;
  label: ReactNode;
}) {
  return (
    <Field controlId={controlId} density="filter" label={label}>
      {children}
    </Field>
  );
}

export function DashboardSearchInput({
  ariaLabel,
  className,
  onChange,
  onKeyDown,
  placeholder,
  value,
}: DashboardSearchInputProps) {
  return (
    <div
      className={cn("relative min-w-0", className)}
      data-slot="dashboard-search-input"
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute start-3 top-1/2 z-10 size-4 -translate-y-1/2 text-content-subtle"
        data-slot="dashboard-search-input-icon"
      />
      <Input
        // `ps-10!` 会覆盖桌面断点的普通横向内边距，始终为图标保留完整文字槽位。
        aria-label={ariaLabel}
        className="ps-10!"
        controlSize="default"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </div>
  );
}
