"use client";

import { useMemo } from "react";

import { useTranslations } from "next-intl";

import { useLocale } from "@/components/i18n/locale-provider";
import type {
  OperatorReimbursementStatus,
  OperatorReimbursementsPageData,
} from "@/lib/operator-reimbursements";

import {
  DashboardAccessState,
  DashboardPageShell,
} from "../dashboard-page-shell";
import { OperatorReimbursementFormDialog } from "./operator-reimbursement-form-dialog";
import {
  OperatorReimbursementsFilterSection,
  OperatorReimbursementsHeaderSection,
  OperatorReimbursementsListSection,
  OperatorReimbursementsSummarySection,
} from "./operator-reimbursements-sections";
import { useOperatorReimbursementsViewModel } from "./use-operator-reimbursements-view-model";

type OperatorReimbursementsClientProps = {
  initialData: OperatorReimbursementsPageData;
};

export function OperatorReimbursementsClient({
  initialData,
}: OperatorReimbursementsClientProps) {
  const t = useTranslations("OperatorReimbursements");
  const { locale } = useLocale();
  // 所有页面文案先集中成 copy 对象，子组件只消费普通字符串，避免组件里散落翻译键。
  const copy = useMemo(() => createOperatorReimbursementsCopy(t), [t]);
  const viewModel = useOperatorReimbursementsViewModel({
    copy: copy.feedback,
    initialData,
  });

  if (!viewModel.hasPermission) {
    return (
      <DashboardPageShell className="gap-6">
        <DashboardAccessState
          description={copy.noPermissionDescription}
          kind="permission"
          title={copy.noPermissionTitle}
        />
      </DashboardPageShell>
    );
  }

  return (
    <>
      <DashboardPageShell
        feedback={viewModel.pageFeedback}
        header={
          <OperatorReimbursementsHeaderSection
            copy={copy.header}
            currentPeriod={viewModel.currentPeriod}
            currentUnreimbursedCount={viewModel.currentUnreimbursedCount}
            locale={locale}
            onCreate={viewModel.openCreateDialog}
            onReimburseCurrent={viewModel.handleReimburseCurrent}
            reimbursePending={viewModel.reimbursePending}
          />
        }
      >
        <OperatorReimbursementsFilterSection
          copy={copy.filters}
          locale={locale}
          onPeriodFilterChange={viewModel.setPeriodFilter}
          onReset={viewModel.resetFilters}
          onSearchQueryChange={viewModel.setSearchQuery}
          onStatusFilterChange={viewModel.setStatusFilter}
          periodFilter={viewModel.periodFilter}
          periodOptions={viewModel.periodOptions}
          searchQuery={viewModel.searchQuery}
          statusFilter={viewModel.statusFilter}
        />
        <OperatorReimbursementsSummarySection
          copy={copy.summary}
          currentPeriod={viewModel.currentPeriod}
          locale={locale}
          reimbursements={viewModel.reimbursements}
        />
        <OperatorReimbursementsListSection
          copy={copy.list}
          locale={locale}
          onDelete={viewModel.handleDelete}
          pendingAction={viewModel.pendingAction}
          reimbursements={viewModel.filteredReimbursements}
        />
      </DashboardPageShell>

      <OperatorReimbursementFormDialog
        copy={copy.dialog}
        feedback={viewModel.dialogFeedback}
        formState={viewModel.formState}
        onOpenChange={viewModel.handleDialogOpenChange}
        onSubmit={() => void viewModel.handleSubmit()}
        onUpdateField={viewModel.updateFormField}
        open={viewModel.dialogOpen}
        pending={viewModel.submitPending}
      />
    </>
  );
}

type TranslationValues = Record<string, string | number>;
type Translator = (key: string, values?: TranslationValues) => string;

function createOperatorReimbursementsCopy(t: Translator) {
  const statusOptions: Record<OperatorReimbursementStatus, string> = {
    reimbursed: t("status.reimbursed"),
    unreimbursed: t("status.unreimbursed"),
  };

  return {
    dialog: {
      amountLabel: t("dialog.amountLabel"),
      cancel: t("dialog.cancel"),
      contentLabel: t("dialog.contentLabel"),
      contentPlaceholder: t("dialog.contentPlaceholder"),
      createDescription: t("dialog.createDescription"),
      createSubmit: t("dialog.createSubmit"),
      createTitle: t("dialog.createTitle"),
      spentAtLabel: t("dialog.spentAtLabel"),
    },
    feedback: {
      createSuccess: t("feedback.createSuccess"),
      deleteConfirm: (content: string) =>
        t("feedback.deleteConfirm", { content }),
      deleteLockedError: t("feedback.deleteLockedError"),
      deleteSuccess: t("feedback.deleteSuccess"),
      invalidAmount: t("feedback.invalidAmount"),
      invalidDate: t("feedback.invalidDate"),
      missingAmount: t("feedback.missingAmount"),
      missingContent: t("feedback.missingContent"),
      notFoundError: t("feedback.notFoundError"),
      permissionError: t("feedback.permissionError"),
      reimburseEmpty: t("feedback.reimburseEmpty"),
      reimburseSuccess: (count: number) =>
        t("feedback.reimburseSuccess", { count }),
      unknownError: t("feedback.unknownError"),
    },
    filters: {
      allPeriods: t("filters.allPeriods"),
      allStatuses: t("filters.allStatuses"),
      periodLabel: t("filters.periodLabel"),
      searchPlaceholder: t("filters.searchPlaceholder"),
      statusLabel: t("filters.statusLabel"),
      statusOptions,
    },
    header: {
      create: t("header.create"),
      currentPeriodLabel: t("header.currentPeriodLabel"),
      reimburseCurrent: t("header.reimburseCurrent"),
      title: t("header.title"),
    },
    list: {
      amount: t("list.amount"),
      delete: t("list.delete"),
      emptyDescription: t("list.emptyDescription"),
      emptyTitle: t("list.emptyTitle"),
      period: t("list.period"),
      recordsTitle: t("list.recordsTitle"),
      reimbursedAt: t("list.reimbursedAt"),
      spentAt: t("list.spentAt"),
      status: t("list.status"),
      statusOptions,
      updatedAt: t("list.updatedAt"),
    },
    noPermissionDescription: t("noPermissionDescription"),
    noPermissionTitle: t("noPermissionTitle"),
    summary: {
      count: (count: number) => t("summary.count", { count }),
      currentPeriod: t("summary.currentPeriod"),
      currentReimbursed: t("summary.currentReimbursed"),
      currentUnreimbursed: t("summary.currentUnreimbursed"),
      totalUnreimbursed: t("summary.totalUnreimbursed"),
    },
  };
}
