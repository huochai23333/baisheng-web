import { Megaphone } from "lucide-react";

import type { AnnouncementRow } from "@/lib/announcements";

import { formatHomeAnnouncementDate } from "./dashboard-home-display";

type HomeAnnouncementsWidgetCopy = {
  announcements: {
    emptyDescription: string;
    emptyTitle: string;
    sectionDescription: string;
    sectionTitle: string;
  };
  widgets: {
    announcementCount: (count: number) => string;
  };
};

type HomeAnnouncementsWidgetProps = {
  announcements: AnnouncementRow[];
  compact: boolean;
  copy: HomeAnnouncementsWidgetCopy;
  locale: string;
};

export function HomeAnnouncementsWidget({
  announcements,
  compact,
  copy,
  locale,
}: HomeAnnouncementsWidgetProps) {
  if (compact) {
    /*
     * 窄屏只展示前两条公告的标题与日期。相比只显示数量，
     * 用户可以直接判断是否有需要立即阅读的新内容。
     */
    const visibleAnnouncements = announcements.slice(0, 2);

    return (
      <section
        className="flex h-full min-h-0 flex-col"
        data-testid="home-announcements-compact"
      >
        <div className="flex min-w-0 items-center justify-between gap-3">
          <h3 className="flex min-w-0 items-center gap-2 text-lg font-bold text-content-strong">
            <Megaphone className="size-5 shrink-0 text-primary" />
            <span className="truncate">{copy.announcements.sectionTitle}</span>
          </h3>
          <span className="shrink-0 text-xs font-semibold text-content-muted">
            {copy.widgets.announcementCount(announcements.length)}
          </span>
        </div>

        {visibleAnnouncements.length === 0 ? (
          <p className="mt-3 break-words text-sm leading-6 text-content-muted">
            {copy.announcements.emptyDescription}
          </p>
        ) : (
          <div className="mt-3 grid gap-2">
            {visibleAnnouncements.map((announcement) => (
              <article
                className="flex min-w-0 items-start justify-between gap-3 rounded-control-large border border-border-subtle bg-surface-inset px-3 py-2.5"
                key={announcement.id}
              >
                <h4 className="min-w-0 flex-1 line-clamp-1 text-sm font-semibold text-content-strong">
                  {announcement.title}
                </h4>
                <time className="shrink-0 text-xs text-content-muted">
                  {formatHomeAnnouncementDate(announcement, locale)}
                </time>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-xl font-bold tracking-tight text-content-strong">
          <Megaphone className="size-5 text-primary" />
          <span className="min-w-0 break-words">
            {copy.announcements.sectionTitle}
          </span>
        </h3>
        <p className="mt-2 break-words text-sm leading-7 text-content-muted">
          {copy.announcements.sectionDescription}
        </p>
      </div>

      {announcements.length === 0 ? (
        <div className="mt-5 rounded-control-large border border-border-subtle bg-surface-inset p-5">
          <h4 className="text-base font-semibold text-content-strong">
            {copy.announcements.emptyTitle}
          </h4>
          <p className="mt-2 break-words text-sm leading-7 text-content-muted">
            {copy.announcements.emptyDescription}
          </p>
        </div>
      ) : (
        <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {announcements.map((announcement) => (
            <article
              className="rounded-control-large border border-border-subtle bg-surface-inset p-4"
              key={announcement.id}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <h4 className="break-words text-base font-semibold text-content-strong">
                  {announcement.title}
                </h4>
                <time className="shrink-0 text-xs font-medium text-content-muted">
                  {formatHomeAnnouncementDate(announcement, locale)}
                </time>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-content-muted">
                {announcement.content}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
