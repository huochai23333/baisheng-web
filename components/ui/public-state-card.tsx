import type { ReactNode } from "react";

import { Surface } from "./surface";
import { StatusBadge, type StatusTone } from "./status-badge";

/**
 * 404、访问范围和异常页使用同一张提示卡。
 * 页面只传日常语言文案与操作，避免各入口复制颜色、间距和标题层级。
 */
export function PublicStateCard({
  actions,
  badge,
  badgeTone = "info",
  description,
  title,
}: {
  actions: ReactNode;
  badge: ReactNode;
  badgeTone?: StatusTone;
  description: ReactNode;
  title: ReactNode;
}) {
  return (
    <Surface
      className="w-full max-w-xl p-8 sm:p-10"
      padding={null}
      variant="panel"
    >
      <StatusBadge tone={badgeTone}>{badge}</StatusBadge>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-content-strong">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-7 text-content-muted">{description}</p>
      <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
    </Surface>
  );
}
