"use client";

import {
  clampHomeWidgetX,
  clampHomeWidgetY,
  HOME_WIDGET_GRID_COLUMNS,
  HOME_WIDGET_MAX_SIZE,
  HOME_WIDGET_MIN_SIZE,
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
  return {
    ...getHorizontalResize(widget, direction, deltaColumns),
    ...getVerticalResize(widget, direction, deltaRows),
  };
}

function getHorizontalResize(
  widget: HomeWidgetInstance,
  direction: HomeWidgetResizeDirection,
  deltaColumns: number,
) {
  if (direction.includes("left")) {
    return resizeFromLeft(widget.x, widget.x + widget.width, deltaColumns);
  }

  if (direction.includes("right")) {
    return resizeFromRight(widget.x, widget.width, deltaColumns);
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
) {
  if (direction.includes("top")) {
    return resizeFromTop(widget.y, widget.y + widget.height, deltaRows);
  }

  if (direction.includes("bottom")) {
    return resizeFromBottom(widget.y, widget.height, deltaRows);
  }

  return {
    height: widget.height,
    y: widget.y,
  };
}

function resizeFromLeft(startX: number, right: number, deltaColumns: number) {
  const maxWidth = Math.min(HOME_WIDGET_MAX_SIZE, right);
  const nextWidth = clampSize(right - startX - deltaColumns, maxWidth);
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
) {
  const maxWidth = Math.min(
    HOME_WIDGET_MAX_SIZE,
    HOME_WIDGET_GRID_COLUMNS - startX,
  );

  return {
    width: clampSize(startWidth + deltaColumns, maxWidth),
    x: startX,
  };
}

function resizeFromTop(startY: number, bottom: number, deltaRows: number) {
  const maxHeight = Math.min(HOME_WIDGET_MAX_SIZE, bottom);
  const nextHeight = clampSize(bottom - startY - deltaRows, maxHeight);
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
) {
  return {
    height: clampSize(startHeight + deltaRows, HOME_WIDGET_MAX_SIZE),
    y: startY,
  };
}

function clampSize(value: number, maxSize: number) {
  if (!Number.isFinite(value)) {
    return HOME_WIDGET_MIN_SIZE;
  }

  return Math.min(
    maxSize,
    Math.max(HOME_WIDGET_MIN_SIZE, Math.round(value)),
  );
}
