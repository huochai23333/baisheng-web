import type {
  OperatorReimbursementFormInput,
  OperatorReimbursementPeriod,
  OperatorReimbursementRow,
  OperatorReimbursementStatus,
} from "@/lib/operator-reimbursements";

export type OperatorReimbursementFormState = {
  amount: string;
  content: string;
  spentAt: string;
};

export type OperatorReimbursementSummary = {
  amount: number;
  count: number;
};

type OperatorReimbursementErrorCopy = {
  deleteLockedError: string;
  invalidAmount: string;
  invalidDate: string;
  missingAmount: string;
  missingContent: string;
  notFoundError: string;
  permissionError: string;
  unknownError: string;
};

export function createEmptyOperatorReimbursementForm(): OperatorReimbursementFormState {
  return {
    amount: "",
    content: "",
    spentAt: getTodayDateInputValue(),
  };
}

export function toOperatorReimbursementInput(
  formState: OperatorReimbursementFormState,
  copy: OperatorReimbursementErrorCopy,
): OperatorReimbursementFormInput {
  if (!formState.content.trim()) {
    throw new Error(copy.missingContent);
  }

  if (!formState.amount.trim()) {
    throw new Error(copy.missingAmount);
  }

  const amount = Number(formState.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(copy.invalidAmount);
  }

  if (!isDateInputValue(formState.spentAt)) {
    throw new Error(copy.invalidDate);
  }

  return {
    amount,
    content: formState.content,
    spentAt: formState.spentAt,
  };
}

export function getOperatorReimbursementSummaries(
  rows: readonly OperatorReimbursementRow[],
  currentPeriod: OperatorReimbursementPeriod,
) {
  const currentRows = rows.filter((row) =>
    isOperatorReimbursementInPeriod(row, currentPeriod),
  );

  return {
    currentReimbursed: sumOperatorReimbursements(
      currentRows.filter((row) => row.status === "reimbursed"),
    ),
    currentUnreimbursed: sumOperatorReimbursements(
      currentRows.filter((row) => row.status === "unreimbursed"),
    ),
    totalUnreimbursed: sumOperatorReimbursements(
      rows.filter((row) => row.status === "unreimbursed"),
    ),
  };
}

export function isOperatorReimbursementInPeriod(
  row: OperatorReimbursementRow,
  period: OperatorReimbursementPeriod,
) {
  return (
    row.reimbursement_period_start === period.start &&
    row.reimbursement_period_end === period.end
  );
}

export function getOperatorReimbursementPeriodValue(
  row: OperatorReimbursementRow,
) {
  return row.reimbursement_period_start;
}

export function formatOperatorReimbursementAmount(
  amount: number,
  locale: string,
) {
  return new Intl.NumberFormat(locale, {
    currency: "CNY",
    style: "currency",
  }).format(amount);
}

export function formatOperatorReimbursementDate(
  value: string | null,
  locale: string,
) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "Asia/Shanghai",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00+08:00`));
}

export function formatOperatorReimbursementPeriod(
  period: OperatorReimbursementPeriod,
  locale: string,
) {
  return `${formatOperatorReimbursementDate(
    period.start,
    locale,
  )} - ${formatOperatorReimbursementDate(period.end, locale)}`;
}

export function toOperatorReimbursementErrorMessage(
  error: unknown,
  copy: OperatorReimbursementErrorCopy,
) {
  const message = error instanceof Error ? error.message.trim() : "";
  const normalizedMessage = message.toLowerCase();

  if (
    message === copy.invalidAmount ||
    message === copy.invalidDate ||
    message === copy.missingAmount ||
    message === copy.missingContent
  ) {
    return message;
  }

  if (normalizedMessage.includes("operator reimbursement was not found")) {
    return copy.notFoundError;
  }

  if (
    normalizedMessage.includes("delete") ||
    normalizedMessage.includes("not found")
  ) {
    return copy.deleteLockedError;
  }

  if (
    normalizedMessage.includes("permission") ||
    normalizedMessage.includes("forbidden") ||
    normalizedMessage.includes("unauthorized") ||
    normalizedMessage.includes("row-level security")
  ) {
    return copy.permissionError;
  }

  if (
    message.length > 0 &&
    !looksLikeTechnicalOperatorReimbursementError(normalizedMessage)
  ) {
    return message;
  }

  return copy.unknownError;
}

export function getOperatorReimbursementStatusTone(
  status: OperatorReimbursementStatus,
) {
  return status === "reimbursed"
    ? "border-[#d4e7d6] bg-[#f1f8f2] text-[#42624b]"
    : "border-[#eadbbf] bg-[#fff8ec] text-[#856225]";
}

function sumOperatorReimbursements(
  rows: readonly OperatorReimbursementRow[],
): OperatorReimbursementSummary {
  return rows.reduce<OperatorReimbursementSummary>(
    (summary, row) => ({
      amount: summary.amount + row.amount,
      count: summary.count + 1,
    }),
    { amount: 0, count: 0 },
  );
}

function isDateInputValue(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getTodayDateInputValue() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Shanghai",
    year: "numeric",
  }).formatToParts(new Date());
  const partMap = new Map(parts.map((part) => [part.type, part.value]));

  // 日期输入框只接受 YYYY-MM-DD，所以这里用上海时区当天拼出稳定的输入值。
  return [
    partMap.get("year") ?? "",
    partMap.get("month") ?? "",
    partMap.get("day") ?? "",
  ].join("-");
}

function looksLikeTechnicalOperatorReimbursementError(message: string) {
  return (
    message.includes("failed to fetch") ||
    message.includes("fetch failed") ||
    message.includes("timed out") ||
    message.includes("timeout") ||
    message.includes("jwt") ||
    message.includes("relation") ||
    message.includes("column") ||
    message.includes("violates") ||
    message.includes("supabase") ||
    /\bhttp\s+\d{3}\b/.test(message) ||
    /\bstatus code\b/.test(message)
  );
}
