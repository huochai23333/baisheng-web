import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getDefaultSignedInPathForRole,
  getDefaultWorkspaceBasePath,
} from "./auth-routing";
import {
  getCurrentSessionContext,
  resetCurrentAuthContextCache,
} from "./current-session-context";
import { resetUserMediaPreviewCache } from "./user-media-preview-cache";
import { syncProfileFromAuthMetadataIfPossible } from "./user-profile-service";
import type {
  CurrentUserBundle,
  UserMediaAssetRow,
  UserMediaAssetWithPreview,
  UserPrivacyDataRow,
  UserPrivacyRequestRow,
  UserProfileRow,
  UserVipMembershipRow,
} from "./user-self-service-types";
import { withRequestTimeout } from "./request-timeout";

export { getDefaultSignedInPathForRole, getDefaultWorkspaceBasePath };
export {
  getCurrentSession,
  getCurrentSessionContext,
  getRoleFromUser,
  getStatusFromUser,
} from "./current-session-context";
export { createPrivacyRequest } from "./user-privacy-requests";
export {
  deleteUserMediaAssets,
  uploadUserMedia,
} from "./user-media-mutations";
export { createUserMediaAssetPreviewUrl } from "./user-media-preview-cache";
export { updateUserProfileCity } from "./user-profile-service";
export type { AppRole } from "./auth-routing";
export type { UserStatus } from "./auth-metadata";
export type {
  CurrentUserBundle,
  MediaKind,
  PrivacyRequestStatus,
  UserMediaAssetRow,
  UserMediaAssetWithPreview,
  UserPrivacyDataRow,
  UserPrivacyRequestRow,
  UserProfileRow,
  UserVipMembershipRow,
} from "./user-self-service-types";

export function resetCurrentSessionCache() {
  resetCurrentAuthContextCache();
  resetUserMediaPreviewCache();
}

/**
 * 该入口只编排“我的资料”页面所需的并行读取。
 * 资料同步、隐私申请、媒体上传和预览缓存均在各自领域模块中实现。
 */
export async function getCurrentUserBundle(
  supabase: SupabaseClient,
): Promise<CurrentUserBundle | null> {
  const { user, role } = await getCurrentSessionContext(supabase);
  if (!user) return null;

  const [profileResult, privacyDataResult, privacyRequestsResult, vipResult, mediaResult] =
    await withRequestTimeout(
      Promise.all([
        supabase
          .from("user_profiles")
          .select("user_id,name,phone,email,status,city,referral_code,created_at")
          .eq("user_id", user.id)
          .maybeSingle<UserProfileRow>(),
        supabase
          .from("user_privacy_data")
          .select("user_id,passport,id_card")
          .eq("user_id", user.id)
          .maybeSingle<UserPrivacyDataRow>(),
        supabase
          .from("user_privacy_requests")
          .select(
            "id,user_id,passport_requests,id_card_requests,status,reviewer_user_id,created_at,review_at,type",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .returns<UserPrivacyRequestRow[]>(),
        supabase
          .from("user_vip_membership")
          .select(
            "user_id,status,started_at,expires_at,first_paid_order_overview_id,latest_paid_order_overview_id",
          )
          .eq("user_id", user.id)
          .order("expires_at", { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle<UserVipMembershipRow>(),
        supabase
          .from("user_media_assets")
          .select(
            "id,user_id,kind,bucket_name,storage_path,original_name,mime_type,file_size_bytes,status,reviewer_user_id,created_at,reviewed_at,purge_after",
          )
          .eq("user_id", user.id)
          .neq("status", "denied")
          .order("created_at", { ascending: false })
          .returns<UserMediaAssetRow[]>(),
      ]),
    );

  for (const result of [
    profileResult,
    privacyDataResult,
    privacyRequestsResult,
    vipResult,
    mediaResult,
  ]) {
    if (result.error) throw result.error;
  }

  const profile = await syncProfileFromAuthMetadataIfPossible(
    supabase,
    user,
    profileResult.data,
    role,
  );
  const mediaAssets = (mediaResult.data ?? []).map((asset) => ({
    ...asset,
    previewUrl: null,
  })) satisfies UserMediaAssetWithPreview[];

  return {
    authUser: user,
    role,
    profile,
    privacyData: privacyDataResult.data,
    privacyRequests: privacyRequestsResult.data ?? [],
    mediaAssets,
    vipMembership: vipResult.data,
  };
}
