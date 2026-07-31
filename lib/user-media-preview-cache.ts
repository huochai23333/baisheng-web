import type { SupabaseClient } from "@supabase/supabase-js";

import type { UserMediaAssetRow } from "./user-self-service-types";

const SIGNED_URL_TTL_SECONDS = 60 * 60;
const SIGNED_URL_CACHE_GRACE_MS = 30_000;
type PreviewAsset = Pick<UserMediaAssetRow, "bucket_name" | "storage_path">;

const previewUrlCache = new Map<
  string,
  { expiresAt: number; url: string | null }
>();
const previewUrlRequestCache = new Map<string, Promise<string | null>>();

export function resetUserMediaPreviewCache() {
  previewUrlCache.clear();
  previewUrlRequestCache.clear();
}

export async function createUserMediaAssetPreviewUrl(
  supabase: SupabaseClient,
  asset: PreviewAsset & { previewUrl?: string | null },
) {
  if (asset.previewUrl) {
    cachePreviewUrl(asset, asset.previewUrl);
    return asset.previewUrl;
  }

  const cacheKey = getCacheKey(asset);
  const cachedPreviewUrl = getCachedPreviewUrl(cacheKey);
  if (cachedPreviewUrl !== undefined) return cachedPreviewUrl;

  const pendingRequest = previewUrlRequestCache.get(cacheKey);
  if (pendingRequest) return pendingRequest;

  // 同一资源并发只签名一次，弹窗和缩略图不会各自请求一个短期链接。
  const request = supabase.storage
    .from(asset.bucket_name)
    .createSignedUrl(asset.storage_path, SIGNED_URL_TTL_SECONDS)
    .then(({ data, error }) => {
      const previewUrl = error ? null : (data?.signedUrl ?? null);
      cachePreviewUrl(asset, previewUrl);
      return previewUrl;
    })
    .catch(() => null)
    .finally(() => {
      previewUrlRequestCache.delete(cacheKey);
    });
  previewUrlRequestCache.set(cacheKey, request);
  return request;
}

function getCacheKey(asset: PreviewAsset) {
  return `${asset.bucket_name}:${asset.storage_path}`;
}

function getCachedPreviewUrl(cacheKey: string) {
  const cachedEntry = previewUrlCache.get(cacheKey);
  if (!cachedEntry) return undefined;
  if (Date.now() >= cachedEntry.expiresAt - SIGNED_URL_CACHE_GRACE_MS) {
    previewUrlCache.delete(cacheKey);
    return undefined;
  }
  return cachedEntry.url;
}

function cachePreviewUrl(asset: PreviewAsset, previewUrl: string | null) {
  previewUrlCache.set(getCacheKey(asset), {
    expiresAt: Date.now() + SIGNED_URL_TTL_SECONDS * 1000,
    url: previewUrl,
  });
}
