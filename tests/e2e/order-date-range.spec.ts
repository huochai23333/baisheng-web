import { expect, test } from "@playwright/test";

import {
  getDefaultOrderDateRange,
  getOrderDatePresetRange,
  getShanghaiOrderDateBounds,
  isOrderDateValue,
  normalizeOrderDateRange,
} from "../../lib/order-date-range";
import { normalizeAdminOrdersFilters } from "../../lib/admin-orders-page-data";

test.describe("shared order date ranges", () => {
  const shanghaiNewYear = new Date("2026-01-01T00:30:00+08:00");

  test("uses today and the previous 29 Shanghai calendar days", () => {
    expect(getDefaultOrderDateRange(shanghaiNewYear)).toEqual({
      fromDate: "2025-12-03",
      toDate: "2026-01-01",
    });
  });

  test("normalizes incomplete, impossible, and inverted ranges", () => {
    const expected = getDefaultOrderDateRange(shanghaiNewYear);

    expect(
      normalizeOrderDateRange(
        { fromDate: "2026-02-30", toDate: "2026-03-01" },
        shanghaiNewYear,
      ),
    ).toEqual(expected);
    expect(
      normalizeOrderDateRange(
        { fromDate: "2026-01-02", toDate: "2026-01-01" },
        shanghaiNewYear,
      ),
    ).toEqual(expected);
    expect(
      normalizeOrderDateRange({ fromDate: "2026-01-01" }, shanghaiNewYear),
    ).toEqual(expected);
  });

  test("builds half-open Shanghai timestamp bounds", () => {
    expect(
      getShanghaiOrderDateBounds({
        fromDate: "2025-12-31",
        toDate: "2026-01-01",
      }),
    ).toEqual({
      fromInclusive: "2025-12-31T00:00:00.000+08:00",
      toExclusive: "2026-01-02T00:00:00.000+08:00",
    });
  });

  test("supports all shared preset ranges", () => {
    expect(getOrderDatePresetRange("current_month", shanghaiNewYear)).toEqual({
      fromDate: "2026-01-01",
      toDate: "2026-01-01",
    });
    expect(getOrderDatePresetRange("previous_month", shanghaiNewYear)).toEqual({
      fromDate: "2025-12-01",
      toDate: "2025-12-31",
    });
    expect(getOrderDatePresetRange("last_3_months", shanghaiNewYear)).toEqual({
      fromDate: "2025-10-04",
      toDate: "2026-01-01",
    });
  });

  test("rejects invalid calendar values", () => {
    expect(isOrderDateValue("2026-02-29")).toBe(false);
    expect(isOrderDateValue("2028-02-29")).toBe(true);
    expect(isOrderDateValue("2026-1-01")).toBe(false);
  });
});

test.describe("admin order filter normalization", () => {
  test("restores mandatory dates and rejects an empty exact search", () => {
    const normalized = normalizeAdminOrdersFilters({
      createdFromDate: "",
      createdToDate: "not-a-date",
      orderNumber: "",
      searchMode: "exact_all_time",
    });

    expect(isOrderDateValue(normalized.createdFromDate)).toBe(true);
    expect(isOrderDateValue(normalized.createdToDate)).toBe(true);
    expect(normalized.searchMode).toBe("date_range");
  });

  test("keeps an explicit exact order-number search", () => {
    const normalized = normalizeAdminOrdersFilters({
      orderNumber: " TOUR-2025-0001 ",
      searchMode: "exact_all_time",
    });

    expect(normalized.orderNumber).toBe("TOUR-2025-0001");
    expect(normalized.searchMode).toBe("exact_all_time");
  });
});
