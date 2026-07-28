"use client";

import { HOME_WIDGET_GRID_COLUMNS, HOME_WIDGET_ROW_UNIT_PX } from "./dashboard-home-layout";
import type { HomeWidgetLayout } from "./dashboard-home-widget-resize";

export type HomeWidgetGridMetrics = {
  columnGapPx: number;
  columnStridePx: number;
  columnWidthPx: number;
  rowGapPx: number;
  rowStridePx: number;
};

type HomeWidgetResizePreview = {
  remove: () => void;
  update: (layout: HomeWidgetLayout) => void;
};

/**
 * 缩放时只移动这一层轻量预览，不立即改动真实网格。
 * 这样相邻组件不会在鼠标每移动一小段时反复重排，用户松开鼠标后才一次性落位。
 */
export function createHomeWidgetResizePreview(
  gridElement: HTMLElement,
  metrics: HomeWidgetGridMetrics,
  initialLayout: HomeWidgetLayout,
): HomeWidgetResizePreview {
  const preview = document.createElement("div");
  const sizeLabel = document.createElement("span");

  preview.setAttribute("aria-hidden", "true");
  preview.dataset.testid = "home-widget-resize-preview";
  preview.className =
    "pointer-events-none absolute z-50 rounded-surface-panel border-2 border-ring bg-ring/10 shadow-surface-interactive";
  sizeLabel.className =
    "absolute bottom-2 right-2 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm";
  preview.append(sizeLabel);
  gridElement.append(preview);

  const update = (layout: HomeWidgetLayout) => {
    const width =
      layout.width * metrics.columnWidthPx +
      Math.max(0, layout.width - 1) * metrics.columnGapPx;
    const height =
      layout.height * HOME_WIDGET_ROW_UNIT_PX +
      Math.max(0, layout.height - 1) * metrics.rowGapPx;

    preview.style.height = `${height}px`;
    preview.style.transform = `translate3d(${layout.x * metrics.columnStridePx}px, ${layout.y * metrics.rowStridePx}px, 0)`;
    preview.style.width = `${width}px`;
    sizeLabel.textContent = `${layout.width} × ${layout.height}`;
  };

  update(initialLayout);

  return {
    remove: () => preview.remove(),
    update,
  };
}

export function readHomeWidgetGridMetrics(
  gridElement: HTMLElement,
): HomeWidgetGridMetrics {
  const rect = gridElement.getBoundingClientRect();
  const style = window.getComputedStyle(gridElement);
  const columnGapPx = Number.parseFloat(style.columnGap || "0") || 0;
  const rowGapPx = Number.parseFloat(style.rowGap || "0") || 0;
  const columnWidthPx =
    (rect.width - columnGapPx * (HOME_WIDGET_GRID_COLUMNS - 1)) /
    HOME_WIDGET_GRID_COLUMNS;

  return {
    columnGapPx,
    columnStridePx: Math.max(1, columnWidthPx + columnGapPx),
    columnWidthPx,
    rowGapPx,
    rowStridePx: HOME_WIDGET_ROW_UNIT_PX + rowGapPx,
  };
}
