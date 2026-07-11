"use client";

import { useEffect, type ReactNode } from "react";

import { motion, useReducedMotion } from "motion/react";

import { MOTION_DURATION, MOTION_EASING } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

type PageRevealProps = {
  children: ReactNode;
  className?: string;
};

export function PageReveal({ children, className }: PageRevealProps) {
  const reduceMotion = useReducedMotion();

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
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn("min-w-0", className)}
      data-motion-page="true"
      // 页面在服务端已经有完整内容，不能从完全透明开始，否则水合瞬间会出现白屏闪烁。
      initial={reduceMotion ? false : { opacity: 0.72, y: 10 }}
      transition={{
        duration: reduceMotion ? 0 : MOTION_DURATION.page,
        ease: MOTION_EASING.enter,
      }}
    >
      {children}
    </motion.div>
  );
}
