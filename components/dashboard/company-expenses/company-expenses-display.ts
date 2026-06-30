import type {
  CompanyExpenseCategory,
  CompanyExpenseFormInput,
  CompanyExpenseRow,
} from "@/lib/company-expenses";

export type CompanyExpenseFormState = {
  amount: string;
  category: CompanyExpenseCategory;
  currencyCode: string;
  expenseDate: string;
  expenseMonth: string;
  note: string;
  payee: string;
  title: string;
};

export type CompanyExpenseSummary = {
  amount: number;
  count: number;
  currencyCode: string;
};

type CompanyExpenseErrorCopy = {
  invalidAmount: string;
  invalidMonth: string;
  missingAmount: string;
  missingTitle: string;
  notFoundError: string;
  permissionError: string;
  unknownError: string;
};

export const companyExpenseCurrencyOptions = ["CNY", "USD", "THB"] as const;

export function createEmptyCompanyExpenseForm(): CompanyExpenseFormState {
  return {
    amount: "",
    category: "other",
    currencyCode: "CNY",
    expenseDate: "",
    expenseMonth: getCurrentMonthInputValue(),
    note: "",
    payee: "",
    title: "",
  };
}

export function createCompanyExpenseFormFromRow(
  row: CompanyExpenseRow,
): CompanyExpenseFormState {
  return {
    amount: String(row.amount),
    category: row.category,
    currencyCode: row.currency_code,
    expenseDate: row.expense_date ?? "",
    expenseMonth: row.expense_month.slice(0, 7),
    note: row.note ?? "",
    payee: row.payee ?? "",
    title: row.title,
  };
}

export function toCompanyExpenseInput(
  formState: CompanyExpenseFormState,
  copy: CompanyExpenseErrorCopy,
): CompanyExpenseFormInput {
  if (!formState.title.trim()) {
    throw new Error(copy.missingTitle);
  }

  if (!formState.expenseMonth.trim()) {
    throw new Error(copy.invalidMonth);
  }

  if (!formState.amount.trim()) {
    throw new Error(copy.missingAmount);
  }

  const amount = Number(formState.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(copy.invalidAmount);
  }

  return {
    amount,
    category: formState.category,
    currencyCode: formState.currencyCode,
    expenseDate: formState.expenseDate,
    expenseMonth: formState.expenseMonth,
    note: formState.note,
    payee: formState.payee,
    title: formState.title,
  };
}

export function getCompanyExpenseSummaries(
  rows: readonly CompanyExpenseRow[],
): CompanyExpenseSummary[] {
  const summaryByCurrency = new Map<string, CompanyExpenseSummary>();

  rows.forEach((row) => {
    const currencyCode = row.currency_code;
    const current = summaryByCurrency.get(currencyCode) ?? {
      amount: 0,
      count: 0,
      currencyCode,
    };

    summaryByCurrency.set(currencyCode, {
      amount: current.amount + row.amount,
      count: current.count + 1,
      currencyCode,
    });
  });

  return Array.from(summaryByCurrency.values()).sort((left, right) =>
    left.currencyCode.localeCompare(right.currencyCode),
  );
}

export function getCompanyExpenseMonthValue(row: CompanyExpenseRow) {
  return row.expense_month.slice(0, 7);
}

export function formatCompanyExpenseAmount(
  amount: number,
  currencyCode: string,
  locale: string,
) {
  try {
    return new Intl.NumberFormat(locale, {
      currency: currencyCode,
      style: "currency",
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

export function formatCompanyExpenseMonth(value: string, locale: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    month: "long",
    timeZone: "Asia/Shanghai",
    year: "numeric",
  }).format(new Date(`${value.slice(0, 7)}-01T00:00:00+08:00`));
}

export function formatCompanyExpenseDate(value: string | null, locale: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "Asia/Shanghai",
  }).format(new Date(`${value}T00:00:00+08:00`));
}

export function toCompanyExpenseErrorMessage(
  error: unknown,
  copy: CompanyExpenseErrorCopy,
) {
  const message = error instanceof Error ? error.message.trim() : "";
  const normalizedMessage = message.toLowerCase();

  if (
    message === copy.invalidAmount ||
    message === copy.invalidMonth ||
    message === copy.missingAmount ||
    message === copy.missingTitle
  ) {
    return message;
  }

  if (normalizedMessage.includes("company expense was not found")) {
    return copy.notFoundError;
  }

  if (
    normalizedMessage.includes("permission") ||
    normalizedMessage.includes("forbidden") ||
    normalizedMessage.includes("unauthorized") ||
    normalizedMessage.includes("row-level security")
  ) {
    return copy.permissionError;
  }

  if (message.length > 0 && !looksLikeTechnicalCompanyExpenseError(normalizedMessage)) {
    return message;
  }

  return copy.unknownError;
}

function getCurrentMonthInputValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${now.getFullYear()}-${month}`;
}

function looksLikeTechnicalCompanyExpenseError(message: string) {
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
