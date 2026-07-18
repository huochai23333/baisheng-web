"use client";

import type { RefObject } from "react";
import { LoaderCircle, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CurrentUserBundle } from "@/lib/user-self-service";
import type { MediaAssetKey } from "../dashboard-shared-ui";
import type { DashboardSharedMyStateCopy } from "./dashboard-shared-my-state-copy";

// 弹窗操作区只负责按钮展示，真正的上传和删除由媒体 mutation hook 执行。
export function DashboardSharedMyMediaDialogActions({
  activeDialog,
  busyKey,
  copy,
  deletePhotoAssets,
  deleteVideoAssets,
  photoAssets,
  photoInputRef,
  videoAssets,
  videoInputRef,
}: {
  activeDialog: MediaAssetKey | null;
  busyKey: string | null;
  copy: DashboardSharedMyStateCopy;
  deletePhotoAssets: (
    targets: CurrentUserBundle["mediaAssets"],
  ) => Promise<void>;
  deleteVideoAssets: (
    targets: CurrentUserBundle["mediaAssets"],
  ) => Promise<void>;
  photoAssets: CurrentUserBundle["mediaAssets"];
  photoInputRef: RefObject<HTMLInputElement | null>;
  videoAssets: CurrentUserBundle["mediaAssets"];
  videoInputRef: RefObject<HTMLInputElement | null>;
}) {
  if (activeDialog !== "photos" && activeDialog !== "videos") return null;

  const isPhotos = activeDialog === "photos";
  const assets = isPhotos ? photoAssets : videoAssets;
  const deleteBusyKey = isPhotos ? "photos-delete" : "videos-delete";
  const uploadBusyKey = isPhotos ? "photos-upload" : "videos-upload";
  const deleteLabel = isPhotos ? copy.deletePhotos : copy.deleteVideos;
  const uploadLabel = isPhotos ? copy.uploadPhotos : copy.uploadVideos;
  const inputRef = isPhotos ? photoInputRef : videoInputRef;
  const handleDelete = isPhotos ? deletePhotoAssets : deleteVideoAssets;

  return (
    <>
      <Button
        size="default"
        disabled={!assets.length || busyKey !== null}
        onClick={() => void handleDelete(assets)}
        variant="outline"
      >
        {busyKey === deleteBusyKey ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
        {deleteLabel}
      </Button>
      <Button
        variant="primary"
        size="default"
        disabled={busyKey !== null}
        onClick={() => inputRef.current?.click()}
      >
        {busyKey === uploadBusyKey ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        {uploadLabel}
      </Button>
    </>
  );
}
