"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { markBrowserCloudSyncActivity } from "@/lib/browser-sync-recovery";
import {
  getCurrentUserHomeWidgetLayout,
  saveUserHomeWidgetLayout,
} from "@/lib/dashboard-home-layouts";
import { getBrowserSupabaseClient } from "@/lib/supabase";

import { useWorkspaceSyncEffect } from "../workspace-session-provider";
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
  initialWidgets: unknown;
  scope: string;
};

export type DashboardHomeLayoutSaveStatus =
  | "error"
  | "idle"
  | "saved"
  | "saving";

export function useDashboardHomeLayout({
  initialWidgets,
  scope,
}: UseDashboardHomeLayoutOptions) {
  const supabase = getBrowserSupabaseClient();
  const normalizedInitialWidgets = useMemo(
    () => normalizeHomeWidgetLayout(initialWidgets),
    [initialWidgets],
  );
  const [editing, setEditing] = useState(false);
  const [widgets, setWidgets] = useState<HomeWidgetInstance[]>(() =>
    normalizedInitialWidgets,
  );
  const [saveStatus, setSaveStatus] =
    useState<DashboardHomeLayoutSaveStatus>("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedWidgetsJsonRef = useRef(
    serializeHomeWidgets(normalizedInitialWidgets),
  );
  const pendingWidgetsRef = useRef<HomeWidgetInstance[]>(
    normalizedInitialWidgets,
  );
  const queuedWidgetsRef = useRef<HomeWidgetInstance[] | null>(null);
  const saveInFlightRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const saveWidgets = useCallback(
    async (widgetsToSave: HomeWidgetInstance[]) => {
      if (!supabase) {
        return;
      }

      /*
       * 用户连续拖动、缩放或排序时，旧保存请求可能尚未结束。这里不让多个请求
       * 同时写入，而是只保留最新布局排队，防止较慢的旧请求最后返回后覆盖新布局。
       */
      if (saveInFlightRef.current) {
        queuedWidgetsRef.current = widgetsToSave;
        return;
      }

      saveInFlightRef.current = true;
      let nextWidgets: HomeWidgetInstance[] | null = widgetsToSave;

      try {
        while (nextWidgets) {
          const requestedWidgets = nextWidgets;

          queuedWidgetsRef.current = null;
          if (mountedRef.current) {
            setSaveStatus("saving");
          }

          const layout = await saveUserHomeWidgetLayout(
            supabase,
            scope,
            requestedWidgets,
          );
          const normalizedWidgets = normalizeHomeWidgetLayout(layout.widgets);

          markBrowserCloudSyncActivity();
          lastSavedWidgetsJsonRef.current =
            serializeHomeWidgets(normalizedWidgets);

          nextWidgets = queuedWidgetsRef.current;
          if (
            !nextWidgets &&
            serializeHomeWidgets(pendingWidgetsRef.current) !==
              lastSavedWidgetsJsonRef.current
          ) {
            nextWidgets = pendingWidgetsRef.current;
          }
        }

        if (mountedRef.current) {
          setSaveStatus("saved");
        }
      } catch {
        queuedWidgetsRef.current = null;
        lastSavedWidgetsJsonRef.current = "";
        if (mountedRef.current) {
          setSaveStatus("error");
        }
      } finally {
        saveInFlightRef.current = false;
      }
    },
    [scope, supabase],
  );

  useEffect(() => {
    pendingWidgetsRef.current = widgets;

    if (!supabase) {
      return;
    }

    const widgetsJson = serializeHomeWidgets(widgets);

    if (widgetsJson === lastSavedWidgetsJsonRef.current) {
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setSaveStatus("saving");
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      void saveWidgets(widgets);
    }, 250);
  }, [saveWidgets, supabase, widgets]);

  const refreshLayout = useCallback(
    async ({ isMounted }: { isMounted: () => boolean }) => {
      if (!supabase || editing) {
        return;
      }

      const layout = await getCurrentUserHomeWidgetLayout(supabase, scope);

      if (!layout || !isMounted()) {
        return;
      }

      const nextWidgets = normalizeHomeWidgetLayout(layout.widgets);

      lastSavedWidgetsJsonRef.current = serializeHomeWidgets(nextWidgets);
      setWidgets(nextWidgets);
    },
    [editing, scope, supabase],
  );

  useWorkspaceSyncEffect(refreshLayout);

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

  const moveWidget = useCallback((id: string, offset: -1 | 1) => {
    setWidgets((current) => {
      const currentIndex = current.findIndex((widget) => widget.id === id);
      const nextIndex = currentIndex + offset;

      if (
        currentIndex < 0 ||
        nextIndex < 0 ||
        nextIndex >= current.length
      ) {
        return current;
      }

      const nextWidgets = [...current];
      const [movedWidget] = nextWidgets.splice(currentIndex, 1);

      nextWidgets.splice(nextIndex, 0, movedWidget);
      return nextWidgets;
    });
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
  const retrySave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    void saveWidgets(pendingWidgetsRef.current);
  }, [saveWidgets]);

  return {
    addWidget,
    editing,
    moveWidget,
    removeWidget,
    resetWidgets,
    retrySave,
    saveStatus,
    startEditing,
    stopEditing,
    updateWidgetLayout,
    widgets,
  };
}

function serializeHomeWidgets(widgets: readonly HomeWidgetInstance[]) {
  /*
   * JSON 对象的字段排列不代表业务内容。新增组件与数据库返回对象可能字段顺序不同，
   * 因此先按固定字段顺序重新组装，再比较字符串，避免相同布局被误判为一直未保存。
   */
  return JSON.stringify(
    widgets.map((widget) => ({
      height: widget.height,
      id: widget.id,
      type: widget.type,
      width: widget.width,
      x: widget.x,
      y: widget.y,
    })),
  );
}

function getDefaultWidgetSize(type: HomeWidgetType) {
  const widget = createHomeWidgetInstance(type, "preview", { x: 0, y: 0 });

  return {
    height: widget.height,
    type,
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
