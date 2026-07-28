import type {
  CustomerInventoryCreditApplication,
  CustomerInventoryCreditTier,
  CustomerInventoryExtensionRequest,
  CustomerInventoryOrder,
} from "@/lib/customer-inventory-types";

export type InventoryCreditDialogState =
  | { kind: "apply"; order: CustomerInventoryOrder }
  | {
      kind: "review";
      order: CustomerInventoryOrder;
      credits: CustomerInventoryCreditApplication[];
    }
  | {
      kind: "manage";
      order: CustomerInventoryOrder;
      credits: CustomerInventoryCreditApplication[];
    }
  | { kind: "extend"; credit: CustomerInventoryCreditApplication }
  | {
      kind: "reviewExtension";
      extension: CustomerInventoryExtensionRequest;
      credit: CustomerInventoryCreditApplication;
    }
  | { kind: "repay"; credit: CustomerInventoryCreditApplication }
  | null;

export type CreditDecision = {
  applicationId: string;
  approvedAmountUsd: string;
  decision: "approve" | "reject";
  reviewNote: string;
};

export type DirectCreditDecision = {
  approvedAmountUsd: string;
  decision: "approve" | "reject" | "skip";
  reviewNote: string;
  tier: CustomerInventoryCreditTier;
};
