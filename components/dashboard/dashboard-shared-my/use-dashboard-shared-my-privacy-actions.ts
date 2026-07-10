"use client";

import type { Dispatch, SetStateAction } from "react";

import { getBrowserSupabaseClient } from "@/lib/supabase";
import { createPrivacyRequest, type CurrentUserBundle } from "@/lib/user-self-service";
import { toErrorMessage, type NoticeTone } from "../dashboard-shared-ui";
import type {
  DashboardSharedCopy,
  DashboardSharedMyStateCopy,
} from "./dashboard-shared-my-state-copy";

type DialogNotice = { tone: NoticeTone; message: string } | null;
type RefreshBundle = (options?: {
  dialogMessage?: string;
  pageMessage?: string;
  quiet?: boolean;
}) => Promise<void>;

// 身份证与护照都通过隐私申请提交；这里统一处理忙碌状态、刷新和错误反馈。
export function useDashboardSharedMyPrivacyActions({
  authUser,
  copy,
  identityDraft,
  passportDraft,
  refreshBundle,
  setBusyKey,
  setDialogNotice,
  setIdentityEditing,
  setPassportEditing,
  sharedCopy,
  supabase,
}: {
  authUser: CurrentUserBundle["authUser"] | null;
  copy: DashboardSharedMyStateCopy;
  identityDraft: string;
  passportDraft: string;
  refreshBundle: RefreshBundle;
  setBusyKey: Dispatch<SetStateAction<string | null>>;
  setDialogNotice: Dispatch<SetStateAction<DialogNotice>>;
  setIdentityEditing: Dispatch<SetStateAction<boolean>>;
  setPassportEditing: Dispatch<SetStateAction<boolean>>;
  sharedCopy: DashboardSharedCopy;
  supabase: ReturnType<typeof getBrowserSupabaseClient>;
}) {
  const submitRequest = async ({
    busyKey,
    field,
    successMessage,
    stopEditing,
    value,
  }: {
    busyKey: "identity" | "passport";
    field: "id_card" | "passport";
    successMessage: string;
    stopEditing: Dispatch<SetStateAction<boolean>>;
    value: string;
  }) => {
    if (!supabase || !authUser) return;
    setBusyKey(busyKey);
    setDialogNotice(null);
    try {
      await createPrivacyRequest(supabase, { field, userId: authUser.id, value });
      await refreshBundle({ dialogMessage: successMessage, quiet: true });
      stopEditing(false);
    } catch (error) {
      setDialogNotice({ tone: "error", message: toErrorMessage(error, sharedCopy) });
    } finally {
      setBusyKey(null);
    }
  };

  return {
    submitIdentity: () =>
      submitRequest({
        busyKey: "identity",
        field: "id_card",
        stopEditing: setIdentityEditing,
        successMessage: copy.identitySubmitted,
        value: identityDraft,
      }),
    submitPassport: () =>
      submitRequest({
        busyKey: "passport",
        field: "passport",
        stopEditing: setPassportEditing,
        successMessage: copy.passportSubmitted,
        value: passportDraft,
      }),
  };
}
