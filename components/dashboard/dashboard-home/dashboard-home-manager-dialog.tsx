"use client";

import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from "lucide-react";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import { Button } from "@/components/ui/button";

import type { HomeCustomizerCopy } from "./dashboard-home-customizer-copy";
import { DashboardHomeLayoutSaveFeedback } from "./dashboard-home-layout-save-feedback";
import {
  HOME_WIDGET_TYPES,
  type HomeWidgetInstance,
  type HomeWidgetType,
} from "./dashboard-home-layout";
import { HOME_WIDGET_ICONS } from "./dashboard-home-widget-meta";
import type { DashboardHomeLayoutSaveStatus } from "./use-dashboard-home-layout";

type DashboardHomeManagerDialogProps = {
  copy: HomeCustomizerCopy;
  onAddWidget: (type: HomeWidgetType) => void;
  onMoveWidget: (id: string, offset: -1 | 1) => void;
  onOpenChange: (open: boolean) => void;
  onRemoveWidget: (id: string) => void;
  onReset: () => void;
  onRetrySave: () => void;
  open: boolean;
  saveStatus: DashboardHomeLayoutSaveStatus;
  widgets: HomeWidgetInstance[];
};

export function DashboardHomeManagerDialog({
  copy,
  onAddWidget,
  onMoveWidget,
  onOpenChange,
  onRemoveWidget,
  onReset,
  onRetrySave,
  open,
  saveStatus,
  widgets,
}: DashboardHomeManagerDialogProps) {
  const instanceLabels = createWidgetInstanceLabels(widgets, copy);

  return (
    <DashboardDialog
      actions={
        <Button
          data-testid="home-manager-done"
          onClick={() => onOpenChange(false)}
          size="default"
          type="button"
        >
          {copy.done}
        </Button>
      }
      description={copy.manageDescription}
      onOpenChange={onOpenChange}
      open={open}
      title={copy.manage}
    >
      <div className="grid gap-6">
        <DashboardHomeLayoutSaveFeedback
          className="sticky top-0 z-10"
          copy={copy}
          onRetry={onRetrySave}
          status={saveStatus}
        />

        <section aria-labelledby="home-current-widgets-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4
              className="text-lg font-bold text-content-strong"
              id="home-current-widgets-title"
            >
              {copy.currentWidgetsTitle}
            </h4>
            <Button
              data-testid="home-manager-reset"
              onClick={onReset}
              size="default"
              type="button"
              variant="outline"
            >
              <RotateCcw className="size-4" />
              {copy.reset}
            </Button>
          </div>

          {widgets.length === 0 ? (
            <div className="mt-4 rounded-surface-inset border border-dashed border-border bg-surface-inset p-5">
              <p className="font-semibold text-content-strong">
                {copy.emptyTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-content-muted">
                {copy.emptyDescription}
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {widgets.map((widget, index) => {
                const Icon = HOME_WIDGET_ICONS[widget.type];

                return (
                  <article
                    className="flex min-w-0 flex-col gap-3 rounded-surface-inset border border-border-subtle bg-surface-inset p-4 sm:flex-row sm:items-center"
                    data-home-manager-widget-id={widget.id}
                    data-testid="home-manager-widget"
                    key={widget.id}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-control-default bg-surface-interactive text-primary">
                        <Icon className="size-5" />
                      </span>
                      <span className="min-w-0 break-words font-semibold text-content-strong">
                        {instanceLabels.get(widget.id)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        aria-label={`${instanceLabels.get(widget.id)}：${copy.moveEarlier}`}
                        data-testid="home-manager-move-earlier"
                        disabled={index === 0}
                        onClick={() => onMoveWidget(widget.id, -1)}
                        size="icon"
                        title={copy.moveEarlier}
                        type="button"
                        variant="outline"
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        aria-label={`${instanceLabels.get(widget.id)}：${copy.moveLater}`}
                        data-testid="home-manager-move-later"
                        disabled={index === widgets.length - 1}
                        onClick={() => onMoveWidget(widget.id, 1)}
                        size="icon"
                        title={copy.moveLater}
                        type="button"
                        variant="outline"
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                      <Button
                        aria-label={`${instanceLabels.get(widget.id)}：${copy.removeWidget}`}
                        data-testid="home-manager-remove"
                        onClick={() => onRemoveWidget(widget.id)}
                        size="icon"
                        title={copy.removeWidget}
                        type="button"
                        variant="danger"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section aria-labelledby="home-add-widgets-title">
          <h4
            className="text-lg font-bold text-content-strong"
            id="home-add-widgets-title"
          >
            {copy.addWidgetsTitle}
          </h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {HOME_WIDGET_TYPES.map((type) => {
              const Icon = HOME_WIDGET_ICONS[type];

              return (
                <article
                  className="flex min-w-0 flex-col rounded-surface-inset border border-border-subtle bg-surface-inset p-4"
                  key={type}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-control-default bg-surface-interactive text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <h5 className="break-words font-semibold text-content-strong">
                        {copy.widgets[type].title}
                      </h5>
                      <p className="mt-1 break-words text-sm leading-6 text-content-muted">
                        {copy.widgets[type].description}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="mt-4 w-full"
                    data-home-manager-add-type={type}
                    onClick={() => onAddWidget(type)}
                    size="default"
                    type="button"
                  >
                    <Plus className="size-4" />
                    {copy.addWidget}
                  </Button>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </DashboardDialog>
  );
}

/**
 * 同类组件允许重复添加。只有重复时才追加序号，让默认首页保持简洁，
 * 同时保证屏幕阅读器和用户都能分清正在移动或删除的是哪一个实例。
 */
function createWidgetInstanceLabels(
  widgets: readonly HomeWidgetInstance[],
  copy: HomeCustomizerCopy,
) {
  const totals = new Map<HomeWidgetType, number>();
  const currentIndexes = new Map<HomeWidgetType, number>();

  widgets.forEach((widget) => {
    totals.set(widget.type, (totals.get(widget.type) ?? 0) + 1);
  });

  return new Map(
    widgets.map((widget) => {
      const title = copy.widgets[widget.type].title;

      if ((totals.get(widget.type) ?? 0) <= 1) {
        return [widget.id, title];
      }

      const index = (currentIndexes.get(widget.type) ?? 0) + 1;

      currentIndexes.set(widget.type, index);
      return [widget.id, copy.instanceLabel(title, index)];
    }),
  );
}
