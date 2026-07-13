import type { AppRole } from "@/lib/auth-routing";
import type { ExchangeRateRow } from "@/lib/exchange-rates";
import type { WholesaleCustomer, WholesaleProfile } from "@/lib/wholesale";
import type { WholesaleOrderListAttachment } from "@/lib/wholesale-order-list-attachments";
import type { WholesaleOrderPage } from "@/lib/wholesale-order-page";

export type WholesaleOrdersSectionProps = {
  canBypassEditWindow: boolean;
  canEdit: boolean;
  canManageEveryOrder: boolean;
  canReassignOrder: boolean;
  canReviewOrderEditRequests: boolean;
  currentRole: AppRole | null;
  currentUserId: string | null;
  customers: WholesaleCustomer[];
  customersById: Map<string, WholesaleCustomer>;
  exchangeRates: ExchangeRateRow[];
  initialPage: WholesaleOrderPage;
  onApproveOrderEditRequest: (requestId: string) => Promise<boolean>;
  onCreateOrder: (formData: FormData) => Promise<boolean>;
  onDeleteOrderListAttachment: (
    attachment: WholesaleOrderListAttachment,
  ) => Promise<boolean>;
  onMarkOrderSettled: (formData: FormData) => Promise<boolean>;
  onRejectOrderEditRequest: (requestId: string) => Promise<boolean>;
  onRequestOrderEdit: (formData: FormData) => Promise<boolean>;
  onUpdateOrder: (formData: FormData) => Promise<boolean>;
  onUploadOrderListAttachments: (options: {
    existingAttachments: WholesaleOrderListAttachment[];
    files: File[];
    orderId: string;
    uploadedByUserId: string;
  }) => Promise<boolean>;
  orderEditWindowDays: number;
  pendingKey: string | null;
  profilesById: Map<string, WholesaleProfile>;
  salesAccounts: WholesaleProfile[];
};
