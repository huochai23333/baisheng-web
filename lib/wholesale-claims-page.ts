import type { SupabaseClient } from "@supabase/supabase-js";

import type { OrderDateRange, OrderSearchMode } from "./order-date-range";
import type {
  Wholesale1688Order,
  WholesaleCustomer,
  WholesaleOrder,
} from "./wholesale-types";

export type WholesaleClaimBoardKey = "assisted" | "claimed" | "hall";

export type WholesaleClaimFilters = OrderDateRange & {
  exactOrderNumber: string;
  recipientName: string;
  searchMode: OrderSearchMode;
  searchText: string;
};

export type WholesaleClaimCursor = {
  claimedAt?: string;
  id: string;
  sortAt?: string;
};

export type WholesaleClaimRow = {
  assistedCustomerName: string;
  board: "assisted" | "hall";
  purchaseOrder: Wholesale1688Order;
  recipientName: string;
};

export type WholesaleClaimGroupRow = {
  claimGroup: {
    claimed_at: string;
    claimed_by_user_id: string | null;
    customer_id: string;
    id: string;
    updated_at: string;
    updated_by_user_id: string | null;
  };
  claimerName: string;
  customerName: string;
  purchaseOrders: Wholesale1688Order[];
  updaterName: string;
  wholesaleOrders: WholesaleOrder[];
};

export type WholesaleClaimBoardCounts = {
  assisted: number;
  claimedGroups: number;
  claimedPurchases: number;
  hall: number;
};

export type WholesaleClaimPage = {
  board: WholesaleClaimBoardKey;
  boardCounts: WholesaleClaimBoardCounts;
  groupRows: WholesaleClaimGroupRow[];
  nextCursor: WholesaleClaimCursor | null;
  purchaseCount: number;
  rows: WholesaleClaimRow[];
  totalCount: number;
};

export type WholesaleClaimOrderCandidatePage = {
  nextCursor: { id: string; orderedAt: string } | null;
  orders: WholesaleOrder[];
  totalCount: number;
};

export const WHOLESALE_CLAIM_PAGE_SIZE = 20;

export async function getWholesaleClaimPage(
  supabase: SupabaseClient,
  board: WholesaleClaimBoardKey,
  filters: WholesaleClaimFilters,
  cursor: WholesaleClaimCursor | null = null,
  limit = WHOLESALE_CLAIM_PAGE_SIZE,
): Promise<WholesaleClaimPage> {
  const { data, error } = await supabase.rpc("get_wholesale_1688_claim_page", {
    p_board: board,
    p_cursor: cursor,
    p_filters: {
      exactOrderNumber: filters.exactOrderNumber,
      fromDate: filters.fromDate,
      mode: filters.searchMode,
      recipientName: filters.recipientName,
      searchText: filters.searchText,
      toDate: filters.toDate,
    },
    p_limit: limit,
  });

  if (error) {
    throw new Error("1688 订单暂时没有加载成功，请稍后重试。", {
      cause: error,
    });
  }

  return readClaimPage(data, board);
}

export async function getWholesaleClaimOrderCandidatePage(
  supabase: SupabaseClient,
  options: {
    cursor?: { id: string; orderedAt: string } | null;
    customerId: WholesaleCustomer["id"];
    dateRange: OrderDateRange;
    exactOrderNumber?: string;
    includeOrderIds?: string[];
    limit?: number;
    searchMode?: OrderSearchMode;
    searchText?: string;
  },
): Promise<WholesaleClaimOrderCandidatePage> {
  const { data, error } = await supabase.rpc(
    "get_wholesale_claim_order_candidate_page",
    {
      p_cursor: options.cursor ?? null,
      p_customer_id: options.customerId,
      p_filters: {
        exactOrderNumber: options.exactOrderNumber ?? "",
        fromDate: options.dateRange.fromDate,
        mode: options.searchMode ?? "date_range",
        searchText: options.searchText ?? "",
        toDate: options.dateRange.toDate,
      },
      p_include_order_ids: options.includeOrderIds ?? [],
      p_limit: options.limit ?? WHOLESALE_CLAIM_PAGE_SIZE,
    },
  );

  if (error) {
    throw new Error("批发订单选项暂时没有加载成功，请稍后重试。", {
      cause: error,
    });
  }

  const record = readRecord(data);
  if (!record || !Array.isArray(record.orders)) {
    throw new Error("批发订单选项暂时没有加载成功，请稍后重试。");
  }

  return {
    nextCursor: readOrderCursor(record.nextCursor),
    orders: record.orders as WholesaleOrder[],
    totalCount: readNumber(record.totalCount),
  };
}

function readClaimPage(
  value: unknown,
  fallbackBoard: WholesaleClaimBoardKey,
): WholesaleClaimPage {
  const record = readRecord(value);
  if (!record || !Array.isArray(record.rows) || !Array.isArray(record.groupRows)) {
    throw new Error("1688 订单暂时没有加载成功，请稍后重试。");
  }

  const counts = readRecord(record.boardCounts);
  const board =
    record.board === "assisted" ||
    record.board === "hall" ||
    record.board === "claimed"
      ? record.board
      : fallbackBoard;

  return {
    board,
    boardCounts: {
      assisted: readNumber(counts?.assisted),
      claimedGroups: readNumber(counts?.claimedGroups),
      claimedPurchases: readNumber(counts?.claimedPurchases),
      hall: readNumber(counts?.hall),
    },
    groupRows: record.groupRows as WholesaleClaimGroupRow[],
    nextCursor: readClaimCursor(record.nextCursor),
    purchaseCount: readNumber(record.purchaseCount),
    rows: record.rows as WholesaleClaimRow[],
    totalCount: readNumber(record.totalCount),
  };
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readNumber(value: unknown) {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function readClaimCursor(value: unknown): WholesaleClaimCursor | null {
  const cursor = readRecord(value);
  if (!cursor || typeof cursor.id !== "string") return null;

  return {
    claimedAt:
      typeof cursor.claimedAt === "string" ? cursor.claimedAt : undefined,
    id: cursor.id,
    sortAt: typeof cursor.sortAt === "string" ? cursor.sortAt : undefined,
  };
}

function readOrderCursor(value: unknown) {
  const cursor = readRecord(value);
  return cursor &&
    typeof cursor.id === "string" &&
    typeof cursor.orderedAt === "string"
    ? { id: cursor.id, orderedAt: cursor.orderedAt }
    : null;
}
