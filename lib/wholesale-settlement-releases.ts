import type { SupabaseClient } from "@supabase/supabase-js";

import type { AppRole } from "./auth-routing";
import { getCurrentSessionContext } from "./current-session-context";
import type {
  WholesaleCustomer,
  WholesaleOrder,
  WholesaleOrderSettlement,
  WholesaleProfile,
} from "./wholesale";

export type WholesaleSettlementReleaseStatus =
  | "cancelled"
  | "claimed"
  | "pending";

export type WholesaleSettlementRelease = {
  id: string;
  customer_id: string | null;
  customer_name: string;
  release_amount: number;
  release_currency: string;
  received_on: string;
  status: WholesaleSettlementReleaseStatus;
  note: string | null;
  published_by_user_id: string | null;
  publication_request_id: string | null;
  claimed_by_user_id: string | null;
  matched_order_id: string | null;
  settlement_id: string | null;
  claimed_at: string | null;
  cancelled_by_user_id: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WholesaleSettlementReleasePageData = {
  currentRole: AppRole | null;
  currentUserId: string | null;
  customers: WholesaleCustomer[];
  orders: WholesaleOrder[];
  orderSettlements: WholesaleOrderSettlement[];
  profiles: WholesaleProfile[];
  releases: WholesaleSettlementRelease[];
};

type QueryResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

export async function getWholesaleSettlementReleasePageData(
  supabase: SupabaseClient,
): Promise<WholesaleSettlementReleasePageData> {
  const sessionContext = await getCurrentSessionContext(supabase);
  const currentRole = sessionContext.role;
  const currentUserId = sessionContext.user?.id ?? null;

  // 页面一次需要发布记录、客户、订单、结汇记录和人员名称。
  // 这里并行读取可以减少首屏等待时间，真正的数据范围仍交给数据库 RLS 控制。
  const [
    releasesResult,
    customersResult,
    ordersResult,
    orderSettlementsResult,
    profilesResult,
    roleRowsResult,
    rolesResult,
  ] = await Promise.all([
    supabase
      .from("wholesale_settlement_releases")
      .select("*")
      .order("received_on", { ascending: false })
      .order("created_at", { ascending: false }) as unknown as Promise<
      QueryResult<WholesaleSettlementRelease>
    >,
    supabase
      .from("wholesale_customers")
      .select("*")
      .order("created_at", { ascending: false }) as unknown as Promise<
      QueryResult<WholesaleCustomer>
    >,
    supabase
      .from("wholesale_orders")
      .select("*")
      .order("order_month", { ascending: false })
      .order("ordered_at", { ascending: false }) as unknown as Promise<
      QueryResult<WholesaleOrder>
    >,
    supabase
      .from("wholesale_order_settlements")
      .select("*")
      .order("settled_on", { ascending: false })
      .order("created_at", { ascending: false }) as unknown as Promise<
      QueryResult<WholesaleOrderSettlement>
    >,
    supabase
      .from("user_profiles")
      .select("user_id,name,email,phone,status,city")
      .order("created_at", { ascending: false }) as unknown as Promise<
      QueryResult<Omit<WholesaleProfile, "role">>
    >,
    supabase.from("user_roles_data").select("user_id,role_id") as unknown as Promise<
      QueryResult<{ user_id: string; role_id: string }>
    >,
    supabase.from("user_roles").select("id,role") as unknown as Promise<
      QueryResult<{ id: string; role: AppRole }>
    >,
  ]);

  const rolesById = new Map(
    readRows(rolesResult).map((roleRow) => [roleRow.id, roleRow.role]),
  );
  const roleByUserId = new Map(
    readRows(roleRowsResult).map((roleRow) => [
      roleRow.user_id,
      rolesById.get(roleRow.role_id) ?? null,
    ]),
  );
  const profiles = readRows(profilesResult).map((profile) => ({
    ...profile,
    role: roleByUserId.get(profile.user_id) ?? null,
  }));

  return {
    currentRole,
    currentUserId,
    customers: readRows(customersResult),
    orders: readRows(ordersResult),
    orderSettlements: readRows(orderSettlementsResult),
    profiles,
    releases: readRows(releasesResult),
  };
}

function readRows<T>(result: QueryResult<T>) {
  if (result.error) {
    // 查询失败通常代表迁移、RLS 或网络有问题，直接抛出比显示空列表更容易发现真实原因。
    throw new Error(result.error.message);
  }

  return result.data ?? [];
}
