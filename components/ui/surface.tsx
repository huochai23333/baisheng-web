import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const surfaceVariants = cva("min-w-0 border", {
  variants: {
    variant: {
      panel:
        "rounded-surface-panel border-surface-panel-border bg-surface-panel shadow-surface-panel backdrop-blur-xl backdrop-saturate-150",
      inset:
        "rounded-surface-inset border-border-subtle bg-surface-inset shadow-surface-inset",
      interactive:
        "rounded-surface-inset border-border-subtle bg-surface-interactive shadow-surface-interactive transition hover:border-ring",
      floating:
        "rounded-surface-panel border-surface-panel-border bg-surface-overlay shadow-surface-floating",
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

type SurfaceElement = "section" | "article" | "div";

type SurfaceProps<TElement extends SurfaceElement> = {
  as?: TElement;
} & Omit<ComponentPropsWithoutRef<TElement>, "as"> &
  VariantProps<typeof surfaceVariants>;

/**
 * 表面组件统一面板的材质、圆角、阴影和内边距。
 * `as` 只改变语义标签，不允许业务组件因此复制另一套外观。
 */
export function Surface<TElement extends SurfaceElement = "section">({
  as,
  className,
  padding,
  variant,
  ...props
}: SurfaceProps<TElement>) {
  const Component = (as ?? "section") as ElementType;

  return (
    <Component
      className={cn(surfaceVariants({ padding, variant }), className)}
      data-slot="surface"
      data-surface-variant={variant ?? "panel"}
      {...props}
    />
  );
}

export { surfaceVariants };
