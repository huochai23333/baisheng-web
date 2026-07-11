import { NextResponse } from "next/server";

import {
  AiAssistantServiceError,
  createDeepSeekAssistantTextStream,
} from "@/lib/ai-assistant/deepseek-client";
import {
  acquireApiRequestQuota,
  releaseApiRequestQuota,
} from "@/lib/api-request-quota";
import { getServerAuthContext } from "@/lib/server-auth";
import {
  readLimitedJsonBody,
  RequestBodyTooLargeError,
} from "@/lib/server-request-body";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import {
  buildWholesaleOrderAssessmentMessages,
  filterWholesaleOrdersForAssessment,
  normalizeWholesaleOrderAssessmentPayload,
} from "@/lib/wholesale-order-assessment";
import { getWholesalePageData } from "@/lib/wholesale";
import { getCurrentWorkspaceBusinessAccess } from "@/lib/workspace-business-access";

export const runtime = "nodejs";

const ASSESSMENT_TIMEOUT_MS = 30_000;
const MAX_ASSESSMENT_BODY_BYTES = 64 * 1024;

export async function POST(request: Request) {
  const { status, userId } = await getServerAuthContext();

  if (!userId || status !== "active") {
    return createErrorResponse("请先登录后再生成评估。", 401);
  }

  let filters: ReturnType<typeof normalizeWholesaleOrderAssessmentPayload>;

  try {
    filters = normalizeWholesaleOrderAssessmentPayload(
      await readLimitedJsonBody(request, MAX_ASSESSMENT_BODY_BYTES),
    );
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return createErrorResponse("提交的筛选内容太多，请减少后再试。", 413);
    }

    return createErrorResponse("筛选条件暂时无法识别，请调整后重试。", 400);
  }

  const supabase = await getServerSupabaseClient();
  const businessAccess = await getCurrentWorkspaceBusinessAccess(supabase);

  if (!businessAccess.includes("wholesale")) {
    return createErrorResponse("当前账号不能查看批发业务订单。", 403);
  }

  let leaseId: string | null = null;

  try {
    const quota = await acquireApiRequestQuota(supabase, "ai");

    if (!quota.allowed) {
      return createErrorResponse(
        "操作有些频繁，请稍后再生成评估。",
        429,
        quota.retryAfterSeconds,
      );
    }

    leaseId = quota.leaseId;
  } catch {
    return createErrorResponse("评估暂时没有生成成功，请稍后再试。", 503);
  }

  const releaseQuota = async () => {
    const currentLeaseId = leaseId;
    leaseId = null;
    await releaseApiRequestQuota(supabase, currentLeaseId);
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ASSESSMENT_TIMEOUT_MS);

  try {
    const data = await getWholesalePageData(supabase, "orders", {
      orderFilters: {
        customerId: filters.customerId === "all" ? "" : filters.customerId,
        orderedFromDate: filters.orderedFromDate,
        orderedToDate: filters.orderedToDate,
        salesUserId: filters.salesUserId === "all" ? "" : filters.salesUserId,
        searchText: filters.searchText,
        status:
          filters.status === "settled" ||
          filters.status === "partial_settled" ||
          filters.status === "unsettled"
            ? filters.status
            : "all",
      },
      // 评估最多取 100 笔作为客户和订单样例；总数及金额汇总仍由 RPC 对完整范围计算。
      orderLimit: 100,
    });
    if (!data.orderPage?.canViewInternalFields) {
      clearTimeout(timeout);
      await releaseQuota();
      return createErrorResponse("当前账号不能使用订单评估。", 403);
    }
    const orders = filterWholesaleOrdersForAssessment(data, filters);
    const messages = buildWholesaleOrderAssessmentMessages({
      data,
      filters,
      orders,
    });
    const stream = await createDeepSeekAssistantTextStream({
      messages,
      onSettled: () => {
        clearTimeout(timeout);
        void releaseQuota();
      },
      signal: controller.signal,
      userId,
    });

    return new Response(stream, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    clearTimeout(timeout);
    await releaseQuota();

    if (error instanceof AiAssistantServiceError) {
      return createErrorResponse("评估暂时没有生成成功，请稍后再试。", 503);
    }

    return createErrorResponse("评估暂时没有生成成功，请稍后再试。", 503);
  }
}

function createErrorResponse(
  message: string,
  status: number,
  retryAfterSeconds?: number,
) {
  return NextResponse.json(
    { message },
    {
      headers: retryAfterSeconds
        ? { "Retry-After": String(retryAfterSeconds) }
        : undefined,
      status,
    },
  );
}
