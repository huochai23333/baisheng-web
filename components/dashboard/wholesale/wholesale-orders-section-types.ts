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
  onApproveOrderEditRequest: (requestId: string) => void | Promise<void>;
  onCreateOrder: (formData: FormData) => void | Promise<void>;
  onDeleteOrderListAttachment: (
    attachment: WholesaleOrderListAttachment,
  ) => Promise<boolean>;
  onMarkOrderSettled: (formData: FormData) => void | Promise<void>;
  onRejectOrderEditRequest: (requestId: string) => void | Promise<void>;
  onRequestOrderEdit: (formData: FormData) => void | Promise<void>;
  onUpdateOrder: (formData: FormData) => void | Promise<void>;
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
