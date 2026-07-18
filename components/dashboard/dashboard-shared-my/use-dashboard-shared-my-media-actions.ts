"use client";

import type { Dispatch, SetStateAction } from "react";

import { getBrowserSupabaseClient } from "@/lib/supabase";
import {
  deleteUserMediaAssets,
  uploadUserMedia,
  type CurrentUserBundle,
} from "@/lib/user-self-service";
import { toErrorMessage, type FeedbackTone } from "../dashboard-shared-ui";
import type {
  DashboardSharedCopy,
  DashboardSharedMyStateCopy,
} from "./dashboard-shared-my-state-copy";

type DialogNotice = { tone: FeedbackTone; message: string } | null;
type RefreshBundle = (options?: {
  dialogMessage?: string;
  pageMessage?: string;
  quiet?: boolean;
}) => Promise<void>;

// 媒体上传和删除集中在 mutation hook，主状态 hook 不再直接处理四条相似写入流程。
export function useDashboardSharedMyMediaActions({
  authUser,
  copy,
  refreshBundle,
  setBusyKey,
  setDialogNotice,
  sharedCopy,
  supabase,
}: {
  authUser: CurrentUserBundle["authUser"] | null;
  copy: DashboardSharedMyStateCopy;
  refreshBundle: RefreshBundle;
  setBusyKey: Dispatch<SetStateAction<string | null>>;
  setDialogNotice: Dispatch<SetStateAction<DialogNotice>>;
  sharedCopy: DashboardSharedCopy;
  supabase: ReturnType<typeof getBrowserSupabaseClient>;
}) {
  const uploadPhotos = async (files: File[]) => {
    if (!supabase || !authUser) return;
    setBusyKey("photos-upload");
    setDialogNotice(null);
    try {
      await uploadUserMedia(supabase, { files, kind: "image", userId: authUser.id });
      await refreshBundle({ dialogMessage: copy.photosUploaded, quiet: true });
    } catch (error) {
      setDialogNotice({ tone: "error", message: toErrorMessage(error, sharedCopy) });
    } finally {
      setBusyKey(null);
    }
  };

  const uploadVideos = async (files: File[]) => {
    if (!supabase || !authUser) return;
    setBusyKey("videos-upload");
    setDialogNotice(null);
    try {
      await uploadUserMedia(supabase, { files, kind: "video", userId: authUser.id });
      await refreshBundle({ dialogMessage: copy.videosUploaded, quiet: true });
    } catch (error) {
      setDialogNotice({ tone: "error", message: toErrorMessage(error, sharedCopy) });
    } finally {
      setBusyKey(null);
    }
  };

  const deletePhotoAssets = async (targets: CurrentUserBundle["mediaAssets"]) => {
    if (!supabase) return;
    setBusyKey("photos-delete");
    setDialogNotice(null);
    try {
      await deleteUserMediaAssets(supabase, targets);
      await refreshBundle({ dialogMessage: copy.photosDeleted, quiet: true });
    } catch (error) {
      setDialogNotice({ tone: "error", message: toErrorMessage(error, sharedCopy) });
    } finally {
      setBusyKey(null);
    }
  };

  const deleteVideoAssets = async (targets: CurrentUserBundle["mediaAssets"]) => {
    if (!supabase) return;
    setBusyKey("videos-delete");
    setDialogNotice(null);
    try {
      await deleteUserMediaAssets(supabase, targets);
      await refreshBundle({ dialogMessage: copy.videosDeleted, quiet: true });
    } catch (error) {
      setDialogNotice({ tone: "error", message: toErrorMessage(error, sharedCopy) });
    } finally {
      setBusyKey(null);
    }
  };

  return { deletePhotoAssets, deleteVideoAssets, uploadPhotos, uploadVideos };
}
