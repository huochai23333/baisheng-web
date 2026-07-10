import type { DashboardSharedCopy } from "./dashboard-shared-copy";

const PERMISSION_ERROR_FRAGMENTS = [
  "row-level security",
  "permission denied",
  "insufficient privileges",
  "not authorized",
  "unauthorized",
  "forbidden",
];

const TECHNICAL_ERROR_FRAGMENTS = [
  "duplicate key value",
  "violates foreign key constraint",
  "violates check constraint",
  "violates not-null constraint",
  "invalid input syntax",
  "syntax error at or near",
  "failed to fetch",
  "fetch failed",
  "networkerror",
  "timed out",
  "timeout",
  "unexpected token",
  "supabase",
  "postgres",
  "jwt",
  "storage",
  "edge function",
];

export function getRawErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message).trim();
  }
  return "";
}

export function toErrorMessage(error: unknown, copy: DashboardSharedCopy) {
  const message = getRawErrorMessage(error);
  const normalizedMessage = message.toLowerCase();

  if (!message) return copy.errors.unknown;
  if (normalizedMessage.includes("duplicate pending privacy request exists")) {
    return copy.errors.duplicatePending;
  }
  if (
    normalizedMessage.includes(
      "submitted privacy data duplicates existing stored data",
    )
  ) {
    return copy.errors.duplicateStored;
  }
  if (includesErrorFragment(normalizedMessage, PERMISSION_ERROR_FRAGMENTS)) {
    return copy.errors.permission;
  }
  if (looksLikeTechnicalError(normalizedMessage)) return copy.errors.unknown;
  return message;
}

function includesErrorFragment(message: string, fragments: readonly string[]) {
  return fragments.some((fragment) => message.includes(fragment));
}

function looksLikeTechnicalError(message: string) {
  return (
    includesErrorFragment(message, TECHNICAL_ERROR_FRAGMENTS) ||
    /http\s+\d{3}\b/.test(message) ||
    /\bstatus code\b/.test(message) ||
    /\bcolumn\b.+\bdoes not exist\b/.test(message) ||
    /\brelation\b.+\bdoes not exist\b/.test(message)
  );
}
