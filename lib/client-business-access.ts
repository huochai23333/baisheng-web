import type { SupabaseClient } from "@supabase/supabase-js";

import type { WorkspaceBusinessKey } from "./workspace-business-access";

export type ClientBusinessCandidate = {
  email: string | null;
  name: string | null;
  phone: string | null;
  userId: string;
};

export async function getClientBusinessCandidates(
  supabase: SupabaseClient,
  business: WorkspaceBusinessKey,
): Promise<ClientBusinessCandidate[]> {
  const { data, error } = await supabase.rpc(
    "admin_list_client_business_candidates",
    { _business_key: business },
  );

  if (error) {
    throw error;
  }

  if (!Array.isArray(data)) {
    return [];
  }

  // RPC 返回值仍按不可信网络数据处理，只把字段齐全的记录交给界面。
  return data.flatMap((item) => {
    if (!isRecord(item) || typeof item.user_id !== "string") {
      return [];
    }

    return [
      {
        email: normalizeOptionalString(item.email),
        name: normalizeOptionalString(item.name),
        phone: normalizeOptionalString(item.phone),
        userId: item.user_id,
      },
    ];
  });
}

export async function addClientToBusiness(
  supabase: SupabaseClient,
  userId: string,
  business: WorkspaceBusinessKey,
) {
  const { data, error } = await supabase.rpc("admin_add_client_to_business", {
    _business_key: business,
    _target_user_id: userId,
  });

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? (data[0] ?? null) : data;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
