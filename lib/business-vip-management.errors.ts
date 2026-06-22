// Map technical RPC failures into stable UI buckets used by the dialog copy.
export function getBusinessVipErrorCode(error: unknown) {
  const message = getRawErrorMessage(error).toLowerCase();

  if (
    message.includes("forbidden") ||
    message.includes("unauthorized") ||
    message.includes("permission denied")
  ) {
    return "forbidden";
  }

  if (message.includes("not_found")) {
    return "notFound";
  }

  if (
    message.includes("already_processed") ||
    message.includes("duplicate key")
  ) {
    return "processed";
  }

  if (
    message.includes("invalid_input") ||
    message.includes("invalid input")
  ) {
    return "invalidInput";
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("fetch failed") ||
    message.includes("timed out") ||
    message.includes("timeout")
  ) {
    return "serviceUnavailable";
  }

  return "unknown";
}

function getRawErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message).trim();
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "";
}
