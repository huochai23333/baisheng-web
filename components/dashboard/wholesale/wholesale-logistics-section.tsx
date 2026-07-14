"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type {
  WholesaleCustomer,
  WholesaleOrderLinkOption,
} from "@/lib/wholesale";
import type {
  WholesaleLogisticsFeePage,
  WholesaleLogisticsStatusPage,
} from "@/lib/wholesale-logistics-page";

import {
  WholesaleLogisticsCreateDialog,
  WholesaleLogisticsLinkDialog,
  WholesaleLogisticsUnlinkDialog,
  type WholesaleLogisticsLinkTarget,
} from "./wholesale-logistics-dialogs";
import { WholesaleLogisticsFeeSection } from "./wholesale-logistics-fee-section";
import type { WholesaleLogisticsRecordType } from "./wholesale-logistics-mutations";
import { WholesaleLogisticsStatusSection } from "./wholesale-logistics-status-section";
import { WholesalePageShell } from "./wholesale-ui";
import { useWholesaleLogisticsLists } from "./use-wholesale-logistics-lists";

type WholesaleLogisticsSectionProps = {
  canEdit: boolean;
  customers: WholesaleCustomer[];
  initialFeePage: WholesaleLogisticsFeePage;
  initialStatusPage: WholesaleLogisticsStatusPage;
  onCreateLogisticsStatus: (formData: FormData) => Promise<boolean>;
  onSetLogisticsOrderLink: (
    recordType: WholesaleLogisticsRecordType,
    recordId: string,
    wholesaleOrderId: string | null,
  ) => Promise<boolean>;
  orders: WholesaleOrderLinkOption[];
  pendingKey: string | null;
};

/**
 * 物流页面协调组件只组装两个列表和三个弹窗。
 * 查询、筛选、mutation、表单状态及表格渲染均由同层模块分别负责。
 */
export function WholesaleLogisticsSection({
  canEdit,
  customers,
  initialFeePage,
  initialStatusPage,
  onCreateLogisticsStatus,
  onSetLogisticsOrderLink,
  orders,
  pendingKey,
}: WholesaleLogisticsSectionProps) {
  const uiText = useTranslations(
    "UiText.components_dashboard_wholesale_wholesale_logistics_section",
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [linkTarget, setLinkTarget] =
    useState<WholesaleLogisticsLinkTarget | null>(null);
  const [unlinkTarget, setUnlinkTarget] =
    useState<WholesaleLogisticsLinkTarget | null>(null);
  const lists = useWholesaleLogisticsLists({
    initialFeePage,
    initialStatusPage,
  });
  const customersById = new Map(
    customers.map((customer) => [customer.id, customer]),
  );
  const ordersById = new Map(orders.map((order) => [order.id, order]));

  const refreshAffectedList = async (recordType: WholesaleLogisticsRecordType) => {
    if (recordType === "status") {
      await lists.statusList.reload();
    } else {
      await lists.feeList.reload();
    }
  };

  const handleSaveLink = async (
    recordType: WholesaleLogisticsRecordType,
    recordId: string,
    wholesaleOrderId: string | null,
  ) => {
    const succeeded = await onSetLogisticsOrderLink(
      recordType,
      recordId,
      wholesaleOrderId,
    );
    if (succeeded) await refreshAffectedList(recordType);
    return succeeded;
  };

  return (
    <WholesalePageShell
      actions={
        canEdit ? (
          <Button
            className="h-auto min-h-10 whitespace-normal rounded-full bg-[#486782] px-4 py-2 text-center leading-5 text-white hover:bg-[#3e5f79]"
            onClick={() => setCreateOpen(true)}
            type="button"
          >
            <Plus className="size-4" />
            {uiText("createButton")}
          </Button>
        ) : null
      }
      description={uiText("attribute001")}
      eyebrow={uiText("attribute002")}
      title={uiText("attribute003")}
    >
      <WholesaleLogisticsStatusSection
        canEdit={canEdit}
        customers={customers}
        customersById={customersById}
        filters={lists.statusFilters}
        loadError={lists.statusList.loadError}
        loading={lists.statusList.loading}
        loadingMore={lists.statusList.loadingMore}
        onAssociate={setLinkTarget}
        onClearFilters={lists.clearStatusFilters}
        onFiltersChange={lists.setStatusFilters}
        onLoadMore={lists.statusList.loadMore}
        onReload={lists.statusList.reload}
        onUnlink={setUnlinkTarget}
        ordersById={ordersById}
        page={lists.statusList.page}
        pendingKey={pendingKey}
      />

      <WholesaleLogisticsFeeSection
        canEdit={canEdit}
        customers={customers}
        customersById={customersById}
        filters={lists.feeFilters}
        loadError={lists.feeList.loadError}
        loading={lists.feeList.loading}
        loadingMore={lists.feeList.loadingMore}
        onAssociate={setLinkTarget}
        onClearFilters={lists.clearFeeFilters}
        onFiltersChange={lists.setFeeFilters}
        onLoadMore={lists.feeList.loadMore}
        onReload={lists.feeList.reload}
        onUnlink={setUnlinkTarget}
        ordersById={ordersById}
        page={lists.feeList.page}
        pendingKey={pendingKey}
      />

      {canEdit ? (
        <WholesaleLogisticsCreateDialog
          customers={customers}
          onCreate={onCreateLogisticsStatus}
          onOpenChange={setCreateOpen}
          onSucceeded={lists.statusList.reload}
          open={createOpen}
          orders={orders}
          pending={pendingKey === "logistics-status:create"}
        />
      ) : null}

      <WholesaleLogisticsLinkDialog
        customers={customers}
        onOpenChange={(open) => {
          if (!open) setLinkTarget(null);
        }}
        onSave={handleSaveLink}
        open={Boolean(linkTarget)}
        orders={orders}
        pending={
          linkTarget
            ? pendingKey ===
              `logistics-link:${linkTarget.recordType}:${linkTarget.recordId}`
            : false
        }
        target={linkTarget}
      />

      <WholesaleLogisticsUnlinkDialog
        onConfirm={(recordType, recordId) =>
          handleSaveLink(recordType, recordId, null)
        }
        onOpenChange={(open) => {
          if (!open) setUnlinkTarget(null);
        }}
        open={Boolean(unlinkTarget)}
        pending={
          unlinkTarget
            ? pendingKey ===
              `logistics-link:${unlinkTarget.recordType}:${unlinkTarget.recordId}`
            : false
        }
        target={unlinkTarget}
      />
    </WholesalePageShell>
  );
}
