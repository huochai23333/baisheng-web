"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type { HomeWidgetResizeDirection } from "./dashboard-home-widget-interactions";

export type ActiveHomeWidgetResizeHandle = {
  direction: HomeWidgetResizeDirection;
  left: number;
  top: number;
  visible: boolean;
};

type UseDashboardHomeWidgetResizeHandleOptions = {
  deleting: boolean;
  dragging: boolean;
  editing: boolean;
  entering: boolean;
  resizing: boolean;
};

const RESIZE_EDGE_THRESHOLD_PX = 34;

export function useDashboardHomeWidgetResizeHandle({
  deleting,
  dragging,
  editing,
  entering,
  resizing,
}: UseDashboardHomeWidgetResizeHandleOptions) {
  const hideHandleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pointerOnControl, setPointerOnControl] = useState(false);
  const [resizeHandle, setResizeHandle] =
    useState<ActiveHomeWidgetResizeHandle | null>(null);

  useEffect(
    () => () => {
      if (hideHandleTimerRef.current) {
        clearTimeout(hideHandleTimerRef.current);
      }
    },
    [],
  );

  const showResizeHandle = useCallback(
    (nextHandle: Omit<ActiveHomeWidgetResizeHandle, "visible">) => {
      if (hideHandleTimerRef.current) {
        clearTimeout(hideHandleTimerRef.current);
        hideHandleTimerRef.current = null;
      }

      setResizeHandle({ ...nextHandle, visible: true });
    },
    [],
  );

  const hideResizeHandle = useCallback(() => {
    setResizeHandle((currentHandle) =>
      currentHandle ? { ...currentHandle, visible: false } : null,
    );

    if (hideHandleTimerRef.current) {
      clearTimeout(hideHandleTimerRef.current);
    }

    hideHandleTimerRef.current = setTimeout(() => {
      setResizeHandle(null);
      hideHandleTimerRef.current = null;
    }, 160);
  }, []);

  const handleResizePointerLeave = useCallback(() => {
    setPointerOnControl(false);
    if (!resizing) {
      hideResizeHandle();
    }
  }, [hideResizeHandle, resizing]);

  const handleResizePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!editing || deleting || dragging || entering) {
        setPointerOnControl(false);
        hideResizeHandle();
        return;
      }

      if (resizing) {
        return;
      }

      if (isPointerOnCardControl(event)) {
        /*
         * 编辑按钮跟着卡片一起摇晃时，鼠标目标会持续移动。
         * 指针进入按钮后先暂停当前卡片，让调整、删除等操作可以稳定点击。
         */
        setPointerOnControl(true);
        hideResizeHandle();
        return;
      }

      setPointerOnControl(false);
      const nextHandle = getResizeHandleFromPointer(event);

      if (nextHandle) {
        showResizeHandle(nextHandle);
      } else {
        hideResizeHandle();
      }
    },
    [
      deleting,
      dragging,
      editing,
      entering,
      hideResizeHandle,
      resizing,
      showResizeHandle,
    ],
  );

  return {
    handleResizePointerLeave,
    handleResizePointerMove,
    pointerOnControl,
    resizeHandle: editing ? resizeHandle : null,
  };
}

function getResizeHandleFromPointer(
  event: ReactPointerEvent<HTMLElement>,
): Omit<ActiveHomeWidgetResizeHandle, "visible"> | null {
  const rect = event.currentTarget.getBoundingClientRect();
  const pointerX = event.clientX - rect.left;
  const pointerY = event.clientY - rect.top;

  if (!isPointerNearResizeArea(pointerX, pointerY, rect.width, rect.height)) {
    return null;
  }

  const direction = getResizeDirectionFromPointer(
    pointerX,
    pointerY,
    rect.width,
    rect.height,
  );

  return direction ? getFixedResizeHandle(direction, rect.width, rect.height) : null;
}

function isPointerNearResizeArea(
  pointerX: number,
  pointerY: number,
  width: number,
  height: number,
) {
  return (
    pointerX <= RESIZE_EDGE_THRESHOLD_PX ||
    width - pointerX <= RESIZE_EDGE_THRESHOLD_PX ||
    pointerY <= RESIZE_EDGE_THRESHOLD_PX ||
    height - pointerY <= RESIZE_EDGE_THRESHOLD_PX
  );
}

function getResizeDirectionFromPointer(
  pointerX: number,
  pointerY: number,
  width: number,
  height: number,
): HomeWidgetResizeDirection | null {
  const nearLeft = pointerX <= RESIZE_EDGE_THRESHOLD_PX;
  const nearRight = width - pointerX <= RESIZE_EDGE_THRESHOLD_PX;
  const nearTop = pointerY <= RESIZE_EDGE_THRESHOLD_PX;
  const nearBottom = height - pointerY <= RESIZE_EDGE_THRESHOLD_PX;

  if (nearLeft && nearTop) {
    return "top-left";
  }

  if (nearRight && nearTop) {
    return "top-right";
  }

  if (nearRight && nearBottom) {
    return "bottom-right";
  }

  if (nearLeft && nearBottom) {
    return "bottom-left";
  }

  const candidates: Array<{
    direction: HomeWidgetResizeDirection;
    distance: number;
  }> = [];

  if (nearLeft) {
    candidates.push({ direction: "left", distance: pointerX });
  }

  if (nearRight) {
    candidates.push({ direction: "right", distance: width - pointerX });
  }

  if (nearTop) {
    candidates.push({ direction: "top", distance: pointerY });
  }

  if (nearBottom) {
    candidates.push({ direction: "bottom", distance: height - pointerY });
  }

  return (
    candidates.reduce<(typeof candidates)[number] | null>(
      (nearest, candidate) =>
        !nearest || candidate.distance < nearest.distance ? candidate : nearest,
      null,
    )?.direction ?? null
  );
}

function getFixedResizeHandle(
  direction: HomeWidgetResizeDirection,
  width: number,
  height: number,
): Omit<ActiveHomeWidgetResizeHandle, "visible"> {
  /*
   * 44px 的透明操作区以真实边缘为中心，小型视觉把手再向卡片内侧偏移。
   * 这样鼠标无需精确瞄准，用户看到的标记又始终贴着要调整的边。
   */
  const left = 0;
  const centerX = width / 2;
  const right = width;
  const top = 0;
  const centerY = height / 2;
  const bottom = height;

  return {
    direction,
    left: getFixedResizeHandleX(direction, left, centerX, right),
    top: getFixedResizeHandleY(direction, top, centerY, bottom),
  };
}

function getFixedResizeHandleX(
  direction: HomeWidgetResizeDirection,
  left: number,
  centerX: number,
  right: number,
) {
  if (direction.includes("left")) {
    return left;
  }

  if (direction.includes("right")) {
    return right;
  }

  return centerX;
}

function getFixedResizeHandleY(
  direction: HomeWidgetResizeDirection,
  top: number,
  centerY: number,
  bottom: number,
) {
  if (direction.includes("top")) {
    return top;
  }

  if (direction.includes("bottom")) {
    return bottom;
  }

  return centerY;
}

function isPointerOnCardControl(event: ReactPointerEvent<HTMLElement>) {
  if (
    event.target instanceof HTMLElement &&
    event.target.closest("[data-testid='home-widget-resize-handle-active']")
  ) {
    return false;
  }

  return (
    event.target instanceof HTMLElement &&
    Boolean(event.target.closest("button,a,input,select,textarea"))
  );
}
