"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { markBrowserCloudSyncActivity } from "@/lib/browser-sync-recovery";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import type { WorkspaceBusinessKey } from "@/lib/workspace-config";
import {
  getCurrentWorkspaceNavigationPreference,
  saveCurrentWorkspaceNavigationPreference,
} from "@/lib/workspace-navigation-preferences";

import type { AdminShellNavGroup } from "./admin-shell-nav-types";
import { useWorkspaceSyncEffect } from "./workspace-session-provider";

type UseWorkspaceNavigationPreferenceOptions = {
  activeGroupKey: WorkspaceBusinessKey | null;
  groups: readonly AdminShellNavGroup[];
  initialOpenGroupKeys: readonly WorkspaceBusinessKey[] | null;
};

/**
 * 管理桌面端业务分组的展开状态，并把用户主动调整后的结果保存到云端。
 * 渲染组件只需要询问某个分组是否展开，以及在点击时调用 toggleGroup，
 * 不需要了解 Supabase 请求、账号切换同步或并发保存细节。
 */
export function useWorkspaceNavigationPreference({
  activeGroupKey,
  groups,
  initialOpenGroupKeys,
}: UseWorkspaceNavigationPreferenceOptions) {
  const supabase = getBrowserSupabaseClient();
  const [openGroups, setOpenGroups] = useState<ReadonlySet<WorkspaceBusinessKey>>(
    () =>
      resolveInitialOpenGroupKeys(
        groups,
        activeGroupKey,
        initialOpenGroupKeys,
      ),
  );
  const [manuallyClosedGroups, setManuallyClosedGroups] = useState<
    ReadonlySet<WorkspaceBusinessKey>
  >(() => new Set());

  // 用户快速连续点击时，只保留尚未写入的最新状态；当前请求完成后再写下一份。
  // 这样较慢的旧请求永远不会在较新的结果之后落库。
  const pendingSaveRef = useRef<WorkspaceBusinessKey[] | null>(null);
  const failedSaveRef = useRef<WorkspaceBusinessKey[] | null>(null);
  const savingRef = useRef(false);
  const shouldPersistOpenGroupsRef = useRef(false);
  const localRevisionRef = useRef(0);

  const visibleOpenGroups = useMemo(() => {
    if (
      !activeGroupKey ||
      openGroups.has(activeGroupKey) ||
      manuallyClosedGroups.has(activeGroupKey)
    ) {
      return openGroups;
    }

    // 用户进入具体业务页时，仍按原有体验自动展开当前业务。
    // 这里只影响本次显示，不会偷偷改写用户保存的首页展开组合。
    return new Set([...openGroups, activeGroupKey]);
  }, [activeGroupKey, manuallyClosedGroups, openGroups]);

  const orderedOpenBusinessKeys = useMemo(
    () =>
      groups
        .filter((group) => openGroups.has(group.key))
        .map((group) => group.key),
    [groups, openGroups],
  );

  const runSaveQueue = useCallback(async () => {
    if (!supabase || savingRef.current) {
      return;
    }

    savingRef.current = true;

    try {
      while (pendingSaveRef.current) {
        const nextOpenBusinessKeys = pendingSaveRef.current;
        pendingSaveRef.current = null;

        try {
          await saveCurrentWorkspaceNavigationPreference(
            supabase,
            nextOpenBusinessKeys,
          );
          failedSaveRef.current = null;
          markBrowserCloudSyncActivity();
        } catch {
          // 菜单本身必须立即响应。云端暂时不可用时不回滚界面，
          // 只保留最后一次失败状态，等待用户下次操作时再提交新结果。
          failedSaveRef.current =
            pendingSaveRef.current ?? nextOpenBusinessKeys;
          pendingSaveRef.current = null;
          break;
        }
      }
    } finally {
      savingRef.current = false;
    }
  }, [supabase]);

  const queuePreferenceSave = useCallback(
    (openBusinessKeys: readonly WorkspaceBusinessKey[]) => {
      // 新操作已经包含界面完整状态，所以可以直接替换旧的失败快照。
      failedSaveRef.current = null;
      pendingSaveRef.current = [...openBusinessKeys];
      void runSaveQueue();
    },
    [runSaveQueue],
  );

  useEffect(() => {
    if (!shouldPersistOpenGroupsRef.current) {
      return;
    }

    shouldPersistOpenGroupsRef.current = false;
    queuePreferenceSave(orderedOpenBusinessKeys);
  }, [orderedOpenBusinessKeys, queuePreferenceSave]);

  const refreshPreference = useCallback(
    async ({ isMounted }: { isMounted: () => boolean }) => {
      if (!supabase) {
        return;
      }

      const revisionAtRequestStart = localRevisionRef.current;

      try {
        const preference = await getCurrentWorkspaceNavigationPreference(
          supabase,
        );

        // 如果请求期间用户刚刚点过菜单，旧的云端响应不能覆盖本地新操作。
        if (
          !isMounted() ||
          revisionAtRequestStart !== localRevisionRef.current
        ) {
          return;
        }

        shouldPersistOpenGroupsRef.current = false;
        setOpenGroups(
          resolveInitialOpenGroupKeys(
            groups,
            activeGroupKey,
            preference?.open_business_keys ?? null,
          ),
        );
        setManuallyClosedGroups(new Set());
      } catch {
        // 工作台恢复或账号切换时读取失败，保留当前可用菜单，不打断用户操作。
      }
    },
    [activeGroupKey, groups, supabase],
  );

  useWorkspaceSyncEffect(refreshPreference);

  const toggleGroup = useCallback(
    (groupKey: WorkspaceBusinessKey, isOpen: boolean) => {
      localRevisionRef.current += 1;
      shouldPersistOpenGroupsRef.current = true;

      setOpenGroups((current) => {
        const next = new Set(current);

        if (isOpen) {
          next.delete(groupKey);
        } else {
          next.add(groupKey);
        }

        return next;
      });

      setManuallyClosedGroups((current) => {
        const next = new Set(current);

        if (isOpen) {
          next.add(groupKey);
        } else {
          next.delete(groupKey);
        }

        return next;
      });
    },
    [],
  );

  return {
    toggleGroup,
    visibleOpenGroups,
  };
}

function resolveInitialOpenGroupKeys(
  groups: readonly AdminShellNavGroup[],
  activeGroupKey: WorkspaceBusinessKey | null,
  savedOpenGroupKeys: readonly WorkspaceBusinessKey[] | null,
) {
  if (savedOpenGroupKeys === null) {
    return getDefaultOpenGroupKeys(groups, activeGroupKey);
  }

  const visibleSavedGroupKeys = new Set(
    groups
      .filter((group) => savedOpenGroupKeys.includes(group.key))
      .map((group) => group.key),
  );

  if (savedOpenGroupKeys.length > 0 && visibleSavedGroupKeys.size === 0) {
    // 原来保存的业务权限全部被移除后，回到当前第一个可见业务，
    // 避免用户面对一个看似没有入口的空侧栏。
    return getDefaultOpenGroupKeys(groups, activeGroupKey);
  }

  // 保存过空数组代表用户明确选择全部收起，不能误当成“没有偏好”。
  return visibleSavedGroupKeys;
}

function getDefaultOpenGroupKeys(
  groups: readonly AdminShellNavGroup[],
  activeGroupKey: WorkspaceBusinessKey | null,
) {
  const openGroupKeys = new Set(
    groups.slice(0, 1).map((group) => group.key),
  );

  if (
    activeGroupKey &&
    groups.some((group) => group.key === activeGroupKey)
  ) {
    openGroupKeys.add(activeGroupKey);
  }

  return openGroupKeys;
}
