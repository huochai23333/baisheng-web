import type { ComponentProps } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const surfaceVariants = cva("min-w-0 border", {
  variants: {
    variant: {
      panel:
        "rounded-[24px] border-white/85 bg-surface-panel shadow-[var(--surface-shadow-panel)] sm:rounded-[28px]",
      inset:
        "rounded-[20px] border-border-subtle bg-surface-inset shadow-[var(--surface-shadow-inset)] sm:rounded-[24px]",
      interactive:
        "rounded-[20px] border-border-subtle bg-surface-interactive shadow-[var(--surface-shadow-interactive)] transition hover:border-ring sm:rounded-[24px]",
    },
    padding: {
      compact: "p-3 sm:p-4",
      regular: "p-4 sm:p-6",
      spacious: "p-4 sm:p-6 xl:p-8",
    },
  },
  defaultVariants: {
    variant: "panel",
    padding: "regular",
  },
});

export function Surface({
  className,
  padding,
  variant,
  ...props
}: ComponentProps<"section"> & VariantProps<typeof surfaceVariants>) {
  return (
    <section
      className={cn(surfaceVariants({ padding, variant }), className)}
      data-slot="surface"
      data-surface-variant={variant ?? "panel"}
      {...props}
    />
  );
}

export { surfaceVariants };
