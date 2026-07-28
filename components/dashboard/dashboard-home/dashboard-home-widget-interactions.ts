"use client";

import type { PointerEvent as ReactPointerEvent } from "react";

import {
  clampHomeWidgetX,
  clampHomeWidgetY,
  type HomeWidgetInstance,
} from "./dashboard-home-layout";
import {
  createHomeWidgetResizePreview,
  readHomeWidgetGridMetrics,
} from "./dashboard-home-widget-resize-preview";
import {
  getHomeWidgetResizeCursor,
  getResizedHomeWidgetLayout,
  type HomeWidgetLayout,
  type HomeWidgetResizeDirection,
} from "./dashboard-home-widget-resize";

export type { HomeWidgetResizeDirection } from "./dashboard-home-widget-resize";

const POSITION_DRAG_START_THRESHOLD_PX = 6;

export function startHomeWidgetPositionDrag(
  event: ReactPointerEvent<HTMLElement>,
  options: {
    editing: boolean;
    onDragEnd: () => void;
    onDragStart: () => void;
    onMove: (layout: Pick<HomeWidgetInstance, "x" | "y">) => void;
    widget: HomeWidgetInstance;
  },
) {
  if (
    !options.editing ||
    event.button !== 0 ||
    isInteractiveDragTarget(event.target)
  ) {
    return;
  }

  event.preventDefault();
  const widgetElement = event.currentTarget;
  const gridElement = widgetElement.closest<HTMLElement>(
    "[data-testid='home-widget-grid']",
  );

  if (!gridElement) {
    return;
  }

  const widgetRect = widgetElement.getBoundingClientRect();
  const startOffset = {
    x: event.clientX - widgetRect.left,
    y: event.clientY - widgetRect.top,
  };
  const startPoint = {
    x: event.clientX,
    y: event.clientY,
  };
  const originalInlineStyle = {
    transform: widgetElement.style.transform,
    zIndex: widgetElement.style.zIndex,
  };

  capturePointer(widgetElement, event.pointerId);
  let active = true;
  let bodyState: ReturnType<typeof lockBodyForDrag> | null = null;
  let draggingStarted = false;

  const startDragging = () => {
    if (draggingStarted) {
      return;
    }

    draggingStarted = true;
    widgetElement.style.zIndex = "60";
    bodyState = lockBodyForDrag("grabbing");
    options.onDragStart();
  };

  const cleanup = (pointerUpEvent?: globalThis.PointerEvent) => {
    if (!active) {
      return;
    }

    active = false;
    widgetElement.style.transform = originalInlineStyle.transform;
    widgetElement.style.zIndex = originalInlineStyle.zIndex;
    releasePointer(widgetElement, event.pointerId);
    if (bodyState) {
      restoreBodyAfterDrag(bodyState);
    }
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerCancel);
    window.removeEventListener("blur", handleWindowBlur);

    if (draggingStarted && pointerUpEvent) {
      options.onMove(
        getHomeWidgetPositionAtPoint(
          gridElement,
          options.widget,
          pointerUpEvent.clientX - startOffset.x,
          pointerUpEvent.clientY - startOffset.y,
        ),
      );
    }

    if (draggingStarted) {
      options.onDragEnd();
    }
  };

  const handlePointerUp = (pointerUpEvent: globalThis.PointerEvent) => {
    cleanup(pointerUpEvent);
  };
  const handlePointerCancel = () => cleanup();
  const handleWindowBlur = () => cleanup();
  const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
    moveEvent.preventDefault();
    const deltaX = moveEvent.clientX - startPoint.x;
    const deltaY = moveEvent.clientY - startPoint.y;

    if (
      !draggingStarted &&
      Math.hypot(deltaX, deltaY) < POSITION_DRAG_START_THRESHOLD_PX
    ) {
      return;
    }

    startDragging();
    widgetElement.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
  };

  window.addEventListener("pointermove", handlePointerMove, {
    passive: false,
  });
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("pointercancel", handlePointerCancel);
  window.addEventListener("blur", handleWindowBlur);
}

export function startHomeWidgetResize(
  event: ReactPointerEvent<HTMLButtonElement>,
  widget: HomeWidgetInstance,
  direction: HomeWidgetResizeDirection,
  callbacks: {
    onResize: (size: HomeWidgetLayout) => void;
    onResizeEnd: () => void;
    onResizeStart: () => void;
  },
) {
  event.preventDefault();
  event.stopPropagation();

  const startX = event.clientX;
  const startY = event.clientY;
  const startWidgetX = widget.x;
  const startWidgetY = widget.y;
  const startWidth = widget.width;
  const startHeight = widget.height;
  const resizeHandle = event.currentTarget;
  const gridElement = resizeHandle.closest<HTMLElement>(
    "[data-testid='home-widget-grid']",
  );

  if (!gridElement) {
    return;
  }

  const gridMetrics = readHomeWidgetGridMetrics(gridElement);
  const bodyState = lockBodyForDrag(getHomeWidgetResizeCursor(direction));
  const resizePreview = createHomeWidgetResizePreview(gridElement, gridMetrics, {
    height: startHeight,
    width: startWidth,
    x: startWidgetX,
    y: startWidgetY,
  });

  let active = true;
  let lastLayout: HomeWidgetLayout = {
    height: startHeight,
    width: startWidth,
    x: startWidgetX,
    y: startWidgetY,
  };

  capturePointer(resizeHandle, event.pointerId);
  callbacks.onResizeStart();

  const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
    moveEvent.preventDefault();

    const deltaColumns = Math.round(
      (moveEvent.clientX - startX) / gridMetrics.columnStridePx,
    );
    const deltaRows = Math.round(
      (moveEvent.clientY - startY) / gridMetrics.rowStridePx,
    );

    const nextLayout = getResizedHomeWidgetLayout(
      widget,
      direction,
      deltaColumns,
      deltaRows,
    );

    if (areHomeWidgetLayoutsEqual(lastLayout, nextLayout)) {
      return;
    }

    lastLayout = nextLayout;
    resizePreview.update(nextLayout);
  };

  const cleanup = (commit: boolean) => {
    if (!active) {
      return;
    }

    active = false;
    resizePreview.remove();
    releasePointer(resizeHandle, event.pointerId);
    restoreBodyAfterDrag(bodyState);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerCancel);
    window.removeEventListener("blur", handleWindowBlur);

    if (commit && !areHomeWidgetLayoutsEqual(lastLayout, widget)) {
      callbacks.onResize(lastLayout);
    }

    callbacks.onResizeEnd();
  };

  const handlePointerUp = () => cleanup(true);
  const handlePointerCancel = () => cleanup(false);
  const handleWindowBlur = () => cleanup(false);

  window.addEventListener("pointermove", handlePointerMove, {
    passive: false,
  });
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("pointercancel", handlePointerCancel);
  window.addEventListener("blur", handleWindowBlur);
}

function getHomeWidgetPositionAtPoint(
  gridElement: HTMLElement,
  widget: HomeWidgetInstance,
  x: number,
  y: number,
) {
  const gridMetrics = readHomeWidgetGridMetrics(gridElement);
  const gridRect = gridElement.getBoundingClientRect();
  const gridX = x - gridRect.left;
  const gridY = y - gridRect.top;

  return {
    x: clampHomeWidgetX(
      Math.round(gridX / gridMetrics.columnStridePx),
      widget.width,
    ),
    y: clampHomeWidgetY(Math.round(gridY / gridMetrics.rowStridePx)),
  };
}

function areHomeWidgetLayoutsEqual(
  first: HomeWidgetLayout,
  second: HomeWidgetLayout,
) {
  return (
    first.height === second.height &&
    first.width === second.width &&
    first.x === second.x &&
    first.y === second.y
  );
}

function isInteractiveDragTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(
      target.closest(
        "button,a,input,select,textarea,[role='button'],[role='tab'],[data-home-widget-control]",
      ),
    )
  );
}

function lockBodyForDrag(cursor: string) {
  const bodyState = {
    cursor: document.body.style.cursor,
    touchAction: document.body.style.touchAction,
    userSelect: document.body.style.userSelect,
  };

  document.body.style.cursor = cursor;
  document.body.style.touchAction = "none";
  document.body.style.userSelect = "none";

  return bodyState;
}

function restoreBodyAfterDrag(bodyState: {
  cursor: string;
  touchAction: string;
  userSelect: string;
}) {
  document.body.style.cursor = bodyState.cursor;
  document.body.style.touchAction = bodyState.touchAction;
  document.body.style.userSelect = bodyState.userSelect;
}

function capturePointer(element: HTMLElement, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Capture can fail when the pointer has already been released.
  }
}

function releasePointer(element: HTMLElement, pointerId: number) {
  try {
    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }
  } catch {
    // The browser may have already released capture during cancellation.
  }
}
