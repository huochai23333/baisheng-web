"use client";

import { InteractiveButton as DesignButton } from "@/components/ui/button";

import type { CSSProperties, ReactNode } from "react";

import {
  Bell,
  Clock3,
  KeyRound,
  type LucideIcon,
  ListTodo,
  Megaphone,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  HOME_WIDGET_ROW_UNIT_PX,
  HOME_WIDGET_TYPES,
  type HomeWidgetInstance,
  type HomeWidgetType,
} from "./dashboard-home-layout";
import {
  startHomeWidgetPositionDrag,
  startHomeWidgetResize,
} from "./dashboard-home-widget-interactions";
import { getHomeWidgetResizeCursor } from "./dashboard-home-widget-resize";
import { useDashboardHomeWidgetLayoutAnimation } from "./use-dashboard-home-widget-layout-animation";
import { useDashboardHomeWidgetResizeHandle } from "./use-dashboard-home-widget-resize-handle";

export type HomeCustomizerCopy = {
  addWidget: string;
  done: string;
  edit: string;
  emptyDescription: string;
  emptyTitle: string;
  moveLeft: string;
  moveRight: string;
  removeWidget: string;
  reset: string;
  resizeWidget: string;
  sidebarDescription: string;
  sidebarTitle: string;
  sizeLabel: (width: number, height: number) => string;
  widgets: Record<HomeWidgetType, { description: string; title: string }>;
};

type DashboardHomeWidgetCardProps = {
  children: ReactNode;
  copy: HomeCustomizerCopy;
  deleting: boolean;
  dragging: boolean;
  editing: boolean;
  entering: boolean;
  index: number;
  onDragEnd: () => void;
  onDragStart: () => void;
  onMove: (position: Pick<HomeWidgetInstance, "x" | "y">) => void;
  onRemove: () => void;
  onResize: (
    layout: Pick<HomeWidgetInstance, "height" | "width" | "x" | "y">,
  ) => void;
  onResizeEnd: () => void;
  onResizeStart: () => void;
  resizing: boolean;
  widget: HomeWidgetInstance;
};

const widgetIcons: Record<HomeWidgetType, LucideIcon> = {
  announcements: Megaphone,
  clock: Clock3,
  greeting: Bell,
  invite: KeyRound,
  todos: ListTodo,
};

export function DashboardHomeWidgetCard({
  children,
  copy,
  deleting,
  dragging,
  editing,
  entering,
  index,
  onDragEnd,
  onDragStart,
  onMove,
  onRemove,
  onResize,
  onResizeEnd,
  onResizeStart,
  resizing,
  widget,
}: DashboardHomeWidgetCardProps) {
  const Icon = widgetIcons[widget.type];
  const widgetLabel = copy.widgets[widget.type].title;
  const { handleResizePointerLeave, handleResizePointerMove, resizeHandle } =
    useDashboardHomeWidgetResizeHandle({
      deleting,
      dragging,
      editing,
      entering,
      resizing,
    });
  const cardRef = useDashboardHomeWidgetLayoutAnimation({
    disabled: !editing || !resizing || deleting || entering,
    resizing,
  });

  return (
    <article
      className={cn(
        "dashboard-home-widget-card group relative min-w-0 overflow-hidden rounded-surface-panel border border-surface-panel-border bg-surface-panel p-4 shadow-surface-interactive transition-[box-shadow,border-color,opacity] duration-200 will-change-transform sm:p-5",
        editing &&
          !deleting &&
          !entering &&
          !dragging &&
          !resizing &&
          "dashboard-home-wiggle cursor-grab border-ring bg-surface-overlay shadow-surface-interactive active:cursor-grabbing",
        editing &&
          (deleting || entering || resizing) &&
          "border-ring bg-surface-overlay shadow-surface-interactive",
        deleting && "dashboard-home-widget-exit pointer-events-none",
        dragging &&
          "scale-[1.01] opacity-72 shadow-surface-interactive ring-4 ring-ring/45",
        entering && "dashboard-home-widget-enter",
        resizing && "dashboard-home-widget-resizing",
      )}
      data-home-widget-id={widget.id}
      data-home-widget-type={widget.type}
      data-testid="home-widget-card"
      ref={cardRef}
      onPointerDown={(event) => {
        startHomeWidgetPositionDrag(event, {
          editing,
          onDragEnd,
          onDragStart,
          onMove,
          widget,
        });
      }}
      onPointerLeave={handleResizePointerLeave}
      onPointerMove={handleResizePointerMove}
      style={
        {
        animationDelay: `${(index % 5) * -45}ms`,
          "--home-widget-grid-column": `${widget.x + 1} / span ${widget.width}`,
          "--home-widget-grid-row": `${widget.y + 1} / span ${widget.height}`,
          "--home-widget-min-height": `${widget.height * HOME_WIDGET_ROW_UNIT_PX}px`,
        } as CSSProperties
      }
    >
      {editing ? (
        <>
          <DesignButton
            aria-label={copy.removeWidget}
            className="absolute left-1/2 top-3 z-40 inline-flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-surface-overlay text-content-muted shadow-sm transition hover:bg-surface-inset"
            data-home-widget-control="true"
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            onPointerDown={(event) => event.stopPropagation()}
            title={copy.removeWidget}
            type="button"
          >
            <Trash2 className="size-4" />
          </DesignButton>
          {resizeHandle ? (
            <DesignButton
              aria-label={copy.resizeWidget}
              className={cn(
                "absolute z-30 inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-ring bg-primary text-white shadow-surface-interactive transition-[opacity,transform,background-color] duration-150 hover:bg-brand-hover",
                getResizeHandleButtonClass(resizeHandle.direction),
                resizeHandle.visible
                  ? "scale-100 opacity-100"
                  : "scale-75 opacity-0",
              )}
              data-resize-direction={resizeHandle.direction}
              data-home-widget-control="true"
              data-testid="home-widget-resize-handle-active"
              onPointerDown={(event) => {
                startHomeWidgetResize(event, widget, resizeHandle.direction, {
                  onResize,
                  onResizeEnd,
                  onResizeStart,
                });
              }}
              style={{
                cursor: getHomeWidgetResizeCursor(resizeHandle.direction),
                left: `${resizeHandle.left}px`,
                top: `${resizeHandle.top}px`,
              }}
              title={copy.resizeWidget}
              type="button"
            >
              <HomeWidgetResizeHandleMark direction={resizeHandle.direction} />
            </DesignButton>
          ) : null}
        </>
      ) : null}

      <div className={cn("h-full min-h-0", editing && "pt-11")}>{children}</div>

      {editing ? (
        <div className="absolute bottom-3 right-3 z-20 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full border border-border bg-surface-overlay px-3 py-1 text-xs font-semibold text-content-muted shadow-sm">
          <Icon className="size-3.5 shrink-0 text-primary" />
          <span className="min-w-0 truncate">{widgetLabel}</span>
          <span className="shrink-0 text-content-muted">
            {copy.sizeLabel(widget.width, widget.height)}
          </span>
        </div>
      ) : null}
    </article>
  );
}

function getResizeHandleButtonClass(direction: string) {
  if (direction === "left" || direction === "right") {
    return "h-12 w-4 rounded-full";
  }

  if (direction === "top" || direction === "bottom") {
    return "h-4 w-12 rounded-full";
  }

  return "size-9 rounded-control-compact";
}

function HomeWidgetResizeHandleMark({ direction }: { direction: string }) {
  if (direction === "left" || direction === "right") {
    return (
      <span
        aria-hidden="true"
        className="block h-7 w-0.5 rounded-full bg-surface-overlay"
        data-resize-handle-shape="vertical"
      />
    );
  }

  if (direction === "top" || direction === "bottom") {
    return (
      <span
        aria-hidden="true"
        className="block h-0.5 w-7 rounded-full bg-surface-overlay"
        data-resize-handle-shape="horizontal"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "block size-4",
        direction === "top-left" &&
          "border-l-2 border-t-2 border-surface-panel-border",
        direction === "top-right" &&
          "border-r-2 border-t-2 border-surface-panel-border",
        direction === "bottom-right" &&
          "border-b-2 border-r-2 border-surface-panel-border",
        direction === "bottom-left" &&
          "border-b-2 border-l-2 border-surface-panel-border",
      )}
      data-resize-handle-shape="corner"
    />
  );
}

type DashboardHomeWidgetSidebarProps = {
  copy: HomeCustomizerCopy;
  onAddWidget: (type: HomeWidgetType) => void;
  onReset: () => void;
};

export function DashboardHomeWidgetSidebar({
  copy,
  onAddWidget,
  onReset,
}: DashboardHomeWidgetSidebarProps) {
  return (
    <section
      className="flex h-full min-h-0 flex-col rounded-surface-panel border border-surface-panel-border bg-surface-panel p-4 shadow-surface-interactive"
      data-testid="home-widget-sidebar"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-lg font-bold text-content-strong">
            {copy.sidebarTitle}
          </h3>
          <p className="mt-2 break-words text-sm leading-6 text-content-muted">
            {copy.sidebarDescription}
          </p>
        </div>
        <DesignButton
          aria-label={copy.reset}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-interactive text-content-muted transition hover:bg-surface-inset"
          onClick={onReset}
          title={copy.reset}
          type="button"
        >
          <RotateCcw className="size-4" />
        </DesignButton>
      </div>

      <div className="mt-5 grid min-h-0 gap-3 overflow-y-auto pr-1">
        {HOME_WIDGET_TYPES.map((type) => {
          const Icon = widgetIcons[type];

          return (
            <div
              className="rounded-surface-inset border border-border-subtle bg-surface-inset p-4"
              key={type}
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-control-default bg-surface-inset text-primary">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <h4 className="break-words text-sm font-semibold text-content-strong">
                    {copy.widgets[type].title}
                  </h4>
                  <p className="mt-1 break-words text-xs leading-5 text-content-muted">
                    {copy.widgets[type].description}
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="compact"
                className="mt-4 w-full"
                onClick={() => onAddWidget(type)}
                type="button"
              >
                <Plus className="size-4" />
                {copy.addWidget}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
