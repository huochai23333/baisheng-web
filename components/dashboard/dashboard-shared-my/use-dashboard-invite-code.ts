"use client";

import type { Dispatch, SetStateAction } from "react";
import type { UserProfileRow } from "@/lib/user-self-service";
import type { NoticeTone } from "../dashboard-shared-ui";
import type { DashboardSharedMyStateCopy } from "./dashboard-shared-my-state-copy";

// 邀请码复制是独立的浏览器动作，单独封装后主状态 hook 只暴露操作结果。
export function useDashboardInviteCode({
  copy,
  profile,
  setPageNotice,
}: {
  copy: DashboardSharedMyStateCopy;
  profile: UserProfileRow | null;
  setPageNotice: Dispatch<
    SetStateAction<{ tone: NoticeTone; message: string } | null>
  >;
}) {
  return async () => {
    if (!profile?.referral_code) {
      setPageNotice({ tone: "error", message: copy.missingInviteCode });
      return;
    }
    try {
      await navigator.clipboard.writeText(profile.referral_code);
      setPageNotice({ tone: "success", message: copy.inviteCopied });
    } catch {
      setPageNotice({ tone: "error", message: copy.inviteCopyFailed });
    }
  };
}
