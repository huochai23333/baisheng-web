"use client";

import {
  clampHomeWidgetX,
  clampHomeWidgetY,
  getHomeWidgetSizeLimits,
  HOME_WIDGET_GRID_COLUMNS,
  HOME_WIDGET_MAX_SIZE,
  type HomeWidgetInstance,
} from "./dashboard-home-layout";

export type HomeWidgetResizeDirection =
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "right"
  | "top"
  | "top-left"
  | "top-right";

export type HomeWidgetLayout = Pick<
  HomeWidgetInstance,
  "height" | "width" | "x" | "y"
>;

export function getHomeWidgetResizeCursor(
  direction: HomeWidgetResizeDirection,
) {
  if (direction === "left" || direction === "right") {
    return "ew-resize";
  }

  if (direction === "top" || direction === "bottom") {
    return "ns-resize";
  }

  return direction === "top-left" || direction === "bottom-right"
    ? "nwse-resize"
    : "nesw-resize";
}

export function getResizedHomeWidgetLayout(
  widget: HomeWidgetInstance,
  direction: HomeWidgetResizeDirection,
  deltaColumns: number,
  deltaRows: number,
): HomeWidgetLayout {
  const limits = getHomeWidgetSizeLimits(widget.type);

  return {
    ...getHorizontalResize(
      widget,
      direction,
      deltaColumns,
      limits.minWidth,
    ),
    ...getVerticalResize(widget, direction, deltaRows, limits.minHeight),
  };
}

function getHorizontalResize(
  widget: HomeWidgetInstance,
  direction: HomeWidgetResizeDirection,
  deltaColumns: number,
  minimumWidth: number,
) {
  if (direction.includes("left")) {
    return resizeFromLeft(
      widget.x,
      widget.x + widget.width,
      deltaColumns,
      minimumWidth,
    );
  }

  if (direction.includes("right")) {
    return resizeFromRight(
      widget.x,
      widget.width,
      deltaColumns,
      minimumWidth,
    );
  }

  return {
    width: widget.width,
    x: widget.x,
  };
}

function getVerticalResize(
  widget: HomeWidgetInstance,
  direction: HomeWidgetResizeDirection,
  deltaRows: number,
  minimumHeight: number,
) {
  if (direction.includes("top")) {
    return resizeFromTop(
      widget.y,
      widget.y + widget.height,
      deltaRows,
      minimumHeight,
    );
  }

  if (direction.includes("bottom")) {
    return resizeFromBottom(
      widget.y,
      widget.height,
      deltaRows,
      minimumHeight,
    );
  }

  return {
    height: widget.height,
    y: widget.y,
  };
}

function resizeFromLeft(
  startX: number,
  right: number,
  deltaColumns: number,
  minimumWidth: number,
) {
  const maxWidth = Math.min(HOME_WIDGET_MAX_SIZE, right);
  const nextWidth = clampSize(
    right - startX - deltaColumns,
    minimumWidth,
    maxWidth,
  );
  const nextX = right - nextWidth;

  return {
    width: nextWidth,
    x: clampHomeWidgetX(nextX, nextWidth),
  };
}

function resizeFromRight(
  startX: number,
  startWidth: number,
  deltaColumns: number,
  minimumWidth: number,
) {
  const maxWidth = Math.min(
    HOME_WIDGET_MAX_SIZE,
    HOME_WIDGET_GRID_COLUMNS - startX,
  );

  return {
    width: clampSize(startWidth + deltaColumns, minimumWidth, maxWidth),
    x: startX,
  };
}

function resizeFromTop(
  startY: number,
  bottom: number,
  deltaRows: number,
  minimumHeight: number,
) {
  const maxHeight = Math.min(HOME_WIDGET_MAX_SIZE, bottom);
  const nextHeight = clampSize(
    bottom - startY - deltaRows,
    minimumHeight,
    maxHeight,
  );
  const nextY = bottom - nextHeight;

  return {
    height: nextHeight,
    y: clampHomeWidgetY(nextY),
  };
}

function resizeFromBottom(
  startY: number,
  startHeight: number,
  deltaRows: number,
  minimumHeight: number,
) {
  return {
    height: clampSize(
      startHeight + deltaRows,
      minimumHeight,
      HOME_WIDGET_MAX_SIZE,
    ),
    y: startY,
  };
}

function clampSize(value: number, minimum: number, maximum: number) {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.min(maximum, Math.max(minimum, Math.round(value)));
}
