"use client";

import { Plus, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";

import type { HomeCustomizerCopy } from "./dashboard-home-customizer-copy";
import {
  HOME_WIDGET_TYPES,
  type HomeWidgetType,
} from "./dashboard-home-layout";
import { HOME_WIDGET_ICONS } from "./dashboard-home-widget-meta";

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
    <Surface
      className="flex h-full min-h-0 flex-col"
      data-testid="home-widget-sidebar"
      padding="compact"
      variant="panel"
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
        <Button
          aria-label={copy.reset}
          onClick={onReset}
          size="icon"
          title={copy.reset}
          type="button"
          variant="outline"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>

      <div className="mt-5 grid min-h-0 gap-3 overflow-y-auto pr-1">
        {HOME_WIDGET_TYPES.map((type) => {
          const Icon = HOME_WIDGET_ICONS[type];

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
                className="mt-4 w-full"
                onClick={() => onAddWidget(type)}
                size="default"
                type="button"
                variant="primary"
              >
                <Plus className="size-4" />
                {copy.addWidget}
              </Button>
            </div>
          );
        })}
      </div>
    </Surface>
  );
}
