import type { Dispatch, SetStateAction } from "react";

import type { DashboardSharedCopy } from "../dashboard-shared-copy";
import { toErrorMessage } from "../dashboard-shared-errors";
import type { MediaAssetKey, FeedbackTone } from "../dashboard-shared-ui";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import {
  getCurrentUserBundle,
  type CurrentUserBundle,
} from "@/lib/user-self-service";

export type DashboardSharedMyNotice = {
  tone: FeedbackTone;
  message: string;
};

export type DashboardSharedMyRefreshOptions = {
  dialogMessage?: string;
  pageMessage?: string;
  quiet?: boolean;
};

// 刷新资料包含请求、登录失效、页面反馈和弹窗反馈四个分支。
// 独立函数让主 view-model hook 只负责组合状态，同时便于以后单独覆盖这些失败路径。
export async function refreshDashboardSharedMyBundle(
  {
    activeDialog,
    onRequireLogin,
    setBundle,
    setBusyKey,
    setDialogNotice,
    setPageError,
    setPageNotice,
    sharedCopy,
    supabase,
  }: {
    activeDialog: MediaAssetKey | null;
    onRequireLogin: () => void;
    setBundle: Dispatch<SetStateAction<CurrentUserBundle | null>>;
    setBusyKey: Dispatch<SetStateAction<string | null>>;
    setDialogNotice: Dispatch<SetStateAction<DashboardSharedMyNotice | null>>;
    setPageError: Dispatch<SetStateAction<string | null>>;
    setPageNotice: Dispatch<SetStateAction<DashboardSharedMyNotice | null>>;
    sharedCopy: DashboardSharedCopy;
    supabase: ReturnType<typeof getBrowserSupabaseClient>;
  },
  { dialogMessage, pageMessage, quiet }: DashboardSharedMyRefreshOptions = {},
) {
  if (!supabase) return;

  try {
    if (!quiet) setBusyKey("refresh");
    const nextBundle = await getCurrentUserBundle(supabase);

    if (!nextBundle) {
      onRequireLogin();
      return;
    }

    setBundle(nextBundle);
    setPageError(null);
    if (dialogMessage) {
      setDialogNotice({ tone: "success", message: dialogMessage });
    }
    if (pageMessage) {
      setPageNotice({ tone: "success", message: pageMessage });
    }
  } catch (error) {
    const message = toErrorMessage(error, sharedCopy);
    if (activeDialog) setDialogNotice({ tone: "error", message });
    else setPageError(message);
  } finally {
    if (!quiet) setBusyKey(null);
  }
}
