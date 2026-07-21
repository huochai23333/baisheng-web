"use client";

import { useEffect, useSyncExternalStore } from "react";

export type HomeWidgetDisplayMode = "automatic" | "custom";

const DESKTOP_LAYOUT_QUERY = "(min-width: 80rem)";

function subscribeToDesktopLayout(callback: () => void) {
  const mediaQuery = window.matchMedia(DESKTOP_LAYOUT_QUERY);
  mediaQuery.addEventListener("change", callback);

  return () => mediaQuery.removeEventListener("change", callback);
}

function getDesktopLayoutSnapshot() {
  return window.matchMedia(DESKTOP_LAYOUT_QUERY).matches;
}

/**
 * 1280px 是自由布局和自动布局的唯一分界线。CSS 负责实际排列，Hook 只负责
 * 关闭编辑状态和切换内容密度，因此缩小窗口不会改写账号保存的桌面坐标。
 */
export function useDashboardHomeDisplayMode(stopEditing: () => void) {
  const desktopLayout = useSyncExternalStore(
    subscribeToDesktopLayout,
    getDesktopLayoutSnapshot,
    () => false,
  );
  const displayMode: HomeWidgetDisplayMode = desktopLayout
    ? "custom"
    : "automatic";

  useEffect(() => {
    if (displayMode === "automatic") stopEditing();
  }, [displayMode, stopEditing]);

  return displayMode;
}
