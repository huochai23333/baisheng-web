import { cn } from "@/lib/utils";

import type { AuthNoteContent } from "./auth-shell-types";

/**
 * 桌面照片栏在平板和手机上会隐藏，因此说明内容必须在表单后再出现一次。
 * 这个组件集中维护移动说明卡的材质，页面只传文字，不能自行复制一整套卡片样式。
 */
export function AuthSupplementalNote({
  note,
  tone,
}: {
  note: AuthNoteContent;
  tone: "info" | "neutral";
}) {
  return (
    <aside
      className={cn(
        "mt-8 rounded-[26px] border p-5 text-sm text-content-muted shadow-[var(--surface-shadow-interactive)] lg:hidden",
        tone === "neutral" && "border-border-subtle bg-surface-panel",
        tone === "info" && "border-status-info-border bg-status-info-soft",
      )}
      data-auth-region="supplemental-note"
    >
      <p className="font-semibold text-content-strong">{note.title}</p>
      <p className="mt-2 leading-7">{note.description}</p>
    </aside>
  );
}
