import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";
import type { UserMediaAssetWithPreview } from "@/lib/user-self-service";
import {
  normalizeOptionalString,
  normalizeSearchText,
} from "@/lib/value-normalizers";

import type { DashboardSharedCopy } from "./dashboard-shared-copy";

export type ReviewStatus = "empty" | "pending" | "approved";
export type MediaAssetKey = "identity" | "passport" | "photos" | "videos";

export function getMediaStatus(assets: UserMediaAssetWithPreview[]): ReviewStatus {
  if (assets.some((asset) => asset.status === "pending")) return "pending";
  if (assets.some((asset) => asset.status === "pass")) return "approved";
  return "empty";
}

export function getStatusLabel(
  key: MediaAssetKey,
  status: ReviewStatus,
  copy: DashboardSharedCopy,
) {
  if (status === "pending") return copy.mediaStatus.pending;
  if (status === "approved") {
    return key === "identity" || key === "passport"
      ? copy.mediaStatus.approvedIdentity
      : copy.mediaStatus.approvedGeneric;
  }
  if (key === "identity") return copy.mediaStatus.identityEmpty;
  if (key === "passport") return copy.mediaStatus.passportEmpty;
  if (key === "photos") return copy.mediaStatus.photosEmpty;
  return copy.mediaStatus.videosEmpty;
}

export function getReviewStatusTone(status: ReviewStatus) {
  if (status === "approved") return "success" as const;
  if (status === "pending") return "warning" as const;
  return "info" as const;
}

export function mapUserStatus(
  status: string | null | undefined,
  copy: DashboardSharedCopy,
) {
  if (status === "active") {
    return { accent: "success" as const, label: copy.userStatus.active };
  }
  if (status === "suspended") {
    return { accent: "default" as const, label: copy.userStatus.suspended };
  }
  return { accent: "default" as const, label: copy.userStatus.pending };
}

export function formatDateTime(
  value: string | null | undefined,
  locale: Locale = DEFAULT_LOCALE,
) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export { normalizeOptionalString, normalizeSearchText };
