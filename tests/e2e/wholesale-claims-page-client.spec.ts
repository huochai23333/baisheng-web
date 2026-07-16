import { expect, test } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getDefaultOrderDateRange } from "../../lib/order-date-range";
import {
  getWholesaleClaimOrderCandidatePage,
  getWholesaleClaimPage,
} from "../../lib/wholesale-claims-page";

test("1688 claim page sends a required date range and parses cursor pages", async () => {
  let rpcArguments: Record<string, unknown> | null = null;
  const supabase = {
    rpc: async (_name: string, argumentsValue: Record<string, unknown>) => {
      rpcArguments = argumentsValue;
      return {
        data: {
          board: "assisted",
          boardCounts: {
            assisted: 1,
            claimedGroups: 2,
            claimedPurchases: 3,
            hall: 4,
          },
          groupRows: [],
          nextCursor: { id: "00000000-0000-0000-0000-000000000001", sortAt: "2026-07-01T00:00:00Z" },
          purchaseCount: 0,
          rows: [],
          totalCount: 1,
        },
        error: null,
      };
    },
  } as unknown as SupabaseClient;
  const range = getDefaultOrderDateRange();

  const page = await getWholesaleClaimPage(supabase, "assisted", {
    ...range,
    exactOrderNumber: "",
    recipientName: "",
    searchMode: "date_range",
    searchText: "",
  });

  expect(page.boardCounts.claimedPurchases).toBe(3);
  expect(page.nextCursor?.sortAt).toBe("2026-07-01T00:00:00Z");
  expect(
    (rpcArguments as unknown as { p_filters: Record<string, unknown> })
      .p_filters,
  ).toMatchObject({
    fromDate: range.fromDate,
    mode: "date_range",
    toDate: range.toDate,
  });
});

test("claim order candidates carry exact history mode and selected ids", async () => {
  let rpcArguments: Record<string, unknown> | null = null;
  const supabase = {
    rpc: async (_name: string, argumentsValue: Record<string, unknown>) => {
      rpcArguments = argumentsValue;
      return {
        data: { nextCursor: null, orders: [], totalCount: 0 },
        error: null,
      };
    },
  } as unknown as SupabaseClient;
  const range = getDefaultOrderDateRange();
  const selectedId = "00000000-0000-0000-0000-000000000002";

  await getWholesaleClaimOrderCandidatePage(supabase, {
    customerId: "00000000-0000-0000-0000-000000000003",
    dateRange: range,
    exactOrderNumber: " WH-HISTORY-001 ",
    includeOrderIds: [selectedId],
    searchMode: "exact_all_time",
  });

  const argumentsValue = rpcArguments as unknown as {
    p_filters: Record<string, unknown>;
    p_include_order_ids: string[];
  };
  expect(argumentsValue.p_filters).toMatchObject({
    exactOrderNumber: " WH-HISTORY-001 ",
    mode: "exact_all_time",
  });
  expect(argumentsValue.p_include_order_ids).toEqual([selectedId]);
});
