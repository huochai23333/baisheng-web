export const ORDER_DATE_TIME_ZONE = "Asia/Shanghai";

export type OrderDateRange = {
  fromDate: string;
  toDate: string;
};

export type OrderSearchMode = "date_range" | "exact_all_time";

export type OrderDatePreset =
  | "last_30_days"
  | "current_month"
  | "previous_month"
  | "last_3_months"
  | "custom";

const DATE_VALUE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isOrderDateValue(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const matched = DATE_VALUE_PATTERN.exec(value);

  if (!matched) {
    return false;
  }

  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

export function getDefaultOrderDateRange(now = new Date()): OrderDateRange {
  const today = getShanghaiDateValue(now);

  return {
    fromDate: addCalendarDays(today, -29),
    toDate: today,
  };
}

export function normalizeOrderDateRange(
  range?: Partial<OrderDateRange> | null,
  now = new Date(),
): OrderDateRange {
  if (
    !isOrderDateValue(range?.fromDate) ||
    !isOrderDateValue(range?.toDate) ||
    range.fromDate > range.toDate
  ) {
    return getDefaultOrderDateRange(now);
  }

  return {
    fromDate: range.fromDate,
    toDate: range.toDate,
  };
}

export function getOrderDatePresetRange(
  preset: Exclude<OrderDatePreset, "custom">,
  now = new Date(),
): OrderDateRange {
  const today = getShanghaiDateValue(now);

  if (preset === "last_30_days") {
    return getDefaultOrderDateRange(now);
  }

  if (preset === "last_3_months") {
    return {
      fromDate: addCalendarDays(today, -89),
      toDate: today,
    };
  }

  const { month, year } = parseDateValue(today);

  if (preset === "current_month") {
    return {
      fromDate: formatDateValue(year, month, 1),
      toDate: today,
    };
  }

  const previousMonthDate = new Date(Date.UTC(year, month - 2, 1));
  const previousYear = previousMonthDate.getUTCFullYear();
  const previousMonth = previousMonthDate.getUTCMonth() + 1;
  const previousMonthLastDay = new Date(
    Date.UTC(previousYear, previousMonth, 0),
  ).getUTCDate();

  return {
    fromDate: formatDateValue(previousYear, previousMonth, 1),
    toDate: formatDateValue(previousYear, previousMonth, previousMonthLastDay),
  };
}

export function getShanghaiOrderDateBounds(range: OrderDateRange): {
  fromInclusive: string;
  toExclusive: string;
} {
  const normalizedRange = normalizeOrderDateRange(range);

  return {
    fromInclusive: `${normalizedRange.fromDate}T00:00:00.000+08:00`,
    toExclusive: `${addCalendarDays(normalizedRange.toDate, 1)}T00:00:00.000+08:00`,
  };
}

function getShanghaiDateValue(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: ORDER_DATE_TIME_ZONE,
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function addCalendarDays(value: string, amount: number) {
  const { day, month, year } = parseDateValue(value);
  const date = new Date(Date.UTC(year, month - 1, day + amount));

  return formatDateValue(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
  );
}

function parseDateValue(value: string) {
  return {
    day: Number(value.slice(8, 10)),
    month: Number(value.slice(5, 7)),
    year: Number(value.slice(0, 4)),
  };
}

function formatDateValue(year: number, month: number, day: number) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
