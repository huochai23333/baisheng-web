"use client";

import type { WholesaleSettlementReleasePageData } from "@/lib/wholesale-settlement-releases";

import { WholesaleActionFeedbackNotice } from "./wholesale-action-feedback";
import { WholesaleSettlementReleaseSection } from "./wholesale-settlement-release-section";
import { useWholesaleSettlementReleaseActions } from "./use-wholesale-settlement-release-actions";

export function WholesaleSettlementReleaseClient({
  initialData,
}: {
  initialData: WholesaleSettlementReleasePageData;
}) {
  const actions = useWholesaleSettlementReleaseActions();
  const canPublish =
    initialData.currentRole === "administrator" ||
    initialData.currentRole === "finance";
  const canAllocate =
    initialData.currentRole === "administrator" ||
    initialData.currentRole === "salesman";

  return (
    <div className="space-y-6">
      <WholesaleActionFeedbackNotice feedback={actions.feedback} />

      <WholesaleSettlementReleaseSection
        allocations={initialData.allocations}
        canAllocate={canAllocate}
        canPublish={canPublish}
        customers={initialData.customers}
        onCancelRelease={actions.cancelRelease}
        onClearAllocations={actions.clearAllocations}
        onCreateRelease={actions.createRelease}
        onSaveAllocations={actions.saveAllocations}
        orderSettlements={initialData.orderSettlements}
        orders={initialData.orders}
        pendingKey={actions.pendingKey}
        profiles={initialData.profiles}
        releases={initialData.releases}
      />
    </div>
  );
}
