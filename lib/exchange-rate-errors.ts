/**
 * Edge Function 失败时，Supabase 会把接口响应放在错误对象的 context 中。
 * 优先读取接口给用户的说明，解析不到时再退回通用提示。
 */
export async function toExchangeRateFunctionError(error: unknown) {
  const response = getFunctionErrorResponse(error);

  if (response) {
    try {
      const payload = (await response.clone().json()) as {
        error?: string;
        message?: string;
      };
      const message =
        typeof payload.message === "string" && payload.message.trim()
          ? payload.message.trim()
          : typeof payload.error === "string" && payload.error.trim()
            ? payload.error.trim()
            : null;

      if (message) return new Error(message);
    } catch {
      // 响应不是 JSON 时继续使用原始错误，避免把真实故障替换成解析异常。
    }
  }

  return error instanceof Error
    ? error
    : new Error("今天的汇率暂时获取失败，请稍后重试或联系管理员。");
}

function getFunctionErrorResponse(error: unknown) {
  if (typeof error !== "object" || error === null || !("context" in error)) {
    return null;
  }

  const { context } = error as { context?: unknown };
  return context instanceof Response ? context : null;
}
