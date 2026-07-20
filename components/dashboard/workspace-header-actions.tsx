"use client";

import { InteractiveButton as DesignButton } from "@/components/ui/button";

import { useEffect, useMemo, useRef, useState } from "react";

import Link from "next/link";
import {
  Bell,
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

import { useLocale } from "@/components/i18n/locale-provider";
import {
  MotionList,
  MotionListItem,
} from "@/components/motion/motion-primitives";
import { Button } from "@/components/ui/button";
import type { AnnouncementRow } from "@/lib/announcements";
import { signOutCurrentBrowserSession } from "@/lib/browser-auth-session";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { useStaleFocusRecovery } from "@/lib/use-stale-focus-recovery";
import { MOTION_DURATION, MOTION_EASING } from "@/lib/motion-tokens";
import type { WorkspaceAnnouncementsState } from "@/lib/workspace-announcements";

import { DashboardDialog } from "./dashboard-dialog";
import { FeedbackNotice } from "./dashboard-shared-ui";
import { WorkspaceFeedbackButton } from "./workspace-feedback/workspace-feedback-button";
import { useWorkspaceHeaderAnnouncements } from "./use-workspace-header-announcements";

type WorkspaceHeaderActionsProps = {
  accountLabel: string;
  initialAnnouncementsState: WorkspaceAnnouncementsState;
  initials: string;
  myHref: string;
};

export function WorkspaceHeaderActions({
  accountLabel,
  initialAnnouncementsState,
  initials,
  myHref,
}: WorkspaceHeaderActionsProps) {
  const t = useTranslations("DashboardShell");
  const { locale } = useLocale();
  const shouldUseFullPageLoad = useStaleFocusRecovery();
  const supabase = getBrowserSupabaseClient();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const announcementsCopy = useMemo(
    () => ({
      loadError: t("announcements.loadError"),
      readError: t("announcements.readError"),
    }),
    [t],
  );
  const announcements = useWorkspaceHeaderAnnouncements({
    copy: announcementsCopy,
    initialState: initialAnnouncementsState,
  });

  const accountMenuItems = useMemo(
    () => [
      {
        href: `${myHref}#personal-center`,
        icon: LayoutDashboard,
        label: t("accountMenu.personalCenter"),
      },
      {
        href: `${myHref}var(--chart-1)ount-center`,
        icon: Settings,
        label: t("accountMenu.accountCenter"),
      },
      {
        href: `${myHref}#profile-info`,
        icon: IdCard,
        label: t("accountMenu.profileInfo"),
      },
      {
        href: `${myHref}var(--chart-1)ount-verification`,
        icon: ShieldCheck,
        label: t("accountMenu.accountVerification"),
      },
    ],
    [myHref, t],
  );

  useEffect(() => {
    if (!accountMenuOpen) {
      return;
    }

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
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen]);

  const handleLogout = () => {
    if (logoutPending) {
      return;
    }

    setLogoutPending(true);
    signOutCurrentBrowserSession(supabase);
  };

  return (
    <>
      <DesignButton
        aria-label={t("announcements.open")}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-interactive sm:h-10 sm:w-10"
        disabled={announcements.loading}
        onClick={announcements.openRecentAnnouncements}
        type="button"
      >
        {announcements.loading ? (
          <LoaderCircle className="size-[18px] animate-spin" />
        ) : (
          <Bell className="size-[18px]" />
        )}
        {announcements.unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-surface-inset px-1 text-[10px] font-semibold leading-none text-white">
            {announcements.unreadCount > 9 ? "9+" : announcements.unreadCount}
          </span>
        ) : null}
      </DesignButton>
      <WorkspaceFeedbackButton />

      <div className="relative" ref={menuRef}>
        <DesignButton
          aria-expanded={accountMenuOpen}
          aria-label={t("accountMenu.open")}
          className="inline-flex items-center gap-3 rounded-full bg-surface-inset p-1.5 transition-colors hover:bg-surface-inset sm:pr-3"
          data-testid="workspace-account-menu-trigger"
          onClick={() => {
            setAccountMenuOpen((current) => !current);
          }}
          type="button"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-inset text-xs font-semibold text-white">
            {initials}
          </div>
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
              className="absolute right-0 top-[calc(100%+0.75rem)] z-40 w-[240px] origin-top-right overflow-hidden rounded-control-large border border-border-subtle bg-surface-interactive shadow-surface-interactive"
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

                  // 账号菜单不是高频跳转入口，点击时读取最新页面，
                  // 可以避免浏览器长期保存包含旧登录状态的页面内容。
                  return (
                    <Link
                      className="flex items-center gap-3 rounded-control-default px-3 py-2.5 text-sm font-medium text-content-muted transition-colors hover:bg-surface-inset"
                      href={item.href}
                      key={item.href}
                      onClick={(event) => {
                        setAccountMenuOpen(false);

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
                  className="flex w-full items-center gap-3 rounded-control-default px-3 py-2.5 text-left text-sm font-semibold text-status-danger transition-colors hover:bg-surface-inset disabled:cursor-not-allowed disabled:opacity-70"
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

      <DashboardDialog
        actions={
          announcements.unreadCount > 0 ? (
            <Button
              variant="primary"
              size="compact"
              disabled={announcements.markingRead}
              onClick={() => void announcements.acknowledgeAnnouncements()}
            >
              {announcements.markingRead ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : null}
              {t("announcements.acknowledge")}
            </Button>
          ) : undefined
        }
        description={
          announcements.dialogMode === "auto"
            ? t("announcements.newDescription")
            : t("announcements.recentDescription")
        }
        onOpenChange={announcements.closeDialog}
        open={announcements.dialogOpen}
        title={
          announcements.dialogMode === "auto"
            ? t("announcements.newTitle")
            : t("announcements.recentTitle")
        }
      >
        <MotionList className="space-y-4">
          {announcements.errorMessage ? (
            <FeedbackNotice tone="error">
              {announcements.errorMessage}
            </FeedbackNotice>
          ) : null}

          {announcements.displayedAnnouncements.length === 0 ? (
            <div className="rounded-surface-panel border border-border-subtle bg-surface-interactive p-6 text-sm leading-7 text-content-muted">
              {t("announcements.empty")}
            </div>
          ) : (
            announcements.displayedAnnouncements.map((announcement, index) => (
              <MotionListItem index={index} key={announcement.id}>
                <WorkspaceAnnouncementCard
                  announcement={announcement}
                  locale={locale}
                />
              </MotionListItem>
            ))
          )}
        </MotionList>
      </DashboardDialog>
    </>
  );
}

function WorkspaceAnnouncementCard({
  announcement,
  locale,
}: {
  announcement: AnnouncementRow;
  locale: string;
}) {
  const publishedAt = announcement.published_at ?? announcement.created_at;

  return (
    <article className="rounded-surface-panel border border-border-subtle bg-surface-interactive p-5 shadow-surface-interactive">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h4 className="text-lg font-semibold text-content-strong">
          {announcement.title}
        </h4>
        <time className="shrink-0 text-xs font-medium text-content-muted">
          {formatWorkspaceAnnouncementDate(publishedAt, locale)}
        </time>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-content-muted">
        {announcement.content}
      </p>
    </article>
  );
}

function formatWorkspaceAnnouncementDate(value: string | null, locale: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}
