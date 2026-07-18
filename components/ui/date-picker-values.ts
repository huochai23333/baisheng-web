export type DatePickerMode = "date" | "month" | "datetime-local";

export type DatePickerLocale = "en" | "zh";

type DateParts = {
  day: number;
  month: number;
  year: number;
};

/**
 * 日期控件只需要区分当前产品支持的中英文。
 * 其他地区代码退回英文，避免业务组件各自判断 `zh-CN`、`en-US` 等变体。
 */
export function normalizeDatePickerLocale(locale: string): DatePickerLocale {
  return locale.toLowerCase().startsWith("zh") ? "zh" : "en";
}

/**
 * 将用户输入转换成业务层一直使用的稳定字符串。
 * 这里不创建带时区的 Date，避免在 UTC 与上海时区之间切换时日期前后偏移一天。
 */
export function parseDatePickerInput(
  text: string,
  mode: DatePickerMode,
  locale: DatePickerLocale,
) {
  const value = text.trim();
  if (!value) return "";

  if (mode === "month") {
    return parseMonthText(value, locale);
  }

  if (mode === "datetime-local") {
    const match = value.match(/^(.+?)(?:T|\s+)(\d{1,2}):(\d{2})$/);
    if (!match) return null;

    const date = parseDateText(match[1], locale);
    const hour = Number(match[2]);
    const minute = Number(match[3]);
    if (!date || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return null;
    }

    return `${date}T${padNumber(hour)}:${padNumber(minute)}`;
  }

  return parseDateText(value, locale);
}

export function isCanonicalDatePickerValue(
  value: string,
  mode: DatePickerMode,
) {
  if (!value) return true;

  if (mode === "month") {
    const match = value.match(/^(\d{4})-(\d{2})$/);
    return Boolean(
      match && isValidMonth(Number(match[1]), Number(match[2])),
    );
  }

  if (mode === "datetime-local") {
    const match = value.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
    );
    return Boolean(
      match &&
        isValidDate({
          day: Number(match[3]),
          month: Number(match[2]),
          year: Number(match[1]),
        }) &&
        Number(match[4]) <= 23 &&
        Number(match[5]) <= 59,
    );
  }

  return Boolean(readCanonicalDate(value));
}

export function formatDatePickerValue(
  value: string,
  mode: DatePickerMode,
  locale: DatePickerLocale,
) {
  if (!value || !isCanonicalDatePickerValue(value, mode)) return value;

  if (mode === "month") {
    const [year, month] = value.split("-");
    return locale === "zh" ? `${year}年${month}月` : `${month}/${year}`;
  }

  const dateValue = value.slice(0, 10);
  const date = readCanonicalDate(dateValue);
  if (!date) return value;

  const formattedDate =
    locale === "zh"
      ? `${date.year}/${padNumber(date.month)}/${padNumber(date.day)}`
      : `${padNumber(date.month)}/${padNumber(date.day)}/${date.year}`;

  return mode === "datetime-local"
    ? `${formattedDate} ${value.slice(11, 16)}`
    : formattedDate;
}

export function getDatePickerPlaceholder(
  mode: DatePickerMode,
  locale: DatePickerLocale,
) {
  if (mode === "month") return locale === "zh" ? "YYYY/MM" : "MM/YYYY";
  if (mode === "datetime-local") {
    return locale === "zh" ? "YYYY/MM/DD HH:mm" : "MM/DD/YYYY HH:mm";
  }
  return locale === "zh" ? "YYYY/MM/DD" : "MM/DD/YYYY";
}

export function isDatePickerValueWithinBounds(
  value: string,
  min: string | undefined,
  max: string | undefined,
) {
  return (!min || value >= min) && (!max || value <= max);
}

/**
 * DayPicker 内部需要 Date 对象，但业务值仍然是无时区字符串。
 * 使用本地中午可以避开夏令时午夜切换，返回业务值时只读取年月日部分。
 */
export function datePickerValueToDate(value: string) {
  const date = readCanonicalDate(value.slice(0, 10));
  if (!date) return undefined;

  const result = new Date(0);
  result.setHours(12, 0, 0, 0);
  result.setFullYear(date.year, date.month - 1, date.day);
  return result;
}

export function dateToDatePickerValue(date: Date) {
  return `${String(date.getFullYear()).padStart(4, "0")}-${padNumber(
    date.getMonth() + 1,
  )}-${padNumber(date.getDate())}`;
}

export function mergeDateAndTime(date: string, time: string) {
  return `${date}T${time}`;
}

export function splitDateTimeValue(value: string) {
  if (!isCanonicalDatePickerValue(value, "datetime-local")) return null;
  return { date: value.slice(0, 10), time: value.slice(11, 16) };
}

/** 获取上海当前日期和分钟，供“今天”“现在”快捷操作统一复用。 */
export function getShanghaiDatePickerValue(mode: DatePickerMode) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Shanghai",
    year: "numeric",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const date = `${values.year}-${values.month}-${values.day}`;

  if (mode === "month") return date.slice(0, 7);
  if (mode === "datetime-local") return `${date}T${values.hour}:${values.minute}`;
  return date;
}

export function getDatePickerYearRange(
  displayedYear: number,
  min: string | undefined,
  max: string | undefined,
) {
  const currentYear = Number(getShanghaiDatePickerValue("date").slice(0, 4));
  const minYear = min ? Number(min.slice(0, 4)) : undefined;
  const maxYear = max ? Number(max.slice(0, 4)) : undefined;

  return {
    end: maxYear ?? Math.max(2100, currentYear + 50, displayedYear + 50),
    start: minYear ?? Math.min(1900, currentYear - 100, displayedYear - 100),
  };
}

export function getInitialDatePickerMonth(value: string, mode: DatePickerMode) {
  const seed = value || getShanghaiDatePickerValue(mode);
  const dateValue = mode === "month" ? `${seed.slice(0, 7)}-01` : seed.slice(0, 10);
  return datePickerValueToDate(dateValue) ?? new Date();
}

export function getInitialDateTimeDraft(value: string) {
  return isCanonicalDatePickerValue(value, "datetime-local")
    ? value
    : getShanghaiDatePickerValue("datetime-local");
}

function parseDateText(value: string, locale: DatePickerLocale) {
  const yearFirst = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (yearFirst) {
    return formatValidDate({
      day: Number(yearFirst[3]),
      month: Number(yearFirst[2]),
      year: Number(yearFirst[1]),
    });
  }

  const monthFirst =
    locale === "en" ? value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/) : null;
  if (!monthFirst) return null;

  return formatValidDate({
    day: Number(monthFirst[2]),
    month: Number(monthFirst[1]),
    year: Number(monthFirst[3]),
  });
}

function parseMonthText(value: string, locale: DatePickerLocale) {
  // 中文界面提交后会显示“2026年07月”；再次失焦时也必须能解析自己生成的文本，
  // 否则用户只是在表单里切换焦点就会把已经有效的月份标成错误。
  const chineseDisplay =
    locale === "zh" ? value.match(/^(\d{4})年(\d{1,2})月$/) : null;
  if (
    chineseDisplay &&
    isValidMonth(Number(chineseDisplay[1]), Number(chineseDisplay[2]))
  ) {
    return `${chineseDisplay[1]}-${padNumber(Number(chineseDisplay[2]))}`;
  }

  const yearFirst = value.match(/^(\d{4})[-/](\d{1,2})$/);
  if (yearFirst && isValidMonth(Number(yearFirst[1]), Number(yearFirst[2]))) {
    return `${yearFirst[1]}-${padNumber(Number(yearFirst[2]))}`;
  }

  const monthFirst =
    locale === "en" ? value.match(/^(\d{1,2})\/(\d{4})$/) : null;
  if (!monthFirst || !isValidMonth(Number(monthFirst[2]), Number(monthFirst[1]))) {
    return null;
  }

  return `${monthFirst[2]}-${padNumber(Number(monthFirst[1]))}`;
}

function readCanonicalDate(value: string): DateParts | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const parts = {
    day: Number(match[3]),
    month: Number(match[2]),
    year: Number(match[1]),
  };
  return isValidDate(parts) ? parts : null;
}

function formatValidDate(parts: DateParts) {
  return isValidDate(parts)
    ? `${String(parts.year).padStart(4, "0")}-${padNumber(parts.month)}-${padNumber(parts.day)}`
    : null;
}

function isValidDate({ day, month, year }: DateParts) {
  if (!isValidMonth(year, month)) return false;
  const monthDays = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= monthDays[month - 1];
}

function isValidMonth(year: number, month: number) {
  return Number.isInteger(year) && year >= 1 && year <= 9999 && month >= 1 && month <= 12;
}

function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function padNumber(value: number) {
  return String(value).padStart(2, "0");
}
