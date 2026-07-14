"use client";

import { useMemo, useState } from "react";

import { ChevronDown, LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  ADMIN_NAV_ICONS,
  MobileAdminNavLink,
} from "./admin-shell-nav-links";
import type {
  AdminShellNavGroup,
  AdminShellNavLink,
} from "./admin-shell-nav-types";
import { useAdminShellNavigation } from "./use-admin-shell-navigation";

type AdminShellMobileNavProps = {
  emptyGroupsLabel: string;
  globalItems: readonly AdminShellNavLink[];
  groups: readonly AdminShellNavGroup[];
};

/** 移动导航保持完整菜单下拉，不参与桌面业务分组偏好的读取和保存。 */
export function AdminShellMobileNav({
  emptyGroupsLabel,
  globalItems,
  groups,
}: AdminShellMobileNavProps) {
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!activeItem) {
    return null;
  }

  const activeGroupKey = activeItem.groupKey ?? null;
  const mobileGroups = activeGroupKey
    ? [
        ...groups.filter((group) => group.key === activeGroupKey),
        ...groups.filter((group) => group.key !== activeGroupKey),
      ]
    : groups;
  const ActiveIcon = ADMIN_NAV_ICONS[activeItem.icon];
  const activeIsPending = resolvedPendingHref === activeItem.href;
  const activeLabel = activeItem.groupLabel
    ? `${activeItem.groupLabel} / ${activeItem.label}`
    : activeItem.label;

  return (
    <div className="relative">
      <button
        aria-expanded={mobileMenuOpen}
        aria-label={activeLabel}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-[18px] border border-white/90 bg-white/88 px-4 py-3 text-left text-[#486782] shadow-[0_12px_28px_rgba(72,103,130,0.1)] backdrop-blur transition-colors hover:bg-[#f2f5f7]"
        onClick={() => setMobileMenuOpen((value) => !value)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {activeIsPending ? (
            <LoaderCircle className="size-4 shrink-0 animate-spin" />
          ) : (
            <ActiveIcon className="size-4 shrink-0" />
          )}
          <span className="min-w-0 truncate text-sm font-semibold">
            {activeLabel}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            mobileMenuOpen ? "rotate-180" : "rotate-0",
          )}
        />
      </button>

      <nav
        aria-hidden={!mobileMenuOpen}
        className={cn(
          "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 max-h-[62vh] overflow-y-auto rounded-[22px] border border-white/90 bg-[#fbfaf8]/98 p-2 shadow-[0_22px_50px_rgba(35,49,58,0.2)] backdrop-blur transition-[opacity,transform,clip-path] duration-200 ease-out",
          mobileMenuOpen
            ? "pointer-events-auto translate-y-0 opacity-100 [clip-path:inset(0_0_0_0)]"
            : "pointer-events-none -translate-y-1 opacity-0 [clip-path:inset(0_0_100%_0)]",
        )}
      >
        <div className="grid gap-2">
          {globalItems.map((item) => (
            <MobileAdminNavLink
              handleNavClick={handleNavClick}
              isFocusable={mobileMenuOpen}
              item={item}
              key={item.href}
              pathname={pathname}
              prefetchRoute={prefetchRoute}
              resolvedPendingHref={resolvedPendingHref}
              setMobileMenuOpen={setMobileMenuOpen}
            />
          ))}
          {mobileGroups.length > 0 ? (
            mobileGroups.map((group) => (
              <div className="grid gap-1.5" key={group.key}>
                <p className="px-3 pt-2 text-[11px] font-semibold tracking-[0.12em] text-[#82909b] uppercase">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <MobileAdminNavLink
                    handleNavClick={handleNavClick}
                    isFocusable={mobileMenuOpen}
                    item={item}
                    key={item.href}
                    pathname={pathname}
                    prefetchRoute={prefetchRoute}
                    resolvedPendingHref={resolvedPendingHref}
                    setMobileMenuOpen={setMobileMenuOpen}
                  />
                ))}
              </div>
            ))
          ) : (
            <p className="px-3 py-3 text-sm leading-6 text-[#6d767c]">
              {emptyGroupsLabel}
            </p>
          )}
        </div>
      </nav>
    </div>
  );
}
