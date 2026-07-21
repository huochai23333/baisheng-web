"use client";

import { useMemo, useState, type ReactNode } from "react";

import { Copy, KeyRound, Link as LinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildBoardInviteLink } from "@/lib/business-referrals";
import { isSalesStaffRole } from "@/lib/sales-staff-roles";
import type { SalesmanBusinessBoard } from "@/lib/salesman-business-access";
import { cn } from "@/lib/utils";

type HomeInviteNotice = {
  message: string;
  tone: "error" | "success";
};

export type HomeInviteCopy = {
  businessBoards: Record<SalesmanBusinessBoard, string>;
  codeLabel: string;
  copiedBoardLink: (board: string) => string;
  compactDescription: string;
  copiedCode: string;
  copiedLink: string;
  copyBoardLink: (board: string) => string;
  copyCode: string;
  copyFailed: string;
  copyLink: string;
  description: string;
  noCodeDescription: string;
  noCodeTitle: string;
  noLinkAccess: string;
  title: string;
};

type HomeInviteSectionProps = {
  businessBoards: readonly SalesmanBusinessBoard[];
  copy: HomeInviteCopy;
  density?: "comfortable" | "compact" | "mini";
  referralCode: string | null;
  role: string | null;
};

type InviteLinkAction = {
  board?: SalesmanBusinessBoard;
  label: string;
  miniLabel?: string;
  successMessage: string;
  testId: string;
};

export function HomeInviteSection({
  businessBoards,
  copy,
  density = "comfortable",
  referralCode,
  role,
}: HomeInviteSectionProps) {
  const [notice, setNotice] = useState<HomeInviteNotice | null>(null);
  const mini = density === "mini";
  const compact = density !== "comfortable";
  const normalizedReferralCode = referralCode?.trim().toUpperCase() ?? "";
  const linkActions = useMemo(
    () =>
      buildInviteLinkActions({
        businessBoards,
        copy,
        role,
      }),
    [businessBoards, copy, role],
  );

  const handleCopy = async (value: string, successMessage: string) => {
    if (!value) {
      setNotice({ message: copy.copyFailed, tone: "error" });
      return;
    }

    try {
      await writeClipboard(value);
      setNotice({ message: successMessage, tone: "success" });
    } catch {
      setNotice({ message: copy.copyFailed, tone: "error" });
    }
  };

  if (mini) {
    return (
      <section
        className="flex h-full min-h-0 flex-col overflow-hidden"
        data-testid="home-invite-section"
      >
        <InviteHeading compact copy={copy} mini />
        <div className="mt-1.5 flex min-w-0 items-center gap-2 rounded-control-large border border-border-subtle bg-surface-inset">
          <p
            className="min-w-0 flex-1 truncate px-2 font-mono text-sm font-bold text-content-strong"
            data-testid="home-invite-code"
          >
            {normalizedReferralCode || copy.noCodeTitle}
          </p>
          {normalizedReferralCode ? (
            <Button
              aria-label={copy.copyCode}
              className="shrink-0"
              // 迷你卡片和普通卡片使用同一个测试标识，保证响应式切换后仍能验证复制行为。
              data-testid="home-invite-copy-code"
              onClick={() =>
                void handleCopy(normalizedReferralCode, copy.copiedCode)
              }
              size="icon-compact"
              type="button"
              variant="ghost"
            >
              <Copy className="size-4" />
            </Button>
          ) : null}
        </div>
        {notice ? (
          <p aria-live="polite" className="sr-only" role="status">
            {notice.message}
          </p>
        ) : null}
      </section>
    );
  }

  if (!normalizedReferralCode) {
    return (
      <section
        className="flex h-full min-h-0 flex-col justify-between"
        data-testid="home-invite-section"
      >
        <InviteHeading compact={compact} copy={copy} mini={mini} />
        <div className="mt-4 rounded-surface-inset border border-border-subtle bg-surface-inset p-4">
          <h4 className="break-words text-sm font-semibold text-content-muted">
            {copy.noCodeTitle}
          </h4>
          <p className="mt-2 break-words text-sm leading-6 text-content-muted">
            {copy.noCodeDescription}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="flex h-full min-h-0 flex-col overflow-hidden"
      data-testid="home-invite-section"
    >
      <InviteHeading compact={compact} copy={copy} mini={mini} />

      <div
        className={cn(
          "rounded-control-large border border-border-subtle bg-surface-inset",
          mini ? "mt-3 p-2" : compact ? "mt-4 p-3" : "mt-4 p-4",
        )}
      >
        {!mini ? (
          <span className="text-xs font-semibold text-content-muted">
            {copy.codeLabel}
          </span>
        ) : null}
        <p
          className={cn(
            "break-words font-mono font-bold leading-tight text-content-strong",
            mini ? "text-sm" : compact ? "mt-1 text-lg" : "mt-1 text-2xl",
          )}
          data-testid="home-invite-code"
        >
          {normalizedReferralCode}
        </p>
      </div>

      <div
        className={cn(
          "grid gap-2",
          mini ? "grid-cols-3" : compact ? "grid-cols-1" : "sm:grid-cols-2",
          mini ? "mt-3" : "mt-4",
        )}
      >
        <InviteActionButton
          icon={<Copy className="size-4" />}
          iconOnly={mini}
          label={copy.copyCode}
          onClick={() =>
            void handleCopy(normalizedReferralCode, copy.copiedCode)
          }
          testId="home-invite-copy-code"
        />
        {linkActions.map((action) => (
          <InviteActionButton
            icon={<LinkIcon className="size-4" />}
            iconOnly={mini}
            key={action.testId}
            label={action.label}
            miniLabel={action.miniLabel}
            onClick={() =>
              void handleCopy(
                buildInviteLinkValue(action, normalizedReferralCode),
                action.successMessage,
              )
            }
            testId={action.testId}
          />
        ))}
      </div>

      {!mini && isSalesStaffRole(role) && linkActions.length === 0 ? (
        <p className="mt-3 break-words text-xs leading-5 text-content-muted">
          {copy.noLinkAccess}
        </p>
      ) : null}

      {notice ? (
        <p
          aria-live="polite"
          className={cn(
            "mt-3 break-words text-sm leading-6",
            mini && "line-clamp-1 text-xs leading-5",
            notice.tone === "success"
              ? "text-status-success"
              : "text-content-muted",
          )}
          role="status"
        >
          {notice.message}
        </p>
      ) : null}
    </section>
  );
}

function InviteHeading({
  compact,
  copy,
  mini,
}: {
  compact: boolean;
  copy: HomeInviteCopy;
  mini: boolean;
}) {
  return (
    <div className="min-w-0">
      <h3
        className={cn(
          "flex items-center gap-2 font-bold tracking-tight text-content-strong",
          mini ? "text-base" : compact ? "text-lg" : "text-xl",
        )}
      >
        <KeyRound className="size-5 shrink-0 text-primary" />
        <span className="min-w-0 break-words">
          {mini ? copy.codeLabel : copy.title}
        </span>
      </h3>
      {!mini ? (
        <p
          className={cn(
            "mt-2 break-words text-sm leading-7 text-content-muted",
            compact && "line-clamp-2 text-xs leading-6",
          )}
        >
          {compact ? copy.compactDescription : copy.description}
        </p>
      ) : null}
    </div>
  );
}

function InviteActionButton({
  icon,
  iconOnly,
  label,
  miniLabel,
  onClick,
  testId,
}: {
  icon: ReactNode;
  iconOnly: boolean;
  label: string;
  miniLabel?: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <Button
      className={cn("justify-start", iconOnly && "justify-center")}
      data-testid={testId}
      onClick={onClick}
      title={label}
      type="button"
      size="compact"
      variant="outline"
      wrap
    >
      {iconOnly && miniLabel ? (
        <span aria-hidden="true" className="text-xs font-bold leading-none">
          {miniLabel}
        </span>
      ) : (
        icon
      )}
      <span
        className={cn(
          "min-w-0 whitespace-normal break-words text-left leading-5",
          iconOnly && "sr-only",
        )}
      >
        {label}
      </span>
    </Button>
  );
}

function buildInviteLinkActions({
  businessBoards,
  copy,
  role,
}: {
  businessBoards: readonly SalesmanBusinessBoard[];
  copy: HomeInviteCopy;
  role: string | null;
}): InviteLinkAction[] {
  if (isSalesStaffRole(role)) {
    return businessBoards.map((board) => {
      const boardLabel = copy.businessBoards[board];

      return {
        board,
        label: copy.copyBoardLink(boardLabel),
        miniLabel: boardLabel.slice(0, 1),
        successMessage: copy.copiedBoardLink(boardLabel),
        testId: `home-invite-copy-link-${board}`,
      };
    });
  }

  return [
    {
      label: copy.copyLink,
      successMessage: copy.copiedLink,
      testId: "home-invite-copy-link",
    },
  ];
}

function buildInviteLinkValue(action: InviteLinkAction, referralCode: string) {
  if (typeof window === "undefined") {
    return "";
  }

  if (action.board) {
    return buildBoardInviteLink({
      board: action.board,
      origin: window.location.origin,
      referralCode,
    });
  }

  return buildGeneralInviteLink(window.location.origin, referralCode);
}

function buildGeneralInviteLink(origin: string, referralCode: string) {
  const params = new URLSearchParams({
    ref: referralCode,
  });

  return `${origin}/register?${params.toString()}`;
}

async function writeClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");

  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    if (!document.execCommand("copy")) {
      throw new Error("copy_failed");
    }
  } finally {
    document.body.removeChild(textarea);
  }
}
