import type { SupabaseClient } from "@supabase/supabase-js";

import { getCurrentSessionContext } from "./current-session-context";
import type {
  TourismVipRpcRow,
  WholesaleVipRpcRow,
} from "./business-vip-management.normalizers";
import {
  normalizeTourismVipRow,
  normalizeWholesaleVipRow,
} from "./business-vip-management.normalizers";
import type {
  BusinessVipPageData,
  BusinessVipPageMode,
} from "./business-vip-management.types";
import { withRequestTimeout } from "./request-timeout";
import type { WorkspaceBusinessKey } from "./workspace-business-modules";

type RpcResult<T> = {
  data: T[] | null;
  error: { message?: string } | null;
};

// UI mode controls which actions are shown; row visibility is still enforced by RPCs.
export async function getBusinessVipPageData(
  supabase: SupabaseClient,
  business: WorkspaceBusinessKey,
  mode: BusinessVipPageMode,
): Promise<BusinessVipPageData> {
  const sessionContext = await getCurrentSessionContext(supabase);
  const currentRole = sessionContext.role;
  const currentUserId = sessionContext.user?.id ?? null;
  const canAdmin = currentRole === "administrator" && mode === "admin";

  return {
    business,
    canAdmin,
    canRequest: mode === "salesman",
    currentRole,
    currentUserId,
    mode,
    rows:
      business === "tourism"
        ? await getTourismVipRows(supabase)
        : await getWholesaleVipRows(supabase),
  };
}

async function getTourismVipRows(supabase: SupabaseClient) {
  const result = (await withRequestTimeout(
    supabase.rpc("list_tourism_vip_management"),
  )) as unknown as RpcResult<TourismVipRpcRow>;

  if (result.error) {
    throw result.error;
  }

  return (result.data ?? []).flatMap((row) => normalizeTourismVipRow(row));
}

async function getWholesaleVipRows(supabase: SupabaseClient) {
  const result = (await withRequestTimeout(
    supabase.rpc("list_wholesale_vip_management"),
  )) as unknown as RpcResult<WholesaleVipRpcRow>;

  if (result.error) {
    throw result.error;
  }

  return (result.data ?? []).flatMap((row) => normalizeWholesaleVipRow(row));
}
