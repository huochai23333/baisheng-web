import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  MediaKind,
  UserMediaAssetRow,
} from "./user-self-service-types";
import { withRequestTimeout } from "./request-timeout";
import { normalizeOptionalString } from "./value-normalizers";

const USER_MEDIA_MUTATION_TIMEOUT_MS = 60_000;
const USER_MEDIA_MUTATION_TIMEOUT_MESSAGE = "媒体操作超时，请稍后重试。";

export async function uploadUserMedia(
  supabase: SupabaseClient,
  options: { userId: string; kind: MediaKind; files: File[] },
) {
  if (options.files.length === 0) return;

  const formData = new FormData();
  formData.set("action", "upload");
  formData.set("kind", options.kind);
  for (const file of options.files) {
    formData.append("files", file, file.name);
  }
  await invokeUserMediaMutation(supabase, formData);
}

export async function deleteUserMediaAssets(
  supabase: SupabaseClient,
  assets: Array<Pick<UserMediaAssetRow, "bucket_name" | "storage_path" | "id">>,
) {
  if (assets.length === 0) return;
  await invokeUserMediaMutation(supabase, {
    action: "delete",
    assetIds: assets.map((asset) => asset.id),
  });
}

async function invokeUserMediaMutation(
  supabase: SupabaseClient,
  body: FormData | { action: "delete"; assetIds: string[] },
) {
  const { error } = await withRequestTimeout(
    supabase.functions.invoke("user-media-mutate", { body }),
    {
      timeoutMs: USER_MEDIA_MUTATION_TIMEOUT_MS,
      message: USER_MEDIA_MUTATION_TIMEOUT_MESSAGE,
    },
  );
  if (error) throw await toUserMediaMutationError(error);
}

async function toUserMediaMutationError(error: unknown) {
  const response = getFunctionErrorResponse(error);
  if (response) {
    try {
      const payload = (await response.clone().json()) as {
        error?: string;
        message?: string;
      };
      const message =
        normalizeOptionalString(payload.message) ??
        normalizeOptionalString(payload.error);
      if (message) return new Error(message);
    } catch {
      // 响应不是 JSON 时保留 Supabase 客户端原始错误，便于调用方统一记录。
    }
  }
  return error instanceof Error
    ? error
    : new Error("当前服务暂时不可用，请稍后再试。");
}

function getFunctionErrorResponse(error: unknown) {
  if (typeof error !== "object" || error === null || !("context" in error)) {
    return null;
  }
  const { context } = error as { context?: unknown };
  return context instanceof Response ? context : null;
}
