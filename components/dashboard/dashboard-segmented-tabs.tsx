"use client";

import { InteractiveButton as DesignButton } from "@/components/ui/button";

import { useId, type ReactNode } from "react";

import { LoaderCircle } from "lucide-react";
import { LayoutGroup, motion } from "motion/react";

import { cn } from "@/lib/utils";

export type DashboardSegmentedTabOption<Key extends string> = {
  badge?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  key: Key;
  label: ReactNode;
};

type DashboardSegmentedTabsProps<Key extends string> = {
  className?: string;
  onChange: (value: Key) => void;
  options: Array<DashboardSegmentedTabOption<Key>>;
  pendingValue?: Key | null;
  value: Key;
};

export function DashboardSegmentedTabs<Key extends string>({
  className,
  onChange,
  options,
  pendingValue = null,
  value,
}: DashboardSegmentedTabsProps<Key>) {
  const layoutGroupId = useId();

  return (
    <LayoutGroup id={layoutGroupId}>
      <div
        className={cn(
          "flex w-full flex-col gap-2 rounded-[22px] border border-border bg-white/78 p-2 shadow-[var(--surface-shadow-interactive)] sm:flex-row",
          className,
        )}
        data-motion-segmented-tabs="true"
      >
        {options.map((option) => {
          const isActive = option.key === value;
          const isPending = option.key === pendingValue;

          return (
            <DesignButton
              aria-pressed={isActive}
              aria-busy={isPending}
              className={cn(
                "relative flex min-h-12 flex-1 items-center gap-3 overflow-hidden rounded-[16px] px-4 py-3 text-left text-sm transition-colors",
                isActive
                  ? "text-white"
                  : "bg-surface-inset text-content-muted hover:bg-surface-inset hover:text-content-strong",
              )}
              key={option.key}
              onClick={() => onChange(option.key)}
              type="button"
            >
              {isActive ? (
                <motion.span
                  className="absolute inset-0 rounded-[16px] bg-primary shadow-[var(--surface-shadow-interactive)]"
                  layoutId="dashboard-segmented-tab-active"
                  transition={{ bounce: 0.1, duration: 0.28, type: "spring" }}
                />
              ) : null}
              <span className="relative z-10 flex w-full items-center gap-3">
                {option.icon || isPending ? (
                  <span
                    className={cn(
                      "inline-flex size-8 shrink-0 items-center justify-center rounded-full",
                      isActive
                        ? "bg-white/16 text-white"
                        : "bg-white text-primary",
                    )}
                  >
                    {isPending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      option.icon
                    )}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="font-semibold">{option.label}</span>
                    {option.badge ? (
                      <span
                        className={cn(
                          "inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
                          isActive
                            ? "bg-white/18 text-white"
                            : "bg-white text-primary",
                        )}
                      >
                        {option.badge}
                      </span>
                    ) : null}
                  </span>
                  {option.description ? (
                    <span
                      className={cn(
                        "mt-1 block text-xs leading-5",
                        isActive ? "text-white/78" : "text-content-muted",
                      )}
                    >
                      {option.description}
                    </span>
                  ) : null}
                </span>
              </span>
            </DesignButton>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
