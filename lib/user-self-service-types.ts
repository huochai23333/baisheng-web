import type { User } from "@supabase/supabase-js";

import type { UserStatus } from "./auth-metadata";
import type { AppRole } from "./auth-routing";

export type PrivacyRequestStatus = "pending" | "pass" | "denied";
export type MediaKind = "image" | "video";

export type UserProfileRow = {
  user_id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  status: UserStatus;
  city: string | null;
  referral_code: string | null;
  created_at: string;
};

export type UserPrivacyDataRow = {
  user_id: string;
  passport: string | null;
  id_card: string | null;
};

export type UserPrivacyRequestRow = {
  id: string;
  user_id: string;
  passport_requests: string | null;
  id_card_requests: string | null;
  status: PrivacyRequestStatus;
  reviewer_user_id: string | null;
  created_at: string;
  review_at: string | null;
  type: boolean;
};

export type UserVipMembershipRow = {
  user_id: string;
  status: "active" | "expired" | "cancelled";
  started_at: string | null;
  expires_at: string | null;
  first_paid_order_overview_id: string | null;
  latest_paid_order_overview_id: string | null;
};

export type UserMediaAssetRow = {
  id: string;
  user_id: string;
  kind: MediaKind;
  bucket_name: string;
  storage_path: string;
  original_name: string;
  mime_type: string;
  file_size_bytes: number;
  status: PrivacyRequestStatus;
  reviewer_user_id: string | null;
  created_at: string;
  reviewed_at: string | null;
  purge_after: string | null;
};

export type UserMediaAssetWithPreview = UserMediaAssetRow & {
  previewUrl: string | null;
};

export type CurrentUserBundle = {
  authUser: User;
  role: AppRole | null;
  profile: UserProfileRow | null;
  privacyData: UserPrivacyDataRow | null;
  privacyRequests: UserPrivacyRequestRow[];
  mediaAssets: UserMediaAssetWithPreview[];
  vipMembership: UserVipMembershipRow | null;
};
