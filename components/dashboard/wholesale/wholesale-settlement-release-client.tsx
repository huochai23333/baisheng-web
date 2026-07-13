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
  const canClaim =
    initialData.currentRole === "administrator" ||
    initialData.currentRole === "salesman";

  return (
    <div className="space-y-6">
      <WholesaleActionFeedbackNotice feedback={actions.feedback} />

      <WholesaleSettlementReleaseSection
        canClaim={canClaim}
        canPublish={canPublish}
        customers={initialData.customers}
        onCancelRelease={actions.cancelRelease}
        onClaimRelease={actions.claimRelease}
        onCreateRelease={actions.createRelease}
        orderSettlements={initialData.orderSettlements}
        orders={initialData.orders}
        pendingKey={actions.pendingKey}
        profiles={initialData.profiles}
        releases={initialData.releases}
      />
    </div>
  );
}
