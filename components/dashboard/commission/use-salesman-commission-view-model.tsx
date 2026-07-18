"use client";

import { useCallback, useMemo, useState } from "react";
import { Coins, WalletCards } from "lucide-react";
import { useTranslations } from "next-intl";

import type { AdminCommissionRow } from "@/lib/admin-commission";
import {
  getSalesmanCommissionPageData,
  type SalesmanCommissionPageData,
} from "@/lib/salesman-commission";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { useDashboardPagination } from "@/lib/use-dashboard-pagination";
import type { FeedbackTone } from "@/components/dashboard/dashboard-shared-ui";
import { useWorkspaceSyncEffect } from "@/components/dashboard/workspace-session-provider";

import { toCommissionErrorMessage } from "./commission-display";

type PageFeedback = { tone: FeedbackTone; message: string } | null;
type CommissionBoard = "normal" | "task";

/** 业务员佣金页的数据刷新、看板选择和分页状态统一收口。 */
export function useSalesmanCommissionViewModel(
  initialData: SalesmanCommissionPageData,
) {
  const supabase = getBrowserSupabaseClient();
  const t = useTranslations("Commission");
  const [pageFeedback, setPageFeedback] = useState<PageFeedback>(null);
  const [hasPermission, setHasPermission] = useState(initialData.hasPermission);
  const [commissions, setCommissions] = useState<AdminCommissionRow[]>(
    initialData.commissions,
  );
  const [taskCommissions, setTaskCommissions] = useState(
    initialData.taskCommissions,
  );
  const [activeBoard, setActiveBoard] = useState<CommissionBoard>("normal");

  const applyPageData = useCallback((pageData: SalesmanCommissionPageData) => {
    setHasPermission(pageData.hasPermission);
    setCommissions(pageData.commissions);
    setTaskCommissions(pageData.taskCommissions);
  }, []);
  const refreshCommissionBoard = useCallback(
    async ({ isMounted }: { isMounted: () => boolean }) => {
      if (!supabase) return;
      try {
        const nextPageData = await getSalesmanCommissionPageData(supabase);
        if (!isMounted()) return;
        applyPageData(nextPageData);
        setPageFeedback(null);
      } catch (error) {
        if (!isMounted()) return;
        setPageFeedback({
          message: toCommissionErrorMessage(error, t, "salesman"),
          tone: "error",
        });
      }
    },
    [applyPageData, supabase, t],
  );

  useWorkspaceSyncEffect(refreshCommissionBoard);

  return {
    activeBoard,
    boardOptions: useMemo(
      () => [
        {
          icon: <WalletCards className="size-4" />,
          key: "normal" as const,
          meta: t("boards.normal.meta", { count: commissions.length }),
          title: t("boards.normal.title"),
        },
        {
          icon: <Coins className="size-4" />,
          key: "task" as const,
          meta: t("boards.task.meta", { count: taskCommissions.length }),
          title: t("boards.task.title"),
        },
      ],
      [commissions.length, taskCommissions.length, t],
    ),
    commissions,
    commissionsPagination: useDashboardPagination(commissions),
    hasPermission,
    pageFeedback,
    setActiveBoard,
    taskCommissions,
  };
}
