import type { PrivacyRequestStatus } from "@/lib/user-self-service";

type TranslationValues = Record<string, string | number>;

export type DashboardSharedTranslator = (
  key: string,
  values?: TranslationValues,
) => string;

export type DashboardSharedCopy = {
  assetStatus: Record<PrivacyRequestStatus, string>;
  errors: {
    duplicatePending: string;
    duplicateStored: string;
    permission: string;
    unknown: string;
  };
  fallback: { noRecordYet: string };
  inputHint: string;
  loading: string;
  mediaStatus: {
    approvedGeneric: string;
    approvedIdentity: string;
    identityEmpty: string;
    passportEmpty: string;
    pending: string;
    photosEmpty: string;
    videosEmpty: string;
  };
  statusHeadings: { approved: string; pending: string };
  userStatus: { active: string; pending: string; suspended: string };
  video: {
    badge: string;
    count: (count: number) => string;
    defaultTitle: string;
  };
};

/** 所有共享文案都从 next-intl 生成，不再接受旧语言字符串或内置双语文案。 */
export function createDashboardSharedCopy(
  t: DashboardSharedTranslator,
): DashboardSharedCopy {
  return {
    assetStatus: {
      denied: t("assetStatus.denied"),
      pass: t("assetStatus.pass"),
      pending: t("assetStatus.pending"),
    },
    errors: {
      duplicatePending: t("errors.duplicatePending"),
      duplicateStored: t("errors.duplicateStored"),
      permission: t("errors.permission"),
      unknown: t("errors.unknown"),
    },
    fallback: { noRecordYet: t("fallback.noRecordYet") },
    inputHint: t("inputHint"),
    loading: t("loading"),
    mediaStatus: {
      approvedGeneric: t("mediaStatus.approvedGeneric"),
      approvedIdentity: t("mediaStatus.approvedIdentity"),
      identityEmpty: t("mediaStatus.identityEmpty"),
      passportEmpty: t("mediaStatus.passportEmpty"),
      pending: t("mediaStatus.pending"),
      photosEmpty: t("mediaStatus.photosEmpty"),
      videosEmpty: t("mediaStatus.videosEmpty"),
    },
    statusHeadings: {
      approved: t("statusHeadings.approved"),
      pending: t("statusHeadings.pending"),
    },
    userStatus: {
      active: t("userStatus.active"),
      pending: t("userStatus.pending"),
      suspended: t("userStatus.suspended"),
    },
    video: {
      badge: t("video.badge"),
      count: (count) => t("video.count", { count }),
      defaultTitle: t("video.defaultTitle"),
    },
  };
}
