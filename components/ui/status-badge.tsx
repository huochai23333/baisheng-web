import type { ReactNode } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex max-w-full items-center justify-center gap-1.5 rounded-full font-semibold leading-5",
  {
    variants: {
      tone: {
        neutral: "text-content-muted",
        info: "text-status-info",
        success: "text-status-success",
        warning: "text-status-warning",
        danger: "text-status-danger",
      },
      emphasis: {
        soft: "border",
        outline: "border bg-transparent",
        solid: "border border-transparent text-white",
      },
      size: {
        sm: "min-h-7 px-3 py-1 text-xs",
        md: "min-h-8 px-3.5 py-1.5 text-sm",
      },
    },
    compoundVariants: [
      {
        tone: "neutral",
        emphasis: "soft",
        className: "border-status-neutral-border bg-status-neutral-soft",
      },
      {
        tone: "info",
        emphasis: "soft",
        className: "border-status-info-border bg-status-info-soft",
      },
      {
        tone: "success",
        emphasis: "soft",
        className:
          "border-status-success-border bg-status-success-soft",
      },
      {
        tone: "warning",
        emphasis: "soft",
        className:
          "border-status-warning-border bg-status-warning-soft",
      },
      {
        tone: "danger",
        emphasis: "soft",
        className: "border-status-danger-border bg-status-danger-soft",
      },
      { tone: "neutral", emphasis: "outline", className: "border-border" },
      { tone: "info", emphasis: "outline", className: "border-status-info/30" },
      {
        tone: "success",
        emphasis: "outline",
        className: "border-status-success/30",
      },
      {
        tone: "warning",
        emphasis: "outline",
        className: "border-status-warning/30",
      },
      {
        tone: "danger",
        emphasis: "outline",
        className: "border-status-danger/30",
      },
      { tone: "neutral", emphasis: "solid", className: "bg-content-muted" },
      { tone: "info", emphasis: "solid", className: "bg-status-info" },
      { tone: "success", emphasis: "solid", className: "bg-status-success" },
      { tone: "warning", emphasis: "solid", className: "bg-status-warning" },
      { tone: "danger", emphasis: "solid", className: "bg-status-danger" },
    ],
    defaultVariants: {
      tone: "neutral",
      emphasis: "soft",
      size: "sm",
    },
  },
);

export type StatusTone = NonNullable<
  VariantProps<typeof statusBadgeVariants>["tone"]
>;

export function StatusBadge({
  children,
  className,
  emphasis,
  size,
  tone,
}: {
  children: ReactNode;
  className?: string;
} & VariantProps<typeof statusBadgeVariants>) {
  return (
    <span
      className={cn(statusBadgeVariants({ emphasis, size, tone }), className)}
      data-emphasis={emphasis ?? "soft"}
      data-size={size ?? "sm"}
      data-slot="status-badge"
      data-tone={tone ?? "neutral"}
    >
      {children}
    </span>
  );
}

export { statusBadgeVariants };
