"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { Coins, WalletCards } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  getAdminCommissionPageData,
  type AdminCommissionPageData,
  type AdminCommissionRow,
} from "@/lib/admin-commission";
import { getBrowserSupabaseClient } from "@/lib/supabase";
import { useDashboardPagination } from "@/lib/use-dashboard-pagination";
import {
  normalizeSearchText,
  type FeedbackTone,
} from "@/components/dashboard/dashboard-shared-ui";
import { useWorkspaceSyncEffect } from "@/components/dashboard/workspace-session-provider";

import {
  type CategoryFilter,
  type CommissionFilters,
  type SettlementFilter,
  summarizeByBeneficiary,
} from "./admin-commission-sections";
import {
  getCommissionCategoryLabel,
  getCommissionSettlementStatusLabel,
  toCommissionErrorMessage,
} from "./commission-display";
import { useManagedCommissionSettlement } from "./use-managed-commission-settlement";

type PageFeedback = { message: string; tone: FeedbackTone } | null;
type CommissionBoard = "normal" | "task";

const EMPTY_FILTERS: CommissionFilters = {
  beneficiaryUserId: "",
  category: "all",
  orderNumber: "",
  searchText: "",
  settlementStatus: "all",
};

/** 管理端佣金页面的查询、筛选、分页和结算状态统一由 view-model 管理。 */
export function useAdminCommissionViewModel(
  initialData: AdminCommissionPageData,
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
  const [filters, setFilters] = useState<CommissionFilters>(EMPTY_FILTERS);
  const deferredSearchText = useDeferredValue(filters.searchText);

  const applyPageData = useCallback((pageData: AdminCommissionPageData) => {
    setHasPermission(pageData.hasPermission);
    setCommissions(pageData.commissions);
    setTaskCommissions(pageData.taskCommissions);
  }, []);

  const reloadCommissionBoard = useCallback(async () => {
    if (!supabase) return;
    applyPageData(await getAdminCommissionPageData(supabase));
    setPageFeedback(null);
  }, [applyPageData, supabase]);

  const refreshCommissionBoard = useCallback(
    async ({ isMounted }: { isMounted: () => boolean }) => {
      if (!supabase) return;
      try {
        const nextPageData = await getAdminCommissionPageData(supabase);
        if (!isMounted()) return;
        applyPageData(nextPageData);
        setPageFeedback(null);
      } catch (error) {
        if (!isMounted()) return;
        setPageFeedback({
          message: toCommissionErrorMessage(error, t, "admin"),
          tone: "error",
        });
      }
    },
    [applyPageData, supabase, t],
  );

  useWorkspaceSyncEffect(refreshCommissionBoard);

  const beneficiaryOptions = useMemo(
    () => summarizeByBeneficiary(commissions),
    [commissions],
  );
  const filteredCommissions = useMemo(() => {
    const searchValue = normalizeSearchText(deferredSearchText);
    const orderValue = normalizeSearchText(filters.orderNumber);

    return commissions.filter((commission) => {
      if (
        filters.beneficiaryUserId &&
        commission.beneficiary.userId !== filters.beneficiaryUserId
      )
        return false;
      if (
        filters.settlementStatus !== "all" &&
        commission.settlementStatus !== filters.settlementStatus
      )
        return false;
      if (
        filters.category !== "all" &&
        commission.category !== filters.category
      )
        return false;
      if (
        orderValue &&
        !normalizeSearchText(commission.orderNumber).includes(orderValue)
      )
        return false;
      if (!searchValue) return true;

      return [
        commission.orderNumber,
        commission.beneficiary.label,
        commission.beneficiary.name,
        commission.beneficiary.email,
        commission.sourceCustomer?.label ?? "",
        commission.sourceCustomer?.name ?? "",
        commission.sourceCustomer?.email ?? "",
        commission.sourceSalesman?.label ?? "",
        commission.sourceSalesman?.name ?? "",
        commission.sourceSalesman?.email ?? "",
        getCommissionCategoryLabel(commission.category, t),
        getCommissionSettlementStatusLabel(commission.settlementStatus, t),
      ].some((value) => normalizeSearchText(value).includes(searchValue));
    });
  }, [commissions, deferredSearchText, filters, t]);
  const beneficiarySummaries = useMemo(
    () => summarizeByBeneficiary(filteredCommissions),
    [filteredCommissions],
  );
  const commissionsPagination = useDashboardPagination(filteredCommissions);

  const settlementOptions = useMemo(
    () => [
      { value: "all" as SettlementFilter, label: t("options.settlement.all") },
      {
        value: "pending" as SettlementFilter,
        label: t("options.settlement.pending"),
      },
      {
        value: "paid" as SettlementFilter,
        label: t("options.settlement.paid"),
      },
      {
        value: "cancelled" as SettlementFilter,
        label: t("options.settlement.cancelled"),
      },
      {
        value: "reversed" as SettlementFilter,
        label: t("options.settlement.reversed"),
      },
    ],
    [t],
  );
  const categoryOptions = useMemo(
    () => [
      { value: "all" as CategoryFilter, label: t("options.category.all") },
      {
        value: "salesman_purchase" as CategoryFilter,
        label: t("options.category.salesmanPurchase"),
      },
      {
        value: "salesman_service" as CategoryFilter,
        label: t("options.category.salesmanService"),
      },
      {
        value: "referral_purchase" as CategoryFilter,
        label: t("options.category.referralPurchase"),
      },
      {
        value: "referral_service" as CategoryFilter,
        label: t("options.category.referralService"),
      },
      {
        value: "referral_vip_first_year_bonus" as CategoryFilter,
        label: t("options.category.referralVipFirstYearBonus"),
      },
      {
        value: "manual_adjustment" as CategoryFilter,
        label: t("options.category.manualAdjustment"),
      },
    ],
    [t],
  );
  const boardOptions = useMemo(
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
  );

  const {
    handleMarkCommissionAsPaid,
    handleMarkTaskCommissionAsPaid,
    settlingCommissionId,
    settlingTaskCommissionId,
  } = useManagedCommissionSettlement({
    onPageFeedback: setPageFeedback,
    refreshCommissionBoard: reloadCommissionBoard,
    supabase,
  });

  return {
    activeBoard,
    beneficiaryOptions,
    beneficiarySummaries,
    boardOptions,
    categoryOptions,
    commissionsPagination,
    drillDownToBeneficiary: (userId: string) =>
      setFilters({ ...EMPTY_FILTERS, beneficiaryUserId: userId }),
    filteredCommissions,
    filters,
    focusOrderNumber: (orderNumber: string) =>
      setFilters((current) => ({ ...current, orderNumber, searchText: "" })),
    handleFilterChange: <Key extends keyof CommissionFilters>(
      key: Key,
      value: CommissionFilters[Key],
    ) => setFilters((current) => ({ ...current, [key]: value })),
    handleMarkCommissionAsPaid,
    handleMarkTaskCommissionAsPaid,
    hasActiveFilters: Boolean(
      filters.searchText ||
      filters.beneficiaryUserId ||
      filters.orderNumber ||
      filters.settlementStatus !== "all" ||
      filters.category !== "all",
    ),
    hasPermission,
    pageFeedback,
    resetFilters: () => setFilters(EMPTY_FILTERS),
    setActiveBoard,
    settlementOptions,
    settlingCommissionId,
    settlingTaskCommissionId,
    taskCommissions,
  };
}
