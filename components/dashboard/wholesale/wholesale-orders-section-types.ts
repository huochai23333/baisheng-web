import type { AppRole } from "@/lib/auth-routing";
import type { ExchangeRateRow } from "@/lib/exchange-rates";
import type { WholesaleCustomer, WholesaleProfile } from "@/lib/wholesale";
import type { WholesaleOrderListAttachment } from "@/lib/wholesale-order-list-attachments";
import type { WholesaleOrderPage } from "@/lib/wholesale-order-page";

export type WholesaleOrdersSectionProps = {
  canEdit: boolean;
  canManageEveryOrder: boolean;
  canReassignOrder: boolean;
  currentRole: AppRole | null;
  currentUserId: string | null;
  customers: WholesaleCustomer[];
  customersById: Map<string, WholesaleCustomer>;
  exchangeRates: ExchangeRateRow[];
  initialPage: WholesaleOrderPage;
  onCreateOrder: (
    formData: FormData,
    refreshOrders: () => Promise<void>,
  ) => Promise<boolean>;
  onDeleteOrderListAttachment: (
    attachment: WholesaleOrderListAttachment,
  ) => Promise<boolean>;
  onMarkOrderSettled: (
    formData: FormData,
    refreshOrders: () => Promise<void>,
  ) => Promise<boolean>;
  onUpdateOrder: (
    formData: FormData,
    refreshOrders: () => Promise<void>,
  ) => Promise<boolean>;
  onUploadOrderListAttachments: (options: {
    existingAttachments: WholesaleOrderListAttachment[];
    files: File[];
    orderId: string;
    uploadedByUserId: string;
  }) => Promise<boolean>;
  pendingKey: string | null;
  profilesById: Map<string, WholesaleProfile>;
  salesAccounts: WholesaleProfile[];
};
