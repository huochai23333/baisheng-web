"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Link from "next/link";
import {
  ChevronDown,
  IdCard,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";

import { InteractiveButton as DesignButton } from "@/components/ui/button";
import { signOutCurrentBrowserSession } from "@/lib/browser-auth-session";
import { MOTION_DURATION, MOTION_EASING } from "@/lib/motion-tokens";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { useStaleFocusRecovery } from "@/lib/use-stale-focus-recovery";

type WorkspaceAccountMenuProps = {
  accountLabel: string;
  initials: string;
  myHref: string;
};

export function WorkspaceAccountMenu({
  accountLabel,
  initials,
  myHref,
}: WorkspaceAccountMenuProps) {
  const t = useTranslations("DashboardShell");
  const shouldUseFullPageLoad = useStaleFocusRecovery();
  const supabase = getBrowserSupabaseClient();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const accountMenuItems = useMemo(
    () => [
      {
        href: `${myHref}#personal-center`,
        icon: LayoutDashboard,
        label: t("accountMenu.personalCenter"),
      },
      {
        href: `${myHref}#account-center`,
        icon: Settings,
        label: t("accountMenu.accountCenter"),
      },
      {
        href: `${myHref}#profile-info`,
        icon: IdCard,
        label: t("accountMenu.profileInfo"),
      },
      {
        href: `${myHref}#account-verification`,
        icon: ShieldCheck,
        label: t("accountMenu.accountVerification"),
      },
    ],
    [myHref, t],
  );

  useEffect(() => {
    if (!accountMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen]);

  const handleLogout = () => {
    if (logoutPending) return;
    setLogoutPending(true);
    signOutCurrentBrowserSession(supabase);
  };

  return (
    <div className="relative" ref={menuRef}>
      <DesignButton
        aria-expanded={accountMenuOpen}
        aria-label={t("accountMenu.open")}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-3 rounded-full bg-surface-inset p-1.5 transition-colors hover:bg-surface-interactive sm:pr-3"
        data-testid="workspace-account-menu-trigger"
        onClick={() => setAccountMenuOpen((current) => !current)}
        type="button"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initials}
        </span>
        <span className="hidden text-sm font-medium text-primary sm:inline">
          {accountLabel}
        </span>
        <ChevronDown
          className={`hidden size-4 text-content-muted transition-transform duration-200 sm:block ${
            accountMenuOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </DesignButton>

      <AnimatePresence>
        {accountMenuOpen ? (
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute right-0 top-[calc(100%+0.75rem)] z-40 w-[min(240px,calc(100vw-1.5rem))] origin-top-right overflow-hidden rounded-control-large border border-border-subtle bg-surface-overlay shadow-surface-floating backdrop-blur-2xl backdrop-saturate-150"
            data-testid="workspace-account-menu"
            exit={{ opacity: 0, scale: 0.985, y: -6 }}
            initial={{ opacity: 0, scale: 0.985, y: -6 }}
            transition={{
              duration: MOTION_DURATION.standard,
              ease: MOTION_EASING.enter,
            }}
          >
            <div className="border-b border-border-subtle px-4 py-3">
              <p className="truncate text-sm font-semibold text-content-muted">
                {accountLabel}
              </p>
            </div>

            <div className="p-2">
              {accountMenuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    className="flex min-h-11 items-center gap-3 rounded-control-default px-3 py-2.5 text-sm font-medium text-content-muted transition-colors hover:bg-surface-inset"
                    href={item.href}
                    key={item.href}
                    onClick={(event) => {
                      setAccountMenuOpen(false);

                      // 长时间挂起后的页面需要完整加载，正常使用时仍保留站内快速跳转。
                      if (shouldUseFullPageLoad()) {
                        event.preventDefault();
                        window.location.assign(item.href);
                      }
                    }}
                    prefetch={false}
                  >
                    <Icon className="size-4 text-content-muted" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-border-subtle p-2">
              <DesignButton
                className="flex min-h-11 w-full items-center gap-3 rounded-control-default px-3 py-2.5 text-left text-sm font-semibold text-status-danger transition-colors hover:bg-surface-inset disabled:cursor-not-allowed disabled:opacity-70"
                disabled={logoutPending}
                onClick={handleLogout}
                type="button"
              >
                {logoutPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <LogOut className="size-4" />
                )}
                {t("logout")}
              </DesignButton>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
