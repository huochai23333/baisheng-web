"use client";

import { useEffect, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageRevealProps = {
  children: ReactNode;
  className?: string;
};

export function PageReveal({ children, className }: PageRevealProps) {
  useEffect(() => {
    // 手机键盘会为了聚焦登录输入框向下滚动页面。软导航进入工作台后如果保留该位置，
    // 首个标题会被粘性页头遮住；普通页面挂载时回到顶部，带 # 锚点的入口仍交给浏览器定位。
    if (window.location.hash) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      window.scrollTo({ behavior: "auto", left: 0, top: 0 });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return (
    // 服务端与客户端都输出同一个普通 div，避免动画库在水合前后生成不同属性。
    // CSS 只在允许动态效果时播放；偏好减少动态效果的用户会直接看到最终状态。
    <div className={cn("motion-page-reveal min-w-0", className)} data-motion-page="true">
      {children}
    </div>
  );
}
