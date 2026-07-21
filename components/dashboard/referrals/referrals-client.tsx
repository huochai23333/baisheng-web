"use client";

import { Network } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  DashboardAccessState,
  DashboardPageShell,
} from "@/components/dashboard/dashboard-page-shell";
import { DashboardSegmentedTabs } from "@/components/dashboard/dashboard-segmented-tabs";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import { DashboardListSection } from "@/components/dashboard/dashboard-section-panel";
import { EmptyState } from "@/components/dashboard/dashboard-shared-ui";
import type { ReferralsPageData } from "@/lib/referrals";

import { ReferralTreePanel } from "./referrals-tree-view";
import { useReferralsViewModel } from "./use-referrals-view-model";

/** 推荐关系 Client 仅组装页头、业务切换、访问状态和关系树。 */
export function ReferralsClient({
  initialData,
}: {
  initialData: ReferralsPageData;
}) {
  const t = useTranslations("Referrals");
  const viewModel = useReferralsViewModel(initialData);

  return (
    <DashboardPageShell
      feedback={viewModel.pageFeedback}
      header={
        <DashboardSectionHeader
          presentation="work"
          title={t("header.title")}
        />
      }
    >
      {viewModel.boardTabs.length > 1 ? (
        <DashboardSegmentedTabs
          className="sm:w-auto"
          onChange={viewModel.handleBoardChange}
          options={viewModel.boardTabs}
          pendingValue={viewModel.pendingBoard}
          value={viewModel.selectedBoard}
        />
      ) : null}

      {viewModel.canViewReferrals === false ? (
        <DashboardAccessState
          description={t("states.noPermissionDescription")}
          kind="permission"
          title={t("states.noPermissionTitle")}
        />
      ) : viewModel.edges.length === 0 &&
        viewModel.companyRoots.length === 0 ? (
        <DashboardListSection>
          <EmptyState
            description={t("states.emptyDescription")}
            icon={<Network className="size-6" />}
            title={t("states.emptyTitle")}
          />
        </DashboardListSection>
      ) : (
        <ReferralTreePanel
          copy={viewModel.copy}
          currentViewerId={viewModel.currentViewerId}
          graph={viewModel.graph}
          locale={viewModel.locale}
          noMatchDescription={t("states.noMatchDescription")}
          noMatchTitle={t("states.noMatchTitle")}
          onSearchTextChange={viewModel.setSearchText}
          searchPlaceholder={t("tree.searchPlaceholder")}
          searchText={viewModel.searchText}
          sharedCopy={viewModel.sharedCopy}
          title={t("tree.title")}
          treeDisplay={viewModel.treeDisplay}
        />
      )}
    </DashboardPageShell>
  );
}
