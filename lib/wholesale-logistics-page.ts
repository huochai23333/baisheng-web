import type { SupabaseClient } from "@supabase/supabase-js";

import type { WholesaleLogisticsStatus } from "./wholesale-logistics-statuses";
import type {
  WholesaleCustomer,
  WholesaleLogisticsOrder,
  WholesaleOrderLinkOption,
} from "./wholesale-types";

export type WholesaleLogisticsLinkState = "all" | "linked" | "unlinked";

export type WholesaleLogisticsStatusFilters = {
  customerId: string;
  linkState: WholesaleLogisticsLinkState;
  searchText: string;
  statusKind: "all" | WholesaleLogisticsStatus["status_kind"];
};

export type WholesaleLogisticsFeeFilters = {
  customerId: string;
  linkState: WholesaleLogisticsLinkState;
  searchText: string;
};

export type WholesaleLogisticsStatusCursor = {
  id: string;
  isTerminal: boolean;
  updatedAt: string;
};

export type WholesaleLogisticsFeeCursor = {
  id: string;
  updatedAt: string;
};

/**
 * can_manage_link 由数据库按当前账号实时计算，页面不再自行猜测财务或业务员权限。
 * 这样按钮是否显示会和实际 UPDATE 策略保持一致。
 */
export type WholesaleLogisticsStatusListItem = WholesaleLogisticsStatus & {
  can_manage_link: boolean;
};

export type WholesaleLogisticsFeeListItem = WholesaleLogisticsOrder & {
  can_manage_link: boolean;
};

export type WholesaleLogisticsStatusPage = {
  nextCursor: WholesaleLogisticsStatusCursor | null;
  rows: WholesaleLogisticsStatusListItem[];
  totalCount: number;
};

export type WholesaleLogisticsFeePage = {
  nextCursor: WholesaleLogisticsFeeCursor | null;
  rows: WholesaleLogisticsFeeListItem[];
  totalCount: number;
};

export const WHOLESALE_LOGISTICS_PAGE_SIZE = 50;

export const EMPTY_WHOLESALE_LOGISTICS_STATUS_FILTERS: WholesaleLogisticsStatusFilters = {
  customerId: "",
  linkState: "all",
  searchText: "",
  statusKind: "all",
};

export const EMPTY_WHOLESALE_LOGISTICS_FEE_FILTERS: WholesaleLogisticsFeeFilters = {
  customerId: "",
  linkState: "all",
  searchText: "",
};

/**
 * 物流页首屏只读取客户/订单选择项和两个 50 条列表。
 * 这个函数放在物流查询模块中，避免通用批发数据入口再次承载具体列表查询。
 */
export async function getInitialWholesaleLogisticsPageData(
  supabase: SupabaseClient,
) {
  const [customerResult, orderResult, logisticsStatusPage, logisticsFeePage] =
    await Promise.all([
      supabase
        .from("wholesale_customers")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("wholesale_orders")
        // 只读取关联下拉需要的辨认信息，成本、利润等内部资料不会进入物流页面。
        .select(
          "id,order_number,customer_id,customer_payment_amount,customer_payment_currency,ordered_at",
        )
        .order("ordered_at", { ascending: false })
        .order("id", { ascending: false }),
      getWholesaleLogisticsStatusPage(
        supabase,
        EMPTY_WHOLESALE_LOGISTICS_STATUS_FILTERS,
      ).catch(() => null),
      getWholesaleLogisticsFeePage(
        supabase,
        EMPTY_WHOLESALE_LOGISTICS_FEE_FILTERS,
      ).catch(() => null),
    ]);

  if (customerResult.error) {
    throw new Error("批发客户暂时没有加载成功，请稍后重试。", {
      cause: customerResult.error,
    });
  }
  if (orderResult.error) {
    throw new Error("批发订单暂时没有加载成功，请稍后重试。", {
      cause: orderResult.error,
    });
  }

  return {
    customers: (customerResult.data ?? []) as WholesaleCustomer[],
    logisticsFeePage,
    logisticsStatusPage,
    orderLinkOptions: (orderResult.data ?? []) as WholesaleOrderLinkOption[],
  };
}

/** 数据库统一筛选、计数和排序，浏览器只负责传入条件与继续加载游标。 */
export async function getWholesaleLogisticsStatusPage(
  supabase: SupabaseClient,
  filters: WholesaleLogisticsStatusFilters,
  cursor: WholesaleLogisticsStatusCursor | null = null,
  limit = WHOLESALE_LOGISTICS_PAGE_SIZE,
): Promise<WholesaleLogisticsStatusPage> {
  const { data, error } = await supabase.rpc(
    "get_wholesale_logistics_status_page",
    {
      p_cursor: cursor,
      p_filters: filters,
      p_limit: limit,
    },
  );

  if (error) {
    throw new Error("物流核对记录暂时没有加载成功，请稍后重试。", {
      cause: error,
    });
  }

  const result = readRecord(data);
  if (!result || !Array.isArray(result.rows)) {
    throw new Error("物流核对记录暂时没有加载成功，请稍后重试。");
  }

  return {
    nextCursor: readStatusCursor(result.nextCursor),
    rows: result.rows as WholesaleLogisticsStatusListItem[],
    totalCount: readNumber(result.totalCount),
  };
}

export async function getWholesaleLogisticsFeePage(
  supabase: SupabaseClient,
  filters: WholesaleLogisticsFeeFilters,
  cursor: WholesaleLogisticsFeeCursor | null = null,
  limit = WHOLESALE_LOGISTICS_PAGE_SIZE,
): Promise<WholesaleLogisticsFeePage> {
  const { data, error } = await supabase.rpc("get_wholesale_logistics_fee_page", {
    p_cursor: cursor,
    p_filters: filters,
    p_limit: limit,
  });

  if (error) {
    throw new Error("物流费用记录暂时没有加载成功，请稍后重试。", {
      cause: error,
    });
  }

  const result = readRecord(data);
  if (!result || !Array.isArray(result.rows)) {
    throw new Error("物流费用记录暂时没有加载成功，请稍后重试。");
  }

  return {
    nextCursor: readFeeCursor(result.nextCursor),
    rows: result.rows as WholesaleLogisticsFeeListItem[],
    totalCount: readNumber(result.totalCount),
  };
}

function readStatusCursor(value: unknown): WholesaleLogisticsStatusCursor | null {
  const cursor = readRecord(value);
  return cursor &&
    typeof cursor.id === "string" &&
    typeof cursor.isTerminal === "boolean" &&
    typeof cursor.updatedAt === "string"
    ? {
        id: cursor.id,
        isTerminal: cursor.isTerminal,
        updatedAt: cursor.updatedAt,
      }
    : null;
}

function readFeeCursor(value: unknown): WholesaleLogisticsFeeCursor | null {
  const cursor = readRecord(value);
  return cursor &&
    typeof cursor.id === "string" &&
    typeof cursor.updatedAt === "string"
    ? { id: cursor.id, updatedAt: cursor.updatedAt }
    : null;
}

function readNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}
