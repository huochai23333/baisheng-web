import { cva } from "class-variance-authority";

/**
 * 按钮外观单独放在无客户端边界的文件中。
 * 这样服务端页面可以把同一套样式用于 Link，而不会尝试在服务端调用客户端函数。
 */
export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow,opacity,scale,transform] duration-150 ease-out outline-none select-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring active:not-aria-[haspopup]:translate-y-px active:not-aria-[haspopup]:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-brand-hover",
        outline:
          "border-filter-control-border bg-surface-interactive text-primary hover:border-filter-control-hover hover:bg-muted hover:text-foreground aria-expanded:border-filter-control-hover aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/85 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "text-primary hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        danger:
          "bg-status-danger-soft text-status-danger hover:bg-status-danger-soft/75 focus-visible:border-status-danger/40 focus-visible:ring-status-danger/20",
        success:
          "bg-status-success text-white hover:bg-status-success/90 focus-visible:border-status-success/40 focus-visible:ring-status-success/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        compact:
          "h-11 gap-1.5 rounded-full px-4 text-xs sm:h-10",
        default: "h-11 gap-2 rounded-full px-5",
        large: "h-[52px] gap-2 rounded-[22px] px-6 text-[15px]",
        icon: "size-11 rounded-full",
        "icon-compact": "size-11 rounded-full sm:size-10",
        "icon-large": "size-[52px] rounded-[22px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);
