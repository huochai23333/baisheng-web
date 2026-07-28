"use client";

import type { ReactNode } from "react";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronsDownUp,
  ChevronsLeftRight,
  ChevronsRightLeft,
  ChevronsUpDown,
} from "lucide-react";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { Button } from "@/components/ui/button";

import type { HomeCustomizerCopy } from "./dashboard-home-customizer-copy";
import {
  getHomeWidgetSizeLimits,
  HOME_WIDGET_GRID_COLUMNS,
  HOME_WIDGET_MAX_SIZE,
  type HomeWidgetInstance,
} from "./dashboard-home-layout";

type DashboardHomeWidgetAdjustDialogProps = {
  copy: HomeCustomizerCopy;
  onOpenChange: (open: boolean) => void;
  onUpdate: (
    layout: Pick<HomeWidgetInstance, "height" | "width" | "x" | "y">,
  ) => void;
  open: boolean;
  widget: HomeWidgetInstance | null;
};

export function DashboardHomeWidgetAdjustDialog({
  copy,
  onOpenChange,
  onUpdate,
  open,
  widget,
}: DashboardHomeWidgetAdjustDialogProps) {
  if (!widget) {
    return null;
  }

  const widgetTitle = copy.widgets[widget.type].title;
  const sizeLimits = getHomeWidgetSizeLimits(widget.type);
  const update = (
    changes: Partial<
      Pick<HomeWidgetInstance, "height" | "width" | "x" | "y">
    >,
  ) => {
    onUpdate({
      height: widget.height,
      width: widget.width,
      x: widget.x,
      y: widget.y,
      ...changes,
    });
  };

  return (
    <DashboardDialog
      actions={
        <Button
          data-testid="home-adjust-done"
          onClick={() => onOpenChange(false)}
          size="default"
          type="button"
        >
          {copy.done}
        </Button>
      }
      description={copy.sizeLabel(widget.width, widget.height)}
      onOpenChange={onOpenChange}
      open={open}
      title={`${copy.adjustWidget}：${widgetTitle}`}
    >
      <div className="grid gap-6">
        <section aria-labelledby="home-adjust-position-title">
          <h4
            className="text-base font-bold text-content-strong"
            id="home-adjust-position-title"
          >
            {copy.positionTitle}
          </h4>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <AdjustmentButton
              disabled={widget.x === 0}
              icon={<ArrowLeft className="size-4" />}
              label={copy.moveLeft}
              onClick={() => update({ x: widget.x - 1 })}
              testId="home-adjust-move-left"
            />
            <AdjustmentButton
              disabled={widget.x + widget.width >= HOME_WIDGET_GRID_COLUMNS}
              icon={<ArrowRight className="size-4" />}
              label={copy.moveRight}
              onClick={() => update({ x: widget.x + 1 })}
              testId="home-adjust-move-right"
            />
            <AdjustmentButton
              disabled={widget.y === 0}
              icon={<ArrowUp className="size-4" />}
              label={copy.moveUp}
              onClick={() => update({ y: widget.y - 1 })}
              testId="home-adjust-move-up"
            />
            <AdjustmentButton
              icon={<ArrowDown className="size-4" />}
              label={copy.moveDown}
              onClick={() => update({ y: widget.y + 1 })}
              testId="home-adjust-move-down"
            />
          </div>
        </section>

        <section aria-labelledby="home-adjust-size-title">
          <h4
            className="text-base font-bold text-content-strong"
            id="home-adjust-size-title"
          >
            {copy.sizeTitle}
          </h4>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <AdjustmentButton
              disabled={widget.width <= sizeLimits.minWidth}
              icon={<ChevronsRightLeft className="size-4" />}
              label={copy.makeNarrower}
              onClick={() => update({ width: widget.width - 1 })}
              testId="home-adjust-make-narrower"
            />
            <AdjustmentButton
              disabled={
                widget.width >= HOME_WIDGET_MAX_SIZE ||
                widget.x + widget.width >= HOME_WIDGET_GRID_COLUMNS
              }
              icon={<ChevronsLeftRight className="size-4" />}
              label={copy.makeWider}
              onClick={() => update({ width: widget.width + 1 })}
              testId="home-adjust-make-wider"
            />
            <AdjustmentButton
              disabled={widget.height <= sizeLimits.minHeight}
              icon={<ChevronsDownUp className="size-4" />}
              label={copy.makeShorter}
              onClick={() => update({ height: widget.height - 1 })}
              testId="home-adjust-make-shorter"
            />
            <AdjustmentButton
              disabled={widget.height >= HOME_WIDGET_MAX_SIZE}
              icon={<ChevronsUpDown className="size-4" />}
              label={copy.makeTaller}
              onClick={() => update({ height: widget.height + 1 })}
              testId="home-adjust-make-taller"
            />
          </div>
        </section>
      </div>
    </DashboardDialog>
  );
}

function AdjustmentButton({
  disabled = false,
  icon,
  label,
  onClick,
  testId,
}: {
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <Button
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
      size="default"
      type="button"
      variant="outline"
      wrap
    >
      {icon}
      {label}
    </Button>
  );
}
