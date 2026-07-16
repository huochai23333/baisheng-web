import { expect, test } from "@playwright/test";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getDefaultOrderDateRange } from "../../lib/order-date-range";
import {
  getDefaultWholesaleLogisticsFilters,
  getWholesaleLogisticsPage,
} from "../../lib/wholesale-logistics-page";
import { getWholesaleOrderPage } from "../../lib/wholesale-order-page";

test("wholesale order RPC receives normalized dates and explicit search mode", async () => {
  let rpcArguments: Record<string, unknown> | null = null;
  const supabase = {
    rpc: async (_name: string, argumentsValue: Record<string, unknown>) => {
      rpcArguments = argumentsValue;
      return {
        data: {
          canViewInternalFields: false,
          nextCursor: null,
          orders: [],
          summary: {},
          totalCount: 0,
        },
        error: null,
      };
    },
  } as unknown as SupabaseClient;

  await getWholesaleOrderPage(supabase, {
    customerId: "",
    orderedFromDate: "",
    orderedToDate: "invalid",
    salesUserId: "",
    searchMode: "exact_all_time",
    searchText: " WH-1001 ",
    status: "all",
  });

  expect(rpcArguments).not.toBeNull();
  expect((rpcArguments as unknown as { p_filters: unknown }).p_filters).toMatchObject({
    orderedFromDate: getDefaultOrderDateRange().fromDate,
    orderedToDate: getDefaultOrderDateRange().toDate,
    searchMode: "exact_all_time",
    searchText: "WH-1001",
  });
});

test("wholesale logistics defaults and RPC use the mandatory rolling range", async () => {
  const defaultRange = getDefaultOrderDateRange();
  const filters = getDefaultWholesaleLogisticsFilters(
    "salesman",
    "sales-user-id",
  );
  expect(filters).toMatchObject({
    fromDate: defaultRange.fromDate,
    salesUserId: "sales-user-id",
    searchMode: "date_range",
    toDate: defaultRange.toDate,
  });

  let rpcArguments: Record<string, unknown> | null = null;
  const supabase = {
    rpc: async (_name: string, argumentsValue: Record<string, unknown>) => {
      rpcArguments = argumentsValue;
      return {
        data: {
          lastUpdatedAt: null,
          missingCostCount: 0,
          nextCursor: null,
          recordedCostCount: 0,
          rows: [],
          totalCount: 0,
          totalsByCurrency: {},
        },
        error: null,
      };
    },
  } as unknown as SupabaseClient;

  await getWholesaleLogisticsPage(supabase, {
    ...filters,
    fromDate: "",
    searchMode: "exact_all_time",
    searchText: " PKG-1001 ",
  });

  expect(rpcArguments).not.toBeNull();
  expect((rpcArguments as unknown as { p_filters: unknown }).p_filters).toMatchObject({
    fromDate: defaultRange.fromDate,
    searchMode: "exact_all_time",
    searchText: "PKG-1001",
    toDate: defaultRange.toDate,
  });
});
