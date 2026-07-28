import { buildBoardInviteLink } from "@/lib/business-referrals";
import { isSalesStaffRole } from "@/lib/sales-staff-roles";
import type { SalesmanBusinessBoard } from "@/lib/salesman-business-access";

type HomeInviteLinkCopy = {
  businessBoards: Record<SalesmanBusinessBoard, string>;
  copiedBoardLink: (board: string) => string;
  copiedLink: string;
  copyBoardLink: (board: string) => string;
  copyLink: string;
};

export type InviteLinkAction = {
  board?: SalesmanBusinessBoard;
  label: string;
  miniLabel?: string;
  successMessage: string;
  testId: string;
};

export function buildInviteLinkActions({
  businessBoards,
  copy,
  role,
}: {
  businessBoards: readonly SalesmanBusinessBoard[];
  copy: HomeInviteLinkCopy;
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

export function buildInviteLinkValue(
  action: InviteLinkAction,
  referralCode: string,
) {
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

  const params = new URLSearchParams({ ref: referralCode });
  return `${window.location.origin}/register?${params.toString()}`;
}

export async function writeInviteValueToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  /*
   * 某些较旧浏览器或受限页面没有 Clipboard API。
   * 临时输入框只在复制期间存在，完成后立即移除，不会进入用户表单。
   */
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
