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
const RESIZE_HANDLE_OFFSET_PX = 18;

export function useDashboardHomeWidgetResizeHandle({
  deleting,
  dragging,
  editing,
  entering,
  resizing,
}: UseDashboardHomeWidgetResizeHandleOptions) {
  const hideHandleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    if (!resizing) {
      hideResizeHandle();
    }
  }, [hideResizeHandle, resizing]);

  const handleResizePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!editing || deleting || dragging || entering) {
        hideResizeHandle();
        return;
      }

      if (resizing) {
        return;
      }

      if (isPointerOnCardControl(event)) {
        hideResizeHandle();
        return;
      }

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
  const left = RESIZE_HANDLE_OFFSET_PX;
  const centerX = width / 2;
  const right = Math.max(left, width - RESIZE_HANDLE_OFFSET_PX);
  const top = RESIZE_HANDLE_OFFSET_PX;
  const centerY = height / 2;
  const bottom = Math.max(top, height - RESIZE_HANDLE_OFFSET_PX);

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
