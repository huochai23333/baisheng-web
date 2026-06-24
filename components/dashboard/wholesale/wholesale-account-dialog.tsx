"use client";

import { DashboardDialog } from "@/components/dashboard/dashboard-dialog";
import type { WholesaleProfile } from "@/lib/wholesale";

import { WholesaleAccountDetails } from "./wholesale-people-directories";

type WholesaleAccountDialogProps = {
  onSelectedProfileChange: (profile: WholesaleProfile | null) => void;
  selectedProfile: WholesaleProfile | null;
};

export function WholesaleAccountDialog({
  onSelectedProfileChange,
  selectedProfile,
}: WholesaleAccountDialogProps) {
  return (
    <DashboardDialog
      onOpenChange={(open) => {
        if (!open) onSelectedProfileChange(null);
      }}
      open={Boolean(selectedProfile)}
      title={selectedProfile?.name || selectedProfile?.email || "账号详情"}
    >
      {selectedProfile ? (
        <WholesaleAccountDetails profile={selectedProfile} />
      ) : null}
    </DashboardDialog>
  );
}
