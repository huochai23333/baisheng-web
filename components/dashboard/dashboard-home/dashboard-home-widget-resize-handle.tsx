"use client";

import type { PointerEvent as ReactPointerEvent } from "react";

import { InteractiveButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { HomeCustomizerCopy } from "./dashboard-home-customizer-copy";
import type { HomeWidgetResizeDirection } from "./dashboard-home-widget-interactions";
import { getHomeWidgetResizeCursor } from "./dashboard-home-widget-resize";
import type { ActiveHomeWidgetResizeHandle } from "./use-dashboard-home-widget-resize-handle";

type DashboardHomeWidgetResizeHandleProps = {
  copy: HomeCustomizerCopy;
  handle: ActiveHomeWidgetResizeHandle;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
};

export function DashboardHomeWidgetResizeHandle({
  copy,
  handle,
  onPointerDown,
}: DashboardHomeWidgetResizeHandleProps) {
  const label = getHomeWidgetResizeLabel(handle.direction, copy);

  return (
    <>
      <HomeWidgetResizeBoundaryGuide
        direction={handle.direction}
        visible={handle.visible}
      />
      <InteractiveButton
        aria-label={label}
        className={cn(
          "absolute z-40 flex size-11 items-center justify-center rounded-full text-primary motion-reduce:transition-none",
          handle.visible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        data-home-widget-control="true"
        data-resize-direction={handle.direction}
        data-testid="home-widget-resize-handle-active"
        onPointerDown={onPointerDown}
        style={{
          cursor: getHomeWidgetResizeCursor(handle.direction),
          left: `${handle.left}px`,
          scale: handle.visible ? "1" : "0.86",
          top: `${handle.top}px`,
          translate: "-50% -50%",
        }}
        title={label}
        type="button"
      >
        <span
          aria-hidden="true"
          className={cn(
            "block border-2 border-surface-panel bg-primary shadow-sm",
            getResizeHandleMarkerClass(handle.direction),
          )}
          data-resize-marker-direction={handle.direction}
          data-testid="home-widget-resize-marker"
        />
      </InteractiveButton>
    </>
  );
}

function HomeWidgetResizeBoundaryGuide({
  direction,
  visible,
}: {
  direction: HomeWidgetResizeDirection;
  visible: boolean;
}) {
  /*
   * 细边线说明当前会改变哪一侧，小把手提供标准桌面缩放视觉。
   * 真正可点击区域仍是 44px，视觉把手保持克制，不会遮住卡片内容。
   */
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-20 transition-opacity duration-150 motion-reduce:transition-none",
        visible ? "opacity-100" : "opacity-0",
      )}
      data-resize-direction={direction}
      data-testid="home-widget-resize-guide"
    >
      {getResizeGuideSegments(direction).map((className, index) => (
        <span
          className={cn("absolute bg-primary", className)}
          key={`${direction}-${index}`}
        />
      ))}
    </div>
  );
}

function getHomeWidgetResizeLabel(
  direction: HomeWidgetResizeDirection,
  copy: HomeCustomizerCopy,
): string {
  if (direction === "left" || direction === "right") {
    return copy.resizeHorizontal;
  }

  if (direction === "top" || direction === "bottom") {
    return copy.resizeVertical;
  }

  return copy.resizeDiagonal;
}

function getResizeHandleMarkerClass(direction: HomeWidgetResizeDirection) {
  if (direction === "left") {
    return "h-5 w-2 translate-x-1 rounded-full";
  }

  if (direction === "right") {
    return "h-5 w-2 -translate-x-1 rounded-full";
  }

  if (direction === "top") {
    return "h-2 w-5 translate-y-1 rounded-full";
  }

  if (direction === "bottom") {
    return "h-2 w-5 -translate-y-1 rounded-full";
  }

  if (direction === "top-left") {
    return "size-3 translate-x-1.5 translate-y-1.5 rounded-[4px]";
  }

  if (direction === "top-right") {
    return "size-3 -translate-x-1.5 translate-y-1.5 rounded-[4px]";
  }

  if (direction === "bottom-right") {
    return "size-3 -translate-x-1.5 -translate-y-1.5 rounded-[4px]";
  }

  return "size-3 translate-x-1.5 -translate-y-1.5 rounded-[4px]";
}

function getResizeGuideSegments(direction: HomeWidgetResizeDirection) {
  if (direction === "left") {
    return ["bottom-4 left-0 top-4 w-0.5 rounded-r-full"];
  }

  if (direction === "right") {
    return ["bottom-4 right-0 top-4 w-0.5 rounded-l-full"];
  }

  if (direction === "top") {
    return ["left-4 right-4 top-0 h-0.5 rounded-b-full"];
  }

  if (direction === "bottom") {
    return ["bottom-0 left-4 right-4 h-0.5 rounded-t-full"];
  }

  if (direction === "top-left") {
    return [
      "left-0 top-0 h-0.5 w-10 rounded-r-full",
      "left-0 top-0 h-10 w-0.5 rounded-b-full",
    ];
  }

  if (direction === "top-right") {
    return [
      "right-0 top-0 h-0.5 w-10 rounded-l-full",
      "right-0 top-0 h-10 w-0.5 rounded-b-full",
    ];
  }

  if (direction === "bottom-right") {
    return [
      "bottom-0 right-0 h-0.5 w-10 rounded-l-full",
      "bottom-0 right-0 h-10 w-0.5 rounded-t-full",
    ];
  }

  return [
    "bottom-0 left-0 h-0.5 w-10 rounded-r-full",
    "bottom-0 left-0 h-10 w-0.5 rounded-t-full",
  ];
}
