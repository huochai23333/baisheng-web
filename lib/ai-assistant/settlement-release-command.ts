import { getBeijingDateString } from "@/lib/exchange-rates";

import type { AiAssistantSettlementReleaseGuidanceCode } from "./assistant-types";

const ACTION_SOURCE =
  "(?:付款|到账|收款|结汇|paid|payment|received|receive|settlement|settled)";
const CURRENCY_SOURCE =
  "(?:US\\$|AU\\$|A\\$|JP¥|USD|CNY|RMB|EUR|JPY|AUD|美元|美金|人民币|欧元|日元|澳元|\\$|￥|¥|€)";
const NUMBER_SOURCE = "(?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d+)?";

const ACTION_PATTERN = new RegExp(ACTION_SOURCE, "i");
const ALL_ACTIONS_PATTERN = new RegExp(ACTION_SOURCE, "gi");
const CURRENCY_PATTERN = new RegExp(CURRENCY_SOURCE, "gi");
const MONEY_PATTERN = new RegExp(
  `(?:(${CURRENCY_SOURCE})\\s*(${NUMBER_SOURCE})|(${NUMBER_SOURCE})\\s*(${CURRENCY_SOURCE}))`,
  "gi",
);
const QUESTION_PATTERN =
  /(?:怎么|如何|哪里|哪些|什么|能否|可以吗|是否|how\b|where\b|what\b|can\s+i\b|could\s+i\b)/i;
const MAX_AMOUNT = 999_999_999_999.99;
const MAX_CUSTOMER_NAME_LENGTH = 120;
const MAX_NOTE_LENGTH = 300;

export type ParsedSettlementReleaseCommand = {
  amount: number;
  currency: string;
  customerName: string;
  note: string | null;
  receivedOn: string;
};

export type SettlementReleaseCommandParseResult =
  | { kind: "command"; value: ParsedSettlementReleaseCommand }
  | { code: AiAssistantSettlementReleaseGuidanceCode; kind: "guidance" }
  | { kind: "notCommand" };

type TextRange = {
  end: number;
  start: number;
};

type DateCandidate = TextRange & {
  value: string | null;
};

/**
 * 把助手消息限制在一条可验证的结汇指令内。
 * 这里故意不用大模型决定金额或客户，避免自然语言猜测直接变成财务记录。
 */
export function parseSettlementReleaseCommand(
  rawMessage: string,
  today = getBeijingDateString(),
): SettlementReleaseCommandParseResult {
  const normalizedMessage = rawMessage.normalize("NFKC").trim();
  const actionMatch = normalizedMessage.match(ACTION_PATTERN);

  if (!actionMatch) {
    return { kind: "notCommand" };
  }

  const { note, textWithoutNote } = extractNote(normalizedMessage);
  const dateResult = extractReceivedOn(textWithoutNote, today);

  if (dateResult.kind === "invalid") {
    return { code: "invalidDate", kind: "guidance" };
  }

  const textWithoutDate = removeRanges(textWithoutNote, dateResult.ranges);
  const moneyMatches = Array.from(textWithoutDate.matchAll(MONEY_PATTERN));

  if (moneyMatches.length > 1) {
    return { code: "multipleAmounts", kind: "guidance" };
  }

  if (moneyMatches.length === 0) {
    const hasNumber = new RegExp(NUMBER_SOURCE).test(textWithoutDate);
    const hasCurrency = new RegExp(CURRENCY_SOURCE, "i").test(textWithoutDate);

    if (!hasNumber && !hasCurrency && QUESTION_PATTERN.test(normalizedMessage)) {
      return { kind: "notCommand" };
    }

    return {
      code: hasNumber ? "missingCurrency" : "missingAmount",
      kind: "guidance",
    };
  }

  const moneyMatch = moneyMatches[0];
  const currencyToken = moneyMatch[1] ?? moneyMatch[4] ?? "";
  const rawAmount = moneyMatch[2] ?? moneyMatch[3] ?? "";
  const currency = normalizeCurrencyToken(currencyToken);
  const mentionedCurrencies = Array.from(
    textWithoutDate.matchAll(CURRENCY_PATTERN),
    (match) => normalizeCurrencyToken(match[0]),
  ).filter(
    (value): value is Exclude<typeof value, null> => value !== null,
  );

  if (
    !currency ||
    new Set(mentionedCurrencies).size > 1
  ) {
    return { code: "invalidCurrency", kind: "guidance" };
  }

  const amount = normalizeAmount(rawAmount);

  if (amount === null) {
    return { code: "invalidAmount", kind: "guidance" };
  }

  const customerName = extractCustomerName(textWithoutDate, moneyMatch);

  if (!customerName || customerName.length > MAX_CUSTOMER_NAME_LENGTH) {
    return { code: "missingCustomer", kind: "guidance" };
  }

  return {
    kind: "command",
    value: {
      amount,
      currency,
      customerName,
      note,
      receivedOn: dateResult.receivedOn,
    },
  };
}

export function isValidSettlementReleaseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  return buildValidatedDate(
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  ) === value;
}

export function isSupportedSettlementReleaseCurrency(value: string) {
  return ["AUD", "CNY", "EUR", "JPY", "USD"].includes(value);
}

export function isValidSettlementReleaseAmount(value: number) {
  const amountInCents = value * 100;

  return (
    Number.isFinite(value) &&
    value > 0 &&
    value <= MAX_AMOUNT &&
    Math.abs(Math.round(amountInCents) - amountInCents) < 0.000_001
  );
}

function extractNote(message: string) {
  const noteMatch = /(?:备注|note)\s*[:：]?\s*(.+)$/i.exec(message);

  if (!noteMatch || noteMatch.index === undefined) {
    return { note: null, textWithoutNote: message };
  }

  const normalizedNote = noteMatch[1].trim();

  return {
    note: normalizedNote.slice(0, MAX_NOTE_LENGTH) || null,
    textWithoutNote: message.slice(0, noteMatch.index).trim(),
  };
}

function extractReceivedOn(message: string, today: string) {
  const candidates: DateCandidate[] = [];
  const fullDatePattern = /(\d{4})\s*(?:[-/.]|年)\s*(\d{1,2})\s*(?:[-/.]|月)\s*(\d{1,2})\s*日?/g;
  const relativeDatePattern = /今天|昨天|\btoday\b|\byesterday\b/gi;
  const monthDayPattern = /(\d{1,2})\s*月\s*(\d{1,2})\s*日/g;

  for (const match of message.matchAll(fullDatePattern)) {
    addDateCandidate(candidates, match, buildValidatedDate(
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
    ));
  }

  for (const match of message.matchAll(relativeDatePattern)) {
    addDateCandidate(
      candidates,
      match,
      /昨天|yesterday/i.test(match[0]) ? addIsoCalendarDays(today, -1) : today,
    );
  }

  const currentYear = Number(today.slice(0, 4));
  for (const match of message.matchAll(monthDayPattern)) {
    addDateCandidate(candidates, match, buildValidatedDate(
      currentYear,
      Number(match[1]),
      Number(match[2]),
    ));
  }

  if (candidates.length > 1 || candidates.some((candidate) => !candidate.value)) {
    return { kind: "invalid" as const, ranges: [] as TextRange[] };
  }

  return {
    kind: "valid" as const,
    ranges: candidates.map(({ end, start }) => ({ end, start })),
    receivedOn: candidates[0]?.value ?? today,
  };
}

function addDateCandidate(
  candidates: DateCandidate[],
  match: RegExpMatchArray,
  value: string | null,
) {
  const start = match.index ?? -1;
  const end = start + match[0].length;

  if (start < 0 || candidates.some((item) => start < item.end && end > item.start)) {
    return;
  }

  candidates.push({ end, start, value });
}

function extractCustomerName(message: string, moneyMatch: RegExpMatchArray) {
  const moneyStart = moneyMatch.index ?? 0;
  let customerText = `${message.slice(0, moneyStart)} ${message.slice(
    moneyStart + moneyMatch[0].length,
  )}`;

  customerText = customerText
    .replace(ALL_ACTIONS_PATTERN, " ")
    .replace(CURRENCY_PATTERN, " ")
    .replace(/(?:收款日期|结汇日期|日期|date)\s*[:：]?/gi, " ")
    .replace(/[，,。；;]+/g, " ")
    .trim();

  // 这些词只表示用户想执行动作，不属于客户名称；循环处理可以覆盖“请帮我发布”这类组合。
  const leadingCommandPattern =
    /^(?:请|请帮我|帮我|麻烦|麻烦帮我|收到|发布|登记|记录|create|publish|record|please|from|for)\s*/i;
  let previous = "";
  while (customerText && customerText !== previous) {
    previous = customerText;
    customerText = customerText.replace(leadingCommandPattern, "").trim();
  }

  return customerText
    .replace(/^(?:客户|customer)\s*[:：]?\s*/i, "")
    .replace(/\s+(?:from|for|on)$/i, "")
    .replace(/款$/, "")
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCurrencyToken(token: string) {
  const normalized = token.normalize("NFKC").trim().toUpperCase();

  if (["$", "US$", "USD", "美元", "美金"].includes(normalized)) {
    return "USD";
  }

  if (["¥", "￥", "CNY", "RMB", "人民币"].includes(normalized)) {
    return "CNY";
  }

  if (["€", "EUR", "欧元"].includes(normalized)) {
    return "EUR";
  }

  if (["JP¥", "JPY", "日元"].includes(normalized)) {
    return "JPY";
  }

  if (["A$", "AU$", "AUD", "澳元"].includes(normalized)) {
    return "AUD";
  }

  return null;
}

function normalizeAmount(rawAmount: string) {
  const normalized = rawAmount.replace(/,/g, "");
  const decimalPlaces = normalized.split(".")[1]?.length ?? 0;
  const amount = Number(normalized);

  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > MAX_AMOUNT ||
    decimalPlaces > 2
  ) {
    return null;
  }

  return Math.round(amount * 100) / 100;
}

function buildValidatedDate(year: number, month: number, day: number) {
  if (!Number.isInteger(year) || year < 1900 || year > 9999) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function addIsoCalendarDays(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));

  return date.toISOString().slice(0, 10);
}

function removeRanges(value: string, ranges: TextRange[]) {
  return [...ranges]
    .sort((left, right) => right.start - left.start)
    .reduce(
      (current, range) =>
        `${current.slice(0, range.start)} ${current.slice(range.end)}`,
      value,
    );
}
