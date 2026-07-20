import type { ReactNode } from "react";

/**
 * 同一份数据可以分别用桌面表格和移动卡片展示，但断点只能在这里定义。
 * 底栏放在两种视图之后，因此数量、分页和继续加载不会被重复渲染。
 */
export function ResponsiveDataView({
  breakpoint = "md",
  desktop,
  empty,
  footer,
  isEmpty = false,
  mobile,
}: {
  breakpoint?: "md" | "lg";
  desktop: ReactNode;
  empty?: ReactNode;
  footer?: ReactNode;
  isEmpty?: boolean;
  mobile: ReactNode;
}) {
  if (isEmpty) return <>{empty}</>;

  return (
    <div data-breakpoint={breakpoint} data-slot="responsive-data-view">
      <div
        className={breakpoint === "lg" ? "hidden lg:block" : "hidden md:block"}
      >
        {desktop}
      </div>
      <div
        className={
          breakpoint === "lg"
            ? "grid min-w-0 w-full gap-3 lg:hidden [&>*]:min-w-0"
            : "grid min-w-0 w-full gap-3 md:hidden [&>*]:min-w-0"
        }
      >
        {mobile}
      </div>
      {footer}
    </div>
  );
}
