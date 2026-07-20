"use client";

import { InteractiveButton as DesignButton } from "@/components/ui/button";

import { useMemo } from "react";

import { ChevronDown } from "lucide-react";

import type { WorkspaceBusinessKey } from "@/lib/workspace-config";
import { cn } from "@/lib/utils";

import { DesktopAdminNavLink } from "./admin-shell-nav-links";
import type {
  AdminShellNavGroup,
  AdminShellNavLink,
} from "./admin-shell-nav-types";
import { useAdminShellNavigation } from "./use-admin-shell-navigation";
import { useWorkspaceNavigationPreference } from "./use-workspace-navigation-preference";

type AdminShellDesktopNavProps = {
  emptyGroupsLabel: string;
  globalItems: readonly AdminShellNavLink[];
  groups: readonly AdminShellNavGroup[];
  initialOpenGroupKeys: readonly WorkspaceBusinessKey[] | null;
};

// 左侧工作栏内容仍然需要能滚动，但视觉上不显示浏览器自带的滚动滑块。
const HIDDEN_NAV_SCROLLBAR_CLASS =
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

/** 桌面导航只负责分组按钮、折叠动画和业务链接的展示。 */
export function AdminShellDesktopNav({
  emptyGroupsLabel,
  globalItems,
  groups,
  initialOpenGroupKeys,
}: AdminShellDesktopNavProps) {
  const items = useMemo(
    () => [...globalItems, ...groups.flatMap((group) => group.items)],
    [globalItems, groups],
  );
  const {
    activeItem,
    handleNavClick,
    pathname,
    prefetchRoute,
    resolvedPendingHref,
  } = useAdminShellNavigation(items);
  const activeGroupKey = activeItem?.groupKey ?? null;
  const { toggleGroup, visibleOpenGroups } = useWorkspaceNavigationPreference({
    activeGroupKey,
    groups,
    initialOpenGroupKeys,
  });

  return (
    <nav
      className={cn(
        "min-h-0 flex-1 space-y-2 overflow-y-auto pr-1",
        HIDDEN_NAV_SCROLLBAR_CLASS,
      )}
    >
      {globalItems.map((item) => (
        <DesktopAdminNavLink
          handleNavClick={handleNavClick}
          item={item}
          key={item.href}
          pathname={pathname}
          prefetchRoute={prefetchRoute}
          resolvedPendingHref={resolvedPendingHref}
        />
      ))}

      {groups.length === 0 ? (
        <p className="mx-1 rounded-record-card border border-border-subtle bg-surface-panel px-4 py-3 text-sm leading-6 text-content-muted">
          {emptyGroupsLabel}
        </p>
      ) : null}

      {groups.map((group) => {
        const isOpen = visibleOpenGroups.has(group.key);
        const isGroupActive = group.items.some(
          (item) => item.href === pathname,
        );

        return (
          <div className="space-y-1" key={group.key}>
            <DesignButton
              aria-expanded={isOpen}
              className={cn(
                "mx-1 flex w-[calc(100%-0.5rem)] items-center justify-between gap-3 rounded-record-card px-4 py-3 text-left text-sm font-semibold transition-all duration-200",
                isGroupActive
                  ? "bg-status-info-soft text-content-muted"
                  : "text-content-muted/76 hover:bg-surface-inset hover:text-content-muted",
              )}
              onClick={() => toggleGroup(group.key, isOpen)}
              type="button"
            >
              <span className="min-w-0 truncate">{group.label}</span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 transition-transform",
                  isOpen ? "rotate-180" : "rotate-0",
                )}
              />
            </DesignButton>

            <div
              aria-hidden={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows,opacity,transform] duration-200 ease-out",
                isOpen
                  ? "grid-rows-[1fr] translate-y-0 opacity-100"
                  : "grid-rows-[0fr] -translate-y-1 opacity-0",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div
                  className={cn(
                    "space-y-1 pl-3 pt-1 transition-opacity duration-150",
                    isOpen ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                >
                  {group.items.map((item) => (
                    <DesktopAdminNavLink
                      compact
                      handleNavClick={handleNavClick}
                      isFocusable={isOpen}
                      item={item}
                      key={item.href}
                      pathname={pathname}
                      prefetchRoute={prefetchRoute}
                      resolvedPendingHref={resolvedPendingHref}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
