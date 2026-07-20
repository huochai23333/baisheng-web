"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { DashboardSharedMyState } from "./use-dashboard-shared-my-state";

export type DashboardMyStatItem =
  DashboardSharedMyState["account"]["profileStats"][number];

export function DashboardMySectionShell({
  action,
  children,
  description,
  icon,
  id,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  description: string;
  icon: ReactNode;
  id: string;
  title: string;
}) {
  return (
    <section
      className="scroll-mt-28 rounded-surface-panel border border-surface-panel-border bg-surface-panel p-6 shadow-surface-interactive xl:p-8 xl:col-span-6"
      id={id}
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-surface-inset text-primary">
            {icon}
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-primary">
              {title}
            </h3>
            <p className="mt-1 text-sm leading-6 text-content-muted">
              {description}
            </p>
          </div>
        </div>
        {action}
      </div>

      {children}
    </section>
  );
}

export function DashboardMyStatGrid({
  stats,
}: {
  stats: readonly DashboardMyStatItem[];
}) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      {stats.map((item) => (
        <div className="space-y-1" key={item.label}>
          <p className="font-label text-[11px] font-semibold tracking-[0.22em] text-content-muted uppercase">
            {item.label}
          </p>
          {"accent" in item && item.accent === "success" ? (
            <p className="flex items-center gap-2 text-lg font-medium text-status-success">
              <span className="h-2.5 w-2.5 rounded-full bg-status-success" />
              {item.value}
            </p>
          ) : (
            <p
              className={cn(
                "break-words text-lg font-medium text-primary",
                "mono" in item && item.mono && "tracking-[0.18em]",
              )}
            >
              {item.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
