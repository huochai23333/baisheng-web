"use client";

import type { WorkspaceBusinessKey } from "@/lib/workspace-config";

import { AdminShellDesktopNav } from "./admin-shell-desktop-nav";
import { AdminShellMobileNav } from "./admin-shell-mobile-nav";
import type {
  AdminShellNavGroup,
  AdminShellNavLink,
} from "./admin-shell-nav-types";

type AdminShellNavProps = {
  emptyGroupsLabel: string;
  globalItems: readonly AdminShellNavLink[];
  groups: readonly AdminShellNavGroup[];
  initialOpenGroupKeys: readonly WorkspaceBusinessKey[] | null;
  mode: "desktop" | "mobile";
};

/**
 * 主导航只根据页面宽度选择对应视图，桌面偏好和移动下拉状态
 * 分别由同层模块管理，避免一个组件继续承担多种独立职责。
 */
export function AdminShellNav({
  emptyGroupsLabel,
  globalItems,
  groups,
  initialOpenGroupKeys,
  mode,
}: AdminShellNavProps) {
  if (mode === "mobile") {
    return (
      <AdminShellMobileNav
        emptyGroupsLabel={emptyGroupsLabel}
        globalItems={globalItems}
        groups={groups}
      />
    );
  }

  return (
    <AdminShellDesktopNav
      emptyGroupsLabel={emptyGroupsLabel}
      globalItems={globalItems}
      groups={groups}
      initialOpenGroupKeys={initialOpenGroupKeys}
    />
  );
}
