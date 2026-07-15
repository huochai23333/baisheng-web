"use client";

import { useCallback, useEffect, useRef } from "react";

const DEFAULT_STALE_FOCUS_RECOVERY_MS = 180_000;

export function useStaleFocusRecovery(
  staleAfterMs = DEFAULT_STALE_FOCUS_RECOVERY_MS,
) {
  const forceFullPageLoadRef = useRef(false);
  const lastActivityAtRef = useRef(0);
  const lastInactiveAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    // 组件挂载时先记录一个健康时间点。这样即使页面始终保持可见，
    // 浏览器休眠或用户长时间没有操作后，下一次点击也能识别旧页面状态。
    lastActivityAtRef.current = Date.now();

    const markInactive = () => {
      lastInactiveAtRef.current = Date.now();
    };

    const markActive = () => {
      const now = Date.now();
      const inactiveAt = lastInactiveAtRef.current;
      lastInactiveAtRef.current = null;

      if (inactiveAt !== null && now - inactiveAt >= staleAfterMs) {
        forceFullPageLoadRef.current = true;
      }

      lastActivityAtRef.current = now;
    };

    const markUserActivity = () => {
      const now = Date.now();

      // pointerdown 和 keydown 都发生在链接 click 之前。
      // 先把“本次操作前是否已经闲置过久”保存下来，导航点击随后就能决定是否整页加载。
      if (
        lastActivityAtRef.current > 0 &&
        now - lastActivityAtRef.current >= staleAfterMs
      ) {
        forceFullPageLoadRef.current = true;
      }

      lastActivityAtRef.current = now;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        markInactive();
        return;
      }

      markActive();
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        forceFullPageLoadRef.current = true;
        return;
      }

      markActive();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", markInactive);
    window.addEventListener("focus", markActive);
    window.addEventListener("keydown", markUserActivity);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pointerdown", markUserActivity);
    window.addEventListener("scroll", markUserActivity, { passive: true });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", markInactive);
      window.removeEventListener("focus", markActive);
      window.removeEventListener("keydown", markUserActivity);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("pointerdown", markUserActivity);
      window.removeEventListener("scroll", markUserActivity);
    };
  }, [staleAfterMs]);

  return useCallback(() => {
    if (!forceFullPageLoadRef.current) {
      return false;
    }

    forceFullPageLoadRef.current = false;
    return true;
  }, []);
}
