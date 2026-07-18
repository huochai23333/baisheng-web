import { Megaphone } from "lucide-react";

import type { AnnouncementRow } from "@/lib/announcements";

type LoginAnnouncementCardProps = {
  announcement: AnnouncementRow | null;
  copy: {
    title: string;
  };
  locale: string;
};

export function LoginAnnouncementCard({
  announcement,
  copy,
  locale,
}: LoginAnnouncementCardProps) {
  if (!announcement) {
    return null;
  }

  const publishedAt = announcement.published_at ?? announcement.created_at;

  return (
    <article className="mt-6 rounded-[26px] border border-border-subtle bg-surface-panel p-5 text-sm text-content-muted shadow-[var(--surface-shadow-interactive)]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-status-info-soft text-status-info">
          <Megaphone className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <p className="font-semibold text-content-strong">{copy.title}</p>
            <time className="shrink-0 text-xs font-medium text-content-muted">
              {formatLoginAnnouncementDate(publishedAt, locale)}
            </time>
          </div>
          <h3 className="mt-3 text-base font-semibold text-content-strong">
            {announcement.title}
          </h3>
          <p className="mt-2 line-clamp-4 whitespace-pre-wrap leading-7">
            {announcement.content}
          </p>
        </div>
      </div>
    </article>
  );
}

function formatLoginAnnouncementDate(value: string | null, locale: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}
