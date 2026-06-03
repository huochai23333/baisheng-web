"use client";

import { useMemo } from "react";

import { useTranslations } from "next-intl";

import { useLocale } from "@/components/i18n/locale-provider";
import type { DashboardHomePageData } from "@/lib/dashboard-home";

import { DashboardHomeCustomizer } from "./dashboard-home-customizer";
import { createHomeTodoCopy } from "./dashboard-home-todo-display";

type DashboardHomeClientProps = {
  initialData: DashboardHomePageData;
};

export function DashboardHomeClient({ initialData }: DashboardHomeClientProps) {
  const t = useTranslations("DashboardHome");
  const { locale } = useLocale();
  const greetingCopy = useMemo(
    () => ({
      greeting: {
        afternoon: t("greeting.afternoon"),
        evening: t("greeting.evening"),
        morning: t("greeting.morning"),
        noon: t("greeting.noon"),
      },
      subtitle: t("subtitle"),
      title: (name: string) => t("title", { name }),
      unnamedUser: t("unnamedUser"),
    }),
    [t],
  );
  const announcementsCopy = useMemo(
    () => ({
      emptyDescription: t("announcements.emptyDescription"),
      emptyTitle: t("announcements.emptyTitle"),
      sectionDescription: t("announcements.description"),
      sectionTitle: t("announcements.title"),
    }),
    [t],
  );
  const widgetCopy = useMemo(
    () => ({
      announcements: announcementsCopy,
      greeting: greetingCopy,
      widgets: {
        announcementCount: (count: number) =>
          t("customizer.summary.announcementCount", { count }),
        todoCount: (count: number) =>
          t("customizer.summary.todoCount", { count }),
      },
    }),
    [announcementsCopy, greetingCopy, t],
  );
  const customizerCopy = useMemo(
    () => ({
      addWidget: t("customizer.addWidget"),
      done: t("customizer.done"),
      edit: t("customizer.edit"),
      emptyDescription: t("customizer.emptyDescription"),
      emptyTitle: t("customizer.emptyTitle"),
      moveLeft: t("customizer.moveLeft"),
      moveRight: t("customizer.moveRight"),
      removeWidget: t("customizer.removeWidget"),
      reset: t("customizer.reset"),
      resizeWidget: t("customizer.resizeWidget"),
      sidebarDescription: t("customizer.sidebarDescription"),
      sidebarTitle: t("customizer.sidebarTitle"),
      sizeLabel: (width: number, height: number) =>
        t("customizer.sizeLabel", { height, width }),
      widgets: {
        announcements: {
          description: t("customizer.widgets.announcements.description"),
          title: t("customizer.widgets.announcements.title"),
        },
        greeting: {
          description: t("customizer.widgets.greeting.description"),
          title: t("customizer.widgets.greeting.title"),
        },
        todos: {
          description: t("customizer.widgets.todos.description"),
          title: t("customizer.widgets.todos.title"),
        },
      },
    }),
    [t],
  );
  const todoCopy = useMemo(() => createHomeTodoCopy(t), [t]);

  return (
    <DashboardHomeCustomizer
      copy={widgetCopy}
      customizerCopy={customizerCopy}
      initialData={initialData}
      locale={locale}
      todoCopy={todoCopy}
    />
  );
}
