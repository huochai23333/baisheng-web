"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  cloneDefaultHomeWidgetLayout,
  createHomeWidgetInstance,
  findAvailableHomeWidgetPosition,
  normalizeHomeWidgetCoordinates,
  normalizeHomeWidgetLayout,
  type HomeWidgetInstance,
  type HomeWidgetType,
} from "./dashboard-home-layout";

type UseDashboardHomeLayoutOptions = {
  scope: string;
};

export function useDashboardHomeLayout({
  scope,
}: UseDashboardHomeLayoutOptions) {
  const storageKey = useMemo(() => `baisheng.home.widgets.v1:${scope}`, [scope]);
  const [editing, setEditing] = useState(false);
  const [widgets, setWidgets] = useState<HomeWidgetInstance[]>(() =>
    cloneDefaultHomeWidgetLayout(),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(storageKey);

      if (storedValue) {
        setWidgets(normalizeHomeWidgetLayout(JSON.parse(storedValue)));
      } else {
        setWidgets(cloneDefaultHomeWidgetLayout());
      }
    } catch {
      setWidgets(cloneDefaultHomeWidgetLayout());
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(widgets));
  }, [hydrated, storageKey, widgets]);

  const addWidget = useCallback((type: HomeWidgetType) => {
    const id = createWidgetId(type);
    let nextWidgetId = id;

    setWidgets((current) => {
      const widget = createHomeWidgetInstance(
        type,
        id,
        findAvailableHomeWidgetPosition(current, getDefaultWidgetSize(type)),
      );

      nextWidgetId = widget.id;

      return normalizeHomeWidgetCoordinates([...current, widget], widget.id);
    });

    return nextWidgetId;
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets((current) => current.filter((widget) => widget.id !== id));
  }, []);

  const resetWidgets = useCallback(() => {
    setWidgets(cloneDefaultHomeWidgetLayout());
  }, []);

  const updateWidgetLayout = useCallback(
    (
      id: string,
      layout: Pick<HomeWidgetInstance, "height" | "width" | "x" | "y">,
    ) => {
      setWidgets((current) =>
        normalizeHomeWidgetCoordinates(
          current.map((widget) =>
            widget.id === id
              ? {
                  ...widget,
                  ...layout,
                }
              : widget,
          ),
          id,
        ),
      );
    },
    [],
  );

  const startEditing = useCallback(() => setEditing(true), []);
  const stopEditing = useCallback(() => setEditing(false), []);

  return {
    addWidget,
    editing,
    removeWidget,
    resetWidgets,
    startEditing,
    stopEditing,
    updateWidgetLayout,
    widgets,
  };
}

function getDefaultWidgetSize(type: HomeWidgetType) {
  const widget = createHomeWidgetInstance(type, "preview", { x: 0, y: 0 });

  return {
    height: widget.height,
    width: widget.width,
  };
}

function createWidgetId(type: HomeWidgetType) {
  const randomId =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  return `${type}-${randomId}`;
}
